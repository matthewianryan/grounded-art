"""Server-side check-in verification, challenge tokens, and wallet awards.

Presence is layered evidence, not a single trusted signal, because a browser cannot prove its
location: a GPS fix is overridable, and a script can post any coordinate. The award is therefore
a policy decision. Three signals are combined and the strongest available is recorded:

1. Geolocation within the gallery radius, gated on the reported fix accuracy so a coarse
   IP-based fix cannot count.
2. A velocity guard: a point is withheld when travel from the account's previous check-in is
   physically implausible, which defeats farming galleries remotely.
3. An optional per-gallery venue code (a printed or on-screen code) that a remote user cannot
   obtain. When presented it is the trust anchor and the check-in is recorded as venue_code.

Which methods earn a point is controlled by settings.awarding_methods, so trust can be tightened
later without a rewrite. See docs/wallet-and-presence.md.
"""

import hmac
import math
import secrets
import uuid
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.config import settings
from app.models import (
    Account,
    CheckIn,
    CheckInDeclineReason,
    CheckInMethod,
    Gallery,
    GalleryStatus,
    Session as AccountSession,
    WalletTransaction,
    WalletTransactionReason,
)
from app.services.auth import hash_session_token
from app.services.wallet import wallet_balance


@dataclass(frozen=True)
class ChallengeResult:
    challenge_token: str
    expires_at: datetime


@dataclass(frozen=True)
class CheckInResult:
    check_in_id: uuid.UUID
    verified: bool
    point_awarded: bool
    already_earned_today: bool
    balance: int
    presence_method: str
    decline_reason: str | None


def _hash_challenge_token(token: str) -> str:
    return hash_session_token(token)


def _generate_challenge_token() -> str:
    return secrets.token_urlsafe(32)


