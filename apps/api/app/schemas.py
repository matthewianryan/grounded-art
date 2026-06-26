"""Pydantic response schemas for the read API.

These are the public shapes returned to the web app. Internal and operational fields, such as
status, provenance, source, and the maintenance timestamps, are deliberately left out so they
are not exposed through the API.
"""

import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


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
    last_refreshed_at: datetime | None
    images: list[GalleryImageRead]
    external_refs: list[GalleryExternalRefRead]


class FeedItemRead(ORMModel):
    id: uuid.UUID
    slug: str
    type: str
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
