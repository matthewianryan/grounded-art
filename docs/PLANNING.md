# Grounded Art - Planning

This document and the documents it links to record decisions and intentions only.
Open questions, options, and anything undecided are kept out of these documents and
stay in working conversation until they become decisions.

## What Grounded Art is

Grounded Art is a website that connects people in Cape Town with local art,
galleries, and artists. It is built specifically for Cape Town.

Grounded Art brings the city's galleries, exhibitions, events, and posts into one
space, kept current and refreshed. It is curated and human-made.

Grounded Art is the connective tissue of Cape Town's art scene. It makes the scene
legible and accessible to the people who love it, and it gives visibility to the
artists who make it. Helping emerging Cape Town artists be seen is a core part of
the mission, not a side effect. Many local artists work without gallery
representation, and the feed gives them a place to be found.

## How we are different

- Against fragmentation: galleries, events, and posts live in one space rather than
  being scattered across separate social accounts.
- Against staleness: information and images are recent and regularly refreshed, so
  what people see reflects what is happening now.
- For the artists, not only the audience: Grounded Art exists to make Cape Town art
  discoverable and to make its artists visible, including those without a physical
  space or gallery representation.

## Who it is for

Grounded Art is designed for distinct audiences with distinct needs.

- Locals: residents looking for what is on and a reason to go out.
- Visitors: people in Cape Town for a short time who want to find the art scene,
  including cultural tourists and art fair visitors.
- Artists: Cape Town creatives, especially emerging artists, who want to be seen
  and discovered.
- Galleries: spaces that want reach and that want to stay current without extra
  effort.

## Current focus

The build ships in phases. v1 is the landing page, with every page filled with available
content, copy, and images. v2 is the web app: the feed and the maps page, saturated with
scraped Cape Town data. Dylan builds the landing page and Matthew builds the web app in
parallel on the shared scaffolding now in place, with the landing page shipping first as v1.
The stack and team workflow are recorded in [Architecture](architecture.md). Core product
decisions are recorded in [Product](product.md).

A v2 redesign is now underway: a stronger feed and map experience, plus accounts, a points
wallet earned by verified check-ins, a profile and account area, and a contact page. It is
recorded in [Redesign](redesign.md) and built by phase from [Redesign plan](redesign-plan.md).
Dylan and Matthew build it collaboratively across the repo.

## Surfaces

- Landing page and home sections - see [Home page](pages/home.md)
- Posts feed - see [Posts feed](pages/posts.md)
- Map - see [Maps](pages/maps.md)
- About - see [About](pages/about.md)

## How content is gathered

Content is populated both manually and automatically. The automated approach is
documented in [Content pipeline](content-pipeline.md).

## Document index

- [Architecture](architecture.md)
- [Product](product.md)
- [Data model](data-model.md)
- [External dependencies](external-dependencies.md)
- [Design](design.md)
- [Home page](pages/home.md)
- [Posts feed](pages/posts.md)
- [Maps](pages/maps.md)
- [About](pages/about.md)
- [Content pipeline](content-pipeline.md)
- [v1 status](v1-status.md)
- [Follow-ups](follow-ups.md)
- [Screencast](screencast.md)

### v2 redesign (current)

- [Redesign](redesign.md)
- [Redesign plan](redesign-plan.md)
- [Interactions](interactions.md)
- [Wallet and presence](wallet-and-presence.md)
- [Profile and account](pages/profile.md)
- [Contact](pages/contact.md)

## Writing rule for all surfaces

All user-facing copy is written to read as human-written. We strip AI tells from copy,
including em dashes. This applies across the landing page and every page of the app.
