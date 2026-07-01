"""Write endpoint for the site-wide contact form."""

import json
import logging
import uuid
from datetime import datetime, timedelta, timezone
from urllib import error, request
from urllib.parse import urlencode

from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    HTTPException,
    Request,
    Response,
    status,
)
from sqlalchemy import delete, func, select
from sqlalchemy.orm import Session

from app.config import settings
from app.db import get_db
from app.models import ContactMessage, ContactRateLimitEvent
from app.schemas import ContactMessageCreate, ContactMessageRead

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/contact", tags=["contact"])


def _client_ip(request: Request) -> str:
    cloudflare_ip = request.headers.get("cf-connecting-ip")
    if cloudflare_ip:
        return cloudflare_ip.strip()

    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        return forwarded_for.split(",", 1)[0].strip()

    if request.client is None:
        return "unknown"
    return request.client.host


def _check_rate_limit(
    *,
    db: Session,
    key: str,
    max_hits: int,
    window_seconds: int,
) -> None:
    if max_hits <= 0 or window_seconds <= 0:
        return

    now = datetime.now(timezone.utc)
    cutoff = now - timedelta(seconds=window_seconds)
    stale_cutoff = now - timedelta(days=1)
    db.execute(delete(ContactRateLimitEvent).where(ContactRateLimitEvent.occurred_at < stale_cutoff))

    hits = (
        db.scalar(
            select(func.count())
            .select_from(ContactRateLimitEvent)
            .where(
                ContactRateLimitEvent.key == key,
                ContactRateLimitEvent.occurred_at >= cutoff,
            )
        )
        or 0
    )
    if hits >= max_hits:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many contact requests. Please try again later.",
        )
    db.add(ContactRateLimitEvent(key=key))


def _apply_contact_rate_limits(
    *,
    db: Session,
    payload: ContactMessageCreate,
    request: Request,
) -> None:
    ip = _client_ip(request)
    _check_rate_limit(
        db=db,
        key=f"contact:ip:{ip}",
        max_hits=settings.contact_rate_limit_ip_max,
        window_seconds=settings.contact_rate_limit_ip_window_seconds,
    )
    _check_rate_limit(
        db=db,
        key=f"contact:email:{payload.email}",
        max_hits=settings.contact_rate_limit_email_max,
        window_seconds=settings.contact_rate_limit_email_window_seconds,
    )
    db.commit()


def _verify_turnstile(token: str | None, remote_ip: str) -> None:
    if settings.turnstile_secret_key is None:
        return
    if not token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification required.",
        )

    payload = urlencode(
        {
            "secret": settings.turnstile_secret_key,
            "response": token,
            "remoteip": remote_ip,
        }
    ).encode("utf-8")

    verification_request = request.Request(
        settings.turnstile_siteverify_url,
        data=payload,
        headers={
            "Content-Type": "application/x-www-form-urlencoded",
            # Cloudflare blocks the default ``Python-urllib`` agent.
            "User-Agent": "grounded-art-api",
        },
        method="POST",
    )
    try:
        with request.urlopen(verification_request, timeout=5) as response:
            result = json.loads(response.read().decode("utf-8"))
    except Exception:
        logger.exception("Turnstile verification request failed")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Verification is temporarily unavailable.",
        ) from None

    if not result.get("success"):
        logger.info("Turnstile verification failed: %s", result.get("error-codes", []))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification failed.",
        )


def _format_contact_email_text(
    *,
    message_id: uuid.UUID,
    received_at: datetime,
    name: str,
    email: str,
    subject: str,
    body: str,
) -> str:
    return "\n".join(
        [
            "New Grounded Art contact message",
            "",
            f"Message ID: {message_id}",
            f"Received: {received_at.isoformat()}",
            f"Name: {name}",
            f"Email: {email}",
            f"Subject: {subject}",
            "",
            "Message:",
            body,
        ]
    )


def _notify_contact_message(
    *,
    message_id: uuid.UUID,
    received_at: datetime,
    name: str,
    email: str,
    subject: str,
    body: str,
    resend_api_key: str | None,
    resend_api_url: str,
    notification_from: str,
    notification_to: str,
    reply_to_submitter: bool,
) -> None:
    if resend_api_key is None:
        logger.info(
            "Contact message %s stored; Resend API key is not configured",
            message_id,
        )
        return

    payload = {
        "from": notification_from,
        "to": [notification_to],
        "subject": f"[Grounded Art] {subject}",
        "text": _format_contact_email_text(
            message_id=message_id,
            received_at=received_at,
            name=name,
            email=email,
            subject=subject,
            body=body,
        ),
    }
    if reply_to_submitter:
        payload["reply_to"] = email

    try:
        body = json.dumps(payload).encode("utf-8")
        resend_request = request.Request(
            resend_api_url,
            data=body,
            headers={
                "Authorization": f"Bearer {resend_api_key}",
                "Content-Type": "application/json",
                # Resend sits behind Cloudflare, which blocks the default
                # ``Python-urllib`` agent with a 403 "error code: 1010" page.
                "User-Agent": "grounded-art-api",
            },
            method="POST",
        )
        with request.urlopen(resend_request, timeout=10) as response:
            if response.status >= 400:
                logger.warning(
                    "Resend returned %s for contact message %s",
                    response.status,
                    message_id,
                )
    except error.HTTPError as exc:
        logger.warning(
            "Resend returned %s for contact message %s",
            exc.code,
            message_id,
        )
    except Exception:
        logger.exception("Resend notification failed for contact message %s", message_id)


@router.post("", response_model=ContactMessageRead, status_code=status.HTTP_201_CREATED)
def create_contact_message(
    payload: ContactMessageCreate,
    background_tasks: BackgroundTasks,
    request: Request,
    db: Session = Depends(get_db),
) -> ContactMessage | Response:
    _apply_contact_rate_limits(db=db, payload=payload, request=request)

    if payload.company:
        logger.info("Contact honeypot submission blocked from %s", _client_ip(request))
        return Response(status_code=status.HTTP_204_NO_CONTENT)

    _verify_turnstile(payload.turnstile_token, _client_ip(request))

    message = ContactMessage(
        name=payload.name,
        email=payload.email,
        subject=payload.subject,
        body=payload.message,
    )
    db.add(message)
    db.commit()
    db.refresh(message)

    background_tasks.add_task(
        _notify_contact_message,
        message_id=message.id,
        received_at=message.received_at,
        name=message.name,
        email=message.email,
        subject=message.subject,
        body=message.body,
        resend_api_key=settings.resend_api_key,
        resend_api_url=settings.resend_api_url,
        notification_from=settings.contact_notification_from,
        notification_to=settings.contact_notification_to,
        reply_to_submitter=settings.contact_notification_reply_to_submitter,
    )

    return message
