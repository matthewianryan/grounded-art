"""passwordless auth and saved items

Drops account.password_hash for passwordless email auth, adds login_code for one-time
sign-in codes, and adds account_saved_item for per-account saved galleries and feed items.

Revision ID: d4e8f1a2b3c4
Revises: d7c9a2b6e1f4
Create Date: 2026-06-30 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "d4e8f1a2b3c4"
down_revision: Union[str, Sequence[str], None] = "d7c9a2b6e1f4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_column("account", "password_hash")

    op.create_table(
        "login_code",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("code_hash", sa.String(length=255), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("consumed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("attempt_count", sa.Integer(), server_default="0", nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_login_code_email_expires_at",
        "login_code",
        ["email", "expires_at"],
        unique=False,
    )

    op.create_table(
        "account_saved_item",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("account_id", sa.Uuid(), nullable=False),
        sa.Column("item_kind", sa.String(length=16), nullable=False),
        sa.Column("item_slug", sa.String(length=255), nullable=False),
        sa.Column(
            "saved_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["account_id"], ["account.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "account_id",
            "item_kind",
            "item_slug",
            name="uq_account_saved_item_account_kind_slug",
        ),
    )
    op.create_index(
        op.f("ix_account_saved_item_account_id"),
        "account_saved_item",
        ["account_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_account_saved_item_account_id"), table_name="account_saved_item")
    op.drop_table("account_saved_item")
    op.drop_index("ix_login_code_email_expires_at", table_name="login_code")
    op.drop_table("login_code")
    op.add_column(
        "account",
        sa.Column("password_hash", sa.String(length=255), nullable=False, server_default=""),
    )
    op.alter_column("account", "password_hash", server_default=None)
