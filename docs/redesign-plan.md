# Redesign plan

A phased build for the v2 redesign in [Redesign](redesign.md). Each phase ends with a design
review gate and a short tweak window, so the design is corrected before the next phase builds
on it. Dylan and Matthew build in parallel across the repo.

How the gate works: at the end of each phase, the phase output is checked against
[Design](design.md) and the mockup intent in [Redesign](redesign.md). Anything off is fixed
inside the tweak window before the next phase starts. A phase is not done until its gate passes.
The order front-loads the durable layer and follows the team's usual order within each phase:
data and migrations, then API, then frontend.

## Phase 0. Foundations and decisions

- [x] Ratify the design doctrine change (the image carousel in the web app feed). Done, and
      design.md is updated. Lock decisions D1 to D13 in [Redesign](redesign.md).
- [x] Confirm the shared tokens cover the new screens. Add any missing tokens (badge, card,
      action row, wallet) to `packages/tailwind-config`.
- [x] Re-skin the two reference patterns as isolated Grounded Art shells: the circular gallery
      and the unmask reveal. No data yet.
- [x] Add the new migrations behind a flag: account, session, check-in, wallet transaction,
      contact message, and the optional gallery brand. See [Data model](data-model.md).

Gate: the token sheet and the two re-skinned shells read as Grounded Art, not as the templates.
The migrations apply cleanly on a fresh database.

## Phase 1. Feed redesign

- [x] Replace the feed browse hero with the circular gallery, art-leading, showing all feed
      items, with a reduced-motion fallback to a static list.
- [x] Remove the feed category filters. The carousel shows every feed item as an image, sliced
      only by the temporal views.
- [x] Build the post-led card with the artist name and optional brand and pin badges.
- [x] Wire the unmask reveal from the centre card to the full post detail.

Gate: feed browse and post detail match the mockup intent in the Grounded Art skin. Reduced
motion shows a clean static feed. Keyboard and screen reader work.

## Phase 2. Map detail and check-in, no points yet

- [x] Apply the custom cream and black map style (the preset exists in the MVP and is not yet
      ported).
- [x] Complete the side-panel action row: Directions, Save, Check in, Share.
- [x] Keep the existing client check-in behaviour. Add the account gate so a signed-out
      Check in routes to sign in and returns to the gallery.

Gate: the map reads as a real, legible map in Grounded Art style. The action row and the auth
gate work. The existing check-in states are intact.

## Phase 3. Accounts, wallet, verified check-in

- [x] Finish auth: sign in, create account, session, and the cookie-to-account merge on first
      sign-in (3A).
- [x] Server-side verification with the challenge token. Award one point per verified check-in,
      rate limited to one per gallery per 24 hours (3B).
- [x] Wallet ledger and the wallet read endpoint. The celebration moment shows the new balance
      (3B).

Gate: a verified check-in increments the wallet exactly once inside the window. All check-in
states from [Wallet and presence](wallet-and-presence.md) behave. The ledger balance is correct.

## Phase 4. Profile and account area

- [x] Profile with avatar, display name, and bio (shipped in 3A).
- [x] Sections: Wallet, Saved, Check-ins, Account (shipped in 3A; wallet and check-ins wired in 3B).
- [x] Account editor with the display and personal information split (shipped in 3A).

Gate: the profile and account screens match the mockup intent in Grounded Art tokens with no
orange. Saved items carried from session appear. The wallet view reads from Phase 3.

## Phase 5. Artist and gallery public profile cards

- [ ] Gallery public profile cards on the feed canvas, using the existing `Gallery` records.
      Selecting one unmasks to a gallery account-style view backed by the current gallery data:
      description, images, location details, links, and relevant actions.
- [ ] Artist public profile cards on the feed canvas, using the existing creative-led feed item
      fields (`creative_name`, `external_url`, images, and links). For v1 these cards do not
      have the scroll-up expansion; the card itself is the display surface.
- [x] Brand badges beside the name on post cards. These are already wired from optional gallery
      brand data and tied-location data.

Scope note: Phase 5 does not introduce self-managed artist or gallery accounts, profile
claiming, ownership, roles, or public account editing. Those belong to a deeper future layer
tracked in [Follow-ups](follow-ups.md).

Gate: the artist and gallery public profile cards read correctly as curated Grounded Art
surfaces. Gallery cards unmask to the account-style gallery view. Artist cards remain card-only
for v1. Badges render only when a brand or location is present, and never compete with the art.

## Phase 6. Contact page and navigation

- [x] The contact page and its form, posting to the API. See [Contact](pages/contact.md).
- [x] Nav and footer updated for the redesign: Map, Feed, Profile, Contact us.
- [x] Landing call to action that opens the web app, defaulting to the feed carousel.
- [x] Landing nav Map and Feed link to in-page previews (`/#atlas`, `/#feed`). The live app
      stays under `/app` via the web zone nav and deep links.

Gate: the form reaches us and stores. Nav and footer are consistent across the landing and the
web app. The page is in Grounded Art tokens.

## Phase 7. Cross-cutting polish

- [ ] Dark mode pass across every new screen.
- [ ] Reduced-motion audit on the circular gallery and all unmask reveals.
- [ ] Accessibility pass: keyboard, focus order, screen reader labels, contrast.
- [ ] Performance pass on the circular gallery and image loading.
- [ ] Empty, loading, and error states for the new surfaces.

Gate: a full design and accessibility QA pass against [Design](design.md), on desktop and
mobile, in light and dark.

## Notes

- Each gate is small on purpose, so a tweak window is hours, not days. Momentum over ceremony.
- Phases 1 and 2 are independent and can run in parallel once Phase 0 closes. Phase 3 depends on
  the auth scaffold from Phase 0 and the check-in gate from Phase 2. Phases 4 and 5 depend on
  Phase 3.
