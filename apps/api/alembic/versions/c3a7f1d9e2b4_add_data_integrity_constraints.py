"""add data integrity constraints

Adds coordinate-range checks on gallery and a partial unique index enforcing at most one
primary image per gallery. These guard the system of record against bad seeded and scraped data.

Revision ID: c3a7f1d9e2b4
Revises: b130255744cd
Create Date: 2026-06-26 11:30:00.000000

"""
from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "c3a7f1d9e2b4"
down_revision: Union[str, Sequence[str], None] = "b130255744cd"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_check_constraint(
        "ck_gallery_latitude_range",
        "gallery",
        "latitude IS NULL OR latitude BETWEEN -90 AND 90",
    )
    op.create_check_constraint(
        "ck_gallery_longitude_range",
        "gallery",
        "longitude IS NULL OR longitude BETWEEN -180 AND 180",
    )
    op.create_index(
        "uq_gallery_image_one_primary",
        "gallery_image",
        ["gallery_id"],
        unique=True,
        postgresql_where="is_primary",
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index("uq_gallery_image_one_primary", table_name="gallery_image")
    op.drop_constraint("ck_gallery_longitude_range", "gallery", type_="check")
    op.drop_constraint("ck_gallery_latitude_range", "gallery", type_="check")
