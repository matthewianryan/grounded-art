# Grounded Art - Planning

This document and the documents it links to record decisions and intentions only.
Open questions, options, and anything undecided are kept out of these documents and
stay in working conversation until they become decisions.

## What Grounded Art is

Grounded Art is a website that connects people in Cape Town with local art,
galleries, and artists. It is built specifically for Cape Town.

Grounded Art brings the city's galleries, exhibitions, events, and posts into one
space, kept current and refreshed. It is curated and human-made.

## How we are different

- Against fragmentation: galleries, events, and posts live in one space rather than
  being scattered across separate social accounts.
- Against staleness: information and images are recent and regularly refreshed, so
  what people see reflects what is happening now.

## Current focus

The build is moving toward a single live launch. The landing page opens directly into a
working atlas and feed, so the landing page and the web app are built together rather than in
sequence. Dylan builds the landing page and Matthew builds the web app in parallel, on the
shared scaffolding and environment now in place. The stack and team workflow are recorded in
[Architecture](architecture.md). Core product decisions are recorded in [Product](product.md).

## Surfaces

- Landing page and home sections - see [Home page](pages/home.md)
- Posts feed - see [Posts feed](pages/posts.md)
- Maps atlas - see [Maps](pages/maps.md)
- About - see [About](pages/about.md)

## How content is gathered

Content is populated both manually and automatically. The automated approach is
documented in [Content pipeline](content-pipeline.md).

## Document index

- [Architecture](architecture.md)
- [Product](product.md)
- [Design](design.md)
- [Home page](pages/home.md)
- [Posts feed](pages/posts.md)
- [Maps](pages/maps.md)
- [About](pages/about.md)
- [Content pipeline](content-pipeline.md)

## Writing rule for all surfaces

All user-facing copy is written to read as human-written. We strip AI tells from copy,
including em dashes. This applies across the landing page and every page of the app.
