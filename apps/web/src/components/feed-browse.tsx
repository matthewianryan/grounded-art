"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { FeedItem, FeedGalleryContext, Gallery } from "@/lib/types";
import {
  buildFeedCanvasItems,
  feedPostKind,
  kindOpensDetail,
} from "@/lib/feed-display";
import { useUserActions } from "@/components/user-actions-provider";
import { galleryKey, feedKey } from "@/lib/user-actions";
import { FeedCircularGallery } from "@/components/feed-circular-gallery";
import { FeedExpandedCard } from "@/components/feed-expanded-card";
import { FeedArtistCard } from "@/components/feed-artist-card";
import { FeedGalleryCard } from "@/components/feed-gallery-card";
import { FeedUnmaskReveal } from "@/components/feed-unmask-reveal";
import { PostDetail } from "@/components/post-detail";
import { GalleryProfileView } from "@/components/gallery-profile-view";
import { FEED_CAROUSEL_STAGE_CLASS } from "@/lib/feed-carousel-layout";

type FeedMode = "browse" | "detail";

// Matches the toolbar band in FeedPageShell (pt-20 + pb-8 + search row) so the pinned scene
// keeps the same height as the browse carousel area.
const FEED_SCENE_HEIGHT_CLASS = "h-[calc(100dvh-9.5rem)]";

