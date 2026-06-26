"""Seed the database with a curated set of real Cape Town galleries and feed items.

This is the thin curated seed described in docs/PLANNING.md. It populates enough real data
to make the map nodes and the feed temporal views meaningful, and verifies the migration and
the read API end to end. It is not the full content pipeline.

Run from apps/api with:

    uv run python -m app.seed

The script is idempotent: it upserts by slug, so running it again updates existing rows
rather than creating duplicates.

Galleries are real Cape Town galleries, with details gathered from gallery sites and public
listings. Most feed items are real exhibitions and events with a source link recorded in
provenance. Items whose source is "sample_seed" are placeholders that exist to exercise a
code path and should be replaced by curated content.
"""

import argparse
import json
from datetime import date, datetime, timezone
from pathlib import Path

from app.db import SessionLocal
from app.models import FeedItem, Gallery, GalleryExternalRef

SEED_DIR = Path(__file__).resolve().parent.parent / "seed"

# Scalar columns copied straight from the gallery fixture.
_GALLERY_FIELDS = (
    "name",
    "description",
    "formatted_address",
    "suburb",
    "latitude",
    "longitude",
    "website_url",
    "phone",
    "hours",
    "business_status",
    "featured",
    "featured_rank",
)

# Scalar columns copied straight from the feed item fixture.
_FEED_FIELDS = (
    "type",
    "title",
    "body",
    "creative_name",
    "external_url",
    "image_url",
    "location_text",
    "starts_on",
    "ends_on",
    "featured",
)


def _load(name: str) -> list[dict]:
    return json.loads((SEED_DIR / name).read_text())


def _parse_date(value: str | None) -> date | None:
    return date.fromisoformat(value) if value else None


def _provenance(source: str | None, source_url: str | None, today: date) -> dict:
    return {
        "seed": {
            "source": source or "manual",
            "source_url": source_url,
            "last_verified": today.isoformat(),
        }
    }


def seed_galleries(session, now: datetime) -> int:
    rows = _load("galleries.json")

    # First pass: upsert gallery scalars and drop any existing external refs. The deletes are
    # flushed before the new refs are inserted below, so a re-run cannot collide with itself on
    # the (source, external_id) unique constraint.
    galleries: dict[str, Gallery] = {}
    for row in rows:
        slug = row["slug"]
        gallery = session.query(Gallery).filter_by(slug=slug).one_or_none()
        if gallery is None:
            gallery = Gallery(slug=slug)
            session.add(gallery)

        for field in _GALLERY_FIELDS:
            setattr(gallery, field, row.get(field))
        gallery.provenance = _provenance("manual_research", row.get("website_url"), now.date())
        gallery.last_refreshed_at = now

        for ref in list(gallery.external_refs):
            session.delete(ref)
        galleries[slug] = gallery

    session.flush()

    # Second pass: insert the external refs now that the old ones are gone.
    for row in rows:
        gallery = galleries[row["slug"]]
        for ref in row.get("external_refs", []):
            gallery.external_refs.append(
                GalleryExternalRef(
                    source=ref["source"],
                    external_id=ref.get("external_id"),
                    url=ref.get("url"),
                    last_synced_at=now,
                )
            )

    session.flush()
    return len(galleries)


def seed_feed_items(session, now: datetime) -> int:
    galleries = {g.slug: g.id for g in session.query(Gallery.slug, Gallery.id).all()}
    count = 0
    for row in _load("feed_items.json"):
        slug = row["slug"]
        item = session.query(FeedItem).filter_by(slug=slug).one_or_none()
        if item is None:
            item = FeedItem(slug=slug)
            session.add(item)

        for field in _FEED_FIELDS:
            value = row.get(field)
            if field in ("starts_on", "ends_on"):
                value = _parse_date(value)
            setattr(item, field, value)

        gallery_slug = row.get("gallery_slug")
        if gallery_slug is not None and gallery_slug not in galleries:
            raise ValueError(f"feed item {slug!r} references unknown gallery {gallery_slug!r}")
        item.gallery_id = galleries.get(gallery_slug) if gallery_slug else None

        item.source = row.get("source")
        item.source_url = row.get("source_url")
        item.provenance = _provenance(row.get("source"), row.get("source_url"), now.date())
        item.last_refreshed_at = now
        count += 1

    session.flush()
    return count


def reset(session) -> None:
    """Clear the seeded tables for a clean, deterministic load.

    Use this to drop ad-hoc rows that are not part of the curated seed. feed_item is removed
    first because it references gallery.
    """
    session.query(FeedItem).delete()
    session.query(GalleryExternalRef).delete()
    session.query(Gallery).delete()
    session.flush()


def main() -> None:
    parser = argparse.ArgumentParser(description="Seed the Grounded Art database.")
    parser.add_argument(
        "--reset",
        action="store_true",
        help="Clear galleries, external refs, and feed items before seeding.",
    )
    args = parser.parse_args()

    now = datetime.now(timezone.utc)
    with SessionLocal() as session:
        if args.reset:
            reset(session)
        galleries = seed_galleries(session, now)
        feed_items = seed_feed_items(session, now)
        session.commit()
    print(f"Seeded {galleries} galleries and {feed_items} feed items.")


if __name__ == "__main__":
    main()
