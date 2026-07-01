# v1 implementation status

This note tracks the build of v1, the landing page, so work can continue across sessions. The
v1 and v2 scope is recorded in [Product](product.md).

## Built

- Monorepo scaffold with pnpm and Turborepo: `apps/landing`, `apps/web`, `apps/api`, and the
  shared packages.
- Shared theme in `packages/tailwind-config`: the cream, black, and rust palette, Noto Serif
  for display and DM Sans for body, and light and dark modes with a no-flash script and a
  toggle.
- The landing hero in `apps/landing/src/components/hero.tsx`: the load-in and rust hairline
  motion signature, built with GSAP SplitText and DrawSVG and gated by reduced motion, plus a
  cross-dissolve between featured works.
- The full home page: hero, the atlas preview with gallery nodes over a Cape Town frame, the
  feed preview, the one-space differentiation band, the galleries invitation, the human and
  local teaser, and the closing call to action. Sections reveal gently on scroll, gated by
  reduced motion.
- Shared navigation and footer in `site-nav.tsx` and `site-footer.tsx`, with Instagram, the
  contact email, and a clear takedown and opt-out contact.
- The dedicated About page at `apps/landing/src/app/about`.
- SEO basics: per-page metadata with Open Graph and Twitter cards, a generated Open Graph image
  (`opengraph-image.tsx`), an SVG favicon (`icon.svg`), `sitemap.ts`, and `robots.ts`.
- Placeholder imagery in `apps/landing/public/images`, sourced from Unsplash and recorded in
  `CREDITS.md`, ready to swap for real Cape Town gallery and artist images.

## Next, for v1 landing

- Swap placeholder imagery for real, cleared Cape Town gallery and artist images.
  v1 launches on the current placeholders and these are swapped in as they clear.
- Register grounded-art.co.za and deploy the landing to Cloudflare Pages.

See [Follow-ups](follow-ups.md) for the running worklist.

## Decisions

- The gallery-interest capture in the galleries section is a direct mailto link in v1, not a
  form, with a short POPIA note on how the address is used.
- v1 imagery is Unsplash placeholder content while real Cape Town images are gathered.

## Implementation notes

- The animation stack, Motion and GSAP with the free SplitText and DrawSVG plugins, is
  installed in the landing app only.
- The landing and web apps are separated by origin. The landing owns the root domain; the web
  app owns the app subdomain.
- In v1 the Map and Feed links point to in-page previews on the landing. They become live links
  into the web app when v2 ships.
