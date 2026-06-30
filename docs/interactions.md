# Interactions and animation

This document records the confirmed interaction and animation decisions for the redesign. It
sits alongside [Redesign](redesign.md) and [Design](design.md), and it covers the feed
carousel, the scroll-driven post reveal, the map styling, and the gesture model that ties them
together. It reflects the feed as it shipped in Phase 1.

The two reference sources gave us behaviour and technique, not drop-in code:

- The feed carousel follows the 21st.dev circular gallery (ravikatiyar, circular gallery 2).
  That is React and Tailwind and was adapted from 21st.dev. It animates with `motion`, which
  `apps/web` already depends on.
- The post reveal follows the framer.university "unmask sections on scroll" resource. That is a
  Framer project, not portable code. Its author is explicit that the effect uses no animation
  library: it is sticky positioning plus z-index layering, where each section sits masked beneath
  the one above and the scroll exposes it. We reproduce that same technique natively in our stack.

## The feed carousel

- The feed browses as a horizontally swipeable carousel of feed items. There are no category
  filters. The only slicing is the temporal views.
- Swiping or dragging sideways moves items through the carousel. The centre item is the active
  focus, larger and forward, with the neighbours receding and only their edges peeking. Touch
  carries momentum.
- Cards are frameless. Each card shows its item's cover image at a fixed portrait ratio (4:5),
  cover-cropped with a centre focal anchor, so the row reads as a clean, uniform set of images
  rather than a mix of sizes. The full, uncropped images live in the detail grid, not here, so
  the crop in browse does not cost fidelity. A card with no image falls back to a typographic
  label.
- The active item is the one the reveal opens (see the post reveal below).
- Desktop equivalents: pointer drag, the left and right arrow keys, and an optional horizontal
  wheel. The active item is always reachable by keyboard.
- Reduced motion: the carousel falls back to a plain horizontal snap-scroll with no arc, no
  depth, and no inertia. Every item stays reachable.
- Images load lazily so a long feed does not load every image at once.

## The two-stage post reveal

Opening a post is two stages: the active card expands in place, and then a full detail page
rises over it on scroll. The persistent scene behind both stages is what makes the transition
feel continuous.

### Stage 1, the expanded card

- Selecting the active centre card expands it in place into a card view. The carousel and the
  neighbouring cards stay visible behind it; there is no backdrop tint and the scene is not torn
  down.
- The card shows the title and a kind-aware meta line (an art post leads with the creative's
  name and the work title; an event or announcement leads with the title and the posting
  account), a short body, and the action row: Save and Share always, and View Map when the post
  is tied to a gallery.
- Clicking outside the card, in stage 1 only, closes it back to browse. Clicks inside the card
  do not dismiss it.

### Stage 2, the full detail page

- From the expanded card, scrolling down raises the full detail page up over the card, driven by
  scroll progress: the further the scroll, the more the page covers the card, until it is fully
  in view. This is the unmask technique, reproduced natively with sticky positioning and z-index
  over a pinned scene, no animation library.
- The reveal is fully reversible. Scrolling back up retracts the page by the same scroll
  progress, and at the top of the runway the page is fully gone, returning cleanly to the
  expanded card with the carousel still behind. The page reappears only on the next scroll down.
- The detail page is full width, edge to edge. Top to bottom it carries the title and meta, the
  full description held to a comfortable reading measure (about 65 characters) inside the
  full-width sheet, the links and actions, and then the images at the bottom in full dimensions.
- The images render uncropped at their true aspect ratios. A single image shows centred; several
  flow into a responsive masonry that preserves each image's aspect ratio and adjusts its column
  count to the viewport (CSS multi-column, no masonry library).
- One shared detail component serves both the in-feed reveal and the standalone `/feed/[slug]`
  page. The reveal is the richer way to arrive at that content while browsing; Share and external
  links point at the route, which is also the reduced-motion and no-script destination.

### Per kind

