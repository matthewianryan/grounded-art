"""check-in trust model

Adds the layered check-in presence model: a per-gallery on-site check_in_code (the venue-code
trust anchor), the challenge method carried on the session, and the presence method, fix
accuracy, and decline reason recorded on each check-in. See docs/wallet-and-presence.md.

Revision ID: e5f1a2c3d4b5
Revises: d4e8f1a2b3c4
Create Date: 2026-07-01 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "e5f1a2c3d4b5"
down_revision: Union[str, Sequence[str], None] = "d4e8f1a2b3c4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("gallery", sa.Column("check_in_code", sa.String(length=64), nullable=True))
    op.add_column(
        "session",
        sa.Column("check_in_challenge_method", sa.String(length=16), nullable=True),
    )
    op.add_column(
        "check_in",
        sa.Column(
            "presence_method",
            sa.String(length=16),
            server_default="geolocation",
            nullable=False,
        ),
    )
    op.add_column("check_in", sa.Column("accuracy_metres", sa.Float(), nullable=True))
    op.add_column("check_in", sa.Column("decline_reason", sa.String(length=32), nullable=True))


def downgrade() -> None:
    op.drop_column("check_in", "decline_reason")
    op.drop_column("check_in", "accuracy_metres")
    op.drop_column("check_in", "presence_method")
    op.drop_column("session", "check_in_challenge_method")
    op.drop_column("gallery", "check_in_code")
