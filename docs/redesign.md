# Redesign (v2 UI direction)

This note records the v2 redesign of the web app surfaces and the new account, wallet,
and contact work. It builds on [Design](design.md), [Product](product.md),
[Data model](data-model.md), and the deferred list in [Feature list](feature-list.md).
The phased build is in [Redesign plan](redesign-plan.md). The animation and gesture detail is
in [Interactions](interactions.md).

## What this redesign is

The landing page (v1) ships as built. This redesign is the v2 web app: a stronger, more
distinctive feed and map experience, plus three capabilities that were on the deferred list
and are now in scope. Those are accounts, a points wallet earned by verified check-ins, and
a profile and account area. A contact page is added across the site.

## Two reference patterns, re-skinned

We are borrowing two interaction patterns from external sources. We are taking the interaction
and the information architecture, not the visual skin. Both are re-expressed in Grounded Art
tokens.

- Circular gallery browse. A set of tilted art cards sits on the feed canvas. The centre card
  is the focus. Selecting it enlarges it and reveals the full post. Reference: the 21st.dev
  circular gallery component. In Grounded Art this becomes the feed's hero browse mode. The
  art leads, the frame stays quiet, and the cards carry the colour.
- Unmask on scroll. A card or section lifts to reveal a fuller surface beneath it, used for
  the full post detail and for the artist or gallery account view. Reference: the
  framer.university unmask sections on scroll resource. In Grounded Art this is the transition
  from a post card to its full display, and from a profile card to the account view.

## The re-skin rule (read this first)

The screenshots are mockups assembled from off-the-shelf templates to communicate intent.
They carry template artifacts that are not Grounded Art and must not be copied:

- The blue "Build for yourself, not by yourself" section is WordPress sample content. Replace
  the copy and the blue ground entirely.
- The orange accents on the profile, wallet, and account screens are a Wix theme. Grounded Art
  has no orange. The single accent is rust (#a24b2c), used sparingly.
- "Book Now", the Johannesburg address, the "ART SCHOOL powered by Wix" footer, and
  "My Programs" are template filler. None of them are ours.

Everything renders in the Grounded Art system: cream and black ground, rust as the only accent,
Noto Serif for display, DM Sans for interface, and light and dark modes from the shared tokens.
If a mockup colour or label is not in our token set or our copy, it does not ship.

## A doctrine note for Design

[Design](design.md) currently reserves expression and motion for the landing page and asks the
web app feed and map to stay restrained with no decorative stylization. This redesign brings one
expressive browse affordance, the circular gallery, into the web app feed, and adds the unmask
reveal to post and profile detail.

This doctrine change is ratified. Design.md is updated to allow it. The position: expression
may extend to the web app's browse surfaces, held to the same rules as the landing. The art
still leads, motion is slow and intentional, every motion is gated by reduced motion with a
static fallback, and the map stays a real, legible map. The adopted wording in the
"Where expression lives" section of design.md:

> The landing page is the most expressive surface. The web app stays professional and minimal,
> with one expressive browse affordance in the feed, the circular gallery, held to the same
> restraint as the landing: the art leads, motion is slow and reduced-motion gated, and the map
> remains a real, legible map with no abstraction.

## New and changed surfaces

- Feed. Circular gallery browse as the hero, showing all feed items as images. The category
  filters are removed. The only slicing is the temporal views (this weekend, opening this week,
  closing soon). Post cards carry the artist name and optional brand and pin badges. Selecting
  the centre card unmasks the full post.
- Landing entry. A primary call to action on the landing opens the web app directly, landing
  on the feed carousel. The nav Map and Feed links go live into the app at the same time.
- Map. The existing side-panel card gains the full action row: Directions, Save, Check in,
  Share. Check in now verifies presence server-side and can award a point. The custom cream
  and black map style is applied.
- Post detail. The full-display post via the unmask reveal.
- Artist and gallery public profile cards. A curated profile-style card can appear on the feed
  canvas in place of a post. Gallery cards use the existing gallery record and unmask to an
  account-style gallery view backed by current gallery data. Artist cards use the existing
  creative-led feed item fields and stay card-only in v1, with no "scroll up for more"
  expansion. This phase does not add self-managed artist or gallery accounts.
- Profile and account. A signed-in user has a profile with a bio and avatar, a wallet, a saved
  list, a check-in history, and an account editor. See [Profile](pages/profile.md).
- Contact. A site-wide contact page with a form that reaches us. See [Contact](pages/contact.md).

## Brand badges

A post card shows the creative's name, and optionally two small badges beside it: a gallery
brand badge and a pin marker badge for a tied physical location. Brand is an optional attribute
on a gallery. A post with no brand and no location shows the name alone. Badges are small,
monochrome by default, and never compete with the art. See [Data model](data-model.md).

## Accounts are now in scope

Check in, profile, and wallet require a signed-in account. Browsing the map and the feed stays
open with no sign-in wall. The existing saved and checked-in state, held in the ga-saved cookie,
migrates onto the account on first sign-in so nothing is lost. Auth, accounts, and server-side
check-in verification move out of the deferred list and into this redesign. See
[Wallet and presence](wallet-and-presence.md).

## Decisions

These are the calls made for this redesign. They are opinionated and reversible. Flag any you
want to revisit before Phase 0 closes.

- D1. The wallet is a points balance, an in-app earned currency, not a saved-payment-methods
  wallet. The Wix "save your payment details" screen is template filler. Stored payment methods
  belong to the future shop and are out of scope here.
- D2. Points are server-authoritative. The balance is the sum of an append-only wallet ledger,
  so it is auditable and tamper resistant. This uses the proof-of-presence thinking already
  named in the deferred list.
- D3. A verified check-in is one the server confirms inside the gallery radius (100m), rate
  limited to one award per gallery per 24 hours to stop farming. The existing client-only
  check-in stays as the unverified, no-points path.
- D4. Check in, profile, and wallet require an account. Map and feed browsing stay open. The
  cookie-held saved state migrates to the account on sign-in.
- D5. Profile sections in this redesign: Profile, Wallet, Saved, Check-ins, Account. The Wix
  items My Programs, Notifications, and Settings are dropped for now.
- D6. Brand is an optional attribute on a gallery. Badges render only when present.
- D7. Contact is a site-wide page, not a profile section. The form posts to the API, is stored,
  and notifies us. "Book Now" is dropped. The action is "Send".
- D8. No blue and no orange. Cream, black, and rust only, with rust used sparingly.
- D9. The circular gallery and every unmask reveal honour reduced motion with a static fallback,
  and are keyboard and screen-reader accessible.
- D10. Modelling artist studios as galleries stays deferred. Do not extend the data model for it
  before this redesign ships. This is a carry-over.
- D11. The feed has no category filters. The image carousel shows every feed item. The only
  slicing is the temporal views, which are kept because product.md treats them as a core return
  hook. The feed item type stays in the data for internal use and is not exposed as a filter.
- D12. A primary call to action on the landing opens the web app directly, defaulting to the
  feed carousel. Map and Feed stay co-equal inside the app through the nav.
- D13. The expressive image carousel is allowed in the web app feed. Design.md is updated. This
  closes the prior open question.

## Status of the doctrine question

Resolved. The doctrine change is ratified and design.md is updated. All decisions above are
made.
