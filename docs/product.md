# Product

This document records core product decisions for Grounded Art.

## Launch

Grounded Art launches as a live app. At launch the landing page opens directly into a
working atlas and feed. There is no waitlist. The web app is functional and seeded with
content before launch.

## Curation model

Grounded Art is a curated front over a full directory. The Cape Town galleries in scope sit
in an underlying directory, and a human-curated editorial layer of highlights sits on top.

## Primary surfaces

The atlas and the feed are co-equal primary surfaces. The map gives the geographic view of
galleries. The feed gives the time-ordered view of what is happening. Neither is subordinate
to the other.

## Data model

The atlas and the feed run on two separate setups that cross-link where relevant.

The atlas is built around galleries. A gallery is a physical place. Only galleries with a
physical location are rendered as nodes on the map.

The feed is built around events and posts. Feed items are not required to have a physical
location. They can come from creatives, curators, and artists who have no physical space, and
they can link to a digital presence such as a website or a social profile. A feed item can
optionally be tied to a physical location.

The two setups cross-link where relevant. A gallery's events and posts link back to its node
on the map. A feed item from a creative without a physical location links to that creative's
digital presence instead.
