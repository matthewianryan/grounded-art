"use client";

import Link from "next/link";
import { useEffect, useState, type MouseEvent, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { FeedItem } from "@/lib/types";
import { feedItemPrimaryImage, feedPostImages, feedPostLinks, postBadges } from "@/lib/feed-display";
import { useUserActions } from "@/components/user-actions-provider";
import { PostBadges } from "@/components/post-badges";
import { PostLinks } from "@/components/post-links";
import { FeedPostImage } from "@/components/feed-post-card";

interface FeedArtistCardProps {
  item: FeedItem;
  onClose: () => void;
}

/**
 * The artist public profile card. Unlike a post it has no scroll-up expansion in v1: the card
 * itself is the display surface, built entirely from the creative-led feed item fields
 * (creative name, work, images, external link, and links).
 */
export function FeedArtistCard({ item, onClose }: FeedArtistCardProps) {
  const reduce = useReducedMotion();
  const { isFeedItemSaved, toggleSaveFeedItem } = useUserActions();
  const [imageIndex, setImageIndex] = useState(0);

  const displayName = item.creative_name?.trim() || item.title;
  const badges = postBadges(item, undefined);
  const images = feedPostImages(item, undefined);
  const imageUrl = images[imageIndex] ?? feedItemPrimaryImage(item);
  const links = feedPostLinks(item);
  const saved = isFeedItemSaved(item.slug);

  useEffect(() => {
    setImageIndex(0);
  }, [item.id]);

  const card = (
    <article
      className="relative flex flex-col overflow-hidden rounded-card border border-line bg-card-bg shadow-card sm:flex-row"
      aria-labelledby="feed-artist-title"
    >
      <div className="relative w-full shrink-0 border-b border-line p-4 sm:w-[45%] sm:border-b-0 sm:border-r">
        <FeedPostImage
          imageUrl={imageUrl}
          displayName={displayName}
          className="mx-auto aspect-[4/5] w-full max-w-sm object-cover object-center"
        />

        {images.length > 1 && (
          <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-between px-3">
            <NavCircle
              label="Previous image"
              direction="prev"
              disabled={imageIndex === 0}
              onClick={(event) => {
                event.stopPropagation();
                setImageIndex((index) => Math.max(0, index - 1));
              }}
            />
            <NavCircle
              label="Next image"
              direction="next"
              disabled={imageIndex >= images.length - 1}
              onClick={(event) => {
                event.stopPropagation();
                setImageIndex((index) => Math.min(images.length - 1, index + 1));
              }}
            />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="ga-meta uppercase tracking-wide text-muted">Artist</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <h2 id="feed-artist-title" className="ga-display-card text-ink sm:text-2xl">
                {displayName}
              </h2>
              <PostBadges badges={badges} />
            </div>

            {item.title && item.title !== displayName && (
              <p className="ga-display-sub mt-1 text-muted">{item.title}</p>
            )}

            {item.location_text && <p className="ga-meta mt-1">{item.location_text}</p>}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full border border-line px-3 py-1 text-xs text-muted transition hover:border-ink hover:text-ink"
            aria-label="Close artist card"
          >
            Close
          </button>
        </div>

        {item.body && <p className="ga-body mt-4 flex-1">{item.body}</p>}

        {links.length > 0 && (
          <div className="mt-5">
            <PostLinks links={links} />
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          {item.external_url && (
            <ActionPill label="Go to artist" href={item.external_url} external primary />
          )}
          <ActionPill
            label={saved ? "Saved" : "Save"}
            onClick={() => toggleSaveFeedItem(item.slug)}
            pressed={saved}
          />
          <ActionPill label="Share" href={`/feed/${item.slug}`} />
        </div>
      </div>
    </article>
  );

  if (reduce) return card;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {card}
    </motion.div>
  );
}

function NavCircle({
  label,
  direction,
  disabled,
  onClick,
}: {
  label: string;
  direction: "prev" | "next";
  disabled: boolean;
  onClick: (event: MouseEvent) => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-paper/90 text-ink shadow-card transition hover:border-ink disabled:pointer-events-none disabled:opacity-30"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d={direction === "prev" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

function ActionPill({
  label,
  href,
  onClick,
  pressed,
  primary,
  external,
}: {
  label: ReactNode;
  href?: string;
  onClick?: () => void;
  pressed?: boolean;
  primary?: boolean;
  external?: boolean;
}) {
  const className = primary
    ? "inline-flex items-center rounded-full border border-accent bg-accent px-3.5 py-1.5 text-sm text-paper transition hover:opacity-90"
    : `inline-flex items-center rounded-full border px-3.5 py-1.5 text-sm transition ${
        pressed
          ? "border-ink bg-ink/5 text-ink"
          : "border-line text-muted hover:border-ink hover:text-ink"
      }`;

  if (href) {
    if (external) {
      return (
        <a href={href} target="_blank" rel="noreferrer" className={className}>
          {label}
        </a>
      );
    }
    return (
      <Link href={href} className={className}>
        {label}
      </Link>
    );
  }

  return (
    <button type="button" className={className} onClick={onClick}>
      {label}
    </button>
  );
}
