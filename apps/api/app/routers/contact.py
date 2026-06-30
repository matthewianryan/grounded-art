"""Write endpoint for the site-wide contact form."""

import json
import logging
import uuid
from urllib import request

from fastapi import APIRouter, BackgroundTasks, Depends, status
from sqlalchemy.orm import Session

from app.config import settings
from app.db import get_db
from app.models import ContactMessage
from app.schemas import ContactMessageCreate, ContactMessageRead

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/contact", tags=["contact"])


def _notify_contact_message(
    *,
    message_id: uuid.UUID,
    name: str,
    email: str,
    subject: str,
    recipient: str,
    webhook_url: str | None,
) -> None:
    payload = {
        "type": "contact_message.received",
        "message_id": str(message_id),
        "name": name,
        "email": email,
        "subject": subject,
        "recipient": recipient,
    }

    if webhook_url is None:
        logger.info("Contact message %s received for %s", message_id, recipient)
        return

    try:
        body = json.dumps(payload).encode("utf-8")
        webhook_request = request.Request(
            webhook_url,
            data=body,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with request.urlopen(webhook_request, timeout=5) as response:
            if response.status >= 400:
                logger.warning(
                    "Contact notification webhook returned %s for message %s",
                    response.status,
                    message_id,
                )
    except Exception:
        logger.exception("Contact notification webhook failed for message %s", message_id)


@router.post("", response_model=ContactMessageRead, status_code=status.HTTP_201_CREATED)
def create_contact_message(
    payload: ContactMessageCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
) -> ContactMessage:
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
        name=message.name,
        email=message.email,
        subject=message.subject,
        recipient=settings.contact_notification_email,
        webhook_url=settings.contact_notification_webhook_url,
    )

    return message
