# AGENTS.md

Context for AI coding agents working in this repo. Read this first, then the docs it points to.

## What this is

Grounded Art connects people in Cape Town with local art, galleries, and artists. It is a pnpm
and Turborepo monorepo with Next.js multi-zones.

- `apps/landing`: Next.js landing site. Owns the domain root.
- `apps/web`: Next.js web app (map and feed). Served under `/app`.
- `apps/api`: FastAPI and PostgreSQL backend.
- `packages/tailwind-config`: shared Tailwind v4 theme tokens.
- `packages/tsconfig`: shared TypeScript base config.

## Current focus

We are building the v2 web app redesign. Start with `docs/redesign.md`, and build by phase from
`docs/redesign-plan.md`. The interaction and animation rules are in `docs/interactions.md`. The
verified check-in, points wallet, and accounts are in `docs/wallet-and-presence.md`.

Do not pull work from a later phase into an earlier one. Each phase ends at a review gate. Plan
the work, map it to that gate, and stop there.

## Hard rules

- Tokens only. The theme is in `packages/tailwind-config` (`theme.css`): `paper` (cream), `ink`
  (black), `accent` (rust, used sparingly), `muted`, `line`. No other accent colours. No blue,
  no orange. Both light and dark mode come from these tokens.
- Type: Noto Serif for display, DM Sans for body and interface.
- No em dashes anywhere, in code, copy, or docs. This is strict.
- Motion is gated by `prefers-reduced-motion` with a static fallback, using `useReducedMotion`
  from `motion/react`. See `apps/web/src/components/check-in-celebration.tsx` and
  `apps/landing/src/components/reveal.tsx`. `motion` is a dependency of both apps. GSAP is
  landing-only.
- Accessibility: keyboard operable, managed focus, sensible labels.
- The art leads. The frame stays quiet and never competes with the work. The map stays a real,
  legible map, never abstracted or desaturated.

## Where things are (apps/web)

- API client: `src/lib/api.ts` (gallery and feed fetchers, for example `getFeedItem`,
  `getGallery`, `listGalleries`). Types in `src/lib/types.ts`. Check the file for exact names.
- Map provider boundary: `src/lib/maps.ts`.
- On-device state: `src/lib/user-actions.ts` and `src/components/user-actions-provider.tsx`,
  using the `ga-saved` and `ga-checkins` cookies. Theme persists via `ga-theme` in
  `localStorage`.
- Check-in: `src/lib/check-in.ts`, with `CHECK_IN_RADIUS_METRES = 100`.
- Feed: `src/components/feed-card.tsx`, `feed-list-client.tsx`, `feed-filters.tsx`, and the
  shared `src/components/detail-card.tsx`.

## Working agreement

- Plan before editing on anything non-trivial. Map the plan to the relevant phase gate in
  `docs/redesign-plan.md`, and stop at that gate.
- Keep changes scoped to the current phase. Flag scope you would need to expand, do not expand
  it silently.
- Update the status rows in `docs/feature-list.md` when a feature lands.
- Run `pnpm typecheck` and `pnpm lint` in the app you touched.

## Documentation map

Current redesign:

- `docs/redesign.md`: the v2 redesign brief and decisions.
- `docs/redesign-plan.md`: the phased build with review gates.
- `docs/interactions.md`: carousel, unmask reveal, gesture model, map styling.
- `docs/wallet-and-presence.md`: verified check-in, points wallet, accounts.
- `docs/pages/profile.md`, `docs/pages/contact.md`: the new surfaces.

Canonical references:

- `docs/PLANNING.md`: planning index and what Grounded Art is.
- `docs/design.md`, `docs/product.md`, `docs/data-model.md`, `docs/architecture.md`,
  `docs/external-dependencies.md`.
- `docs/pages/`: per-page specs (home, posts, maps, about, profile, contact).
- `docs/build-spec.md`: history of the v1 client-only check-in layer, superseded by the redesign
  where they overlap.
