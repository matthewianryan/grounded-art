# Content pipeline

This document records how content is gathered for Grounded Art. It covers both manual
entry and the automated system.

## Purpose and phases

The automated system exists to fast-forward content population during initial, local
setup. This is a seeding step for getting the product off the ground locally.

After seeding, we move to a permissions phase: we approach real galleries directly,
establish communication, and obtain proper permission to use their information, posts,
and images. Accurate, permissioned content from galleries replaces seeded content
before it is relied on in production.

## Sources

Content is gathered from:

- Existing Cape Town art and event listing sites.
- Gallery websites directly.
- Google Places API.
- Instagram and other social media posts, through a semi-manual, human-in-the-loop
  process that stays within normal usage and respects platform anti-abuse signals.

## Methods

- Use RSS feeds, newsletters, and public calendars wherever they are available.
- Scrape public gallery and exhibition pages, and public listing pages.
- Use LLM extraction over copied page text to pull structured details such as gallery
  name, location, exhibition title, dates, and images.

## Modes

- Automatic ingestion, running the sources and methods above.
- Manual entry, by us, for content that is added or corrected by hand.
