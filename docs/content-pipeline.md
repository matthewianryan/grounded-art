# Content pipeline

This document records how content is gathered for Grounded Art. It covers both manual
entry and the automated system.

## Purpose and phases

The automated system fast-forwards content population so Grounded Art can launch with real,
useful Cape Town content. v1 launches the landing page publicly with available content,
including scraped images and information. v2 saturates the feed and the maps page with scraped
data.

In parallel, and as an ongoing effort, we pursue direct gallery relationships and proper
permission to use their information, posts, and images. Scraped content is confirmed or
replaced as those relationships are established.

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

## Attribution and opt-out

Grounded Art attributes content and links back to each gallery and its digital presence. The
site carries a clear takedown and opt-out contact, and we act on those requests. We store
public business information, not individuals' personal data.
