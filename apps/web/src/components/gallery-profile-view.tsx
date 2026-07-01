"use client";

import type { Gallery, FeedItemLink } from "@/lib/types";
import { galleryBadges, galleryImageSet } from "@/lib/feed-display";
import { resolveActionRowContext } from "@/lib/action-row";
import { ActionRow } from "@/components/detail-card";
import { PostBadges } from "@/components/post-badges";
import { PostLinks } from "@/components/post-links";
import { PostImageMasonry } from "@/components/post-image-masonry";

interface GalleryProfileViewProps {
  gallery: Gallery;
  headingId?: string;
}

const DAY_ORDER = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
const DAY_LABELS: Record<(typeof DAY_ORDER)[number], string> = {
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
  sun: "Sun",
};

/**
 * The account-style gallery view revealed when a gallery public profile card unmasks. Backed
 * entirely by the existing gallery record: description, images, location details, links, and the
 * shared action row (Directions, Save, Check in, Share).
 */
export function GalleryProfileView({ gallery, headingId }: GalleryProfileViewProps) {
  const badges = galleryBadges(gallery);
  const images = galleryImageSet(gallery);
  const hours = formatHours(gallery.hours);
  const links = galleryLinks(gallery);
  const actions = resolveActionRowContext(undefined, gallery);

  return (
    <article className="w-full">
      <header>
        <p className="ga-meta uppercase tracking-wide text-muted">Gallery</p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <h1 id={headingId} tabIndex={headingId ? -1 : undefined} className="ga-display-page text-ink outline-none">
            {gallery.name}
          </h1>
          <PostBadges badges={badges} />
        </div>

        <div className="ga-body mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          {gallery.formatted_address && <span>{gallery.formatted_address}</span>}
          {gallery.suburb && !gallery.formatted_address && <span>{gallery.suburb}</span>}
          {hours && (
            <>
              {(gallery.formatted_address || gallery.suburb) && <Dot />}
              <span>{hours}</span>
            </>
          )}
        </div>
      </header>

      {gallery.description && (
        <p className="ga-body-intro mt-6 max-w-[65ch] text-ink/80">{gallery.description}</p>
      )}

      <div className="mt-8 space-y-4">
        <PostLinks links={links} />
        <ActionRow item={undefined} gallery={gallery} actions={actions} />
      </div>

      {images.length > 0 && (
        <div className="mt-10">
          <PostImageMasonry images={images} alt={gallery.name} />
        </div>
      )}
    </article>
  );
}

function galleryLinks(gallery: Gallery): FeedItemLink[] {
  const links: FeedItemLink[] = [];
  if (gallery.website_url) {
    links.push({ id: "website", label: "Website", url: gallery.website_url, sort_rank: 0 });
  }
  for (const ref of gallery.external_refs) {
    if (ref.url) {
      links.push({ id: ref.id, label: sourceLabel(ref.source), url: ref.url, sort_rank: 1 });
    }
  }
  return links;
}

function sourceLabel(source: string): string {
  const known: Record<string, string> = {
    instagram: "Instagram",
    facebook: "Facebook",
    google: "Google",
    google_places: "Google",
  };
  return known[source] ?? source.charAt(0).toUpperCase() + source.slice(1);
}

function formatHours(hours: Gallery["hours"]): string | null {
  if (!hours) return null;
  const parts = DAY_ORDER.filter((d) => hours[d]).map((d) => `${DAY_LABELS[d]} ${hours[d]}`);
  return parts.length > 0 ? parts.join(" · ") : null;
}

function Dot() {
  return <span aria-hidden="true">·</span>;
}
