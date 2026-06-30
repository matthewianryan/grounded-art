"use client";

import Link from "next/link";
import type { FeedItem, Gallery } from "@/lib/types";
import {
  feedPostImageSet,
  feedPostKind,
  feedPostLinks,
  postBadges,
  toFeedGalleryContext,
} from "@/lib/feed-display";
import { resolveActionRowContext } from "@/lib/action-row";
import { formatDateRange } from "@/lib/format";
import { useUserActions } from "@/components/user-actions-provider";
import { PostBadges } from "@/components/post-badges";
import { PostLinks } from "@/components/post-links";
import { PostImageMasonry } from "@/components/post-image-masonry";

interface PostDetailProps {
  item: FeedItem;
  gallery: Gallery | undefined;
  headingId?: string;
  className?: string;
  // The in-feed sheet spans the full viewport width; the standalone route stays a column.
  fullBleed?: boolean;
}

/**
 * The full post detail surface, shared by the in-feed unmask overlay and the standalone
 * /feed/[slug] route. Top to bottom: title and meta, the reading column body, links and
 * actions, then the images full-dimension in a masonry. In fullBleed mode every section uses
 * the full width and only the body stays a reading column.
 */
export function PostDetail({
  item,
  gallery,
  headingId,
  className = "",
  fullBleed = false,
}: PostDetailProps) {
  const kind = feedPostKind(item);
  const galleryContext = gallery ? toFeedGalleryContext(gallery) : undefined;
  const badges = postBadges(item, galleryContext);
  const links = feedPostLinks(item);
  const images = feedPostImageSet(item, gallery);
  const dates = formatDateRange(item.starts_on, item.ends_on);

  // Art posts lead with the artist or creative name, with the work title beneath. Events and
  // announcements lead with the title and show the posting account.
  const leadsWithArtist = kind === "art_post" && Boolean(item.creative_name);
  const heading = leadsWithArtist ? item.creative_name! : item.title;
  const postingAccount = gallery?.name ?? null;

  return (
    <article className={`${fullBleed ? "w-full" : "mx-auto w-full max-w-3xl"} ${className}`}>
      <header>
        <div className="flex flex-wrap items-center gap-2">
          <h1
            id={headingId}
            tabIndex={headingId ? -1 : undefined}
            className="font-display text-3xl leading-tight tracking-tight text-ink outline-none sm:text-4xl"
          >
            {heading}
          </h1>
          <PostBadges badges={badges} />
        </div>

        {leadsWithArtist && (
          <p className="mt-2 font-display text-xl text-muted">{item.title}</p>
        )}

        <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm text-muted">
          {!leadsWithArtist && postingAccount && <span>{postingAccount}</span>}
          {item.location_text && (
            <>
              {!leadsWithArtist && postingAccount && <Dot />}
              <span>{item.location_text}</span>
            </>
          )}
          {dates && (
            <>
              {((!leadsWithArtist && postingAccount) || item.location_text) && <Dot />}
              <span>{dates}</span>
            </>
          )}
        </div>
      </header>

      {item.body && (
        <p className="mt-6 max-w-[65ch] text-base leading-relaxed text-ink/80">{item.body}</p>
      )}

      <div className="mt-8 space-y-4">
        <PostLinks links={links} />
        <PostActions item={item} gallery={gallery} />
      </div>

      {images.length > 0 && (
        <div className="mt-10">
          <PostImageMasonry images={images} alt={heading} />
        </div>
      )}
    </article>
  );
}

function PostActions({ item, gallery }: { item: FeedItem; gallery: Gallery | undefined }) {
  const { isFeedItemSaved, toggleSaveFeedItem } = useUserActions();
  const actions = resolveActionRowContext(item, gallery);
  const gallerySlug = gallery?.slug;
  const saved = isFeedItemSaved(item.slug, gallerySlug);

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => toggleSaveFeedItem(item.slug, gallerySlug)}
        aria-pressed={saved}
        className={`inline-flex items-center rounded-full border px-3.5 py-1.5 text-sm transition ${
          saved
            ? "border-ink bg-ink/5 text-ink"
            : "border-line text-muted hover:border-ink hover:text-ink"
        }`}
      >
        {saved ? "Saved" : "Save"}
      </button>

      {actions.viewOnMap && actions.mapGallerySlug && (
        <Link
          href={`/map?gallery=${encodeURIComponent(actions.mapGallerySlug)}`}
          className="inline-flex items-center rounded-full border border-line px-3.5 py-1.5 text-sm text-muted transition hover:border-ink hover:text-ink"
        >
          View map
        </Link>
      )}

      <Link
        href={`/feed/${item.slug}`}
        className="inline-flex items-center rounded-full border border-line px-3.5 py-1.5 text-sm text-muted transition hover:border-ink hover:text-ink"
      >
        Share
      </Link>
    </div>
  );
}

function Dot() {
  return <span aria-hidden="true">·</span>;
}
