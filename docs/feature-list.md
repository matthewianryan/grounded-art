# Grounded Art — Feature list

## Surfaces

### Landing (apps/landing)

| Feature | Status | Notes |
|---------|--------|-------|
| Hero with GSAP load-in and rust hairline | Built | SplitText + DrawSVG, reduced-motion gated |
| Atlas preview section | Built | Static nodes over Cape Town image, scroll reveal |
| Feed preview section | Built | 4-up image grid, marketing content |
| One-space differentiation band | Built | Inverted ink-ground section |
| Galleries and artists invitation | Built | mailto CTA, POPIA note |
| Human and local teaser | Built | Links to About |
| Closing CTA section | Built | |
| About page | Built | Values grid, full editorial layout |
| Shared nav with wordmark and rust rule | Built | Links to in-page anchors in v1 |
| Shared footer with takedown contact | Built | |
| Light/dark toggle | Built | No-flash script, persisted in localStorage |
| SEO: metadata, Open Graph, sitemap, robots | Built | Per-page metadata |
| Scroll reveal (Reveal component) | Built | motion/react, reduced-motion gated |

### Web app (apps/web)

| Feature | Status | Notes |
|---------|--------|-------|
| Feed page with temporal views | Built | This weekend, opening this week, closing soon |
| Feed type filters | Built | Exhibition, opening, event, post |
| Feed card (text layout) | Built | Links to post detail; image layout still pending |
| Feed card image layout (post-led) | Not built | image_url field exists; needs rendering |
| Feed loading skeleton | Built | Pulse animation, mirrors page frame |
| Feed empty and error states | Partial | Minimal; needs copy and design pass |
| Feed saved filter pill | Built | Client-side filter via ga-saved cookie |
| Map page | Built | Gallery map with side panel; list fallback without API key |
| Map base layer (Google Maps) | Built | Loaded when NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is set |
| Map custom style (cream/black preset) | Not built | Style JSON exists in MVP; not ported |
| Gallery markers on map | Built | Rust default, ink when selected |
| Gallery side-panel card | Built | Shared DetailCard component |
| No-key list fallback | Built | isMapConfigured() shows gallery list |
| Post detail route | Built | /app/feed/[slug] with DetailCard |
| Gallery detail route /galleries/[slug] | Not built | getGallery(slug) client exists |
| Feed-to-gallery cross-link | Built | Feed cards link to detail; save writes gallery key |
| View-on-map deep link | Built | /app/map?gallery={slug} |
| Check-in (browser geolocation) | Built | v1: client-only, 100 m radius, no backend |
| Check-in celebration moment | Built | motion/react with useReducedMotion |
| Saved items (local state) | Built | ga-saved cookie, feed and gallery keys |
| Web app shared nav | Built | Sticky, active-route highlight |
| Web app shared footer | Built | |
| Light/dark toggle | Built | Mirrors landing mechanism |
| App home (entry point) | Built | Minimal; may be folded into multi-zone |

### API (apps/api)

| Feature | Status | Notes |
|---------|--------|-------|
| GET /galleries | Built | Suburb and featured filters, pagination |
| GET /galleries/{slug} | Built | Full gallery with images and external refs |
| GET /feed | Built | Type and temporal view filters, pagination |
| GET /feed/{slug} | Built | Single feed item |
| Gallery seed (14 Cape Town galleries) | Built | All have coordinates; no images yet |
| Feed seed (10 items) | Built | No image URLs yet |
| Gallery image records | Not built | Model exists; no seed images |
| Feed image URLs | Not built | image_url field exists; no seeded values |
| API test suite | Not built | |

## Deferred (post-v1)

- Content ingestion pipeline beyond manual seed
- Image hosting pipeline with source and attribution tracking
- Auth, accounts, admin UI
- Editorial stories layer
- Points, leaderboard, profiles
- Proof-of-presence backend (challenge tokens, rank gating)
- Server-side check-in verification