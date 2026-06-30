# Grounded Art feature list

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
| App CTA (deep link to web app) | Not built | Opens /app feed carousel; nav Map/Feed links go live |
| About page | Built | Values grid, full editorial layout |
| Shared nav with wordmark and rust rule | Built | Links to in-page anchors in v1 |
| Shared footer with takedown contact | Built | |
| Light/dark toggle | Built | No-flash script, persisted in localStorage |
| SEO: metadata, Open Graph, sitemap, robots | Built | Per-page metadata |
| Scroll reveal (Reveal component) | Built | motion/react, reduced-motion gated |

### Web app (apps/web)

| Feature | Status | Notes |
|---------|--------|-------|
| Feed page with temporal views | Built | This weekend, opening this week, closing soon, with local q search |
| Feed type filters | Built | Art, events, and announcements pills; client-side kind filter on carousel |
| Feed card (text layout) | Removed | Replaced by image carousel and post-led cards in Phase 1 |
| Feed card image layout (post-led) | Not built | image_url field exists; needs rendering |
| Feed loading skeleton | Built | Pulse animation, mirrors page frame |
| Feed empty and error states | Partial | Minimal; needs copy and design pass |
| Feed saved filter pill | Built | Client-side filter via ga-saved cookie |
| Map page | Built | Gallery map with side panel; list fallback without API key |
| Map base layer (Google Maps) | Built | Loaded when NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is set |
| Map custom style (cream/black preset) | Built | Cream/black preset in maps.ts |
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

### Web app redesign (v2)

Planned in [Redesign](redesign.md) and [Redesign plan](redesign-plan.md). Status is the
starting point for the redesign build.

| Feature | Status | Notes |
|---------|--------|-------|
| Shared redesign tokens (card, badge, action row, wallet) | Built | Phase 0; packages/tailwind-config |
| Circular gallery shell (preview) | Built | Phase 0 isolated shell; /app/preview/patterns |
| Unmask reveal shell (preview) | Built | Phase 0 isolated shell; sticky scroll layering |
| Circular gallery feed browse | Built | Live at /feed; all items, temporal views only |
| Unmask-on-scroll post detail | Built | Wired from active carousel card to DetailCard |
| Post-led card with artist name | Built | feed-post-card.tsx with name and badges |
| Brand and pin badges on post cards | Built | Optional gallery brand and tied-location pin |
| Custom cream/black map style | Built | Cream/black preset in maps.ts |
| Map action row (Directions, Save, Check in, Share) | Built | Full action row on gallery DetailCard |
| Accounts and sign-in | Built | Passwordless email, one-time code, unified sign-up/sign-in |
| Account gate on Check in, profile, wallet | Built | Map and feed browsing stay open |
| Cookie-to-account merge on first sign-in | Built | Migrates ga-saved state |
| Server-side check-in verification | Built | Challenge token, 100 m server radius |
| Points wallet (append-only ledger) | Built | +1 per verified check-in |
| Anti-farming (one award per gallery per 24h) | Built | Same transaction as check-in |
| Profile (avatar, display name, bio) | Built | /app/profile home |
| Profile sections (Wallet, Saved, Check-ins, Account) | Built | Wallet and check-ins read from API |
| Account editor (display vs personal info) | Built | No orange; rust only on the primary action |
| Artist and gallery account card | Not built | Profile-as-card; no scroll-up expansion for v1 |
| Contact page and form | Not built | Posts to API, stored and notified; "Send" not "Book Now" |

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
| Redesign schema migrations | Built | Phase 0; account, session, check-in, wallet, contact, gallery brand |
| Auth and sessions | Built | Passwordless email, session cookie, sign out |
| POST /check-ins (verify and award) | Built | POST /me/check-ins; verifies presence, awards atomically |
| Challenge token on gallery card open | Built | POST /me/check-in-challenge on gallery card open |
| GET /me, PATCH /me (profile and account) | Built | Per-account read and edit |
| GET /me/wallet | Built | Ledger sum and recent transactions |
| GET /me/saved | Built | Read and write saved galleries and feed items |
| POST /contact | Not built | Stores the message and notifies us |
| API test suite | Not built | |

## Deferred (post-v1)

The redesign pulls auth and accounts, points and profiles, the proof-of-presence backend, and
server-side check-in verification into scope. They are now in the redesign table above. What
remains deferred:

- Content ingestion pipeline beyond manual seed
- Image hosting pipeline with source and attribution tracking
- Curator admin UI
- Editorial stories layer
- Leaderboard and ranking
- The shop that spends wallet points, and stored payment methods
