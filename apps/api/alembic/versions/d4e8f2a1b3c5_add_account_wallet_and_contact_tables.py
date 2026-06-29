"""add account, session, check-in, wallet, contact, and gallery brand tables

Revision ID: d4e8f2a1b3c5
Revises: c3a7f1d9e2b4
Create Date: 2026-06-29 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "d4e8f2a1b3c5"
down_revision: Union[str, Sequence[str], None] = "c3a7f1d9e2b4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "account",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("display_name", sa.String(length=255), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=True),
        sa.Column("avatar_url", sa.String(length=512), nullable=True),
        sa.Column("bio", sa.Text(), nullable=True),
        sa.Column("first_name", sa.String(length=255), nullable=True),
        sa.Column("last_name", sa.String(length=255), nullable=True),
        sa.Column("phone", sa.String(length=64), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "session",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("account_id", sa.Uuid(), nullable=False),
        sa.Column("token_hash", sa.String(length=128), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["account_id"], ["account.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("token_hash", name="uq_session_token_hash"),
    )
    op.create_index(op.f("ix_session_account_id"), "session", ["account_id"], unique=False)
    op.create_index(op.f("ix_session_expires_at"), "session", ["expires_at"], unique=False)

    op.create_table(
        "gallery_brand",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("gallery_id", sa.Uuid(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("logo_url", sa.String(length=512), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["gallery_id"], ["gallery.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("gallery_id", name="uq_gallery_brand_gallery_id"),
    )
    op.create_index(op.f("ix_gallery_brand_gallery_id"), "gallery_brand", ["gallery_id"], unique=True)

    op.create_table(
        "check_in",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("account_id", sa.Uuid(), nullable=False),
        sa.Column("gallery_id", sa.Uuid(), nullable=False),
        sa.Column("reported_latitude", sa.Float(), nullable=False),
        sa.Column("reported_longitude", sa.Float(), nullable=False),
        sa.Column("reported_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("verified", sa.Boolean(), server_default="false", nullable=False),
        sa.Column("point_awarded", sa.Boolean(), server_default="false", nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.CheckConstraint(
            "reported_latitude BETWEEN -90 AND 90",
            name="ck_check_in_latitude_range",
        ),
        sa.CheckConstraint(
            "reported_longitude BETWEEN -180 AND 180",
            name="ck_check_in_longitude_range",
        ),
        sa.ForeignKeyConstraint(["account_id"], ["account.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["gallery_id"], ["gallery.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_check_in_account_id"), "check_in", ["account_id"], unique=False)
    op.create_index(op.f("ix_check_in_gallery_id"), "check_in", ["gallery_id"], unique=False)
    op.create_index(op.f("ix_check_in_reported_at"), "check_in", ["reported_at"], unique=False)
    op.create_index(
        "ix_check_in_account_gallery_reported_at",
        "check_in",
        ["account_id", "gallery_id", "reported_at"],
        unique=False,
    )

    op.create_table(
        "wallet_transaction",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("account_id", sa.Uuid(), nullable=False),
        sa.Column("delta", sa.Integer(), nullable=False),
        sa.Column("reason", sa.String(length=64), nullable=False),
        sa.Column("check_in_id", sa.Uuid(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.CheckConstraint("delta <> 0", name="ck_wallet_transaction_delta_nonzero"),
        sa.ForeignKeyConstraint(["account_id"], ["account.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["check_in_id"], ["check_in.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_wallet_transaction_account_id"),
        "wallet_transaction",
        ["account_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_wallet_transaction_check_in_id"),
        "wallet_transaction",
        ["check_in_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_wallet_transaction_created_at"),
        "wallet_transaction",
        ["created_at"],
        unique=False,
    )

    op.create_table(
        "contact_message",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("subject", sa.String(length=512), nullable=False),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_contact_message_created_at"),
        "contact_message",
        ["created_at"],
        unique=False,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f("ix_contact_message_created_at"), table_name="contact_message")
    op.drop_table("contact_message")

    op.drop_index(op.f("ix_wallet_transaction_created_at"), table_name="wallet_transaction")
    op.drop_index(op.f("ix_wallet_transaction_check_in_id"), table_name="wallet_transaction")
    op.drop_index(op.f("ix_wallet_transaction_account_id"), table_name="wallet_transaction")
    op.drop_table("wallet_transaction")

    op.drop_index("ix_check_in_account_gallery_reported_at", table_name="check_in")
    op.drop_index(op.f("ix_check_in_reported_at"), table_name="check_in")
    op.drop_index(op.f("ix_check_in_gallery_id"), table_name="check_in")
    op.drop_index(op.f("ix_check_in_account_id"), table_name="check_in")
    op.drop_table("check_in")

    op.drop_index(op.f("ix_gallery_brand_gallery_id"), table_name="gallery_brand")
    op.drop_table("gallery_brand")

    op.drop_index(op.f("ix_session_expires_at"), table_name="session")
    op.drop_index(op.f("ix_session_account_id"), table_name="session")
    op.drop_table("session")

    op.drop_table("account")
