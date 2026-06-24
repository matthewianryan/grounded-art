# Product

This document records core product decisions for Grounded Art.

## Mission and intention

Grounded Art is the connective tissue of Cape Town's art scene. It makes the scene
legible and accessible to the people who love it, and it gives visibility to the
artists who make it.

Helping emerging Cape Town artists be seen is a core part of the mission. Many local
artists work without a physical space or gallery representation, and the feed exists
to give them a place to be found, alongside the city's galleries and events.

Grounded Art serves distinct audiences: locals looking for what is on, visitors
finding the scene, artists who want to be discovered, and galleries that want reach
while staying current.

## Beyond the directory

The directory, the map, and the feed are the base. Two further layers are decided
directions that deepen the product.

- Editorial stories. A curated layer of short gallery and artist stories sits over
  the directory. This is where the human curation becomes visible and where Grounded
  Art reads as a cultural publication rather than a listings utility.
- Temporal feed views. The feed is sliced by time so people can see what is on this
  weekend, what is opening this week, and what is closing soon. This is what makes
  "kept current" a felt benefit and gives people a reason to return.

## Launch and phases

Grounded Art ships in phases.

v1 is the landing page. Every page of the landing site is built and filled with available
content, copy, and images, and it launches publicly using available content, including scraped
images and information.

v2 is the web app: the events and posts feed and the maps page, saturated with real Cape Town
locations and information using scraped data and efficient ingestion. The landing page leads
into this app once v2 ships.

There is no waitlist.

## Curation model

Grounded Art is a curated front over a full directory. The Cape Town galleries in scope sit
in an underlying directory, and a human-curated editorial layer of highlights sits on top.

## Primary surfaces

The map and the feed are co-equal primary surfaces. The map gives the geographic view of
galleries. The feed gives the time-ordered view of what is happening. Neither is subordinate
to the other.

## Data model

The map and the feed run on two separate setups that cross-link where relevant.

The map is built around galleries. A gallery is a physical place. Only galleries with a
physical location are rendered as nodes on the map.

The feed is built around events and posts. Feed items are not required to have a physical
location. They can come from creatives, curators, and artists who have no physical space, and
they can link to a digital presence such as a website or a social profile. A feed item can
optionally be tied to a physical location.

The two setups cross-link where relevant. A gallery's events and posts link back to its node
on the map. A feed item from a creative without a physical location links to that creative's
digital presence instead.
