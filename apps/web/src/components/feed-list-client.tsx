"use client";

import type { FeedItem } from "@/lib/types";
import type { GallerySummary } from "@/components/feed-card";
import { FeedCard } from "@/components/feed-card";
import { useUserActions } from "@/components/user-actions-provider";
import { galleryKey, feedKey } from "@/lib/user-actions";

export function FeedListClient({
  items,
  galleriesById,
  savedOnly,
}: {
  items: FeedItem[];
  galleriesById: Map<string, GallerySummary>;
  savedOnly: boolean;
}) {
  const { ready, isSaved } = useUserActions();

  if (!ready && savedOnly) {
    return (
      <p className="mt-10 text-sm text-muted">Loading your saved items...</p>
    );
  }

  const visible = savedOnly
    ? items.filter((item) => {
        if (isSaved(feedKey(item.slug))) return true;
        const gallery = item.gallery_id ? galleriesById.get(item.gallery_id) : undefined;
        return gallery ? isSaved(galleryKey(gallery.slug)) : false;
      })
    : items;

  if (visible.length === 0) {
    return (
      <p className="mt-10 text-sm text-muted">
        {savedOnly
          ? "Nothing saved yet. Save exhibitions and posts as you browse."
          : "Nothing in this view yet. Try another filter, or check back soon."}
      </p>
    );
  }

  return (
    <div className="mt-10">
      {visible.map((item) => (
        <FeedCard
          key={item.id}
          item={item}
          gallery={item.gallery_id ? galleriesById.get(item.gallery_id) : undefined}
        />
      ))}
    </div>
  );
}
