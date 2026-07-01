# Grounded Art — use cases, user journeys, and UI gaps

## Actors

Four actors are named in docs/product.md and docs/PLANNING.md. Each has a distinct
motivation and a distinct entry point.

| Actor | Who they are | Core need |
|-------|-------------|-----------|
| Local | Cape Town resident | What is on this week, and where |
| Visitor | Short-stay visitor, cultural tourist, art fair attendee | Find the art scene fast, without knowing the city |
| Artist | Cape Town creative, often without a physical space | Be discovered, have a presence alongside galleries |
| Gallery | Physical space wanting reach and currency | Be found, stay current without manual effort |

A fifth actor is implicit and equally important:

| Actor | Who they are | Core need |
|-------|-------------|-----------|
| Curator (us) | Dylan and Matthew | Add and maintain content; keep the directory current |

---

## Use cases

### UC-1 Browse the feed for what is on this weekend

Actor: Local or Visitor
Entry: Landing page Feed CTA, or direct to /feed
Precondition: Feed has active items with starts_on and ends_on dates in range

Steps:
1. User arrives at the feed
2. Taps "This weekend" temporal filter
3. Reads the filtered list: exhibitions, openings, events on Saturday and Sunday
4. Taps a feed card title to open the post detail
5. Reads the full item: title, dates, gallery, description, image
6. Taps "View on map" to see where the gallery is
7. Taps "Save" to bookmark the item for the session

Outcome: User has a plan for the weekend with a gallery location confirmed on the map.

---

### UC-2 Discover a gallery on the map and plan a visit

Actor: Local or Visitor
Entry: Landing page Atlas CTA, or direct to /map
Precondition: Galleries are seeded with coordinates

Steps:
1. User arrives at the map
2. Sees Cape Town rendered with gallery markers
3. Pans or zooms to a neighbourhood (Woodstock, City Bowl, Sea Point)
4. Taps a marker
5. Gallery card opens in side panel: name, suburb, address, today's hours, primary image, website
6. User reads the hours and confirms the gallery is open
7. Taps "View gallery" to go to the gallery detail page
8. Reads the full gallery: description, full week hours, current exhibitions from the feed
9. Taps the website link to book or get directions

Outcome: User knows where to go, what is showing, and whether the gallery is open today.

---

### UC-3 Check in at a gallery

Actor: Local (on-site)
Entry: Gallery card on map, gallery detail page, or post detail page
Precondition: User is physically within 100m of the gallery; gallery has coordinates

Steps:
1. User is standing outside or inside the gallery
2. Opens the gallery card or detail page
3. Taps "Check in"
4. Browser requests location permission (first time only)
5. If permission granted and within 100m: success state shown ("You're here.")
6. If outside 100m: out-of-range state shown ("Not quite there yet.")
7. If permission denied: permission state shown ("Location not shared.")
8. On success: the Check in button transitions to its checked-in state for the session

Outcome: User gets a small moment of acknowledgement for being at the gallery.
The gallery's checked-in state persists for the session.

---

### UC-4 Find an artist with no physical gallery

Actor: Local, Visitor, or someone discovering Cape Town art online
Entry: Feed
Precondition: Feed has posts from creatives with no gallery_id but with creative_name and external_url

Steps:
1. User browses the feed
2. Sees a post from a creative (type: post, no gallery attribution, creative_name and external_url present)
3. Post renders image-led with the creative's name as attribution
4. User taps "Artist" in the action row
5. Browser opens the creative's external_url (website or social profile) in a new tab

Outcome: User discovers an emerging artist and lands on the artist's own presence.

---

### UC-5 A gallery wants to be listed

Actor: Gallery
Entry: Landing page "For galleries and artists" section
Precondition: None

Steps:
1. Gallery representative finds the landing page
2. Reads the "For galleries and artists" section
3. Taps "Email us about your space"
4. Mail client opens with the pre-filled subject line
5. Gallery sends an email to galleries@grounded-art.co.za

Outcome: Gallery has initiated contact. We add them to the directory manually.

Note: This is intentionally a mailto in v1. No form, no instant confirmation, no
onboarding flow. The UI requirement here is that the email link works and the subject
line pre-populates. Both are built.

---

### UC-6 An artist wants to be featured

Actor: Artist
Entry: Landing page "For galleries and artists" section, or About page
Precondition: None

Steps:
1. Artist finds the landing page or about page
2. Reads the galleries and artists section
3. Taps the email CTA
4. Sends an email expressing interest

Outcome: Artist has initiated contact. We add their posts to the feed manually.

