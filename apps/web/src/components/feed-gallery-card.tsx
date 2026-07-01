"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import type { Gallery } from "@/lib/types";
import { galleryBadges, galleryPrimaryImage } from "@/lib/feed-display";
import { galleryKey } from "@/lib/user-actions";
import { useUserActions } from "@/components/user-actions-provider";
import { PostBadges } from "@/components/post-badges";
import { FeedPostImage } from "@/components/feed-post-card";

interface FeedGalleryCardProps {
  gallery: Gallery;
  onClose: () => void;
  onReveal: () => void;
}

/**
 * The gallery public profile card, expanded from the feed canvas. It previews the gallery and
 * offers "Scroll down" to unmask the full account-style gallery view.
 */
export function FeedGalleryCard({ gallery, onClose, onReveal }: FeedGalleryCardProps) {
  const reduce = useReducedMotion();
  const { isSaved, toggleSaveGallery } = useUserActions();

  const badges = galleryBadges(gallery);
  const imageUrl = galleryPrimaryImage(gallery);
  const saved = isSaved(galleryKey(gallery.slug));
  const description =
    gallery.description && gallery.description.length > 200
      ? `${gallery.description.slice(0, 200).trim()}…`
      : gallery.description;

  const card = (
    <article
      className="relative flex flex-col overflow-hidden rounded-card border border-line bg-card-bg shadow-card sm:flex-row"
      aria-labelledby="feed-gallery-title"
    >
      <div className="w-full shrink-0 border-b border-line p-4 sm:w-[45%] sm:border-b-0 sm:border-r">
        <FeedPostImage
          imageUrl={imageUrl}
          displayName={gallery.name}
          className="mx-auto aspect-[4/5] w-full max-w-sm object-cover object-center"
        />
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="ga-meta uppercase tracking-wide text-muted">Gallery</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <h2 id="feed-gallery-title" className="ga-display-card text-ink sm:text-2xl">
                {gallery.name}
              </h2>
              <PostBadges badges={badges} />
            </div>

            {gallery.suburb && <p className="ga-meta mt-1">{gallery.suburb}</p>}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full border border-line px-3 py-1 text-xs text-muted transition hover:border-ink hover:text-ink"
            aria-label="Close gallery card"
          >
            Close
          </button>
        </div>

        {description && <p className="ga-body mt-4 flex-1">{description}</p>}

        <div className="mt-6 flex flex-wrap gap-2">
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
          {gallery.latitude != null && gallery.longitude != null && (
            <ActionPill
              label="View map"
              href={`/map?gallery=${encodeURIComponent(gallery.slug)}`}
            />
          )}
          <ActionPill
            label={saved ? "Saved" : "Save"}
            onClick={() => toggleSaveGallery(gallery.slug)}
            pressed={saved}
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