export function FeedBrowse({
  items,
  galleriesById,
  fullGalleriesById,
  featuredGalleries,
  savedOnly,
  searchTerm,
}: {
  items: FeedItem[];
  galleriesById: Map<string, FeedGalleryContext>;
  fullGalleriesById: Map<string, Gallery>;
  featuredGalleries: Gallery[];
  savedOnly: boolean;
  searchTerm: string;
}) {
  const { ready, isSaved } = useUserActions();
  const [mode, setMode] = useState<FeedMode>("browse");
  const [activeIndex, setActiveIndex] = useState(0);
  const sceneRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const sheetHeadingId = "feed-detail-title";
  const normalizedSearch = searchTerm.trim().toLowerCase();

  useEffect(() => {
    setActiveIndex(0);
    setMode("browse");
  }, [items, savedOnly, normalizedSearch]);

  // Lock page scroll in browse; unlock in detail so the unmask sheet can rise on a normal scroll.
  useEffect(() => {
    if (mode === "detail") {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      return;
    }

    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [mode]);

  const visibleFeed = useMemo(() => {
    const savedFiltered = !savedOnly
      ? items
      : !ready
        ? []
        : items.filter((item) => {
            if (isSaved(feedKey(item.slug))) return true;
            const gallery = item.gallery_id ? galleriesById.get(item.gallery_id) : undefined;
            return gallery ? isSaved(galleryKey(gallery.slug)) : false;
          });

    if (!normalizedSearch) return savedFiltered;

    return savedFiltered.filter((item) => {
      const gallery = item.gallery_id ? galleriesById.get(item.gallery_id) : undefined;
      const haystack = [
        item.title,
        item.body,
        item.creative_name,
        item.location_text,
        gallery?.name,
        gallery?.brand_name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedSearch);
    });
  }, [items, savedOnly, ready, isSaved, galleriesById, normalizedSearch]);

  const visibleGalleries = useMemo(() => {
    let list = featuredGalleries;
    if (savedOnly) {
      if (!ready) return [];
      list = list.filter((gallery) => isSaved(galleryKey(gallery.slug)));
    }

    if (!normalizedSearch) return list;

    return list.filter((gallery) => {
      const haystack = [gallery.name, gallery.description, gallery.suburb, gallery.brand_name]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }, [featuredGalleries, savedOnly, ready, isSaved, normalizedSearch]);

  const canvasItems = useMemo(
    () => buildFeedCanvasItems(visibleFeed, galleriesById, fullGalleriesById, visibleGalleries),
    [visibleFeed, galleriesById, fullGalleriesById, visibleGalleries],
  );

  const carouselItems = useMemo(() => canvasItems.map((entry) => entry.carousel), [canvasItems]);

  const safeIndex = Math.min(activeIndex, Math.max(0, canvasItems.length - 1));
  const activeCanvas = canvasItems[safeIndex];
  const activeLabel = activeCanvas?.carousel.displayName ?? "post";
  // Artist cards are card-only in v1; posts open the full detail (unless announcements) and
  // gallery cards open the account-style gallery view. Only those two run the reveal.
  const activeOpensDetail =
    activeCanvas?.type === "post"
      ? kindOpensDetail(feedPostKind(activeCanvas.item))
      : activeCanvas?.type === "gallery";

  const openDetail = useCallback(() => setMode("detail"), []);

  const closeDetail = useCallback(() => {
    window.scrollTo({ top: 0 });
    setMode("browse");
  }, []);

  const scrollToSheet = useCallback(() => {
    if (!activeOpensDetail) return;
    sheetRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [activeOpensDetail]);

  const handleActiveIndexChange = useCallback(
    (index: number) => {
      if (mode === "browse") setActiveIndex(index);
    },
    [mode],
  );

  useEffect(() => {
    if (mode !== "detail") return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeDetail();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mode, closeDetail]);

  useEffect(() => {
    if (mode === "detail") {
      requestAnimationFrame(() => dialogRef.current?.focus({ preventScroll: true }));
    }
  }, [mode]);

  // #region agent log
  useEffect(() => {
    fetch("http://127.0.0.1:7600/ingest/0f8ab905-2030-4221-a6e1-3ce1dfa4f39e", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "7ab1cb" },
      body: JSON.stringify({
        sessionId: "7ab1cb",
        runId: "verify-static-shell",
        hypothesisId: "B",
        location: "feed-browse.tsx:local-mode",
        message: "local mode without shell provider",
        data: { mode, detailOpen: mode === "detail" },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
  }, [mode]);
  // #endregion

  if (!ready && savedOnly) {
    return <p className="text-sm text-muted">Loading your saved items...</p>;
  }

  if (canvasItems.length === 0) {
    return (
      <p className="text-sm text-muted">
        {normalizedSearch
          ? savedOnly
            ? "No saved items match that search. Try another term or clear filters."
            : "No feed items match that search. Try another term or view."
          : savedOnly
            ? "Nothing saved yet. Save exhibitions and posts as you browse."
            : "Nothing in this view yet. Try another view, or check back soon."}
      </p>
    );
  }

  const detailOpen = mode === "detail";
  const fillContainer = mode === "detail";

  let expandedCard: ReactNode = null;
  if (detailOpen && activeCanvas) {
    if (activeCanvas.type === "post") {
      expandedCard = (
        <FeedExpandedCard
          item={activeCanvas.item}
          gallery={activeCanvas.gallery}
          galleryContext={activeCanvas.galleryContext}
          onClose={closeDetail}
          onReveal={scrollToSheet}
        />
      );
    } else if (activeCanvas.type === "artist") {
      expandedCard = <FeedArtistCard item={activeCanvas.item} onClose={closeDetail} />;
    } else {
      expandedCard = (
        <FeedGalleryCard
          gallery={activeCanvas.gallery}
          onClose={closeDetail}
          onReveal={scrollToSheet}
        />
      );
    }
  }

  const sceneClassName =
    mode === "detail"
      ? `sticky top-0 z-0 ${FEED_SCENE_HEIGHT_CLASS} overflow-hidden bg-paper`
      : "relative z-0 h-full min-h-0 bg-paper";

  return (
    <div className={mode === "browse" ? "relative h-full min-h-0" : "relative bg-paper"}>
      {/* Scene: carousel, neighbours, and the expanded card. Pinned in detail so a normal scroll
          raises the sheet over it without moving or resizing the carousel. */}
      <div ref={sceneRef} className={sceneClassName}>
        <FeedCircularGallery
          items={carouselItems}
          activeIndex={safeIndex}
          onActiveIndexChange={handleActiveIndexChange}
          onCenterClick={mode === "browse" ? openDetail : undefined}
          interactive={mode === "browse"}
          fillContainer={fillContainer}
        />

        {detailOpen && activeCanvas && (
          <div
            ref={dialogRef}
            tabIndex={-1}
            className={`absolute inset-x-0 top-0 z-[70] flex ${FEED_CAROUSEL_STAGE_CLASS} pointer-events-none items-start justify-center overflow-y-auto px-3 pb-3 pt-2 outline-none md:items-center md:px-4 md:py-8`}
            role="dialog"
            aria-modal="true"
            aria-label={`${activeLabel} detail`}
          >
            <div className="pointer-events-auto relative w-full max-w-4xl">{expandedCard}</div>
          </div>
        )}
      </div>

      {/* Sheet: full-width detail in normal flow below the pinned scene; scroll drives the reveal. */}
      {detailOpen && activeOpensDetail && activeCanvas && (
        <div ref={sheetRef} className="relative z-10 bg-paper">
          <FeedUnmaskReveal>
            {activeCanvas.type === "gallery" ? (
              <GalleryProfileView gallery={activeCanvas.gallery} headingId={sheetHeadingId} />
            ) : activeCanvas.type === "post" ? (
              <PostDetail
                item={activeCanvas.item}
                gallery={activeCanvas.gallery}
                headingId={sheetHeadingId}
                fullBleed
              />
            ) : null}
          </FeedUnmaskReveal>
        </div>
      )}
    </div>
  );
}
