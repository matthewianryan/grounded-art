"""Pydantic response schemas for the read API.

These are the public shapes returned to the web app. Internal and operational fields, such as
status, provenance, source, and the maintenance timestamps, are deliberately left out so they
are not exposed through the API.
"""

import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


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


class ContactMessageCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    email: str = Field(min_length=3, max_length=255)
    subject: str = Field(min_length=2, max_length=512)
    message: str = Field(min_length=10, max_length=5000)

    @field_validator("name", "email", "subject", "message", mode="before")
    @classmethod
    def _strip_text(cls, value: str) -> str:
        if isinstance(value, str):
            return value.strip()
        return value

    @field_validator("email")
    @classmethod
    def _validate_email(cls, value: str) -> str:
        if "@" not in value or "." not in value.rsplit("@", 1)[-1]:
            raise ValueError("Enter a valid email address.")
        return value.lower()


class ContactMessageRead(ORMModel):
    id: uuid.UUID
    received_at: datetime
