# Interactions and animation

This document records the confirmed interaction and animation decisions for the redesign. It
sits alongside [Redesign](redesign.md) and [Design](design.md), and it covers the feed
carousel, the swipe-up post reveal, the map styling, and the gesture model that ties them
together.

The two reference sources give us behaviour and technique, not drop-in code:

- The feed carousel follows the 21st.dev circular gallery (ravikatiyar, circular gallery 2).
  That is React and Tailwind and can be copied from 21st.dev directly. It animates with
  `motion`, which `apps/web` already depends on.
- The swipe-up post reveal follows the framer.university "unmask sections on scroll" resource.
  That is a Framer project, not portable code. Its author is explicit that the effect uses no
  animation library: it is sticky positioning plus z-index layering, where each section sits
  masked beneath the one above and the scroll exposes it. We reproduce that same technique
  natively in our stack.

## The feed carousel

- The feed browses as a horizontally swipeable carousel that shows every feed item as an image.
  There are no category filters. The only slicing is the temporal views.
- Swiping or dragging sideways moves items through the carousel. The centre item is the active
  focus, larger and forward, with the neighbours receding. Touch carries momentum.
- The active item is the one a swipe up will open (see the post reveal below).
- When the active item is a gallery account card, it does not unmask. A click or activation opens
  the map with that gallery's node focused and its information panel in view.
- Desktop equivalents: pointer drag, the left and right arrow keys, and an optional horizontal
  wheel. The active item is always reachable by keyboard.
- Reduced motion: the carousel falls back to a plain horizontal snap-scroll with no arc, no
  depth, and no inertia. Every item stays reachable.
- Images load lazily so a long feed does not load every image at once.

## Swipe up for post detail, the unmask

- From the active post in the carousel, a swipe up reveals that post's full detail. On touch a
  swipe up is a scroll, and the scroll is what drives the reveal.
- The reveal uses the unmask technique from the reference: the full detail sits masked beneath
  the carousel, and as the user scrolls up it is exposed layer over layer through sticky
  positioning and z-index. No animation library is needed for this.
- The detail that is revealed is the full post: the image in full display, the artist name with
  any brand and pin badges, the body, and the action row.
- Desktop equivalent: a normal scroll, or selecting the active post, reveals the same detail.
- Reduced motion: the detail still reveals on scroll, without the layered masking flourish. A
  static expanded state is the fallback, so nothing depends on the animation to be usable.
- Scope: the reveal applies to art posts and events. Announcements do not expand. Account cards
  do not unmask either; a gallery account card routes to the map with its node focused instead.

## Gesture model

The carousel takes horizontal gestures and the reveal takes vertical ones, on the same surface,
so the two must be told apart cleanly.

- On touch, lock to the dominant axis at the start of a gesture. A mostly sideways drag moves
  the carousel and does not scroll the page. A mostly upward drag scrolls and reveals the
  detail and does not move the carousel.
- The horizontal drag is scoped to the carousel element so a vertical scroll still bubbles to
  the page.
- The flow reads as: swipe sideways to bring a post to the centre, then swipe up on that post
  to open it.

## The map

- The map is the real Google Maps base layer, restyled into the Grounded Art version. It keeps
  the familiar Google Maps interaction, pan and zoom and the real base, and looks like Google
  Maps wearing our skin.
- The custom style applies the cream and black palette and strips Google's points of interest,
  labels, and controls that we do not need. The MVP holds the style preset to port.
- Our own layers sit on top: rust gallery markers, ink when selected, and the side-panel card.
- It stays a real, legible map. It is not abstracted, desaturated, or turned black and white.
  This matches [Maps](pages/maps.md) and [External dependencies](external-dependencies.md).

## Stack

- `motion` (v12) is already a dependency of `apps/web`, used by the check-in celebration. The
  carousel drag and any spring use it. No new core animation library is expected.
- The GSAP plugins (SplitText, DrawSVG) stay landing-only. They are for the landing headline
  and hairline, not the web app.
- The 21st.dev carousel is copied in as a component and reconciled against our dependencies and
  tokens. The unmask reveal is built from CSS sticky positioning and z-index, no library.
- The components most affected are `feed-filters.tsx` (categories removed),
  `feed-list-client.tsx` and `feed-card.tsx` (reworked into the carousel), and
  `detail-card.tsx` (the unmask target).

## Decisions to confirm

These are the calls captured here. They extend the decisions in [Redesign](redesign.md).

- I1. The carousel is swipe and drag driven, with the centre item active. Reduced motion falls
  back to a horizontal snap-scroll.
- I2. A swipe up on the active post reveals its full detail, using the reference unmask
  technique reproduced natively with sticky positioning and z-index.
- I3. Touch gestures lock to the dominant axis so the horizontal carousel and the vertical
  reveal do not fight.
- I4. The map is the real Google Maps base, custom-styled to Grounded Art, with our markers and
  card on top. It stays a real, legible map.
- I5. No new core animation library. `motion` is already present in `apps/web`, and the unmask
  needs none.
