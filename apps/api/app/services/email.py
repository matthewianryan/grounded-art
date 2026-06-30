"""Email delivery adapters for passwordless sign-in."""

import json
import logging
import urllib.error
import urllib.request
from typing import Protocol

from app.config import settings

logger = logging.getLogger(__name__)

RESEND_API_URL = "https://api.resend.com/emails"


class EmailSender(Protocol):
    def send_login_code(self, email: str, code: str) -> None: ...


class ConsoleEmailSender:
    """Logs the one-time code to the server console in development."""

    def send_login_code(self, email: str, code: str) -> None:
        logger.info("Login code for %s: %s", email, code)


class ResendEmailSender:
    """Sends one-time sign-in codes through the Resend API."""

    def send_login_code(self, email: str, code: str) -> None:
        if not settings.resend_api_key:
            msg = "RESEND_API_KEY must be set when EMAIL_PROVIDER=resend"
            raise ValueError(msg)

        minutes = settings.login_code_ttl_minutes
        payload = json.dumps(
            {
                "from": settings.email_from,
                "to": [email],
                "subject": "Your Grounded Art sign-in code",
                "text": (
                    f"Your sign-in code is {code}.\n\n"
                    f"It expires in {minutes} minutes. "
                    "If you did not request this, you can ignore this email."
                ),
            }
        ).encode()

        request = urllib.request.Request(
            RESEND_API_URL,
            data=payload,
            headers={
                "Authorization": f"Bearer {settings.resend_api_key}",
                "Content-Type": "application/json",
            },
            method="POST",
        )

        try:
            with urllib.request.urlopen(request, timeout=30) as response:
                if response.status >= 400:
                    msg = f"Resend returned status {response.status}"
                    raise RuntimeError(msg)
        except urllib.error.HTTPError as exc:
            body = exc.read().decode(errors="replace")
            logger.error("Resend API error %s: %s", exc.code, body)
            msg = "Could not send sign-in email"
            raise RuntimeError(msg) from exc
        except urllib.error.URLError as exc:
            logger.error("Resend request failed: %s", exc.reason)
            msg = "Could not send sign-in email"
            raise RuntimeError(msg) from exc


def get_email_sender() -> EmailSender:
    provider = settings.email_provider.lower()
    if provider == "console":
        return ConsoleEmailSender()
    if provider == "resend":
        return ResendEmailSender()
    msg = f"Unsupported email provider: {settings.email_provider}"
    raise ValueError(msg)
