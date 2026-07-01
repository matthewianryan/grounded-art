"""Authenticated account endpoints."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.db import get_db
from app.deps import CurrentSession, get_current_account
from app.models import (
    Account,
    FeedItem,
    FeedItemStatus,
    Gallery,
    GalleryStatus,
    SavedItemKind,
)
from app.schemas import (
    AccountRead,
    AccountUpdate,
    AddSavedBody,
    CheckInChallengeBody,
    CheckInChallengeRead,
    CheckInCreateBody,
    CheckInPage,
    CheckInRead,
    CheckInResultRead,
    SavedItemRead,
    SavedPage,
    WalletRead,
    WalletTransactionRead,
)
from app.services.check_in import issue_challenge, list_check_ins, submit_check_in
from app.services.saved import add_saved_item, list_saved_items, remove_saved_item
from app.services.wallet import recent_transactions, transaction_gallery_name, wallet_balance

router = APIRouter(prefix="/me", tags=["me"])

_gallery_eager = (selectinload(Gallery.images), selectinload(Gallery.external_refs))
_feed_eager = (selectinload(FeedItem.images), selectinload(FeedItem.links))


@router.get("", response_model=AccountRead)
def get_me(account: Account = Depends(get_current_account)) -> Account:
    return account


@router.patch("", response_model=AccountRead)
def patch_me(
    body: AccountUpdate,
    db: Session = Depends(get_db),
    account: Account = Depends(get_current_account),
) -> Account:
    updates = body.model_dump(exclude_unset=True)
    for key, value in updates.items():
        setattr(account, key, value)
    db.commit()
    db.refresh(account)
    return account


@router.get("/saved", response_model=SavedPage)
def get_saved(
    db: Session = Depends(get_db),
    account: Account = Depends(get_current_account),
) -> SavedPage:
    saved = list_saved_items(db, account.id)
    items: list[SavedItemRead] = []

    for row in saved:
        gallery = None
        feed_item = None
        if row.item_kind == SavedItemKind.GALLERY:
            gallery = db.scalars(
                select(Gallery)
                .where(Gallery.slug == row.item_slug, Gallery.status == GalleryStatus.ACTIVE)
                .options(*_gallery_eager)
            ).first()
        elif row.item_kind == SavedItemKind.FEED:
            feed_item = db.scalars(
                select(FeedItem)
                .where(FeedItem.slug == row.item_slug, FeedItem.status == FeedItemStatus.ACTIVE)
                .options(*_feed_eager)
            ).first()

        if gallery is None and feed_item is None:
            continue

        items.append(
            SavedItemRead(
                kind=row.item_kind,
                slug=row.item_slug,
                saved_at=row.saved_at,
                gallery=gallery,
                feed_item=feed_item,
            )
        )

    return SavedPage(items=items)


@router.post("/saved", response_model=SavedItemRead, status_code=201)
def post_saved(
    body: AddSavedBody,
    db: Session = Depends(get_db),
    account: Account = Depends(get_current_account),
) -> SavedItemRead:
    try:
        row = add_saved_item(db, account.id, body.kind, body.slug)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

    gallery = None
    feed_item = None
    if body.kind == SavedItemKind.GALLERY:
        gallery = db.scalars(
            select(Gallery)
            .where(Gallery.slug == body.slug, Gallery.status == GalleryStatus.ACTIVE)
            .options(*_gallery_eager)
        ).first()
    else:
        feed_item = db.scalars(
            select(FeedItem)
            .where(FeedItem.slug == body.slug, FeedItem.status == FeedItemStatus.ACTIVE)
            .options(*_feed_eager)
        ).first()

    return SavedItemRead(
        kind=row.item_kind,
        slug=row.item_slug,
        saved_at=row.saved_at,
        gallery=gallery,
        feed_item=feed_item,
    )


@router.delete("/saved/{kind}/{slug}", status_code=204)
def delete_saved(
    kind: str,
    slug: str,
    db: Session = Depends(get_db),
    account: Account = Depends(get_current_account),
) -> None:
    if kind not in (SavedItemKind.FEED, SavedItemKind.GALLERY):
        raise HTTPException(status_code=400, detail="Invalid saved item kind.")
    removed = remove_saved_item(db, account.id, kind, slug)
    if not removed:
        raise HTTPException(status_code=404, detail="Saved item not found.")


@router.get("/wallet", response_model=WalletRead)
def get_wallet(
    db: Session = Depends(get_db),
    account: Account = Depends(get_current_account),
) -> WalletRead:
    balance = wallet_balance(db, account.id)
    transactions = recent_transactions(db, account.id)
    return WalletRead(
        balance=balance,
        transactions=[
            WalletTransactionRead(
                id=tx.id,
                delta=tx.delta,
                reason=tx.reason,
                created_at=tx.created_at,
                gallery_name=transaction_gallery_name(tx),
            )
            for tx in transactions
        ],
    )


@router.get("/check-ins", response_model=CheckInPage)
def get_check_ins(
    db: Session = Depends(get_db),
    account: Account = Depends(get_current_account),
) -> CheckInPage:
    rows = list_check_ins(db, account.id)
    return CheckInPage(
        items=[
            CheckInRead(
                id=row.id,
                gallery_slug=row.gallery.slug,
                gallery_name=row.gallery.name,
                checked_in_at=row.checked_in_at,
                verified=row.verified,
                point_awarded=row.point_awarded,
                presence_method=row.presence_method,
            )
            for row in rows
        ]
    )


@router.post("/check-in-challenge", response_model=CheckInChallengeRead)
def post_check_in_challenge(
    body: CheckInChallengeBody,
    session_ctx: CurrentSession,
    db: Session = Depends(get_db),
) -> CheckInChallengeRead:
    _, session = session_ctx
    try:
        result = issue_challenge(db, session, body.gallery_slug, body.code)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return CheckInChallengeRead(
        challenge_token=result.challenge_token,
        expires_at=result.expires_at,
    )


@router.post("/check-ins", response_model=CheckInResultRead, status_code=201)
def post_check_in(
    body: CheckInCreateBody,
    session_ctx: CurrentSession,
    db: Session = Depends(get_db),
) -> CheckInResultRead:
    account, session = session_ctx
    try:
        result = submit_check_in(
            db,
            account,
            session,
            gallery_slug=body.gallery_slug,
            latitude=body.latitude,
            longitude=body.longitude,
            challenge_token=body.challenge_token,
            accuracy=body.accuracy,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return CheckInResultRead(
        id=result.check_in_id,
        verified=result.verified,
        point_awarded=result.point_awarded,
        already_earned_today=result.already_earned_today,
        balance=result.balance,
        presence_method=result.presence_method,
        decline_reason=result.decline_reason,
    )