def distance_metres(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    earth_radius = 6_371_000
    to_rad = math.radians
    d_lat = to_rad(lat2 - lat1)
    d_lng = to_rad(lng2 - lng1)
    a = (
        math.sin(d_lat / 2) ** 2
        + math.cos(to_rad(lat1)) * math.cos(to_rad(lat2)) * math.sin(d_lng / 2) ** 2
    )
    return 2 * earth_radius * math.asin(math.sqrt(a))


def _get_active_gallery(db: Session, slug: str) -> Gallery | None:
    return db.scalars(
        select(Gallery).where(Gallery.slug == slug, Gallery.status == GalleryStatus.ACTIVE)
    ).first()


def _challenge_valid(session: AccountSession, gallery_id: object, challenge_token: str) -> bool:
    now = datetime.now(UTC)
    if session.check_in_challenge_token is None:
        return False
    if session.check_in_challenge_expires_at is None or session.check_in_challenge_expires_at <= now:
        return False
    if session.check_in_challenge_gallery_id != gallery_id:
        return False
    return session.check_in_challenge_token == _hash_challenge_token(challenge_token)


def _clear_challenge(session: AccountSession) -> None:
    session.check_in_challenge_token = None
    session.check_in_challenge_expires_at = None
    session.check_in_challenge_gallery_id = None
    session.check_in_challenge_method = None


def _resolve_method(gallery: Gallery, code: str | None) -> str:
    """Venue-code tier when the presented code matches the gallery's; geolocation otherwise.

    A missing or wrong code silently downgrades rather than erroring, so a stale link never
    blocks a check-in; it only forgoes the stronger tier.
    """
    stored = gallery.check_in_code
    if code and stored and hmac.compare_digest(code.strip(), stored):
        return CheckInMethod.VENUE_CODE
    return CheckInMethod.GEOLOCATION


def _accuracy_ok(accuracy: float | None) -> bool:
    limit = settings.check_in_max_accuracy_metres
    if limit <= 0 or accuracy is None:
        return True
    return accuracy <= limit


def _last_awarded_check_in(db: Session, account_id: object) -> CheckIn | None:
    return db.scalars(
        select(CheckIn)
        .where(CheckIn.account_id == account_id, CheckIn.point_awarded.is_(True))
        .order_by(CheckIn.checked_in_at.desc())
        .limit(1)
    ).first()


def _travel_implausible(previous: CheckIn | None, latitude: float, longitude: float) -> bool:
    """True when moving from the previous check-in to here exceeds the speed limit."""
    max_speed = settings.check_in_max_speed_kmh
    if max_speed <= 0 or previous is None:
        return False
    elapsed_s = (datetime.now(UTC) - previous.checked_in_at).total_seconds()
    if elapsed_s <= 0:
        return False
    dist_m = distance_metres(previous.latitude, previous.longitude, latitude, longitude)
    speed_kmh = (dist_m / 1000) / (elapsed_s / 3600)
    return speed_kmh > max_speed


def _has_recent_award(db: Session, account_id: object, gallery_id: object) -> bool:
    window_start = datetime.now(UTC) - timedelta(hours=settings.check_in_award_window_hours)
    prior = db.scalars(
        select(CheckIn)
        .where(
            CheckIn.account_id == account_id,
            CheckIn.gallery_id == gallery_id,
            CheckIn.point_awarded.is_(True),
            CheckIn.checked_in_at >= window_start,
        )
        .limit(1)
    ).first()
    return prior is not None


def issue_challenge(
    db: Session,
    session: AccountSession,
    gallery_slug: str,
    code: str | None = None,
) -> ChallengeResult:
    gallery = _get_active_gallery(db, gallery_slug)
    if gallery is None:
        msg = "Gallery not found."
        raise ValueError(msg)

    token = _generate_challenge_token()
    expires_at = datetime.now(UTC) + timedelta(minutes=settings.check_in_challenge_ttl_minutes)
    session.check_in_challenge_token = _hash_challenge_token(token)
    session.check_in_challenge_expires_at = expires_at
    session.check_in_challenge_gallery_id = gallery.id
    # The method is resolved and pinned here, so the venue-code tier cannot be claimed by a
    # submission that never presented the code.
    session.check_in_challenge_method = _resolve_method(gallery, code)
    db.commit()

    return ChallengeResult(challenge_token=token, expires_at=expires_at)


def submit_check_in(
    db: Session,
    account: Account,
    session: AccountSession,
    *,
    gallery_slug: str,
    latitude: float,
    longitude: float,
    challenge_token: str,
    accuracy: float | None = None,
) -> CheckInResult:
    gallery = _get_active_gallery(db, gallery_slug)
    if gallery is None:
        msg = "Gallery not found."
        raise ValueError(msg)

    if gallery.latitude is None or gallery.longitude is None:
        msg = "This gallery has no map coordinates yet."
        raise ValueError(msg)

    # Read the pinned method before the challenge is cleared, then default to the weakest tier.
    method = session.check_in_challenge_method or CheckInMethod.GEOLOCATION

    challenge_ok = _challenge_valid(session, gallery.id, challenge_token)
    dist = distance_metres(latitude, longitude, gallery.latitude, gallery.longitude)
    within_radius = dist <= settings.check_in_radius_metres

    # Presence: is the location evidence good enough to record this as verified? Ordered so the
    # most actionable failure is surfaced first.
    verified = False
    decline_reason: str | None = None
    if not _accuracy_ok(accuracy):
        decline_reason = CheckInDeclineReason.LOW_ACCURACY
    elif not within_radius:
        decline_reason = CheckInDeclineReason.OUT_OF_RANGE
    elif not challenge_ok:
        decline_reason = CheckInDeclineReason.UNVERIFIED
    else:
        verified = True

    # Award: a verified check-in still earns nothing when travel is implausible, the daily point
    # is already taken, or the method is not one policy awards.
    already_earned_today = False
    point_awarded = False
    if verified:
        if _travel_implausible(_last_awarded_check_in(db, account.id), latitude, longitude):
            decline_reason = CheckInDeclineReason.IMPLAUSIBLE_TRAVEL
        elif _has_recent_award(db, account.id, gallery.id):
            already_earned_today = True
            decline_reason = CheckInDeclineReason.ALREADY_EARNED_TODAY
        elif method not in settings.awarding_methods:
            decline_reason = CheckInDeclineReason.METHOD_NOT_ELIGIBLE
        else:
            point_awarded = True
            decline_reason = None

    check_in = CheckIn(
        account_id=account.id,
        gallery_id=gallery.id,
        latitude=latitude,
        longitude=longitude,
        checked_in_at=datetime.now(UTC),
        verified=verified,
        point_awarded=point_awarded,
        presence_method=method,
        accuracy_metres=accuracy,
        decline_reason=decline_reason,
    )
    db.add(check_in)
    db.flush()

    if point_awarded:
        db.add(
            WalletTransaction(
                account_id=account.id,
                delta=1,
                reason=WalletTransactionReason.VERIFIED_CHECK_IN,
                check_in_id=check_in.id,
            )
        )

    _clear_challenge(session)
    db.commit()
    db.refresh(check_in)

    balance = wallet_balance(db, account.id)
    return CheckInResult(
        check_in_id=check_in.id,
        verified=verified,
        point_awarded=point_awarded,
        already_earned_today=already_earned_today,
        balance=balance,
        presence_method=method,
        decline_reason=decline_reason,
    )


def list_check_ins(db: Session, account_id, *, limit: int = 100) -> list[CheckIn]:
    return list(
        db.scalars(
            select(CheckIn)
            .where(CheckIn.account_id == account_id)
            .options(selectinload(CheckIn.gallery))
            .order_by(CheckIn.checked_in_at.desc())
            .limit(limit)
        ).all()
    )
