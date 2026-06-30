"use client";

import { useCallback, useEffect, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { FeedCarouselItem } from "@/lib/feed-display";
import { FeedPostImage } from "@/components/feed-post-card";
import {
  FEED_CAROUSEL_CARD_CLASS,
  FEED_CAROUSEL_SNAP_PADDING_CLASS,
  FEED_CAROUSEL_STAGE_CLASS,
} from "@/lib/feed-carousel-layout";

interface CircularGalleryProps {
  items: FeedCarouselItem[];
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  onActiveSelect?: () => void;
}

const MOBILE_CARD_OFFSET_X = 110;
const DESKTOP_CARD_OFFSET_X = 200;
const ARC_LIFT = 14;

function arcOffsetY(offset: number): number {
  return Math.abs(offset) ** 2 * ARC_LIFT;
}

export function CircularGallery({
  items,
  activeIndex,
  onActiveIndexChange,
  onActiveSelect,
}: CircularGalleryProps) {
  const reduce = useReducedMotion();

  if (items.length === 0) return null;

  if (reduce) {
    return (
      <ReducedMotionGallery
        items={items}
        activeIndex={activeIndex}
        onActiveIndexChange={onActiveIndexChange}
        onActiveSelect={onActiveSelect}
      />
    );
  }

  return (
    <MotionGallery
      items={items}
      activeIndex={activeIndex}
      onActiveIndexChange={onActiveIndexChange}
      onActiveSelect={onActiveSelect}
    />
  );
}

function CarouselImage({ item }: { item: FeedCarouselItem }) {
  return (
    <FeedPostImage
      imageUrl={item.imageUrl}
      displayName={item.displayName}
      className="aspect-[4/5] w-full object-cover"
    />
  );
}

function ReducedMotionGallery({
  items,
  activeIndex,
  onActiveIndexChange,
  onActiveSelect,
}: CircularGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const activeEl = container.querySelector('[aria-current="true"]');
    activeEl?.scrollIntoView({ inline: "center", block: "nearest", behavior: "auto" });
  }, [activeIndex]);

  return (
    <div
      ref={containerRef}
      className={`flex ${FEED_CAROUSEL_STAGE_CLASS} touch-pan-y snap-x snap-mandatory items-center gap-8 overflow-x-auto ${FEED_CAROUSEL_SNAP_PADDING_CLASS} pb-8`}
      role="list"
      aria-label="Feed browse gallery"
    >
      {items.map((item, index) => {
        const isActive = index === activeIndex;
        return (
          <article
            key={item.id}
            role="listitem"
            aria-current={isActive ? "true" : undefined}
            className={`${FEED_CAROUSEL_CARD_CLASS} shrink-0 snap-center`}
          >
            <button
              type="button"
              className="w-full text-left"
              aria-label={
                isActive
                  ? `Open ${item.displayName}`
                  : `Show ${item.displayName} in centre`
              }
              onClick={() => {
                onActiveIndexChange(index);
                if (isActive) onActiveSelect?.();
              }}
            >
              <CarouselImage item={item} />
            </button>
          </article>
        );
      })}
    </div>
  );
}

function MotionGallery({
  items,
  activeIndex,
  onActiveIndexChange,
  onActiveSelect,
}: CircularGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef(0);
  const isDesktopRef = useRef(false);

  const goTo = useCallback(
    (index: number) => {
      onActiveIndexChange(Math.max(0, Math.min(items.length - 1, index)));
    },
    [items.length, onActiveIndexChange],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const media = window.matchMedia("(min-width: 768px)");
    const syncBreakpoint = () => {
      isDesktopRef.current = media.matches;
    };
    syncBreakpoint();
    media.addEventListener("change", syncBreakpoint);

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goTo(activeIndex - 1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        goTo(activeIndex + 1);
      } else if (event.key === "Enter" && document.activeElement === container) {
        onActiveSelect?.();
      }
    }

    function onWheel(event: WheelEvent) {
      const delta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (Math.abs(delta) < 8) return;
      event.preventDefault();
      if (delta > 0) goTo(activeIndex + 1);
      else goTo(activeIndex - 1);
    }

    container.addEventListener("keydown", onKeyDown);
    container.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      media.removeEventListener("change", syncBreakpoint);
      container.removeEventListener("keydown", onKeyDown);
      container.removeEventListener("wheel", onWheel);
    };
  }, [activeIndex, goTo, onActiveSelect]);

  return (
    <div
      ref={containerRef}
      className={`relative ${FEED_CAROUSEL_STAGE_CLASS} w-full touch-pan-y overflow-hidden [perspective:1200px]`}
      style={{ perspectiveOrigin: "50% 40%" }}
      role="list"
      aria-label="Feed browse gallery"
      tabIndex={0}
    >
      <div className="absolute inset-0 flex items-center justify-center [transform-style:preserve-3d]">
        {items.map((item, index) => {
          const offset = index - activeIndex;
          const isActive = offset === 0;
          const absOffset = Math.abs(offset);

          if (absOffset > 1) return null;

          return (
            <motion.article
              key={item.id}
              role="listitem"
              aria-hidden={!isActive}
              aria-current={isActive ? "true" : undefined}
              aria-label={isActive ? item.displayName : undefined}
              className={`absolute cursor-pointer ${FEED_CAROUSEL_CARD_CLASS}`}
              style={{
                transformStyle: "preserve-3d",
                zIndex: 10 - absOffset,
              }}
              animate={{
                x: offset * (isDesktopRef.current ? DESKTOP_CARD_OFFSET_X : MOBILE_CARD_OFFSET_X),
                y: arcOffsetY(offset),
                rotateY: offset * -28,
                rotateZ: offset * -4,
                scale: 1 - absOffset * 0.08,
                z: -absOffset * 40,
                opacity: 1 - absOffset * 0.12,
              }}
              transition={{ type: "spring", stiffness: 220, damping: 26 }}
              drag={isActive ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.1}
              onDragStart={(_, info) => {
                dragStartX.current = info.point.x;
              }}
              onDragEnd={(_, info) => {
                const delta = info.point.x - dragStartX.current;
                if (delta < -40) goTo(activeIndex + 1);
                else if (delta > 40) goTo(activeIndex - 1);
              }}
              onClick={() => {
                if (!isActive) goTo(index);
                else onActiveSelect?.();
              }}
            >
              <CarouselImage item={item} />
            </motion.article>
          );
        })}
      </div>
    </div>
  );
}
