# Cloudflare deployment

This repo should be launched in stages.

## Current production target

Host the landing site on Cloudflare Pages:

- Cloudflare project type: Pages
- Project name: `grounded-art-landing`
- Domain: `grounded-art.co.za`
- Build command: `pnpm pages:build`
- Build output directory: `apps/landing/out`
- Root directory: `/`

The landing app is configured as a static Next.js export for Cloudflare Pages. It links to
the app through `NEXT_PUBLIC_APP_URL`; it does not proxy the app. `pnpm pages:build` defaults
`NEXT_PUBLIC_APP_URL` to `https://app.grounded-art.co.za`, so the deployed static export
always links out to the app origin even if the Pages project has no env var set. Set
`NEXT_PUBLIC_APP_URL` in the build environment only to override that (e.g. a staging app
origin).

### Map / Feed links while the app is offline

The web app is not deployed yet, so pointing Map/Feed at `app.grounded-art.co.za` would send
visitors to a dead origin. The landing gates these links on `NEXT_PUBLIC_APP_LIVE`:

- **Unset or `false` (current default):** Map/Feed stay on the landing and scroll to the
  on-page explainer sections (`/#atlas`, `/#feed`).
- **`true`:** Map/Feed point at the real app (`NEXT_PUBLIC_APP_URL` + `/map` / `/feed`).

At launch, once `app.grounded-art.co.za` is serving, set `NEXT_PUBLIC_APP_LIVE=true` in the
Cloudflare Pages project's environment variables (Production) and redeploy. That single flag
is the switch; `NEXT_PUBLIC_APP_URL` already defaults to the production app origin.

## What is not live yet

Do not expect these to be served by Cloudflare Pages:

- `/map`
- `/feed`
- `/sign-in`
- the contact form, unless `NEXT_PUBLIC_API_URL` points to a deployed API

The web app needs a Next.js server runtime and the API needs FastAPI plus Postgres. Those are
served by Docker on xneelo.

`apps/landing/public/_redirects` sends old `/app/*` URLs to `app.grounded-art.co.za` so
bookmarked or guessed app paths land on the app origin once it is deployed.

## Local verification

From the repo root:

```bash
pnpm pages:build
```

That should create `apps/landing/out`.

To preview the exact static output locally:

```bash
pnpm pages:preview
```

## Manual deploy

After logging in to Cloudflare locally:

```bash
npx wrangler login
pnpm pages:deploy
```

This uploads `apps/landing/out` to the `grounded-art-landing` Pages project.

## Cloudflare dashboard setup

In Cloudflare, create or use a Pages project, not a Worker:

1. Go to Workers & Pages.
2. Click Create.
3. Choose Pages.
4. Connect the GitHub repository.
5. Set the project name to `grounded-art-landing`.
6. Set Root directory to `/`.
7. Set Build command to `pnpm pages:build`.
8. Set Build output directory to `apps/landing/out`.
9. Set Production branch to `main`.
10. Deploy.

Then attach the domain:

Do this from the Pages project, not from account-level Cloudflare Domains or Domain
Registration. `grounded-art.co.za` should already exist as a Cloudflare zone because its
nameservers point at Cloudflare.

1. Open the `grounded-art-landing` Pages project.
2. Go to Custom domains.
3. Select Set up a domain.
4. Enter `grounded-art.co.za`.
5. Continue and let Cloudflare create the DNS record for the existing zone.
6. Optionally repeat for `www.grounded-art.co.za` if you want the `www` hostname to work too.

The existing `grounded-art` Worker is not the target for this launch. It can be ignored or
deleted after the Pages project is working.
