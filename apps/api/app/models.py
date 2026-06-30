"""ORM models for the Grounded Art web app.

The data model and the decisions behind it are recorded in docs/data-model.md. Our database
is the system of record. External services seed and enrich it and never serve runtime reads
in their place.

Enumerated values are kept as strings in the database rather than native enums, so the set of
allowed values can evolve without a schema migration. The StrEnum classes below are the
reference for those values and are used for validation at the API boundary.
"""

import uuid
from datetime import date, datetime
from enum import StrEnum

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
    Uuid,
    func,
    text,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class GalleryStatus(StrEnum):
    ACTIVE = "active"
    HIDDEN = "hidden"
    OPTED_OUT = "opted_out"


class BusinessStatus(StrEnum):
    OPERATIONAL = "operational"
    CLOSED_TEMPORARILY = "closed_temporarily"
    CLOSED_PERMANENTLY = "closed_permanently"


class ExternalRefSource(StrEnum):
    GOOGLE_PLACES = "google_places"
    INSTAGRAM = "instagram"
    LISTING_SITE = "listing_site"
    GALLERY_SITE = "gallery_site"


class ImageSource(StrEnum):
    SCRAPED = "scraped"
    GALLERY_PROVIDED = "gallery_provided"
    MANUAL = "manual"


class ImagePermission(StrEnum):
    UNCONFIRMED = "unconfirmed"
    CLEARED = "cleared"
    GALLERY_PROVIDED = "gallery_provided"


class FeedItemType(StrEnum):
    EXHIBITION = "exhibition"
    OPENING = "opening"
    EVENT = "event"
    POST = "post"


class FeedItemKind(StrEnum):
    """The reveal behaviour kind, distinct from the internal type.

    Art posts and events open the two-stage reveal to a full detail page. Announcements stop
    at the expanded card with Save and Share only. Kind is set explicitly at creation; it is
    never inferred from content shape.
    """

    ART_POST = "art_post"
    EVENT = "event"
    ANNOUNCEMENT = "announcement"


class FeedItemStatus(StrEnum):
    ACTIVE = "active"
    HIDDEN = "hidden"
    OPTED_OUT = "opted_out"


class WalletTransactionReason(StrEnum):
    VERIFIED_CHECK_IN = "verified_check_in"
    SHOP_SPEND = "shop_spend"


class SavedItemKind(StrEnum):
    FEED = "feed"
    GALLERY = "gallery"


def _uuid_pk() -> Mapped[uuid.UUID]:
    return mapped_column(Uuid, primary_key=True, default=uuid.uuid4)


class TimestampMixin:
    """created_at and updated_at, maintained by the database."""

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )


class Gallery(Base, TimestampMixin):
    """A physical Cape Town gallery, rendered as a node on the map.

    Identity is ours: every gallery has an internal id and a stable slug. External
    identifiers live in GalleryExternalRef, never as the key, so a gallery can exist with no
    external references at all.
    """

    __tablename__ = "gallery"
    # Coordinates are seeded and scraped from outside sources, so guard against out-of-range
    # values landing in the system of record. Null is allowed (a gallery may have no coordinates).
    __table_args__ = (
        CheckConstraint(
            "latitude IS NULL OR latitude BETWEEN -90 AND 90",
            name="ck_gallery_latitude_range",
        ),
        CheckConstraint(
            "longitude IS NULL OR longitude BETWEEN -180 AND 180",
            name="ck_gallery_longitude_range",
        ),
    )

    id: Mapped[uuid.UUID] = _uuid_pk()
    slug: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)

    formatted_address: Mapped[str | None] = mapped_column(String(512))
    suburb: Mapped[str | None] = mapped_column(String(255), index=True)
    latitude: Mapped[float | None] = mapped_column(Float)
    longitude: Mapped[float | None] = mapped_column(Float)

    website_url: Mapped[str | None] = mapped_column(String(512))
    phone: Mapped[str | None] = mapped_column(String(64))
    # Structured opening hours, owned by us and sourced from gallery sites and manual entry.
    hours: Mapped[dict | None] = mapped_column(JSONB)
    # One of BusinessStatus.
    business_status: Mapped[str | None] = mapped_column(String(32))

    # One of GalleryStatus. opted_out supports takedown and opt-out requests.
    status: Mapped[str] = mapped_column(
        String(32), nullable=False, server_default=GalleryStatus.ACTIVE
    )
    featured: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="false")
    featured_rank: Mapped[int | None] = mapped_column(Integer)

    # Field-group provenance: {field_group: {source, source_url, last_verified}}.
    provenance: Mapped[dict | None] = mapped_column(JSONB)
    last_refreshed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    # Optional brand for badge and pin rendering on post cards and the map.
    brand_name: Mapped[str | None] = mapped_column(String(255))
    brand_logo_url: Mapped[str | None] = mapped_column(String(512))

    external_refs: Mapped[list["GalleryExternalRef"]] = relationship(
        back_populates="gallery", cascade="all, delete-orphan"
    )
    images: Mapped[list["GalleryImage"]] = relationship(
        back_populates="gallery", cascade="all, delete-orphan"
    )
    feed_items: Mapped[list["FeedItem"]] = relationship(back_populates="gallery")
    check_ins: Mapped[list["CheckIn"]] = relationship(back_populates="gallery")


