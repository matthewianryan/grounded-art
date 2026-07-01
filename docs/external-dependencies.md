# External dependencies

This document is the register of every external service Grounded Art relies on. Grounded
Art is built as its own system. External services are used where they earn their place
during this non-commercial stage, and each reliance is recorded here with the path to
decouple from it later.

Each reliance is classified by role:

- Seed: a batch import we run, after which our database owns the data.
- Live: a runtime dependency the running product calls.

The standing intent is to keep reliances at Seed and to keep Live reliances few, bounded,
and replaceable.

## Google Places API

- Role: Seed, with periodic re-sync. Runtime never calls Places.
- Provides: gallery discovery within the Cape Town bounding box, coordinates, and an
  initial seed of address. The Google `place_id` is stored as one external reference, not
  as our identity.
- Does not provide our truth: hours, phone, website, descriptions, and images are owned by
  Grounded Art and sourced separately. Ratings and reviews are not used at all.
- Decoupling path: our database is the system of record after import. Removing the import
  job stops new reliance with no runtime impact. Identity is not coupled, because the
  `place_id` lives in the gallery external references and can be dropped.

## Google Maps base layer

- Role: Live. The base map canvas, tiles, and pan and zoom only.
- Provides: the rendered base map on the maps page. Everything drawn on top, the gallery
  nodes and the side-panel cards, is rendered from our own data.
- Browser key setup: restrict to the Maps JavaScript API and to HTTP referrers. For local
  development, allow `http://localhost:3000/*` and `http://localhost:3001/*`. The landing
  app proxies `/app` to the web app, but the browser referer stays on port 3000.
- Decoupling path: the map is accessed through an internal provider boundary, so the base
  layer can be swapped to MapLibre with vector tiles later without touching the node and
  card code.

## Scraped sources and social posts

- Role: Seed, ongoing. Listing sites, gallery websites, and social posts including
  Instagram, through the content pipeline.
- Provides: images and feed content during this phase, and confirmation or correction of
  seeded gallery details.
- Decoupling path: scraped content is owned in our database, attributed and tracked by
  source, and replaced by gallery-provided content as relationships form. See
  [Content pipeline](content-pipeline.md).

## Resend

- Role: Live. Transactional email for passwordless sign-in codes only.
- Provides: delivery of one-time login codes when `EMAIL_PROVIDER=resend` on the API.
- Setup: verify `grounded-art.co.za` in Resend and add SPF and DKIM DNS records. Set
  `RESEND_API_KEY` and `EMAIL_FROM` on the API. Local development uses `EMAIL_PROVIDER=console`
  and logs codes to the API process instead.
- Decoupling path: the sender is behind `get_email_sender()` in `apps/api/app/services/email.py`.
  Another provider can be added without changing the auth flow.