Gap: The current landing copy focuses on galleries and spaces. Artists without a
physical space are named in product.md as a core part of the mission, but the landing
section heading ("For galleries and artists") and body copy does not explicitly address
the independent creative who has no space. The copy could be more specific about what
being featured looks like for an artist with no gallery: a post in the feed, a link to
their profile, their name on a card.

---

### UC-7 A visitor new to Cape Town finds the art scene

Actor: Visitor (no prior knowledge of Cape Town galleries)
Entry: Search engine or word of mouth, lands on landing page
Precondition: None

Steps:
1. Visitor lands on the landing home page
2. Hero communicates what Grounded Art is
3. Visitor scrolls: sees the atlas preview, the feed preview
4. Taps "Explore the atlas" CTA
5. Arrives at /map
6. Sees galleries spread across Cape Town
7. Taps a marker in the City Bowl (nearest, most walkable)
8. Reads gallery card: name, suburb, hours, description
9. Taps "View on map" link or website to plan the visit

Outcome: Visitor has a starting point without knowing any gallery names in advance.

Gap: The map has no suburb or neighbourhood filter. A visitor who does not know
Woodstock from Sea Point cannot narrow to "galleries near the Waterfront" or "galleries
I can walk to from the CBD." This is a browsing-by-geography need that the current
feature set does not address. The API already supports a suburb filter
(listGalleries({ suburb })) but it is not exposed in any UI.

---

### UC-8 A local returns regularly to see what is new

Actor: Local (repeat visitor)
Entry: Direct URL or bookmark to /feed
Precondition: Feed is kept current with new items

Steps:
1. Local visits /feed on a Thursday evening
2. Default feed shows all recent items, newest first
3. Local sees what has been added since their last visit
4. Taps "Opening this week" to narrow to new shows
5. Finds one they want to attend on Saturday
6. Saves it (session state)

Outcome: The temporal filters are the product's key hook for return visits. "Kept
current" becomes a felt benefit when there is always something new on this view.

Gap: There is no "new since you last visited" or "added this week" signal in the UI.
Featured items are pinned but there is no freshness indicator on feed cards, so the
local cannot quickly see what has changed. The last_refreshed_at field exists on
FeedItem but is not surfaced anywhere. Even a simple "Added X days ago" caption on
recent items would serve this need.

---

### UC-9 Curator adds and maintains content

Actor: Curator (Dylan or Matthew)
Entry: Direct database / API seed scripts
Precondition: API is running; database is seeded

Steps:
1. Curator identifies a new gallery or exhibition to add
2. Adds gallery record via seed or direct insert
3. Adds feed item linked to gallery
4. Confirms item appears in feed at /feed
5. Confirms gallery appears on map at /map
6. Updates last_refreshed_at as information is verified

Outcome: Content is live. No admin UI exists in v1.

Gap: There is no curator-facing UI at all. All content management is done via the
database directly. This is an intentional cut for v1, but it is the binding constraint
on how fast content can be added. The content pipeline docs describe an LLM-assisted
ingestion flow but it is not built. As the volume of galleries and feed items grows,
the lack of a curator interface becomes the bottleneck.

---

## UI gaps identified from the journeys

These are gaps in the current UI spec or implementation surface, derived from walking
each journey above against what exists in the codebase.

### Gap 1: Artist-specific copy on the landing (UC-6)
Current: "For galleries and artists" section addresses galleries and spaces. Copy
implies a physical space is needed.
Need: Explicit mention that independent artists and creatives without a gallery can be
featured in the feed with a link to their digital presence.
UI requirement: One or two sentences in section-galleries.tsx copy that name the
artist-without-a-space use case. No layout change needed.
Priority: Low. Does not block launch; affects acquisition of a key actor.

### Gap 2: Suburb or area filter on the map (UC-7)
Current: Map shows all 14 galleries as markers. No filter. The API supports
listGalleries({ suburb }) but nothing calls it with a suburb parameter.
Need: Visitors and locals who want to plan a walk need to narrow the map to a
neighbourhood.
UI requirement: A small filter row above or overlaid on the map: "All areas",
"City Bowl", "Woodstock", "V&A Waterfront", "Sea Point", "Green Point". Selecting one
calls listGalleries({ suburb }) and re-renders only those markers. Suburb values come
from the gallery.suburb field already in the data.
Priority: Medium. Enhances UC-7 significantly without requiring API changes.

### Gap 3: No freshness signal on feed cards (UC-8)
Current: FeedCard shows dates (starts_on, ends_on) but not when the item was added or
refreshed. published_at exists on FeedItem and is returned by the API.
Need: Repeat visitors cannot see what is new since their last visit without reading
every item.
UI requirement: Show "Added X days ago" or "New this week" as a secondary caption on
feed cards when published_at is within the last 7 days. Use the existing formatDate
helper. Small text-muted label below the dates.
Priority: Medium. Directly serves the return-visit use case that temporal filters alone
do not cover.