class GalleryExternalRef(Base, TimestampMixin):
    """A link from a gallery to its entry in an outside system.

    These are reconciliation attributes, not identity. The Google place_id, an Instagram
    handle, and listing or gallery site URLs are stored here.
    """

    __tablename__ = "gallery_external_ref"
    __table_args__ = (
        UniqueConstraint("source", "external_id", name="uq_external_ref_source_external_id"),
    )

    id: Mapped[uuid.UUID] = _uuid_pk()
    gallery_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("gallery.id", ondelete="CASCADE"), nullable=False, index=True
    )
    # One of ExternalRefSource.
    source: Mapped[str] = mapped_column(String(32), nullable=False)
    external_id: Mapped[str | None] = mapped_column(String(512))
    url: Mapped[str | None] = mapped_column(String(512))
    last_synced_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    gallery: Mapped["Gallery"] = relationship(back_populates="external_refs")


class GalleryImage(Base, TimestampMixin):
    """An image belonging to a gallery, hosted by Grounded Art.

    Images are scraped during this phase and replaced by gallery-provided images as
    relationships form. Each image tracks its source, permission status, and attribution.
    """

    __tablename__ = "gallery_image"
    # At most one image per gallery may be the primary (the hero shown on cards and the map).
    __table_args__ = (
        Index(
            "uq_gallery_image_one_primary",
            "gallery_id",
            unique=True,
            postgresql_where=text("is_primary"),
        ),
    )

    id: Mapped[uuid.UUID] = _uuid_pk()
    gallery_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("gallery.id", ondelete="CASCADE"), nullable=False, index=True
    )
    url: Mapped[str] = mapped_column(String(512), nullable=False)
    # One of ImageSource.
    source: Mapped[str] = mapped_column(String(32), nullable=False)
    source_url: Mapped[str | None] = mapped_column(String(512))
    # One of ImagePermission.
    permission_status: Mapped[str] = mapped_column(
        String(32), nullable=False, server_default=ImagePermission.UNCONFIRMED
    )
    attribution: Mapped[str | None] = mapped_column(String(255))
    width: Mapped[int | None] = mapped_column(Integer)
    height: Mapped[int | None] = mapped_column(Integer)
    is_primary: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="false")
    sort_rank: Mapped[int | None] = mapped_column(Integer)
    captured_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    gallery: Mapped["Gallery"] = relationship(back_populates="images")