Which posts reach stage 2 is governed by the post kind (D14 in [Redesign](redesign.md)). Art
posts and events get both stages. An announcement stops at stage 1 with a Save and Share card
only: no View Map, no scroll-down affordance, no full page. The gallery account card in the
carousel does not reveal at all; it routes to the map (D15). The detail reads the kind directly
from the data; see [Data model](data-model.md).

- Reduced motion: stage 1 expands immediately with no spring, and stage 2 has no progressive
  overlay. The full detail appears as a static, fully scrollable surface, so nothing depends on
  the masking to be usable.

## Gesture model

The carousel takes horizontal gestures and the reveal takes vertical ones, on the same surface,
so the two must be told apart cleanly.

- On touch, lock to the dominant axis at the start of a gesture. A mostly sideways drag moves
  the carousel and does not scroll the page. A mostly downward drag scrolls and drives the
  reveal and does not move the carousel.
- The horizontal drag is scoped to the carousel element so a vertical scroll still bubbles to
  the page.
- The flow reads as: swipe sideways to bring a post to the centre, select it to expand the card,
  then scroll down to raise its full detail, and scroll up to send it away again.

## The map

- The map is the real Google Maps base layer, restyled into the Grounded Art version. It keeps
  the familiar Google Maps interaction, pan and zoom and the real base, and looks like Google
  Maps wearing our skin.
- The custom style applies the cream and black palette and strips Google's points of interest,
  labels, and controls that we do not need.
- Our own layers sit on top: rust gallery markers, ink when selected, and the side-panel card.
- It stays a real, legible map. It is not abstracted, desaturated, or turned black and white.
  This matches [Maps](pages/maps.md) and [External dependencies](external-dependencies.md).

## Stack

- `motion` is already a dependency of `apps/web`, used by the check-in celebration and the
  carousel. No new core animation library is used; the unmask reveal needs none, being sticky
  positioning and z-index driven by native scroll.
- The GSAP plugins (SplitText, DrawSVG) stay landing-only. They are for the landing headline
  and hairline, not the web app.
- Reduced motion is gated throughout with `useReducedMotion` from `motion`.
- The components that carry these interactions are the carousel (`feed-circular-gallery.tsx` and
  its shared layout constants), the reveal orchestrator (`feed-browse.tsx`), the stage-1 card
  (`feed-expanded-card.tsx`), the stage-2 runway (`feed-unmask-reveal.tsx`), the shared
  `post-detail.tsx` with its image masonry and links, and the axis-lock hook. The carousel stage
  height and the expanded-card overlay height read from one shared set of constants so the card
  does not shift when the detail reveals.

## Interaction decisions

These are the confirmed calls. They extend the decisions in [Redesign](redesign.md).

- I1. The carousel is swipe and drag driven, with the centre item active. Reduced motion falls
  back to a horizontal snap-scroll.
- I2. Opening a post is two stages: the active card expands in place over a persistent scene,
  then a full detail page rises over it on scroll. The reveal uses the reference unmask technique
  reproduced natively with sticky positioning and z-index, no animation library.
- I3. Touch gestures lock to the dominant axis so the horizontal carousel and the vertical
  reveal do not fight.
- I4. The map is the real Google Maps base, custom-styled to Grounded Art, with our markers and
  card on top. It stays a real, legible map.
- I5. No new core animation library. `motion` is already present in `apps/web`, and the unmask
  needs none.
- I6. Carousel cards are frameless and cover-cropped to a fixed 4:5 portrait ratio. Full,
  uncropped images live only in the detail grid.
- I7. The full detail page reveals on scroll down and retracts on scroll up, fully reversible,
  gone at the top of the runway. It is full width, with the body text held to about a
  65-character measure.
- I8. Clicking outside the expanded card closes it in stage 1 only. Stage 2 is unaffected and is
  closed by Close, Escape, or scrolling back to the top.
- I9. Multiple detail images render uncropped in a responsive CSS multi-column masonry; a single
  image renders at its true aspect ratio.
- I10. One shared detail component serves both the in-feed reveal and the `/feed/[slug]` route,
  which is also the reduced-motion and no-script fallback. Per-kind gating follows D14: art posts
  and events reach stage 2, announcements stop at stage 1.