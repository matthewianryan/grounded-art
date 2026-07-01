# Grounded Art

Grounded Art connects people in Cape Town with local art, galleries, and artists.

This is a pnpm and Turborepo monorepo. The landing page and the web app are separate
Next.js apps: the landing is a static Cloudflare Pages site, and the app runs on its own
origin with the API behind it.

## Structure

- `apps/landing` - Next.js landing site. Owns the domain root.
- `apps/web` - Next.js web app (map, feed). Served at the app origin root.
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
- [Cloudflare deployment](docs/cloudflare-deployment.md) - current landing-site launch path
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
- [Contact email and abuse controls](docs/contact-email-and-abuse.md) - Resend DNS, root env,
  rate limiting, honeypot, and optional Turnstile

## Local development

### Prerequisites

- Node 22 and pnpm 10
- Docker

### Full local stack

```bash
pnpm install
cp .env.example .env
pnpm dev:local
```

This builds and runs the real app stack in Docker:

- Web app: http://localhost:3001
- API: http://localhost:8000
- Reverse proxy: http://localhost:8080
- Postgres: Docker service `db`, persisted in the `grounded-art-db-data` volume

If `3001` or `8080` is already in use, `pnpm dev:local` automatically uses `3101` or `8180`
and prints the actual URLs.

Health check: http://localhost:8000/health

### Migrations

```bash
pnpm docker:migrate
```

Create new migration files from the API package with `uv run alembic revision --autogenerate -m
"describe the change"` when working outside Docker.
