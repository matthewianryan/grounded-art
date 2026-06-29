"use client";

import { useReducedMotion } from "motion/react";
import type { FeedItem, Gallery } from "@/lib/types";
import { feedCarouselImage, feedDisplayName, postBadges } from "@/lib/feed-display";
import type { FeedGalleryContext } from "@/lib/types";
import { FeedPostCard } from "@/components/feed-post-card";
import { DetailCard } from "@/components/detail-card";

interface FeedUnmaskRevealProps {
  item: FeedItem;
  gallery: Gallery | undefined;
  galleryContext: FeedGalleryContext | undefined;
}

export function FeedUnmaskReveal({ item, gallery, galleryContext }: FeedUnmaskRevealProps) {
  const reduce = useReducedMotion();
  const displayName = feedDisplayName(item);
  const badges = postBadges(item, galleryContext);
  const imageUrl = feedCarouselImage(item, galleryContext);

  if (reduce) {
    return (
      <div className="space-y-6">
        <FeedPostCard imageUrl={imageUrl} displayName={displayName} badges={badges} compact />
        <DetailCard item={item} gallery={gallery} variant="feed" />
      </div>
    );
  }

  return (
    <div className="relative" style={{ height: "180vh" }}>
      <div className="sticky top-0 h-screen">
        <div className="relative h-full">
          <div className="absolute inset-0 z-0 overflow-y-auto pt-[42vh]">
            <div className="mx-auto max-w-lg px-2 pb-24">
              <DetailCard item={item} gallery={gallery} variant="feed" />
            </div>
          </div>

          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 mx-auto max-w-lg px-2 pt-8">
            <div className="pointer-events-auto">
              <FeedPostCard imageUrl={imageUrl} displayName={displayName} badges={badges} compact />
            </div>
            <p className="mt-4 text-center text-xs text-muted">Scroll to reveal full detail</p>
          </div>
        </div>
      </div>
    </div>
  );
}
