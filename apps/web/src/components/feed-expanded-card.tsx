"use client";

import Link from "next/link";
import { useEffect, useState, type MouseEvent, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { FeedItem, FeedGalleryContext, Gallery } from "@/lib/types";
import {
  feedDisplayName,
  feedPostImages,
  feedPostKind,
  kindOpensDetail,
  postBadges,
} from "@/lib/feed-display";
import { resolveActionRowContext } from "@/lib/action-row";
import { formatDateRange } from "@/lib/format";
import { useUserActions } from "@/components/user-actions-provider";
import { PostBadges } from "@/components/post-badges";
import { FeedPostImage } from "@/components/feed-post-card";
import { PolaroidFrame } from "@/components/polaroid-frame";

interface FeedExpandedCardProps {
  item: FeedItem;
  gallery: Gallery | undefined;
  galleryContext: FeedGalleryContext | undefined;
  onClose: () => void;
  onReveal: () => void;
}

export function FeedExpandedCard({
  item,
  gallery,
  galleryContext,
  onClose,
  onReveal,
}: FeedExpandedCardProps) {
  const reduce = useReducedMotion();
  const { isFeedItemSaved, toggleSaveFeedItem } = useUserActions();
  const [imageIndex, setImageIndex] = useState(0);

  const kind = feedPostKind(item);
  const displayName = feedDisplayName(item);
  // Art posts lead with the artist or creative name, with the work title beneath. Events and
  // announcements lead with the title.
  const leadsWithArtist = kind === "art_post" && Boolean(item.creative_name);
  const heading = leadsWithArtist ? item.creative_name! : item.title;
  const opensDetail = kindOpensDetail(kind);
  const badges = postBadges(item, galleryContext);
  const images = feedPostImages(item, gallery);
  const imageUrl = images[imageIndex] ?? images[0] ?? null;
  const dates = formatDateRange(item.starts_on, item.ends_on);
  const actions = resolveActionRowContext(item, gallery);
  const gallerySlug = gallery?.slug;
  const saved = isFeedItemSaved(item.slug, gallerySlug);

  useEffect(() => {
    setImageIndex(0);
  }, [item.id]);

  const bodyExcerpt =
    item.body && item.body.length > 180 ? `${item.body.slice(0, 180).trim()}…` : item.body;

  const card = (
    <article
      className="relative flex flex-col overflow-hidden rounded-card border border-line bg-card-bg shadow-card sm:flex-row"
      aria-labelledby="feed-expanded-title"
    >
      <div className="relative w-full shrink-0 border-b border-line p-4 sm:w-[45%] sm:border-b-0 sm:border-r">
        <PolaroidFrame active className="mx-auto max-w-sm">
          <FeedPostImage
            imageUrl={imageUrl}
            displayName={displayName}
            className="aspect-[4/5] w-full object-cover sm:min-h-[18rem]"
          />
        </PolaroidFrame>

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
            <div className="flex flex-wrap items-center gap-2">
              <h2
                id="feed-expanded-title"
                className="font-display text-xl leading-snug tracking-tight text-ink sm:text-2xl"
              >
                {heading}
              </h2>
              <PostBadges badges={badges} />
            </div>

            {leadsWithArtist && (
              <p className="mt-1 font-display text-base text-muted">{item.title}</p>
            )}

            {gallery && (
              <p className="mt-2 text-sm text-muted">
                {gallery.name}
                {gallery.suburb ? ` · ${gallery.suburb}` : ""}
              </p>
            )}

            {dates && <p className="mt-1 text-xs text-muted">{dates}</p>}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full border border-line px-3 py-1 text-xs text-muted transition hover:border-ink hover:text-ink"
            aria-label="Close expanded view"
          >
            Close
          </button>
        </div>

        {bodyExcerpt && (
          <p className="mt-4 flex-1 text-sm leading-relaxed text-muted">{bodyExcerpt}</p>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          {opensDetail && (
            <ActionPill
              label={
                <span className="inline-flex items-center gap-1.5">
                  <ChevronDown />
                  Scroll down
                </span>
              }
              onClick={onReveal}
              primary
            />
          )}
          {actions.viewOnMap && actions.mapGallerySlug && (
            <ActionPill
              label="View map"
              href={`/map?gallery=${encodeURIComponent(actions.mapGallerySlug)}`}
            />
          )}
          <ActionPill
            label={saved ? "Saved" : "Save"}
            onClick={() => toggleSaveFeedItem(item.slug, gallerySlug)}
            pressed={saved}
          />
          <ActionPill
            label="Share"
            href={`/feed/${item.slug}`}
          />
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

function ChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ActionPill({
  label,
  href,
  onClick,
  pressed,
  primary,
}: {
  label: ReactNode;
  href?: string;
  onClick?: () => void;
  pressed?: boolean;
  primary?: boolean;
}) {
  const className = primary
    ? "inline-flex items-center rounded-full border border-accent bg-accent px-3.5 py-1.5 text-sm text-paper transition hover:opacity-90"
    : `inline-flex items-center rounded-full border px-3.5 py-1.5 text-sm transition ${
        pressed
          ? "border-ink bg-ink/5 text-ink"
          : "border-line text-muted hover:border-ink hover:text-ink"
      }`;

  if (href) {
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