class FeedItem(Base, TimestampMixin):
    """An event or post in the feed.

    Feed items are owned entirely by Grounded Art. They are optionally linked to a gallery,
    and when they come from a creative with no physical space they carry that creative's name
    and a link to their digital presence instead. The dates drive the temporal views.
    """

    __tablename__ = "feed_item"

    id: Mapped[uuid.UUID] = _uuid_pk()
    slug: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    # One of FeedItemType.
    type: Mapped[str] = mapped_column(String(32), nullable=False)
    # One of FeedItemKind. Drives the reveal behaviour; set explicitly at creation, never null.
    kind: Mapped[str] = mapped_column(
        String(32), nullable=False, server_default=FeedItemKind.ART_POST
    )
    title: Mapped[str] = mapped_column(String(512), nullable=False)
    body: Mapped[str | None] = mapped_column(Text)

    # Cross-link to a gallery node, when the item is tied to one.
    gallery_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("gallery.id", ondelete="SET NULL"), index=True
    )
    # For items from a creative with no physical space.
    creative_name: Mapped[str | None] = mapped_column(String(255))
    external_url: Mapped[str | None] = mapped_column(String(512))
    image_url: Mapped[str | None] = mapped_column(String(512))
    # An optional physical location not tied to a gallery.
    location_text: Mapped[str | None] = mapped_column(String(512))

    # Day-granularity dates that drive the temporal views (this weekend, opening this week,
    # closing soon).
    starts_on: Mapped[date | None] = mapped_column(Date, index=True)
    ends_on: Mapped[date | None] = mapped_column(Date, index=True)

    # One of FeedItemStatus.
    status: Mapped[str] = mapped_column(
        String(32), nullable=False, server_default=FeedItemStatus.ACTIVE
    )
    featured: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="false")
    featured_rank: Mapped[int | None] = mapped_column(Integer)

    source: Mapped[str | None] = mapped_column(String(64))
    source_url: Mapped[str | None] = mapped_column(String(512))
    provenance: Mapped[dict | None] = mapped_column(JSONB)
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    last_refreshed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    gallery: Mapped["Gallery | None"] = relationship(back_populates="feed_items")
    images: Mapped[list["FeedItemImage"]] = relationship(
        back_populates="feed_item", cascade="all, delete-orphan"
    )
    links: Mapped[list["FeedItemLink"]] = relationship(
        back_populates="feed_item", cascade="all, delete-orphan"
    )


class FeedItemImage(Base, TimestampMixin):
    """An image belonging to a feed item, hosted by Grounded Art.

    Mirrors GalleryImage. A post can carry several images shown full-dimension in the detail
    page. Width and height are required for new images so the detail page can reserve an aspect
    box and avoid layout shift; legacy or external images without them fall back to natural size.
    """

    __tablename__ = "feed_item_image"
    # At most one image per feed item may be the primary.
    __table_args__ = (
        Index(
            "uq_feed_item_image_one_primary",
            "feed_item_id",
            unique=True,
            postgresql_where=text("is_primary"),
        ),
    )

    id: Mapped[uuid.UUID] = _uuid_pk()
    feed_item_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("feed_item.id", ondelete="CASCADE"), nullable=False, index=True
    )
    url: Mapped[str] = mapped_column(String(512), nullable=False)
    # One of ImageSource.
    source: Mapped[str] = mapped_column(String(32), nullable=False)
    source_url: Mapped[str | None] = mapped_column(String(512))
    # One of ImagePermission.
    permission_status: Mapped[str] = mapped_column(
        String(32), nullable=False, server_default=ImagePermission.UNCONFIRMED
    )
    attribution: Mapped[str | None] = mapped_column(String(255))
    width: Mapped[int | None] = mapped_column(Integer)
    height: Mapped[int | None] = mapped_column(Integer)
    is_primary: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="false")
    sort_rank: Mapped[int | None] = mapped_column(Integer)

    feed_item: Mapped["FeedItem"] = relationship(back_populates="images")


class FeedItemLink(Base, TimestampMixin):
    """An optional social or site link on a feed item.

    Per-post for now; there is no account entity for creatives yet. This moves cleanly to a
    per-account home when accounts arrive.
    """

    __tablename__ = "feed_item_link"

    id: Mapped[uuid.UUID] = _uuid_pk()
    feed_item_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("feed_item.id", ondelete="CASCADE"), nullable=False, index=True
    )
    label: Mapped[str] = mapped_column(String(128), nullable=False)
    url: Mapped[str] = mapped_column(String(512), nullable=False)
    sort_rank: Mapped[int | None] = mapped_column(Integer)

    feed_item: Mapped["FeedItem"] = relationship(back_populates="links")


