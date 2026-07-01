"""Passwordless email auth endpoints."""

from fastapi import APIRouter, Cookie, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from app.config import settings
from app.db import get_db
from app.deps import get_current_account
from app.models import Account
from app.schemas import AccountRead, RequestCodeBody, VerifyCodeBody
from app.services.auth import (
    clear_session_cookie,
    request_login_code,
    revoke_session,
    set_session_cookie,
    verify_login_code,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/request-code", status_code=204)
def post_request_code(body: RequestCodeBody, db: Session = Depends(get_db)) -> None:
    try:
        request_login_code(db, body.email)
    except ValueError as exc:
        raise HTTPException(status_code=429, detail=str(exc)) from exc


@router.post("/verify-code", response_model=AccountRead)
def post_verify_code(
    body: VerifyCodeBody,
    response: Response,
    db: Session = Depends(get_db),
) -> Account:
    try:
        account, token = verify_login_code(
            db,
            body.email,
            body.code,
            saved_keys=body.saved_keys,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    set_session_cookie(response, token)
    return account


@router.post("/sign-out", status_code=204)
def post_sign_out(
    response: Response,
    db: Session = Depends(get_db),
    account: Account = Depends(get_current_account),
    ga_session: str | None = Cookie(default=None, alias=settings.session_cookie_name),
) -> None:
    _ = account
    if ga_session:
        revoke_session(db, ga_session)
    clear_session_cookie(response)
