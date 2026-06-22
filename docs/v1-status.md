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
  motion signature, built with GSAP SplitText and DrawSVG and gated by reduced motion. The
  wordmark and the theme toggle sit in the nav.

## Next, for v1 landing

- The remaining home sections: the map preview, the feed preview, the one-space
  differentiation, the galleries email signup, and the human and local teaser.
- The full navigation and footer, including social links and the takedown and opt-out contact.
- The dedicated About page.
- SEO basics: metadata, an Open Graph image, a favicon, and a sitemap.
- Register grounded-art.co.za and deploy the landing to Vercel.

## Implementation notes

- The animation stack, Motion and GSAP with the free SplitText and DrawSVG plugins, is
  installed in the landing app only.
- The landing and web apps are stitched under one domain with Next.js multi-zones. The landing
  owns the root and the web app owns the `/app` path.
- In v1 the Map and Feed links point to in-page previews on the landing. They become live links
  into the web app when v2 ships.
