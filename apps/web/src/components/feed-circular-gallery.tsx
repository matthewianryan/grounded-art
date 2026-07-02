"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import type { FeedCarouselItem } from "@/lib/feed-display";
import type { GalleryItem } from "@/components/ui/circular-gallery-2";
import { buildFeedGalleryItems, isDarkTheme } from "@/lib/polaroid-texture";
import {
  feedCarouselHitStyle,
  FEED_CAROUSEL_MD_BREAKPOINT,
  FEED_CAROUSEL_MOBILE_CARD_STAGE_CLASS,
  FEED_CAROUSEL_STAGE_CLASS,
  FEED_CAROUSEL_STAGE_FILL_CLASS,
} from "@/lib/feed-carousel-layout";
import { CircularGallery as PolaroidSnapGallery } from "@/components/circular-gallery";
import { FeedFlatCarousel } from "@/components/feed-flat-carousel";

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
  fillContainer?: boolean;
}

function noop() {}

export function FeedCircularGallery({
  items,
  activeIndex,
  onActiveIndexChange,
  onCenterClick,
  interactive = true,
  fillContainer = false,
}: FeedCircularGalleryProps) {
  const reduce = useReducedMotion();
  const [dark, setDark] = useState(false);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[] | null>(null);
  const [viewportWidth, setViewportWidth] = useState(768);
  const [centerHovered, setCenterHovered] = useState(false);

  useEffect(() => {
    let cancelled = false;

    function loadGallery() {
      const width = window.innerWidth;
      setViewportWidth(width);

      if (reduce || items.length === 0 || width < FEED_CAROUSEL_MD_BREAKPOINT) {
        setGalleryItems(null);
        // #region agent log
        fetch("http://127.0.0.1:7600/ingest/0f8ab905-2030-4221-a6e1-3ce1dfa4f39e", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "b37c74" },
          body: JSON.stringify({
            sessionId: "b37c74",
            runId: "post-fix",
            hypothesisId: "A",
            location: "feed-circular-gallery.tsx:loadGallery",
            message: "gallery skipped",
            data: { width, isMobile: width < FEED_CAROUSEL_MD_BREAKPOINT, reduce, itemCount: items.length },
            timestamp: Date.now(),
          }),
        }).catch(() => {});
        // #endregion
        return;
      }

      setGalleryItems(null);
      buildFeedGalleryItems(items, dark).then((built) => {
        if (!cancelled) setGalleryItems(built);
      });
      // #region agent log
      fetch("http://127.0.0.1:7600/ingest/0f8ab905-2030-4221-a6e1-3ce1dfa4f39e", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "b37c74" },
        body: JSON.stringify({
          sessionId: "b37c74",
          runId: "post-fix",
          hypothesisId: "A",
          location: "feed-circular-gallery.tsx:loadGallery",
          message: "gallery loading desktop textures",
          data: { width, depCount: 3 },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
    }

    loadGallery();
    window.addEventListener("resize", loadGallery);
    return () => {
      cancelled = true;
      window.removeEventListener("resize", loadGallery);
    };
  }, [items, dark, reduce]);

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

  const hitStyle = feedCarouselHitStyle(viewportWidth);

  if (items.length === 0) return null;

  const stageHeightClass = fillContainer
    ? FEED_CAROUSEL_STAGE_FILL_CLASS
    : FEED_CAROUSEL_STAGE_CLASS;
  const stageClass = `relative ${stageHeightClass} w-full touch-pan-y bg-paper ${
    interactive ? "" : "pointer-events-none"
  }`;

  const isMobile = viewportWidth < FEED_CAROUSEL_MD_BREAKPOINT;

  if (isMobile) {
    // The flat carousel's card has its own mobile-specific height (see
    // FEED_CAROUSEL_MOBILE_CARD_STAGE_CLASS), different from the shared FEED_CAROUSEL_STAGE_CLASS
    // mobile clause, so this branch sizes itself independently rather than reusing stageClass
    // (still respecting fillContainer for browse mode).
    const mobileStageClass = `relative flex items-center ${
      fillContainer ? FEED_CAROUSEL_STAGE_FILL_CLASS : FEED_CAROUSEL_MOBILE_CARD_STAGE_CLASS
    } w-full touch-pan-y bg-paper ${interactive ? "" : "pointer-events-none"}`;
    return (
      <div className={mobileStageClass}>
        <FeedFlatCarousel
          items={items}
          activeIndex={activeIndex}
          onActiveIndexChange={interactive ? onActiveIndexChange : noop}
          onActiveSelect={onCenterClick}
        />
      </div>
    );
  }

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
            Swipe to browse. Select the centre image to open detail.
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
            centerHovered={centerHovered}
            reduceMotion={false}
            onActiveIndexChange={onActiveIndexChange}
          />
          {interactive && onCenterClick && (
            <button
              type="button"
              className="absolute inset-x-0 top-1/2 z-10 mx-auto -translate-y-1/2 cursor-pointer border-0 bg-transparent"
              style={hitStyle}
              aria-label={`Open ${items[activeIndex]?.displayName ?? "post"}`}
              onClick={onCenterClick}
              onMouseEnter={() => setCenterHovered(true)}
              onMouseLeave={() => setCenterHovered(false)}
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
          Drag to browse. Select the centre image to open detail.
        </p>
      )}
    </div>
  );
}
