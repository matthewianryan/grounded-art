"""Per-account saved galleries and feed items."""

import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import AccountSavedItem, FeedItem, FeedItemStatus, Gallery, GalleryStatus, SavedItemKind


def parse_saved_key(key: str) -> tuple[str, str] | None:
    if key.startswith("feed:"):
        return SavedItemKind.FEED, key[5:]
    if key.startswith("gallery:"):
        return SavedItemKind.GALLERY, key[8:]
    return None


def _slug_exists(db: Session, kind: str, slug: str) -> bool:
    if kind == SavedItemKind.FEED:
        item = db.scalars(
            select(FeedItem).where(
                FeedItem.slug == slug,
                FeedItem.status == FeedItemStatus.ACTIVE,
            )
        ).first()
        return item is not None
    if kind == SavedItemKind.GALLERY:
        gallery = db.scalars(
            select(Gallery).where(
                Gallery.slug == slug,
                Gallery.status == GalleryStatus.ACTIVE,
            )
        ).first()
        return gallery is not None
    return False


def merge_saved_keys(db: Session, account_id: uuid.UUID, keys: list[str]) -> None:
    for key in keys:
        parsed = parse_saved_key(key)
        if parsed is None:
            continue
        kind, slug = parsed
        if not _slug_exists(db, kind, slug):
            continue
        existing = db.scalars(
            select(AccountSavedItem).where(
                AccountSavedItem.account_id == account_id,
                AccountSavedItem.item_kind == kind,
                AccountSavedItem.item_slug == slug,
            )
        ).first()
        if existing is None:
            db.add(
                AccountSavedItem(
                    account_id=account_id,
                    item_kind=kind,
                    item_slug=slug,
                )
            )
    db.flush()


def list_saved_items(db: Session, account_id: uuid.UUID) -> list[AccountSavedItem]:
    return list(
        db.scalars(
            select(AccountSavedItem)
            .where(AccountSavedItem.account_id == account_id)
            .order_by(AccountSavedItem.saved_at.desc())
        ).all()
    )


def add_saved_item(db: Session, account_id: uuid.UUID, kind: str, slug: str) -> AccountSavedItem:
    if kind not in (SavedItemKind.FEED, SavedItemKind.GALLERY):
        msg = "Invalid saved item kind."
        raise ValueError(msg)
    if not _slug_exists(db, kind, slug):
        msg = "Item not found."
        raise ValueError(msg)

    existing = db.scalars(
        select(AccountSavedItem).where(
            AccountSavedItem.account_id == account_id,
            AccountSavedItem.item_kind == kind,
            AccountSavedItem.item_slug == slug,
        )
    ).first()
    if existing is not None:
        return existing

    item = AccountSavedItem(account_id=account_id, item_kind=kind, item_slug=slug)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def remove_saved_item(db: Session, account_id: uuid.UUID, kind: str, slug: str) -> bool:
    item = db.scalars(
        select(AccountSavedItem).where(
            AccountSavedItem.account_id == account_id,
            AccountSavedItem.item_kind == kind,
            AccountSavedItem.item_slug == slug,
        )
    ).first()
    if item is None:
        return False
    db.delete(item)
    db.commit()
    return True
