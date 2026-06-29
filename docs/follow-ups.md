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
galleries and feed items, the typed web API client, the app shell, and the Feed page with its
temporal views.

- Map page: render the seeded galleries as nodes on the Cape Town base map, with a side-panel
  card per gallery. The base layer goes through the provider boundary in `apps/web/src/lib/maps.ts`
  and needs the Google Maps key in `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`.
- Gallery detail surface for the card and any deep links, served from the existing
  `/galleries/{slug}` endpoint.
- API test suite covering the read endpoints, the status filtering, and the temporal views,
  run against a test database in CI.
- Image pipeline: host gallery and feed images with source, permission status, and attribution,
  then show them on the cards and the map.
- Content ingestion to saturate the galleries and the feed beyond the seed, through the content
  pipeline.

## After v1

- Editorial stories layer over the directory.
