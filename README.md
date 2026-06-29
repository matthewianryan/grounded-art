# Grounded Art

Grounded Art connects people in Cape Town with local art, galleries, and artists.

This is a pnpm and Turborepo monorepo. The landing page and the web app are separate
Next.js apps stitched into one site under one domain using Next.js multi-zones.

## Structure

- `apps/landing` - Next.js landing site. Owns the domain root.
- `apps/web` - Next.js web app (map, feed). Served under `/app` via multi-zones.
- `apps/api` - FastAPI and PostgreSQL backend.
- `packages/tailwind-config` - shared Tailwind theme tokens.
- `packages/tsconfig` - shared TypeScript base config.

## Documentation

- [Planning overview](docs/PLANNING.md) - product definition, scope, and index
- [Workflow](docs/workflow.md) - how Dylan and Matthew branch, push, and merge
- [Architecture](docs/architecture.md) - stack and team workflow
- [Product](docs/product.md) - core product decisions
- [Data model](docs/data-model.md) - entities, canonical identity, and source of truth
- [External dependencies](docs/external-dependencies.md) - external reliances and decoupling paths
- [Design](docs/design.md) - aesthetic and visual decisions
- [Home page](docs/pages/home.md) - landing page sections
- [Posts feed](docs/pages/posts.md) - the content feed
- [Maps](docs/pages/maps.md) - the Cape Town gallery map
- [About](docs/pages/about.md) - the about page
- [Content pipeline](docs/content-pipeline.md) - how content is gathered
- [v1 status](docs/v1-status.md) - ongoing v1 implementation notes

### Current focus: the v2 redesign

- [Redesign](docs/redesign.md) - the v2 web app redesign brief and decisions
- [Redesign plan](docs/redesign-plan.md) - the phased build with review gates
- [Interactions](docs/interactions.md) - carousel, unmask reveal, gesture model, map styling
- [Wallet and presence](docs/wallet-and-presence.md) - verified check-in, points wallet, accounts
- [Profile and account](docs/pages/profile.md) and [Contact](docs/pages/contact.md) - new surfaces

## Local development

### Prerequisites

- Node 22 and pnpm 10
- Python 3.12 or newer and uv
- Docker (for Postgres)

### Frontend

```bash
pnpm install
pnpm dev
```

This runs both Next apps together:

- Landing: http://localhost:3000
- Web app: http://localhost:3000/app (the landing app proxies `/app` to the web app on
  port 3001)

### Database

```bash
docker compose up -d db
```

### API

```bash
cd apps/api
cp .env.example .env
uv sync
uv run uvicorn app.main:app --reload --port 8000
```

Health check: http://localhost:8000/health

### Migrations

```bash
cd apps/api
uv run alembic revision --autogenerate -m "describe the change"
uv run alembic upgrade head
```
