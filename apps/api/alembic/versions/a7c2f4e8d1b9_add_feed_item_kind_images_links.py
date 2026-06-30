"""add feed item kind, images, and links

Adds the post detail data: a non-nullable kind on feed_item (backfilled in this revision so no
row is ever without a kind), a feed_item_image collection mirroring gallery_image, and an
optional per-post feed_item_link set.

The kind backfill maps the internal type: exhibition, opening, and event become event; post
becomes art_post. Announcements are reclassified by hand afterwards; there is no content-shape
heuristic.

Revision ID: a7c2f4e8d1b9
Revises: 30b349769e87
Create Date: 2026-06-30 09:20:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a7c2f4e8d1b9'
down_revision: Union[str, Sequence[str], None] = '30b349769e87'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # 1. Add kind nullable with a server default, so existing rows are filled, then backfill by
    #    type, then enforce NOT NULL. No row is left without a kind.
    op.add_column(
        'feed_item',
        sa.Column('kind', sa.String(length=32), server_default='art_post', nullable=True),
    )
    op.execute(
        "UPDATE feed_item SET kind = 'event' "
        "WHERE type IN ('exhibition', 'opening', 'event')"
    )
    op.execute("UPDATE feed_item SET kind = 'art_post' WHERE type = 'post'")
    op.alter_column('feed_item', 'kind', existing_type=sa.String(length=32), nullable=False)

    # 2. Post images, mirroring gallery_image.
    op.create_table(
        'feed_item_image',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('feed_item_id', sa.Uuid(), nullable=False),
        sa.Column('url', sa.String(length=512), nullable=False),
        sa.Column('source', sa.String(length=32), nullable=False),
        sa.Column('source_url', sa.String(length=512), nullable=True),
        sa.Column(
            'permission_status',
            sa.String(length=32),
            server_default='unconfirmed',
            nullable=False,
        ),
        sa.Column('attribution', sa.String(length=255), nullable=True),
        sa.Column('width', sa.Integer(), nullable=True),
        sa.Column('height', sa.Integer(), nullable=True),
        sa.Column('is_primary', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('sort_rank', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['feed_item_id'], ['feed_item.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(
        op.f('ix_feed_item_image_feed_item_id'),
        'feed_item_image',
        ['feed_item_id'],
        unique=False,
    )
    op.create_index(
        'uq_feed_item_image_one_primary',
        'feed_item_image',
        ['feed_item_id'],
        unique=True,
        postgresql_where=sa.text('is_primary'),
    )

    # 3. Per-post links.
    op.create_table(
        'feed_item_link',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('feed_item_id', sa.Uuid(), nullable=False),
        sa.Column('label', sa.String(length=128), nullable=False),
        sa.Column('url', sa.String(length=512), nullable=False),
        sa.Column('sort_rank', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['feed_item_id'], ['feed_item.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(
        op.f('ix_feed_item_link_feed_item_id'),
        'feed_item_link',
        ['feed_item_id'],
        unique=False,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_feed_item_link_feed_item_id'), table_name='feed_item_link')
    op.drop_table('feed_item_link')
    op.drop_index('uq_feed_item_image_one_primary', table_name='feed_item_image')
    op.drop_index(op.f('ix_feed_item_image_feed_item_id'), table_name='feed_item_image')
    op.drop_table('feed_item_image')
    op.drop_column('feed_item', 'kind')
