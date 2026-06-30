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
  with no physical space, it carries that creative's name and a link to their digital
  presence instead. Carries the dates that drive the temporal views.

The redesign adds the following entities. See [Redesign](redesign.md) and
[Wallet and presence](wallet-and-presence.md).

- Account: a signed-in user. Holds email (the sign-in identity), display name, an optional
  title, an avatar, an optional short bio, the private personal fields (first name, last name,
  phone), and the join date. Auth is passwordless email with one-time codes. Browsing the map
  and the feed needs no account. Check in, profile, and wallet require one.
- Account saved item: a gallery or feed item saved by an account. Replaces the ga-saved cookie
  after first sign-in.
- Login code: a short-lived hashed one-time code issued for passwordless email sign-in.
- Session: a server-issued sign-in session for an account, used to gate the per-account
  surfaces and to bind check-in challenge tokens.
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
  body, and the time received.

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

The redesign adds a per-account layer. Identity stays ours, the same as galleries. Points are
server-authoritative: a verified check-in writes both a check-in row and a positive wallet
transaction in one database transaction, so a check-in and its point cannot drift apart. The
balance is always derived from the ledger, which keeps it auditable and lets the future shop
debit it later without rework. Verification and anti-farming are specified in
[Wallet and presence](wallet-and-presence.md).
