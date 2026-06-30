"""Server-side check-in verification, challenge tokens, and wallet awards."""

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


def issue_challenge(db: Session, session: AccountSession, gallery_slug: str) -> ChallengeResult:
    gallery = _get_active_gallery(db, gallery_slug)
    if gallery is None:
        msg = "Gallery not found."
        raise ValueError(msg)

    token = _generate_challenge_token()
    expires_at = datetime.now(UTC) + timedelta(minutes=settings.check_in_challenge_ttl_minutes)
    session.check_in_challenge_token = _hash_challenge_token(token)
    session.check_in_challenge_expires_at = expires_at
    session.check_in_challenge_gallery_id = gallery.id
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
) -> CheckInResult:
    gallery = _get_active_gallery(db, gallery_slug)
    if gallery is None:
        msg = "Gallery not found."
        raise ValueError(msg)

    if gallery.latitude is None or gallery.longitude is None:
        msg = "This gallery has no map coordinates yet."
        raise ValueError(msg)

    challenge_ok = _challenge_valid(session, gallery.id, challenge_token)
    dist = distance_metres(latitude, longitude, gallery.latitude, gallery.longitude)
    within_radius = dist <= settings.check_in_radius_metres
    verified = challenge_ok and within_radius

    already_earned_today = False
    point_awarded = False
    if verified:
        already_earned_today = _has_recent_award(db, account.id, gallery.id)
        point_awarded = not already_earned_today

    check_in = CheckIn(
        account_id=account.id,
        gallery_id=gallery.id,
        latitude=latitude,
        longitude=longitude,
        checked_in_at=datetime.now(UTC),
        verified=verified,
        point_awarded=point_awarded,
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
