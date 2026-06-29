"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import type { FeedItem, FeedGalleryContext, Gallery } from "@/lib/types";
import { toFeedCarouselItem } from "@/lib/feed-display";
import { useUserActions } from "@/components/user-actions-provider";
import { galleryKey, feedKey } from "@/lib/user-actions";
import { CircularGallery } from "@/components/circular-gallery";
import { FeedUnmaskReveal } from "@/components/feed-unmask-reveal";

export function FeedBrowse({
  items,
  galleriesById,
  fullGalleriesById,
  savedOnly,
}: {
  items: FeedItem[];
  galleriesById: Map<string, FeedGalleryContext>;
  fullGalleriesById: Map<string, Gallery>;
  savedOnly: boolean;
}) {
  const { ready, isSaved } = useUserActions();
  const detailRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [items, savedOnly]);

  const visible = useMemo(() => {
    if (!savedOnly) return items;
    if (!ready) return [];
    return items.filter((item) => {
      if (isSaved(feedKey(item.slug))) return true;
      const gallery = item.gallery_id ? galleriesById.get(item.gallery_id) : undefined;
      return gallery ? isSaved(galleryKey(gallery.slug)) : false;
    });
  }, [items, savedOnly, ready, isSaved, galleriesById]);

  const carouselItems = useMemo(
    () =>
      visible.map((item) => {
        const galleryContext = item.gallery_id
          ? galleriesById.get(item.gallery_id)
          : undefined;
        return toFeedCarouselItem(item, galleryContext);
      }),
    [visible, galleriesById],
  );

  const safeIndex = Math.min(activeIndex, Math.max(0, visible.length - 1));
  const activeItem = visible[safeIndex];
  const activeGallery = activeItem?.gallery_id
    ? fullGalleriesById.get(activeItem.gallery_id)
    : undefined;

  function scrollToDetail() {
    detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (!ready && savedOnly) {
    return <p className="mt-10 text-sm text-muted">Loading your saved items...</p>;
  }

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
      <CircularGallery
        items={carouselItems}
        activeIndex={safeIndex}
        onActiveIndexChange={setActiveIndex}
        onActiveSelect={scrollToDetail}
      />

      {activeItem && (
        <div ref={detailRef} className="mt-12">
          <FeedUnmaskReveal
            item={activeItem}
            gallery={activeGallery}
            galleryContext={
              activeItem.gallery_id ? galleriesById.get(activeItem.gallery_id) : undefined
            }
          />
        </div>
      )}
    </div>
  );
}
