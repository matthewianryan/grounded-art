# Deployment

How to run Grounded Art in staging and production. Local development is in [README.md](../README.md)
and [AGENTS.md](../AGENTS.md).

## Topology (Cloudflare-first)

| Service | Staging | Production |
|---------|---------|------------|
| Landing | `staging.grounded-art.co.za` (Cloudflare Pages static) | `grounded-art.co.za` and `www.grounded-art.co.za` |
| Web app | Cloudflare Pages with SSR, e.g. `app.staging.grounded-art.co.za` | `app.grounded-art.co.za` (recommended) |
| API | Railway, Fly.io, or VPS at `api.staging.grounded-art.co.za` | `api.grounded-art.co.za` |
| Postgres | Staging database only | Production database only |

The landing app is a static export ([`apps/landing/wrangler.toml`](../apps/landing/wrangler.toml)).
It does not proxy `/app`. Until the web app has its own deployed origin, landing navigation should
stay on landing pages and section anchors instead of linking to `/app/*`.

The web app must run with a Node server (Next.js SSR). BFF routes under `/app/api/*` handle auth
and authenticated API calls. A static export of `apps/web` will not work for sign-in or check-in.

The API is FastAPI and PostgreSQL. It does not run on Cloudflare Pages. Deploy it to a Python-friendly
host with a managed Postgres instance.

## Auth and cookies

The browser holds one session cookie: `ga-session` on the web host, path `/app`.

| Route | Role |
|-------|------|
| `/app/api/auth/*` | Sign-in, verify, sign-out; mirrors cookie onto the web host |
| `/app/api/me/*` | Proxies authenticated calls to the API with that cookie |

`NEXT_PUBLIC_API_URL` on the web app is the upstream API URL for BFF server-side fetches only.
Browser client code uses same-origin `/app/api/auth` and `/app/api/me`, not cross-origin API calls.

On the API, set `SESSION_COOKIE_PATH=/`. The BFF still forwards the session token to the API when
proxying.

## Environment variables

### API (`apps/api`)

| Variable | Staging / production |
|----------|----------------------|
| `DATABASE_URL` | Managed Postgres URL; add `?sslmode=require` when required |
| `CORS_ORIGINS` | JSON array with the exact web origin, e.g. `["https://app.staging.grounded-art.co.za"]` |
| `COOKIE_SECURE` | `true` |
| `LOGIN_CODE_PEPPER` | Unique per environment; never reuse the dev default |
| `SESSION_COOKIE_PATH` | `/` |
| `EMAIL_PROVIDER` | `resend` |
| `RESEND_API_KEY` | From Resend dashboard |
| `EMAIL_FROM` | Verified sender, e.g. `Grounded Art <noreply@grounded-art.co.za>` |

Local development uses `EMAIL_PROVIDER=console` (codes log to the API process).

### Web (`apps/web`)

| Variable | Staging / production |
|----------|----------------------|
| `NEXT_PUBLIC_API_URL` | `https://api.staging.grounded-art.co.za` or production API URL |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Browser key with HTTP referrers for the web app URL |

## Email (Resend)

Sign-in codes require a real sender in staging and production. See
[External dependencies](external-dependencies.md#resend).

1. Create a Resend account and verify `grounded-art.co.za`.
2. Add SPF and DKIM DNS records at your registrar or Cloudflare DNS.
3. Set `EMAIL_PROVIDER=resend`, `RESEND_API_KEY`, and `EMAIL_FROM` on the API.
4. Send a test sign-in and confirm the code arrives in inbox (not API logs).

## DNS

| Record | Points to |
|--------|-----------|
| `staging` | Cloudflare Pages (landing, optional) |
| `app.staging` | Cloudflare Pages (web app, SSR) |
| `api.staging` | API host |
| `www` | Cloudflare Pages (landing) |
| `app` | Cloudflare Pages (web app) |
| `api` | API host |

## Deploy steps (staging)

1. Provision staging Postgres. Run `uv run alembic upgrade head` and seed if needed.
2. Deploy the API. Confirm `GET /health` returns OK.
3. Deploy the web app to Cloudflare Pages with SSR and env vars set.
4. Deploy landing (optional) with CTA linking to the web app feed URL.
5. Run the smoke test below.

## Smoke test

1. `GET /health` on the API.
2. Sign in with a real email. The code arrives in inbox.
3. When signed in, `GET /app/api/me` returns 200.
4. Map: Check in does not redirect to sign-in; geolocation and server check-in run.
5. Profile: wallet, check-ins, and sign out work.
6. Google Maps loads with the correct referrer restrictions.

## Promotion to production

Use the same code and topology. Use new secrets, a new database, and production DNS. Run
migrations on the production database once. Do not copy staging data into production.

Recommended branch mapping: `staging` branch to staging environments, `main` to production.

## Open decisions

| Decision | Recommendation |
|----------|----------------|
| Production web URL | `app.grounded-art.co.za` (simpler with `basePath: /app` and BFF) |
| `www.../app` on same host | Requires a Cloudflare Worker rewrite to the web origin |
| API host | Railway, Fly.io, or VPS with HTTPS |
| Postgres | Neon, Railway, Supabase, or host-managed Postgres |
| Email sender | `noreply@grounded-art.co.za` via Resend |

## Known gaps (not deployment blockers for core app)

| Gap | Follow-up |
|-----|-----------|
| Contact form API (`POST /contact`) | Phase 6 in [redesign-plan.md](redesign-plan.md) |
| Landing `/app` proxy on static site | Worker rewrite, separate app subdomain, or keep landing CTAs on page anchors |
| CI deploy pipelines | Add when hosts are chosen |
| API integration test suite | [feature-list.md](feature-list.md) |
| Contact notification email | When contact form ships |
| POPIA copy for stored emails | Content / legal |

After the BFF auth change, users with stale API-origin cookies may need to sign in once more.
