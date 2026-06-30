"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import type { FeedCarouselItem } from "@/lib/feed-display";
import type { GalleryItem } from "@/components/ui/circular-gallery-2";
import { buildFeedGalleryItems, isDarkTheme } from "@/lib/polaroid-texture";
import {
  FEED_CAROUSEL_HIT_CLASS,
  FEED_CAROUSEL_STAGE_CLASS,
} from "@/lib/feed-carousel-layout";
import { CircularGallery as PolaroidSnapGallery } from "@/components/circular-gallery";

const WebGLCircularGallery = dynamic(
  () => import("@/components/ui/circular-gallery-2").then((mod) => mod.CircularGallery),
  { ssr: false },
);

interface FeedCircularGalleryProps {
  items: FeedCarouselItem[];
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  onCenterClick?: () => void;
  interactive?: boolean;
}

function noop() {}

export function FeedCircularGallery({
  items,
  activeIndex,
  onActiveIndexChange,
  onCenterClick,
  interactive = true,
}: FeedCircularGalleryProps) {
  const reduce = useReducedMotion();
  const [dark, setDark] = useState(false);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[] | null>(null);

  useEffect(() => {
    function readTheme() {
      setDark(isDarkTheme());
    }

    readTheme();

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", readTheme);

    const observer = new MutationObserver(readTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      media.removeEventListener("change", readTheme);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (reduce || items.length === 0) {
      setGalleryItems(null);
      return;
    }

    let cancelled = false;
    setGalleryItems(null);

    buildFeedGalleryItems(items, dark).then((built) => {
      if (!cancelled) setGalleryItems(built);
    });

    return () => {
      cancelled = true;
    };
  }, [items, dark, reduce]);

  if (items.length === 0) return null;

  const stageClass = `relative ${FEED_CAROUSEL_STAGE_CLASS} w-full touch-pan-y bg-paper ${
    interactive ? "" : "pointer-events-none"
  }`;

  if (reduce) {
    return (
      <div className={stageClass}>
        <PolaroidSnapGallery
          items={items}
          activeIndex={activeIndex}
          onActiveIndexChange={interactive ? onActiveIndexChange : noop}
          onActiveSelect={onCenterClick}
        />
        {interactive && (
          <p className="pointer-events-none absolute inset-x-0 bottom-4 text-center text-xs text-muted">
            Scroll to browse. Select the centre image to open detail.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={stageClass}>
      {galleryItems ? (
        <>
          <WebGLCircularGallery
            items={galleryItems}
            bend={3}
            borderRadius={0.05}
            scrollSpeed={2}
            scrollEase={0.02}
            activeIndex={activeIndex}
            interactive={interactive}
            onActiveIndexChange={onActiveIndexChange}
          />
          {interactive && onCenterClick && (
            <button
              type="button"
              className={`absolute inset-x-0 top-1/2 z-10 mx-auto ${FEED_CAROUSEL_HIT_CLASS} -translate-y-1/2 cursor-pointer border-0 bg-transparent`}
              aria-label={`Open ${items[activeIndex]?.displayName ?? "post"}`}
              onClick={onCenterClick}
            />
          )}
        </>
      ) : (
        <div className="flex h-full items-center justify-center">
          <p className="text-sm text-muted">Loading gallery...</p>
        </div>
      )}

      {interactive && galleryItems && (
        <p className="pointer-events-none absolute inset-x-0 bottom-4 text-center text-xs text-muted">
          Scroll or drag to browse. Select the centre image to open detail.
        </p>
      )}
    </div>
  );
}
