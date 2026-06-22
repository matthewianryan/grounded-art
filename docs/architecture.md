# Architecture

## Stack

- Frontend: Next.js with TypeScript. This is used for both the landing page and the web
  app frontend.
- Web app backend: FastAPI with Python.
- Database: PostgreSQL.

## Repository structure

Grounded Art is one monorepo. The landing page and the web app are built as separate
Next.js apps so Dylan and Matthew can work in parallel with minimal overlap, and they are
served together as one site under one domain.

- `apps/landing` - Next.js + TypeScript. The marketing and information site. Owns the root
  routes. Built by Dylan.
- `apps/web` - Next.js + TypeScript. The web app, including the atlas and the feed. Owns
  the app routes. Built by Matthew.
- `apps/api` - FastAPI + Python. The web app backend. Built by Matthew.
- `packages/` - shared configuration and the shared Tailwind theme.

The landing app and the web app are stitched into one site using Next.js Multi-Zones. The
landing app holds the domain root and routes the app paths through to the web app. The
whole site is served from one domain.

## Domain

The site is served from www.grounded-art.co.za.

## Frontend tooling

- The monorepo is managed with pnpm workspaces and Turborepo.
- Styling uses Tailwind CSS v4 with a custom theme. The theme tokens are shared across the
  landing app and the web app so the stitched site stays visually consistent.

## Backend tooling

- The Python environment and dependencies are managed with uv.
- Database access uses SQLAlchemy. Schema migrations use Alembic.
- PostgreSQL runs locally through Docker Compose during development.

## Build order

Grounded Art launches as a live app, so the landing page and the web app are built toward one
launch rather than in sequence. The landing page opens directly into a working atlas and
feed. The web app and its seeded content are functional before launch.

## Team and workflow

Dylan and Matthew build Grounded Art together. Once the core scaffolding and shared
environment are set up, they work in parallel: Dylan on the landing page, Matthew on the
web app.
