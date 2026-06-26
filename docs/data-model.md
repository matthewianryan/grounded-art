# Data model

This document records the decided data model for the web app. It builds on the product
data model in [Product](product.md) and the dependency split in
[External dependencies](external-dependencies.md).

## System of record

Grounded Art's own database is the system of record. External services seed and enrich it,
and never serve runtime reads in their place.

## Canonical identity

Identity is ours and does not depend on any external service.

- Every gallery has an internal id and a stable slug used in public URLs.
- A gallery can exist with no external references at all. This is required for emerging
  artists and spaces that no external directory knows about.
- External identifiers, including the Google `place_id`, an Instagram handle, and listing
  or gallery site URLs, are stored as gallery external references. They are reconciliation
  attributes, not the key.

## Entities

- Gallery: a physical place, rendered as a node on the map. Holds name, slug, address,
  suburb, coordinates, website, phone, hours, business status, and a human-written
  description.
- Gallery external reference: a source and external id pair linking a gallery to an entry
  in an outside system, with the time it was last synced.
- Gallery image: an image belonging to a gallery, hosted by Grounded Art, with its source,
  permission status, and attribution. Images are scraped during this phase and replaced by
  gallery-provided images as relationships form.
- Feed item: an event or post. Optionally linked to a gallery. When it comes from a creative
  with no physical space, it carries that creative's name and a link to their digital
  presence instead. Carries the dates that drive the temporal views.

## Source of truth by field

- Identity, description, images, hours, phone, website, and all feed content are owned by
  Grounded Art.
- Discovery, coordinates, and the initial address seed come from Google Places at import
  time and are owned by us afterward.
- Hours are owned and sourced from gallery sites and manual entry, not taken live from any
  external service. Stale hours are the problem Grounded Art exists to fix, so they are not
  imported as truth.

## Ratings and reviews

Grounded Art does not use ratings or reviews. They are not stored and not shown.

## Provenance and freshness

- Each gallery records where its field groups came from, the source link, and when each was
  last verified. This supports the confirm-or-replace workflow against seeded and scraped
  content, and supports takedown and opt-out.
- Galleries and feed items record when they were last refreshed, so "kept current" is
  enforced rather than claimed.

## Curation

Curation is represented by a featured flag and ordering on galleries and feed items. The
richer editorial stories layer is a later addition and is not modelled yet.