### Gap 4: No search or name lookup on the map (UC-2, UC-7)
Current: Galleries can only be found by panning the map or scanning markers.
Need: A user who knows a gallery name (Zeitz MOCAA, blank projects) cannot find it
without already knowing roughly where it is on the map.
UI requirement: A minimal search input overlaid on the map (top of the side panel or
top-left of the map canvas). Filters the marker list client-side by gallery name. Does
not require an API change; filter against the already-fetched listGalleries payload.
Priority: Low for v1 (only 14 galleries, all findable by panning). Becomes important
as the gallery count grows.

### Gap 5: Gallery hours missing from feed cards (UC-2)
Current: FeedCard shows exhibition dates but not gallery hours. The gallery detail page
(Phase 4) will show full hours, but the map side panel card shows only today's hours.
Need: When a user is deciding whether to visit today, they need hours without having
to navigate to the detail page.
UI requirement: Already specified in the gallery-card.tsx plan for Phase 2: show
today's hours in the side panel. Confirm this carries into the gallery detail page with
the full week view. No gap in the build plan; flagging it as a confirmed requirement.
Priority: Confirmed, already in scope.

### Gap 6: No back navigation from map to feed item (UC-1 to UC-2 cross-journey)
Current: The "View on map" deep link (Phase 4) takes a user from a feed item to the
map with the gallery pre-selected via ?gallery= query param. But there is no way to
return to the originating feed item.
Need: A user who goes from a feed item about an exhibition to the gallery on the map
should be able to return to that exhibition without losing their place.
UI requirement: The gallery card on the map, when opened via a ?from=feed&item={slug}
deep link, shows a "Back to {exhibition title}" link at the top of the card. This is a
URL state management question: the feed item slug and title can be passed as query
params alongside ?gallery=.
Priority: Low for v1. Nice to have; deferred to Phase 4 or post-v1.

### Gap 7: No mobile nav between map and feed (all journeys)
Current: The web app nav (site-nav.tsx) has Map and Feed links. On mobile, the map
takes the full viewport height and the nav is at the top. After checking in or saving
from a map card, there is no quick way to switch to the feed without scrolling back to
the top nav.
Need: On mobile, a bottom tab bar or persistent nav shortcut between Map and Feed
would make switching natural.
UI requirement: A fixed bottom tab bar on mobile only (hidden on sm: and above) with
two tabs: Map (ti-map-2) and Feed (ti-list). Uses the same active-route logic as the
existing site-nav. This is an additive mobile enhancement, not a replacement of the
existing nav.
Priority: Medium. The web app will be used on phones by people standing in galleries.
Mobile navigation quality is high-impact for UC-3 (check-in) specifically.

### Gap 8: No empty state on the map when no galleries load (Phase 7, UC-2)
Current: Planned in Phase 7 as a "could not load galleries" message but not yet
specified in detail.
Need: If the API is down or returns zero galleries, the map canvas renders without
markers and the user sees a blank cream map with no explanation.
UI requirement: When listGalleries returns an empty array or throws, show a muted
overlay on the side panel: "Galleries could not be loaded. Try refreshing." The map
base layer stays visible so the page does not look broken.
Priority: Medium. A blank map with no markers reads as broken, not as an empty state.

### Gap 9: Saved items are invisible to the user (UC-1, UC-3)
Current: The save action is specified as session-only state on the action row button.
But there is no surface that shows the user what they have saved. Saving has no
payoff beyond the button state changing.
Need: A user who saves three exhibitions during a browsing session should be able to
see their saved list before deciding where to go.
UI requirement: A "Saved" view or filter on the feed page that shows only session-saved
items. This could be as simple as an additional filter pill "Saved" that filters the
rendered list client-side to items whose slugs are in the saved-state store. No API
change needed.
Priority: Medium. Without this, "Save" is a gesture with no consequence, which will
train users to ignore it.

### Gap 10: No sharing mechanism (all discovery journeys)
Current: No share or copy-link affordance anywhere in the app.
Need: A user who finds a great exhibition wants to send the link to a friend. The URLs
are already stable and shareable (feed/{slug}, galleries/{slug}), but there is no
copy or share button to make this easy.
UI requirement: A "Share" or "Copy link" button in the action row alongside Save.
On mobile, navigator.share() opens the native share sheet. On desktop, copies the URL
to clipboard and shows a brief "Link copied" confirmation. One additional action button,
consistent with the existing action row pattern.
Priority: Low for v1. Word of mouth is how a product like this grows; making sharing
frictionless has a long-term acquisition value, but it does not block the core
journeys.