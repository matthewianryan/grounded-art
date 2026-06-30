"""add contact rate limit events

Revision ID: d7c9a2b6e1f4
Revises: 30b349769e87
Create Date: 2026-06-30 14:47:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


# revision identifiers, used by Alembic.
revision: str = "d7c9a2b6e1f4"
down_revision: Union[str, Sequence[str], None] = "30b349769e87"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "contact_rate_limit_event",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("key", sa.String(length=512), nullable=False),
        sa.Column(
            "occurred_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_contact_rate_limit_event_key",
        "contact_rate_limit_event",
        ["key"],
        unique=False,
    )
    op.create_index(
        "ix_contact_rate_limit_event_occurred_at",
        "contact_rate_limit_event",
        ["occurred_at"],
        unique=False,
    )
    op.create_index(
        "ix_contact_rate_limit_event_key_occurred_at",
        "contact_rate_limit_event",
        ["key", "occurred_at"],
        unique=False,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(
        "ix_contact_rate_limit_event_key_occurred_at",
        table_name="contact_rate_limit_event",
    )
    op.drop_index("ix_contact_rate_limit_event_occurred_at", table_name="contact_rate_limit_event")
    op.drop_index("ix_contact_rate_limit_event_key", table_name="contact_rate_limit_event")
    op.drop_table("contact_rate_limit_event")
