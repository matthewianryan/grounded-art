# Follow-ups

A running list of decided work, kept short. Add items as they are decided, remove
them as they are done. This is a worklist, not a place for open questions.

## To launch v1

- Realign the landing copy with the sharpened positioning. Foreground emerging-artist
  visibility in the "For galleries and artists" section, and let the audience framing
  (locals, visitors, artists, galleries) read through the hero and feed sections.
- Swap placeholder imagery for real, cleared Cape Town gallery and artist images.
  v1 launches on the current placeholders and these are swapped in as they clear.
- Register grounded-art.co.za and deploy the landing to Cloudflare Pages.

## v2 web app

The v2 redesign is tracked in [Redesign plan](redesign-plan.md), with the design direction in
[Redesign](redesign.md). The items below remain the baseline web app worklist.

Built so far: the read API for galleries and the feed, the curated seed of real Cape Town
galleries and feed items, the typed web API client, the app shell, feed, map, gallery detail,
auth, profile, wallet, check-in, and contact surfaces.

- API test suite covering the read endpoints, the status filtering, and the temporal views,
  run against a test database in CI.
- Image pipeline: host gallery and feed images with source, permission status, and attribution,
  then show them on the cards and the map.
- Content ingestion to saturate the galleries and the feed beyond the seed, through the content
  pipeline.

## After v1

- Editorial stories layer over the directory.
- Deeper artist and gallery account layer. Phase 5 uses curated public profile-style cards
  backed by existing gallery and feed item data. A later phase should define and build the real
  self-managed artist or gallery presence, including the product rules for public profiles,
  account ownership or claiming, editing permissions, moderation, and attribution. Do not
  predefine the schema or permission model until that layer is actively planned.
