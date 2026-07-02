"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { FeedCarouselItem } from "@/lib/feed-display";
import { FeedPostImage } from "@/components/feed-post-card";
import {
  FEED_CAROUSEL_MOBILE_CARD_HEIGHT_CLASS,
  FEED_CAROUSEL_MOBILE_CARD_PADDING_CLASS,
  FEED_CAROUSEL_MOBILE_CARD_RADIUS_CLASS,
  FEED_CAROUSEL_MOBILE_CARD_STAGE_CLASS,
  FEED_CAROUSEL_MOBILE_CARD_WIDTH_CLASS,
} from "@/lib/feed-carousel-layout";

interface FeedFlatCarouselProps {
  items: FeedCarouselItem[];
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  onActiveSelect?: () => void;
}

const NEIGHBOR_SCALE = 0.92;
const NEIGHBOR_OPACITY = 0.6;
const CARD_TRANSITION = { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const };

export function FeedFlatCarousel({
  items,
  activeIndex,
  onActiveIndexChange,
  onActiveSelect,
}: FeedFlatCarouselProps) {
  const reduce = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<string, HTMLElement>>(new Map());
  const observerActiveRef = useRef(activeIndex);

  function scrollToIndex(index: number) {
    const item = items[index];
    if (!item) return;
    observerActiveRef.current = index;
    cardRefs.current
      .get(item.id)
      ?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }

  // Programmatic scroll-into-view when activeIndex changes for a reason OTHER than the
  // IntersectionObserver itself (e.g. a filter-change reset to 0, or a neighbor-card tap).
  useEffect(() => {
    if (observerActiveRef.current === activeIndex) return;
    observerActiveRef.current = activeIndex;
    const item = items[activeIndex];
    if (!item) return;
    cardRefs.current
      .get(item.id)
      ?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [activeIndex, items]);

  // Detect which card is centered after a native swipe settles, and report it upward.
  useEffect(() => {
    const activeItem = items[activeIndex];
    if (!activeItem) return;
    const img = cardRefs.current.get(activeItem.id)?.querySelector("img");
    if (!img) return;
    const style = window.getComputedStyle(img);
    // #region agent log
    fetch("http://127.0.0.1:7600/ingest/0f8ab905-2030-4221-a6e1-3ce1dfa4f39e", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "b37c74" },
      body: JSON.stringify({
        sessionId: "b37c74",
        runId: "post-fix",
        hypothesisId: "B",
        location: "feed-flat-carousel.tsx:activeImageStyle",
        message: "active carousel image object position",
        data: {
          objectPosition: style.objectPosition,
          objectFit: style.objectFit,
          activeIndex,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
  }, [activeIndex, items]);

  // Detect which card is centered after a native swipe settles, and report it upward.
  useEffect(() => {
    const track = trackRef.current;
    if (!track || items.length === 0) return;

    const visibility = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.getAttribute("data-item-id");
          if (!id) continue;
          visibility.set(id, entry.isIntersecting ? entry.intersectionRatio : 0);
        }
        let bestId: string | null = null;
        let bestRatio = 0;
        for (const [id, ratio] of visibility) {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestId = id;
          }
        }
        if (bestId === null) return;
        const index = items.findIndex((item) => item.id === bestId);
        if (index === -1 || index === observerActiveRef.current) return;
        observerActiveRef.current = index;
        onActiveIndexChange(index);
      },
      {
        root: track,
        rootMargin: "0px -35% 0px -35%",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    );

    for (const el of cardRefs.current.values()) observer.observe(el);
    return () => observer.disconnect();
  }, [items, onActiveIndexChange]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        scrollToIndex(Math.min(items.length - 1, activeIndex + 1));
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        scrollToIndex(Math.max(0, activeIndex - 1));
      }
    }

    track.addEventListener("keydown", onKeyDown);
    return () => track.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, items]);

  if (items.length === 0) return null;

  return (
    <div
      ref={trackRef}
      className={`flex w-full ${FEED_CAROUSEL_MOBILE_CARD_STAGE_CLASS} touch-pan-y snap-x snap-mandatory items-center gap-4 overflow-x-auto overflow-y-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${FEED_CAROUSEL_MOBILE_CARD_PADDING_CLASS} pb-8`}
      role="list"
      aria-label="Feed browse gallery"
      tabIndex={0}
    >
      {items.map((item, index) => {
        const isActive = index === activeIndex;
        const cardClassName = `${FEED_CAROUSEL_MOBILE_CARD_WIDTH_CLASS} ${FEED_CAROUSEL_MOBILE_CARD_HEIGHT_CLASS} ${FEED_CAROUSEL_MOBILE_CARD_RADIUS_CLASS} shrink-0 snap-center overflow-hidden ${
          isActive ? "ring-1 ring-line" : ""
        }`;
        const setCardRef = (el: HTMLElement | null) => {
          if (el) cardRefs.current.set(item.id, el);
          else cardRefs.current.delete(item.id);
        };

        const cardBody = (
          <button
            type="button"
            className="block h-full w-full text-left"
            aria-label={
              isActive ? `Open ${item.displayName}` : `Show ${item.displayName} in centre`
            }
            onClick={() => {
              if (isActive) {
                onActiveSelect?.();
              } else {
                observerActiveRef.current = index;
                onActiveIndexChange(index);
              }
            }}
          >
            <FeedPostImage
              imageUrl={item.imageUrl}
              displayName={item.displayName}
              className="h-full w-full object-cover object-top"
            />
          </button>
        );

        if (reduce) {
          return (
            <article
              key={item.id}
              ref={setCardRef}
              data-item-id={item.id}
              role="listitem"
              aria-current={isActive ? "true" : undefined}
              className={`${cardClassName} ${
                isActive ? "scale-100 opacity-100" : "scale-[0.92] opacity-60"
              }`}
            >
              {cardBody}
            </article>
          );
        }

        return (
          <motion.article
            key={item.id}
            ref={setCardRef}
            data-item-id={item.id}
            role="listitem"
            aria-current={isActive ? "true" : undefined}
            className={cardClassName}
            animate={{
              scale: isActive ? 1 : NEIGHBOR_SCALE,
              opacity: isActive ? 1 : NEIGHBOR_OPACITY,
            }}
            transition={CARD_TRANSITION}
          >
            {cardBody}
          </motion.article>
        );
      })}
    </div>
  );
}
