"use client";

import type { FeedItem, Gallery } from "@/lib/types";
import { PostDetail } from "@/components/post-detail";

interface FeedUnmaskRevealProps {
  item: FeedItem;
  gallery: Gallery | undefined;
  headingId?: string;
}

/**
 * Stage 2 of the reveal: the full-width PostDetail sheet. The browse scene (carousel and the
 * expanded card) stays mounted and pinned in the parent; this sheet rises over it on scroll via
 * z-index, the framer.university unmask technique with no animation library. The parent applies
 * the pinning and the scroll overlap; here we render the edge-to-edge paper sheet itself.
 */
export function FeedUnmaskReveal({ item, gallery, headingId }: FeedUnmaskRevealProps) {
  return (
    <div className="w-full rounded-t-[1.5rem] border-t border-line bg-paper shadow-[0_-24px_60px_-32px_rgba(0,0,0,0.45)]">
      <div className="px-4 pb-32 pt-12 sm:px-8">
        <PostDetail item={item} gallery={gallery} headingId={headingId} fullBleed />
      </div>
    </div>
  );
}
