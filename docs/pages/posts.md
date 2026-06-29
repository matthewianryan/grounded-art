# Posts feed

The posts feed is a page that presents recent art content from across Cape Town: art posts,
events, and announcements.

## Feed items

Feed items are not required to have a physical location. They can come from galleries, and also
from creatives, curators, and artists who have no physical space, linking to a digital presence
such as a website or a social profile. A feed item can optionally be tied to a physical location,
in which case it cross-links to that gallery's node on the map.

A feed item is one of three kinds, which differ in who leads the card and what actions it offers:

- Art post. Led by the artist or creative's name. It can scroll up to expand to the full post, it
  offers View Map when it is tied to an associated gallery, and it offers Save and Share.
- Event. Led by an event title, posted by an account. It behaves like an art post: scroll up to
  expand, View Map when tied to a gallery, Save, and Share.
- Announcement. Led by an announcement title, posted by an account. It does not expand and has no
  View Map. It offers Save and Share only.

The optional brand and pin badges sit beside the name or title. The pin badge and View Map appear
only when the item is tied to a gallery.

## A single stream

The feed is one stream of all items. It is not split into categories or type filters. Every
feed item is shown, presented image-led so the work leads. The feed item type is kept in the
data for internal use, but it is not exposed as a filter. The only slicing is by time, through
the temporal views below.

In the web app, the feed browses as an image carousel that shows every item. See
[Redesign](../redesign.md).

## How it is populated

The feed is populated in two ways:

- Manually, by us.
- Automatically, through the content pipeline. See [Content pipeline](../content-pipeline.md).

## Temporal views

The feed is sliced by time so people can see what is on now and what is coming. The
views include what is on this weekend, what is opening this week, and what is closing
soon. These views make the feed a reason to return and turn "kept current" into a
felt benefit rather than a claim.

## Intent

The feed is kept recent and regularly refreshed, so it reflects what is happening in
the city now. It gathers content that is otherwise scattered across many separate
sources into one place.

## Presentation

The feed is minimalist and professional. The presentation stays restrained so the posts and
the work lead, with the one expressive exception of the image carousel browse described above.
