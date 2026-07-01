# Wallet and presence

This document specifies the verified check-in, the points wallet, and the account requirement
behind them. It builds on the check-in journey in [Use cases](use-cases.md) (UC-3) and the
entities in [Data model](data-model.md), and it pulls server-side check-in verification and
points out of the deferred list in [Feature list](feature-list.md).

## The loop

A signed-in user standing at a gallery checks in. The server verifies they are within the
gallery radius. A verified check-in awards one point to the user's wallet. Points are an in-app
currency that a future shop will spend. Nothing in this loop touches real money.

## Why server-side

The existing check-in is client-only. The browser reads geolocation, compares it to the gallery
coordinates within 100m, and shows a success state. That is fine for a moment of acknowledgement,
but a point that a shop can spend cannot be awarded by the client alone, because the client can
claim any location. Awarding points needs the server to make the call.

## Account requirement

Points belong to an account, so a check-in that awards a point requires a signed-in user.

- A signed-out user who taps Check in is sent to sign in or create an account, then returned to
  the gallery to complete the check-in.
- Profile and wallet are signed-in only for the same reason. They are per-account.
- Browsing the map and the feed needs no account.
- On first sign-in, the saved and checked-in state in the ga-saved cookie is merged onto the
  account so nothing is lost.

## Verification

A check-in is verified when the server confirms presence. The current mechanism is deliberately
layered rather than absolute, because a browser cannot prove its location.

- The client requests high-accuracy browser geolocation and sends latitude, longitude, and the
  device-reported accuracy when available.
- The server computes the distance to the gallery and accepts it when it is within the radius
  (100m, the existing threshold).
- The server rejects coarse location fixes above the configured accuracy threshold when the
  browser reports one. Missing accuracy is tolerated for compatibility, but recorded as absent.
- A short-lived challenge token binds the submission to the signed-in session and selected
  gallery. It is freshness and route-binding evidence, not a true proof of physical presence.
- A per-gallery venue code can be presented when the user arrived through an on-site QR/link.
  This records the stronger `venue_code` method. Missing or stale codes fall back to
  `geolocation` instead of blocking the user.
- A check-in that fails server verification can still record as an unverified check-in for
  history and audit, but awards no point.

## Anti-farming

- One point per gallery per 24 hours per account. Repeat check-ins at the same gallery inside
  the window record in history but award no further points.
- Implausible travel is checked against the account's previous point-awarded check-in, so a bad
  or out-of-range attempt cannot poison the next valid visit.
- For this version, geolocation and venue-code check-ins both earn points. Requiring venue codes
  should be a later configuration change after codes are actually deployed at galleries.
- The award is written in the same transaction that records the check-in, so a check-in and its
  point cannot drift apart.

## The wallet

- The balance is the sum of an append-only ledger of wallet transactions, not a single mutable
  number. Every change is a row: a positive entry for a verified check-in, and later a negative
  entry for a shop spend.
- The profile wallet view shows the current balance and the recent transactions, each with its
  reason and the gallery it came from.
- The future shop is out of scope here. The ledger is built so the shop can debit it later
  without rework.

## States the UI must cover

- Signed out, taps Check in: route to sign in, return to the gallery.
- Signed in, within radius, first time today: verified, plus one point, show the celebration
  moment and the new balance.
- Signed in, within radius, already earned today: verified check-in recorded, no point, said
  plainly.
- Signed in, outside radius: not in range, no point.
- Location permission denied: location not shared, no point, offer to try again.
- Verification failed, a missing or stale token: recorded as unverified, no point.

## What this needs from the stack

- API: a check-in endpoint that verifies and awards atomically, a wallet read endpoint, and the
  challenge token issued when the gallery card is opened. See [Data model](data-model.md) for
  the entities.
- Web: the account gate on Check in, profile, and wallet; the cookie-to-account merge on
  sign-in; the wallet view; and the extended check-in states above.
