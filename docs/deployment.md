# Deployment

How to run Grounded Art in staging and production. Local development is in [README.md](../README.md)
and [AGENTS.md](../AGENTS.md).

## Topology

| Service | Staging | Production |
|---------|---------|------------|
| Landing | `staging.grounded-art.co.za` (Cloudflare Pages static) | `grounded-art.co.za` and `www.grounded-art.co.za` |
| Web app | Docker on xneelo at `app.staging.grounded-art.co.za` | Docker on xneelo at `app.grounded-art.co.za` |
| API | Docker on xneelo at `api.staging.grounded-art.co.za` | Docker on xneelo at `api.grounded-art.co.za` |
| Postgres | Docker volume on the xneelo server | Docker volume on the xneelo server |

The landing app is a static export ([`apps/landing/wrangler.toml`](../apps/landing/wrangler.toml)).
It does not proxy the app. Landing navigation links to `NEXT_PUBLIC_APP_URL`, which is
`https://app.grounded-art.co.za` in production.

The web app must run with a Node server (Next.js SSR). BFF routes under `/api/*` handle auth
and authenticated API calls. A static export of `apps/web` will not work for sign-in or check-in.

The API is FastAPI. It and Postgres run in Docker on the xneelo server.

## Auth and cookies

The browser holds one session cookie: `ga-session` on the web host, path `/`.

| Route | Role |
|-------|------|
| `/api/auth/*` | Sign-in, verify, sign-out; mirrors cookie onto the web host |
| `/api/me/*` | Proxies authenticated calls to the API with that cookie |

`NEXT_PUBLIC_API_URL` on the web app is the upstream API URL for BFF server-side fetches only.
Browser client code uses same-origin `/api/auth` and `/api/me`, not cross-origin API calls.

On the API, set `SESSION_COOKIE_PATH=/`. The BFF still forwards the session token to the API when
proxying.

## Environment variables

### API (`apps/api`)

| Variable | Staging / production |
|----------|----------------------|
| `DATABASE_URL` | `postgresql+psycopg://grounded:grounded@db:5432/grounded_art` inside Compose |
| `CORS_ORIGINS` | JSON array with the exact landing and web origins, e.g. `["https://staging.grounded-art.co.za","https://app.staging.grounded-art.co.za"]` |
| `COOKIE_SECURE` | `true` |
| `LOGIN_CODE_PEPPER` | Unique per environment; never reuse the dev default |
| `SESSION_COOKIE_PATH` | `/` |
| `EMAIL_PROVIDER` | `resend` |
| `RESEND_API_KEY` | From Resend dashboard |
| `EMAIL_FROM` | Verified sender, e.g. `Grounded Art <noreply@grounded-art.co.za>` |
| `CONTACT_NOTIFICATION_TO` | Inbox for contact form notifications |
| `CONTACT_NOTIFICATION_FROM` | Verified Resend sender, e.g. `Grounded Art <notifications@grounded-art.co.za>` |

Local development uses `EMAIL_PROVIDER=console` (codes log to the API process).

### Web (`apps/web`)

| Variable | Staging / production |
|----------|----------------------|
| `NEXT_PUBLIC_API_URL` | `http://api:8000` inside Compose; public API URL only when running outside Compose |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Browser key with HTTP referrers for the web app URL |
| `WEB_SESSION_COOKIE_PATH` | `/` |
| `NEXT_PUBLIC_COOKIE_PATH` | `/` |

### Landing (`apps/landing`)

| Variable | Staging / production |
|----------|----------------------|
| `NEXT_PUBLIC_APP_URL` | The web app origin, e.g. `https://app.grounded-art.co.za` |
| `NEXT_PUBLIC_APP_LIVE` | `true` only after the web app is serving |
| `NEXT_PUBLIC_API_URL` | The public API origin for the contact form, e.g. `https://api.grounded-art.co.za` |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Optional; only set when Turnstile is enabled |

## Email (Resend)

Sign-in codes require a real sender in staging and production. See
[External dependencies](external-dependencies.md#resend).

1. Create a Resend account and verify `grounded-art.co.za`.
2. Add SPF and DKIM DNS records at your registrar or Cloudflare DNS.
3. Set `EMAIL_PROVIDER=resend`, `RESEND_API_KEY`, and `EMAIL_FROM` on the API.
4. Set `CONTACT_NOTIFICATION_FROM` to a verified sender on the same domain.
5. Send a test sign-in and confirm the code arrives in inbox (not API logs).
6. Submit the contact form and confirm the message is stored and a notification arrives.

## DNS

| Record | Points to |
|--------|-----------|
| `staging` | Cloudflare Pages (landing, optional) |
| `app.staging` | xneelo reverse proxy |
| `api.staging` | xneelo reverse proxy |
| `www` | Cloudflare Pages (landing) |
| `app` | xneelo reverse proxy |
| `api` | xneelo reverse proxy |

## Deploy steps (staging)

1. Provision the xneelo server with Docker and Compose.
2. Set production/staging values in the server `.env`.
3. Run `docker compose build`.
4. Run `pnpm docker:migrate` and `pnpm docker:seed`, or the equivalent `docker compose run`
   commands on the server. These use the prebuilt API virtualenv inside the container.
5. Run `docker compose up -d`.
6. Deploy the landing to Cloudflare Pages with `NEXT_PUBLIC_APP_URL` set to the app origin,
   `NEXT_PUBLIC_API_URL` set to the public API origin, and `NEXT_PUBLIC_APP_LIVE=true`.
7. Run the smoke test below.

## Smoke test

1. `GET /health` on the API.
2. Sign in with a real email. The code arrives in inbox.
3. When signed in, `GET /api/me` returns 200.
4. Map: Check in does not redirect to sign-in; geolocation and server check-in run.
5. Profile: wallet, check-ins, and sign out work.
6. Google Maps loads with the correct referrer restrictions.
7. The contact form submits and sends a Resend notification.

## Promotion to production

Use the same code and topology. Use new secrets, a new database, and production DNS. Run
migrations on the production database once. Do not copy staging data into production.

Recommended branch mapping: `staging` branch to staging environments, `main` to production.

## Open decisions

| Decision | Recommendation |
|----------|----------------|
| Production web URL | `app.grounded-art.co.za` |
| Old `www.../app/*` URLs | Redirect to `https://app.grounded-art.co.za/:splat` from Cloudflare Pages `_redirects` |
| API host | `api.grounded-art.co.za` on the same xneelo Docker server |
| Postgres | Docker `db` service with a persistent volume |
| Email sender | `noreply@grounded-art.co.za` via Resend |

## Known gaps (not deployment blockers for core app)

| Gap | Follow-up |
|-----|-----------|
| CI deploy pipelines | Add when hosts are chosen |
| API integration test suite | [feature-list.md](feature-list.md) |
| POPIA copy for stored emails | Content / legal |

After the BFF auth change, users with stale API-origin cookies may need to sign in once more.
