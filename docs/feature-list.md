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
| Feed page with temporal views | Built | This weekend, opening this week, closing soon |
| Feed type filters | Removed | Categories dropped; feed shows all items, sliced only by temporal views |
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

### Web app redesign (v2)

Planned in [Redesign](redesign.md) and [Redesign plan](redesign-plan.md). Status is the
starting point for the redesign build.

| Feature | Status | Notes |
|---------|--------|-------|
| Shared redesign tokens (card, badge, action row, wallet) | Built | Phase 0; packages/tailwind-config |
| Circular gallery shell (preview) | Built | Phase 0 isolated shell; /app/preview/patterns |
| Unmask reveal shell (preview) | Built | Phase 0 isolated shell; sticky scroll layering |
| Circular gallery feed browse | Not built | Shows all feed items, no category split; reduced-motion fallback to list |
| Unmask-on-scroll post detail | Not built | Re-skinned from framer.university pattern |
| Post-led card with artist name | Not built | Replaces text-led card; image_url already exists |
| Brand and pin badges on post cards | Not built | Optional gallery brand and tied-location pin |
| Custom cream/black map style | Not built | Port the MVP preset |
| Map action row (Directions, Save, Check in, Share) | Partial | Save and Check in exist; add Directions and Share |
| Accounts and sign-in | Not built | Was deferred; now in scope |
| Account gate on Check in, profile, wallet | Not built | Map and feed browsing stay open |
| Cookie-to-account merge on first sign-in | Not built | Migrates ga-saved state |
| Server-side check-in verification | Not built | Was deferred; challenge token, 100 m radius |
| Points wallet (append-only ledger) | Not built | Was deferred; +1 per verified check-in |
| Anti-farming (one award per gallery per 24h) | Not built | Written in the same transaction as the check-in |
| Profile (avatar, display name, bio) | Not built | |
| Profile sections (Wallet, Saved, Check-ins, Account) | Not built | Wix My Programs/Notifications/Settings dropped |
| Account editor (display vs personal info) | Not built | No orange; rust only on the primary action |
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
| Auth and sessions | Not built | Sign in, create account, session; redesign scope |
| POST /check-ins (verify and award) | Not built | Verifies presence, awards a point atomically |
| Challenge token on gallery card open | Not built | Proof-of-presence binding for verification |
| GET /me, PATCH /me (profile and account) | Not built | Per-account read and edit |
| GET /me/wallet | Not built | Balance and recent transactions |
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
