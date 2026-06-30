# AGENTS.md

## Cursor Cloud specific instructions

Grounded Art is a pnpm + Turborepo monorepo with three services:

- `apps/landing` — Next.js landing site, owns the domain root, dev on port 3000.
- `apps/web` — Next.js web app (map + feed), served under `/app`, dev on port 3001.
  The landing app proxies `/app` to the web app via Next.js multi-zones, so browse the
  web app through `http://localhost:3000/app/...` (e.g. `/app/feed`, `/app/map`).
- `apps/api` — FastAPI + PostgreSQL backend, run on port 8000.

Standard commands live in `README.md`, root `package.json` (`pnpm dev|build|lint|typecheck`,
which fan out via Turbo), and `apps/api` (`uv run ...`). Prefer those over duplicating here.

### Environment specifics (already provisioned in the VM snapshot)

- `uv` is installed at `/usr/local/bin/uv` (the API uses uv, not pip/venv directly).
- PostgreSQL 16 is installed natively instead of via Docker (the repo's `docker-compose.yml`
  expects Postgres 17, but Docker is not available here; native 16 is compatible for dev).
  A `grounded` role (password `grounded`) and `grounded_art` database already exist, matching
  `docker-compose.yml` / root `.env.example`, so `DATABASE_URL` defaults work unchanged.
- Environment config is root-only. Use `.env.example` and `.env` at the repo root; do not add
  app-local env files under `apps/api`, `apps/landing`, or `apps/web`.

### Starting services (the update script does NOT start anything)

1. Start Postgres (no init system, so start the cluster manually each boot; data persists):
   `sudo pg_ctlcluster 16 main start`
2. API: from `apps/api`, run `uv run uvicorn app.main:app --reload --port 8000`.
   `apps/api/app/config.py` reads the repo-root `.env` and defaults `DATABASE_URL` to the
   local Postgres.
3. Frontend (both Next apps together): from the repo root, run `pnpm dev`.

### Database setup (only needed on a fresh DB)

From `apps/api`: `uv run alembic upgrade head` then `uv run python -m app.seed`
(seeds ~14 real Cape Town galleries and ~10 feed items; the seed is idempotent by slug).
The seeded data survives in the snapshot, so this is usually a no-op on later boots.

### Notes

- Lint uses `next lint` (prints a deprecation warning that is harmless) for the frontend and
  `uv run ruff check .` for the API.
- The web app's saved-items / check-in user actions persist in first-party cookies scoped to
  the `/app` path (see `apps/web/src/lib/user-actions.ts`); check-in additionally needs
  browser geolocation. `NEXT_PUBLIC_API_URL` defaults to `http://localhost:8000`.
- The Google Maps key (`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in root `.env`) is optional; the map
  page degrades gracefully to "map not configured" when it is unset.
