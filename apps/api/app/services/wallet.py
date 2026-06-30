"""Append-only wallet ledger reads."""

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.models import CheckIn, WalletTransaction


def wallet_balance(db: Session, account_id) -> int:
    return (
        db.scalar(
            select(func.coalesce(func.sum(WalletTransaction.delta), 0)).where(
                WalletTransaction.account_id == account_id
            )
        )
        or 0
    )


def recent_transactions(db: Session, account_id, *, limit: int = 50) -> list[WalletTransaction]:
    return list(
        db.scalars(
            select(WalletTransaction)
            .where(WalletTransaction.account_id == account_id)
            .options(selectinload(WalletTransaction.check_in).selectinload(CheckIn.gallery))
            .order_by(WalletTransaction.created_at.desc())
            .limit(limit)
        ).all()
    )


def transaction_gallery_name(tx: WalletTransaction) -> str | None:
    if tx.check_in is not None and tx.check_in.gallery is not None:
        return tx.check_in.gallery.name
    return None
