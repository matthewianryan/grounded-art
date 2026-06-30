"""Pydantic response schemas for the read API.

These are the public shapes returned to the web app. Internal and operational fields, such as
status, provenance, source, and the maintenance timestamps, are deliberately left out so they
are not exposed through the API.
"""

import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class GalleryImageRead(ORMModel):
    id: uuid.UUID
    url: str
    attribution: str | None
    width: int | None
    height: int | None
    is_primary: bool
    sort_rank: int | None


class GalleryExternalRefRead(ORMModel):
    id: uuid.UUID
    source: str
    external_id: str | None
    url: str | None


class GalleryRead(ORMModel):
    id: uuid.UUID
    slug: str
    name: str
    description: str | None
    formatted_address: str | None
    suburb: str | None
    latitude: float | None
    longitude: float | None
    website_url: str | None
    phone: str | None
    hours: dict | None
    business_status: str | None
    featured: bool
    brand_name: str | None
    brand_logo_url: str | None
    last_refreshed_at: datetime | None
    images: list[GalleryImageRead]
    external_refs: list[GalleryExternalRefRead]


class FeedItemImageRead(ORMModel):
    id: uuid.UUID
    url: str
    attribution: str | None
    width: int | None
    height: int | None
    is_primary: bool
    sort_rank: int | None


class FeedItemLinkRead(ORMModel):
    id: uuid.UUID
    label: str
    url: str
    sort_rank: int | None


class FeedItemRead(ORMModel):
    id: uuid.UUID
    slug: str
    type: str
    kind: str
    title: str
    body: str | None
    gallery_id: uuid.UUID | None
    creative_name: str | None
    external_url: str | None
    image_url: str | None
    location_text: str | None
    starts_on: date | None
    ends_on: date | None
    featured: bool
    published_at: datetime | None
    last_refreshed_at: datetime | None
    images: list[FeedItemImageRead]
    links: list[FeedItemLinkRead]


class GalleryPage(BaseModel):
    items: list[GalleryRead]
    total: int
    limit: int
    offset: int


class FeedPage(BaseModel):
    items: list[FeedItemRead]
    total: int
    limit: int
    offset: int


# Auth and account schemas


class RequestCodeBody(BaseModel):
    email: EmailStr


class VerifyCodeBody(BaseModel):
    email: EmailStr
    code: str = Field(min_length=6, max_length=6)
    saved_keys: list[str] = Field(default_factory=list)


class AccountRead(ORMModel):
    id: uuid.UUID
    email: str
    display_name: str
    title: str | None
    avatar_url: str | None
    bio: str | None
    first_name: str | None
    last_name: str | None
    phone: str | None
    joined_at: datetime


class AccountUpdate(BaseModel):
    display_name: str | None = Field(default=None, min_length=1, max_length=255)
    title: str | None = Field(default=None, max_length=255)
    avatar_url: str | None = Field(default=None, max_length=512)
    bio: str | None = None
    first_name: str | None = Field(default=None, max_length=255)
    last_name: str | None = Field(default=None, max_length=255)
    phone: str | None = Field(default=None, max_length=64)


class SavedItemRead(BaseModel):
    kind: str
    slug: str
    saved_at: datetime
    gallery: GalleryRead | None = None
    feed_item: FeedItemRead | None = None


class SavedPage(BaseModel):
    items: list[SavedItemRead]


class AddSavedBody(BaseModel):
    kind: str = Field(pattern="^(feed|gallery)$")
    slug: str = Field(min_length=1, max_length=255)


class WalletTransactionRead(BaseModel):
    id: uuid.UUID
    delta: int
    reason: str
    created_at: datetime
    gallery_name: str | None = None


class WalletRead(BaseModel):
    balance: int
    transactions: list[WalletTransactionRead]


class CheckInRead(BaseModel):
    id: uuid.UUID
    gallery_slug: str
    gallery_name: str
    checked_in_at: datetime
    verified: bool
    point_awarded: bool


class CheckInPage(BaseModel):
    items: list[CheckInRead]


class CheckInChallengeBody(BaseModel):
    gallery_slug: str = Field(min_length=1, max_length=255)


class CheckInChallengeRead(BaseModel):
    challenge_token: str
    expires_at: datetime


class CheckInCreateBody(BaseModel):
    gallery_slug: str = Field(min_length=1, max_length=255)
    latitude: float
    longitude: float
    challenge_token: str = Field(min_length=1)


class CheckInResultRead(BaseModel):
    id: uuid.UUID
    verified: bool
    point_awarded: bool
    already_earned_today: bool
    balance: int
