"""Email delivery adapters for passwordless sign-in."""

import logging
from typing import Protocol

from app.config import settings

logger = logging.getLogger(__name__)


class EmailSender(Protocol):
    def send_login_code(self, email: str, code: str) -> None: ...


class ConsoleEmailSender:
    """Logs the one-time code to the server console in development."""

    def send_login_code(self, email: str, code: str) -> None:
        logger.info("Login code for %s: %s", email, code)


def get_email_sender() -> EmailSender:
    provider = settings.email_provider.lower()
    if provider == "console":
        return ConsoleEmailSender()
    raise ValueError(f"Unsupported email provider: {settings.email_provider}")
