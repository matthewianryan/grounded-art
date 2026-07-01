# Architecture

## Stack

- Frontend: Next.js with TypeScript. This is used for both the landing page and the web
  app frontend.
- Web app backend: FastAPI with Python.
- Database: PostgreSQL.

## Repository structure

Grounded Art is one monorepo. The landing page and the web app are built as separate
Next.js apps so Dylan and Matthew can work in parallel with minimal overlap. The landing is
served from the root domain, while the app runs on its own app subdomain.

- `apps/landing` - Next.js + TypeScript. The marketing and information site. Owns the root
  routes. Built by Dylan.
- `apps/web` - Next.js + TypeScript. The web app, including the map and the feed. Owns
  the app routes. Built by Matthew.
- `apps/api` - FastAPI + Python. The web app backend. Built by Matthew.
- `packages/` - shared configuration and the shared Tailwind theme.

The landing app and the web app are no longer stitched with Next.js Multi-Zones. The
landing app links to the app origin through `NEXT_PUBLIC_APP_URL`.

## Domain

The landing site is served from `grounded-art.co.za` and `www.grounded-art.co.za` on
Cloudflare Pages. The app is served from `app.grounded-art.co.za`, and the API from
`api.grounded-art.co.za`, both on the xneelo Docker server.

Staging and production setup: [Deployment](deployment.md).

## Frontend tooling

- The monorepo is managed with pnpm workspaces and Turborepo.
- Styling uses Tailwind CSS v4 with a custom theme. The theme tokens are shared across the
  landing app and the web app so the stitched site stays visually consistent.
- Animation uses Motion in both the landing app and the web app, gated by the visitor's
  reduced-motion preference. The landing app additionally uses GSAP with the SplitText and
  DrawSVG plugins for the hero. GSAP is landing-only.

## Backend tooling

- The Python environment and dependencies are managed with uv.
- Database access uses SQLAlchemy. Schema migrations use Alembic.
- PostgreSQL, the API, the web app, and the reverse proxy run through Docker Compose during
  development and on the xneelo server.

## Build order

Grounded Art ships in phases. v1 is the landing page in `apps/landing`, built and filled with
available content, copy, and images. v2 is the web app in `apps/web`: the feed and the maps
page, saturated with scraped Cape Town data. The landing page leads into the app once v2 ships.
Dylan and Matthew still build in parallel on the shared scaffolding, with the landing page
shipping first.

## Team and workflow

Dylan and Matthew build Grounded Art together. Once the core scaffolding and shared
environment are set up, they work in parallel: Dylan on the landing page, Matthew on the
web app.
