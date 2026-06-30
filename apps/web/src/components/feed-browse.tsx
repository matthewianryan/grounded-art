"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, useReducedMotion } from "motion/react";
import type { FeedItem, FeedGalleryContext, Gallery } from "@/lib/types";
import { feedPostKind, kindOpensDetail, toFeedCarouselItem } from "@/lib/feed-display";
import { useVerticalSwipe } from "@/lib/use-axis-lock";
import { useUserActions } from "@/components/user-actions-provider";
import { galleryKey, feedKey } from "@/lib/user-actions";
import { FeedCircularGallery } from "@/components/feed-circular-gallery";
import { FeedExpandedCard } from "@/components/feed-expanded-card";
import { FeedUnmaskReveal } from "@/components/feed-unmask-reveal";
import { useFeedPageShell } from "@/components/feed-page-shell";
import { FEED_CAROUSEL_STAGE_CLASS } from "@/lib/feed-carousel-layout";

type FeedMode = "browse" | "expanded" | "unmask";

export function FeedBrowse({
  items,
  galleriesById,
  fullGalleriesById,
  savedOnly,
  searchTerm,
}: {
  items: FeedItem[];
  galleriesById: Map<string, FeedGalleryContext>;
  fullGalleriesById: Map<string, Gallery>;
  savedOnly: boolean;
  searchTerm: string;
}) {
  const { ready, isSaved } = useUserActions();
  const reduce = useReducedMotion();
  const feedPageShell = useFeedPageShell();
  const [mode, setMode] = useState<FeedMode>("browse");
  const [activeIndex, setActiveIndex] = useState(0);
  const sceneRef = useRef<HTMLDivElement>(null);
  const unmaskRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  // True once the rising sheet has cleared the fold, so the retract listener can tell the entry
  // scroll (which momentarily sits at the fold) apart from a genuine scroll back to the top.
  const armedRef = useRef(false);
  const sheetHeadingId = "feed-detail-title";
  const normalizedSearch = searchTerm.trim().toLowerCase();

  useEffect(() => {
    setActiveIndex(0);
    setMode("browse");
  }, [items, savedOnly, normalizedSearch]);

  useEffect(() => {
    feedPageShell?.reportMode(mode);
  }, [mode, feedPageShell]);

  // Keep the page fixed while the carousel is moveable; scrolling is for expanded detail only.
  useEffect(() => {
    if (mode !== "browse") {
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

  const visible = useMemo(() => {
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
  const activeGalleryContext = activeItem?.gallery_id
    ? galleriesById.get(activeItem.gallery_id)
    : undefined;
  const activeGallery = activeItem?.gallery_id
    ? fullGalleriesById.get(activeItem.gallery_id)
    : undefined;
  // Announcements stop at the expanded card; only art posts and events open the full detail.
  const activeOpensDetail = activeItem
    ? kindOpensDetail(feedPostKind(activeItem))
    : false;

  const openExpanded = useCallback(() => setMode("expanded"), []);
  const closeExpanded = useCallback(() => {
    setMode("browse");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleActiveIndexChange = useCallback(
    (index: number) => {
      if (mode === "browse") setActiveIndex(index);
    },
    [mode],
  );

  const enterUnmask = useCallback(() => {
    if (!activeOpensDetail) return;
    armedRef.current = false;
    setMode("unmask");
    requestAnimationFrame(() => {
      if (reduce) {
        // No progressive overlay: bring the static full-width detail into view.
        unmaskRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      // Align the runway top to the viewport, then scroll down past it so the sheet rises about
      // halfway over the pinned scene. One smooth scroll, pure scroll progress, no JS tweening.
      const runwayTop = window.scrollY + (sceneRef.current?.getBoundingClientRect().top ?? 0);
      window.scrollTo({
        top: runwayTop + window.innerHeight * 0.5,
        behavior: "smooth",
      });
    });
  }, [activeOpensDetail, reduce]);

  useEffect(() => {
    if (mode !== "expanded" && mode !== "unmask") return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeExpanded();
      }
    }

    window.addEventListener("keydown", onKeyDown);

    if (mode !== "expanded") {
      return () => window.removeEventListener("keydown", onKeyDown);
    }

    function onWheel(event: WheelEvent) {
      if (event.deltaY > 20) {
        event.preventDefault();
        enterUnmask();
      }
    }

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("wheel", onWheel);
    };
  }, [mode, closeExpanded, enterUnmask]);

  // Touch equivalent of the wheel-down handler: a downward swipe on the expanded card enters the
  // reveal. Axis-locked so a sideways swipe is left to the carousel.
  useVerticalSwipe(mode === "expanded" && activeOpensDetail, enterUnmask);

  // Reversible retract: while the sheet is rising, track its top edge. Once it has cleared the
  // fold we arm; when it retracts back to the fold (scroll returned to the runway top) we drop
  // back to stage 1, which unmounts the sheet so no sliver is ever left behind. Skipped under
  // reduced motion, where the sheet is a static surface rather than a scroll-driven overlay.
  useEffect(() => {
    if (mode !== "unmask" || reduce) return;

    function onScroll() {
      const sheetTop = unmaskRef.current?.getBoundingClientRect().top;
      if (sheetTop === undefined) return;
      const fold = window.innerHeight;
      if (!armedRef.current) {
        if (sheetTop < fold - fold * 0.12) armedRef.current = true;
        return;
      }
      if (sheetTop >= fold - 2) {
        armedRef.current = false;
        setMode("expanded");
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [mode, reduce]);

  // Move focus to follow the reveal: into the expanded dialog on stage 1, and to the detail
  // heading on stage 2, so keyboard and screen reader users track the surface that is in front.
  useEffect(() => {
    if (mode === "expanded") {
      requestAnimationFrame(() => dialogRef.current?.focus({ preventScroll: true }));
    } else if (mode === "unmask") {
      requestAnimationFrame(() => {
        document.getElementById(sheetHeadingId)?.focus({ preventScroll: true });
      });
    }
  }, [mode]);

  if (!ready && savedOnly) {
    return <p className="text-sm text-muted">Loading your saved items...</p>;
  }

  if (visible.length === 0) {
    return (
      <p className="text-sm text-muted">
        {normalizedSearch
          ? savedOnly
            ? "No saved items match that search. Try another term or clear Saved."
            : "No feed items match that search. Try another term or filter."
          : savedOnly
            ? "Nothing saved yet. Save exhibitions and posts as you browse."
            : "Nothing in this view yet. Try another filter, or check back soon."}
      </p>
    );
  }

  const expandedCard =
    activeItem && (mode === "expanded" || mode === "unmask") ? (
      <FeedExpandedCard
        item={activeItem}
        gallery={activeGallery}
        galleryContext={activeGalleryContext}
        onClose={closeExpanded}
        onReveal={enterUnmask}
      />
    ) : null;

  const scenePinned = mode === "unmask" && !reduce;
  const fillContainer = mode === "browse";

  return (
    <div className={fillContainer ? "relative h-full min-h-0" : "relative"}>
      {/* Scene: carousel, neighbours, and the expanded card. The same elements stay mounted in
          every mode; during the reveal the scene pins so it stays visible behind the sheet. */}
      <div
        ref={sceneRef}
        className={
          scenePinned
            ? "sticky top-0 z-0 min-h-svh overflow-hidden"
            : fillContainer
              ? "relative z-0 h-full min-h-0"
              : "relative z-0"
        }
      >
        <FeedCircularGallery
          items={carouselItems}
          activeIndex={safeIndex}
          onActiveIndexChange={handleActiveIndexChange}
          onCenterClick={mode === "browse" ? openExpanded : undefined}
          interactive={mode === "browse"}
          fillContainer={fillContainer}
        />

        <AnimatePresence>
          {mode === "expanded" && activeItem && (
            <>
              <button
                type="button"
                className="fixed inset-0 z-[60] border-0 bg-ink/10 p-0"
                aria-label="Close expanded view"
                onClick={closeExpanded}
              />
              <div
                ref={dialogRef}
                tabIndex={-1}
                className="pointer-events-none fixed inset-0 z-[70] flex items-center justify-center px-3 py-6 outline-none md:px-4 md:py-8"
                role="dialog"
                aria-modal="true"
                aria-label={`${activeItem.title} detail`}
              >
                <div className="pointer-events-auto relative w-full max-w-4xl">
                  {expandedCard}
                </div>
              </div>
            </>
          )}
          {mode === "unmask" && activeItem && (
            <div
              ref={dialogRef}
              tabIndex={-1}
              className={`absolute inset-x-0 top-0 z-20 flex ${FEED_CAROUSEL_STAGE_CLASS} pointer-events-none items-center justify-center px-3 py-6 outline-none md:px-4 md:py-8`}
              role="dialog"
              aria-modal="true"
              aria-label={`${activeItem.title} detail`}
            >
              <div className="pointer-events-auto relative w-full max-w-4xl">
                {expandedCard}
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Sheet: the full-width detail rising over the pinned scene on scroll (z-index only). */}
      {mode === "unmask" && activeItem && (
        <div ref={unmaskRef} className="relative z-10">
          <FeedUnmaskReveal
            item={activeItem}
            gallery={activeGallery}
            headingId={sheetHeadingId}
          />
        </div>
      )}
    </div>
  );
}
