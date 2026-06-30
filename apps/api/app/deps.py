"""FastAPI dependencies for authenticated routes."""

from typing import Annotated

from fastapi import Cookie, Depends, HTTPException
from sqlalchemy.orm import Session

from app.config import settings
from app.db import get_db
from app.models import Account, Session as AccountSession
from app.services.auth import get_account_for_token, get_session_for_token


def get_current_account(
    db: Session = Depends(get_db),
    ga_session: str | None = Cookie(default=None, alias=settings.session_cookie_name),
) -> Account:
    if not ga_session:
        raise HTTPException(status_code=401, detail="Not signed in")
    account = get_account_for_token(db, ga_session)
    if account is None:
        raise HTTPException(status_code=401, detail="Session expired")
    return account


def get_optional_account(
    db: Session = Depends(get_db),
    ga_session: str | None = Cookie(default=None, alias=settings.session_cookie_name),
) -> Account | None:
    if not ga_session:
        return None
    return get_account_for_token(db, ga_session)


def get_current_session(
    db: Session = Depends(get_db),
    ga_session: str | None = Cookie(default=None, alias=settings.session_cookie_name),
) -> tuple[Account, AccountSession]:
    if not ga_session:
        raise HTTPException(status_code=401, detail="Not signed in")
    session = get_session_for_token(db, ga_session)
    if session is None:
        raise HTTPException(status_code=401, detail="Session expired")
    account = db.get(Account, session.account_id)
    if account is None:
        raise HTTPException(status_code=401, detail="Session expired")
    return account, session


CurrentSession = Annotated[tuple[Account, AccountSession], Depends(get_current_session)]
