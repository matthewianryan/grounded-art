# Profile and account

The profile and account area is the signed-in user's own space in the web app. It is reached
from Profile in the nav, which requires an account.

## Profile

A profile shows the user's avatar, display name, and an optional short bio. It is the home of
the account area and the entry to the sections below.

## Sections

- Profile. Avatar, display name, bio.
- Wallet. The points balance and recent transactions. See
  [Wallet and presence](../wallet-and-presence.md).
- Saved. The galleries and feed items the user has saved, carried over from session state on
  sign-in.
- Check-ins. The user's check-in history, verified and unverified.
- Account. Edit display name, title, avatar, and personal details.

The Wix sample sections My Programs, Notifications, and Settings are not part of this redesign.

## Account editor

The account editor separates display information, which is visible to others (display name,
title, avatar), from personal information, which is private (first name, last name, phone).
Saving confirms, discarding reverts. The orange Wix accents in the mockup are replaced by the
Grounded Art tokens, with rust used only for the primary action.

## Artist and gallery account

An artist or gallery account is shown on the feed canvas as a card in place of a post. An account
card does not unmask. Clicking the focused gallery account card opens the map with that gallery's
node focused, where the gallery information shows as a panel. An artist account with no gallery
has no expansion and no map target in v1, since we are limiting what artists display for now. See
[Redesign](../redesign.md) and [Maps](maps.md).

## Presentation

Restrained and professional, from the shared tokens. The art and the person lead, the frame
stays quiet.
