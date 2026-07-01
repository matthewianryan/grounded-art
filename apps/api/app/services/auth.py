"""Passwordless email auth: one-time codes and server sessions."""

import hashlib
import secrets
from datetime import UTC, datetime, timedelta

from fastapi import Response
from sqlalchemy import delete, func, select
from sqlalchemy.orm import Session

from app.config import settings
from app.models import Account, LoginCode, Session as AccountSession
from app.services.email import EmailSender, get_email_sender


def normalize_email(email: str) -> str:
    return email.strip().lower()


def hash_code(code: str) -> str:
    payload = f"{code}:{settings.login_code_pepper}"
    return hashlib.sha256(payload.encode()).hexdigest()


def generate_code() -> str:
    return f"{secrets.randbelow(1_000_000):06d}"


def generate_session_token() -> str:
    return secrets.token_urlsafe(32)


def hash_session_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def default_display_name(email: str) -> str:
    local = email.split("@", 1)[0]
    return local or "Member"


def count_recent_login_codes(db: Session, email: str) -> int:
    window_start = datetime.now(UTC) - timedelta(hours=settings.login_code_rate_limit_window_hours)
    return (
        db.scalar(
            select(func.count())
            .select_from(LoginCode)
            .where(LoginCode.email == email, LoginCode.created_at >= window_start)
        )
        or 0
    )


def request_login_code(db: Session, email: str, sender: EmailSender | None = None) -> None:
    normalized = normalize_email(email)
    if count_recent_login_codes(db, normalized) >= settings.login_code_rate_limit_per_email:
        msg = "Too many code requests. Try again later."
        raise ValueError(msg)

    code = generate_code()
    expires_at = datetime.now(UTC) + timedelta(minutes=settings.login_code_ttl_minutes)
    login_code = LoginCode(
        email=normalized,
        code_hash=hash_code(code),
        expires_at=expires_at,
    )
    db.add(login_code)
    db.commit()

    mailer = sender or get_email_sender()
    mailer.send_login_code(normalized, code)


def verify_login_code(
    db: Session,
    email: str,
    code: str,
    saved_keys: list[str] | None = None,
) -> tuple[Account, str]:
    """Verify a one-time code, upsert the account, merge saved keys, and return account + token."""
    from app.services.saved import merge_saved_keys

    normalized = normalize_email(email)
    now = datetime.now(UTC)

    login_code = db.scalars(
        select(LoginCode)
        .where(
            LoginCode.email == normalized,
            LoginCode.consumed_at.is_(None),
            LoginCode.expires_at > now,
        )
        .order_by(LoginCode.created_at.desc())
        .limit(1)
    ).first()

    if login_code is None:
        msg = "Invalid or expired code."
        raise ValueError(msg)

    if login_code.attempt_count >= settings.login_code_max_attempts:
        msg = "Too many attempts. Request a new code."
        raise ValueError(msg)

    if hash_code(code.strip()) != login_code.code_hash:
        login_code.attempt_count += 1
        db.commit()
        msg = "Invalid or expired code."
        raise ValueError(msg)

    login_code.consumed_at = now

    account = db.scalars(select(Account).where(Account.email == normalized)).first()
    if account is None:
        account = Account(email=normalized, display_name=default_display_name(normalized))
        db.add(account)
        db.flush()

    if saved_keys:
        merge_saved_keys(db, account.id, saved_keys)

    token = generate_session_token()
    session = AccountSession(
        account_id=account.id,
        token_hash=hash_session_token(token),
        expires_at=now + timedelta(days=settings.session_ttl_days),
    )
    db.add(session)
    db.commit()
    db.refresh(account)
    return account, token


def get_account_for_token(db: Session, token: str) -> Account | None:
    session = get_session_for_token(db, token)
    if session is None:
        return None
    return db.get(Account, session.account_id)


def get_session_for_token(db: Session, token: str) -> AccountSession | None:
    now = datetime.now(UTC)
    return db.scalars(
        select(AccountSession)
        .where(
            AccountSession.token_hash == hash_session_token(token),
            AccountSession.expires_at > now,
        )
        .limit(1)
    ).first()


def revoke_session(db: Session, token: str) -> None:
    db.execute(
        delete(AccountSession).where(AccountSession.token_hash == hash_session_token(token))
    )
    db.commit()


def set_session_cookie(response: Response, token: str) -> None:
    max_age = settings.session_ttl_days * 24 * 60 * 60
    response.set_cookie(
        key=settings.session_cookie_name,
        value=token,
        max_age=max_age,
        httponly=True,
        secure=settings.cookie_secure,
        samesite="lax",
        path=settings.session_cookie_path,
    )


def clear_session_cookie(response: Response) -> None:
    response.delete_cookie(
        key=settings.session_cookie_name,
        path=settings.session_cookie_path,
        secure=settings.cookie_secure,
        httponly=True,
        samesite="lax",
    )
