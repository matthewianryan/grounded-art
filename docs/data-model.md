# Data model

This document records the decided data model for the web app. It builds on the product
data model in [Product](product.md) and the dependency split in
[External dependencies](external-dependencies.md).

## System of record

Grounded Art's own database is the system of record. External services seed and enrich it,
and never serve runtime reads in their place.

## Canonical identity

Identity is ours and does not depend on any external service.

- Every gallery has an internal id and a stable slug used in public URLs.
- A gallery can exist with no external references at all. This is required for emerging
  artists and spaces that no external directory knows about.
- External identifiers, including the Google `place_id`, an Instagram handle, and listing
  or gallery site URLs, are stored as gallery external references. They are reconciliation
  attributes, not the key.

## Entities

- Gallery: a physical place, rendered as a node on the map. Holds name, slug, address,
  suburb, coordinates, website, phone, hours, business status, and a human-written
  description. Optionally holds a brand (see below).
- Gallery external reference: a source and external id pair linking a gallery to an entry
  in an outside system, with the time it was last synced.
- Gallery image: an image belonging to a gallery, hosted by Grounded Art, with its source,
  permission status, and attribution. Images are scraped during this phase and replaced by
  gallery-provided images as relationships form.
- Feed item: an event or post. Optionally linked to a gallery. When it comes from a creative
  with no physical space, it carries that creative's name and links to their digital presence
  instead. Carries the dates that drive the temporal views. Holds a kind, an image collection,
  and a link collection (see below).
- Feed item image: an image belonging to a feed item, hosted by Grounded Art, mirroring the
  gallery image set. Holds the url, source, permission status, attribution, and the true pixel
  width and height. One image per item is marked primary. Images carry a sort rank. Width and
  height are required so the detail grid can reserve each image's aspect box and avoid layout
  shift; legacy or external images without dimensions fall back to natural size. The primary
  image also populates the item's cover, which is what the carousel renders.
- Feed item link: an external link belonging to a feed item, such as a website or an Instagram
  handle. Holds a label, a url, and a sort rank. Links are held per feed item for now. They
  move to a per-account set when accounts for creatives deepen in a later phase.

The redesign adds the following entities. See [Redesign](redesign.md) and
[Wallet and presence](wallet-and-presence.md).

- Account: a signed-in user. Holds email (the sign-in identity), display name, an optional
  title, an avatar, an optional short bio, the private personal fields (first name, last name,
  phone), and the join date. Auth is passwordless email with one-time codes, so no password is
  stored. Browsing the map and the feed needs no account. Check in, profile, and wallet require
  one.
- Account saved item: a gallery or feed item saved by an account. The saved-state cookie merges
  into this set on first sign-in, after which saves are server-held.
- Login code: a short-lived one-time code issued for passwordless email sign-in. The code is
  stored hashed, never in plaintext, with an expiry and a consumed marker.
- Session: a server-issued sign-in session for an account, used to gate the per-account
  surfaces. The raw session token is never stored; the row holds only its hash, with an expiry.
  The session also carries the current check-in challenge: a hashed challenge token, its expiry,
  and the gallery it is bound to, issued when a signed-in user opens a gallery card and consumed
  when the check-in is recorded.
- Gallery brand: an optional attribute on a gallery, holding a brand name and a logo. When
  present it can render as a badge beside a creative's name on a post card, and as a pin
  marker on the map. A gallery without a brand renders the name alone.
- Check-in: a record that an account checked in at a gallery. Holds the account, the gallery,
  the reported coordinates and timestamp, whether the server verified presence, and whether a
  point was awarded. Unverified check-ins are kept for history and award no point.
- Wallet transaction: one entry in an account's append-only points ledger. Holds the account,
  a signed delta, a reason (a verified check-in, and later a shop spend), an optional reference
  to the check-in that produced it, and the time. The wallet balance is the sum of these
  entries, never a single mutable number.
- Contact message: a message sent through the contact page. Holds the name, email, subject,
  body, and the time received. The contact page lives in the landing zone.

## Feed item kind

Every feed item carries an explicit kind, which drives how it behaves in the feed rather than
acting only as a label. The kinds are art post, event, and announcement. Kind is required and
set at creation; it is never inferred from the shape of an item's content, since that would let
an edit to the content silently change the behaviour. The per-kind behaviour, the two-stage
reveal for art posts and events and the Save and Share only card for announcements, is recorded
in [Redesign](redesign.md) (D14) and [Interactions](interactions.md). Existing rows were
backfilled once from their former type when the kind field was introduced.

## Source of truth by field

- Identity, description, images, hours, phone, website, and all feed content are owned by
  Grounded Art.
- Discovery, coordinates, and the initial address seed come from Google Places at import
  time and are owned by us afterward.
- Hours are owned and sourced from gallery sites and manual entry, not taken live from any
  external service. Stale hours are the problem Grounded Art exists to fix, so they are not
  imported as truth.

## Ratings and reviews

Grounded Art does not use ratings or reviews. They are not stored and not shown.

## Provenance and freshness

- Each gallery records where its field groups came from, the source link, and when each was
  last verified. This supports the confirm-or-replace workflow against seeded and scraped
  content, and supports takedown and opt-out.
- Galleries and feed items record when they were last refreshed, so "kept current" is
  enforced rather than claimed.

## Curation

Curation is represented by a featured flag and ordering on galleries and feed items. The
richer editorial stories layer is a later addition and is not modelled yet.

## Accounts, presence, and wallet

The redesign adds a per-account layer. Identity stays ours, the same as galleries.

Saved state is convenience and can merge freely: the saved-state cookie from signed-out
browsing merges into the account's saved items on first sign-in. Points are not convenience,
they are value, so the check-in cookie is never merged. A cookie check-in is by definition
unverified and must never become a verified check-in or mint a point; the signed-out check-in
history stays empty until the server records a verified check-in.

Points are server-authoritative. A check-in is verified server-side: the challenge token issued
when the gallery card was opened must match, and the reported position must fall within the
check-in radius of the gallery (100 metres). A verified check-in writes both a check-in row and a
positive wallet transaction in one database transaction, so a check-in and its point cannot drift
apart, and the write is guarded so two rapid submissions cannot both award a point. At most one
point is awarded per gallery per account in a 24 hour window; further verified check-ins in that
window are recorded without a point. The balance is always derived from the ledger, which keeps
it auditable and lets the future shop debit it later without rework. Verification and anti-farming
are specified in [Wallet and presence](wallet-and-presence.md).