class Account(Base, TimestampMixin):
    """A signed-in user. Check in, profile, and wallet require an account."""

    __tablename__ = "account"

    id: Mapped[uuid.UUID] = _uuid_pk()
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    display_name: Mapped[str] = mapped_column(String(255), nullable=False)
    title: Mapped[str | None] = mapped_column(String(255))
    avatar_url: Mapped[str | None] = mapped_column(String(512))
    bio: Mapped[str | None] = mapped_column(Text)
    first_name: Mapped[str | None] = mapped_column(String(255))
    last_name: Mapped[str | None] = mapped_column(String(255))
    phone: Mapped[str | None] = mapped_column(String(64))
    joined_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    sessions: Mapped[list["Session"]] = relationship(
        back_populates="account", cascade="all, delete-orphan"
    )
    check_ins: Mapped[list["CheckIn"]] = relationship(
        back_populates="account", cascade="all, delete-orphan"
    )
    wallet_transactions: Mapped[list["WalletTransaction"]] = relationship(
        back_populates="account", cascade="all, delete-orphan"
    )
    saved_items: Mapped[list["AccountSavedItem"]] = relationship(
        back_populates="account", cascade="all, delete-orphan"
    )


class LoginCode(Base):
    """A short-lived one-time code for passwordless email sign-in."""

    __tablename__ = "login_code"
    __table_args__ = (Index("ix_login_code_email_expires_at", "email", "expires_at"),)

    id: Mapped[uuid.UUID] = _uuid_pk()
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    code_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    consumed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    attempt_count: Mapped[int] = mapped_column(Integer, nullable=False, server_default="0")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )


class AccountSavedItem(Base):
    """A gallery or feed item saved by an account."""

    __tablename__ = "account_saved_item"
    __table_args__ = (
        UniqueConstraint(
            "account_id",
            "item_kind",
            "item_slug",
            name="uq_account_saved_item_account_kind_slug",
        ),
    )

    id: Mapped[uuid.UUID] = _uuid_pk()
    account_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("account.id", ondelete="CASCADE"), nullable=False, index=True
    )
    # One of SavedItemKind.
    item_kind: Mapped[str] = mapped_column(String(16), nullable=False)
    item_slug: Mapped[str] = mapped_column(String(255), nullable=False)
    saved_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    account: Mapped["Account"] = relationship(back_populates="saved_items")


class Session(Base, TimestampMixin):
    """A server-issued sign-in session for an account."""

    __tablename__ = "session"

    id: Mapped[uuid.UUID] = _uuid_pk()
    account_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("account.id", ondelete="CASCADE"), nullable=False, index=True
    )
    token_hash: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    check_in_challenge_token: Mapped[str | None] = mapped_column(String(255))
    check_in_challenge_expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    check_in_challenge_gallery_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("gallery.id", ondelete="SET NULL"), index=True
    )

    account: Mapped["Account"] = relationship(back_populates="sessions")
    check_in_challenge_gallery: Mapped["Gallery | None"] = relationship()


class CheckIn(Base, TimestampMixin):
    """A record that an account checked in at a gallery."""

    __tablename__ = "check_in"
    __table_args__ = (
        Index(
            "ix_check_in_account_gallery_checked_in_at",
            "account_id",
            "gallery_id",
            "checked_in_at",
        ),
    )

    id: Mapped[uuid.UUID] = _uuid_pk()
    account_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("account.id", ondelete="CASCADE"), nullable=False, index=True
    )
    gallery_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("gallery.id", ondelete="CASCADE"), nullable=False, index=True
    )
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    checked_in_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    verified: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="false")
    point_awarded: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="false")

    account: Mapped["Account"] = relationship(back_populates="check_ins")
    gallery: Mapped["Gallery"] = relationship(back_populates="check_ins")
    wallet_transaction: Mapped["WalletTransaction | None"] = relationship(
        back_populates="check_in", uselist=False
    )


class WalletTransaction(Base, TimestampMixin):
    """One entry in an account's append-only points ledger."""

    __tablename__ = "wallet_transaction"

    id: Mapped[uuid.UUID] = _uuid_pk()
    account_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("account.id", ondelete="CASCADE"), nullable=False, index=True
    )
    delta: Mapped[int] = mapped_column(Integer, nullable=False)
    # One of WalletTransactionReason.
    reason: Mapped[str] = mapped_column(String(32), nullable=False)
    check_in_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("check_in.id", ondelete="SET NULL"), unique=True, index=True
    )

    account: Mapped["Account"] = relationship(back_populates="wallet_transactions")
    check_in: Mapped["CheckIn | None"] = relationship(back_populates="wallet_transaction")


class ContactMessage(Base):
    """A message sent through the contact page."""

    __tablename__ = "contact_message"

    id: Mapped[uuid.UUID] = _uuid_pk()
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    subject: Mapped[str] = mapped_column(String(512), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    received_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), index=True
    )
