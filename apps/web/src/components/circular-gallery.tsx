"use client";

import { useCallback, useEffect, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { FeedCarouselItem } from "@/lib/feed-display";
import { FeedPostCard, FeedPostImage } from "@/components/feed-post-card";

interface CircularGalleryProps {
  items: FeedCarouselItem[];
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  onActiveSelect?: () => void;
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

function ReducedMotionGallery({
  items,
  activeIndex,
  onActiveIndexChange,
  onActiveSelect,
}: CircularGalleryProps) {
  return (
    <div
      className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4"
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
            className="w-56 shrink-0 snap-center"
          >
            <button
              type="button"
              className="w-full text-left"
              onClick={() => {
                onActiveIndexChange(index);
                if (isActive) onActiveSelect?.();
              }}
            >
              <FeedPostCard
                imageUrl={item.imageUrl}
                displayName={item.displayName}
                badges={item.badges}
              />
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

  const goTo = useCallback(
    (index: number) => {
      onActiveIndexChange(Math.max(0, Math.min(items.length - 1, index)));
    },
    [items.length, onActiveIndexChange],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

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

    container.addEventListener("keydown", onKeyDown);
    return () => container.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, goTo, onActiveSelect]);

  return (
    <div
      ref={containerRef}
      className="relative flex h-[28rem] w-full touch-pan-y items-center justify-center overflow-hidden"
      role="list"
      aria-label="Feed browse gallery"
      tabIndex={0}
    >
      {items.map((item, index) => {
        const offset = index - activeIndex;
        const isActive = offset === 0;
        const absOffset = Math.abs(offset);

        return (
          <motion.article
            key={item.id}
            role="listitem"
            aria-hidden={!isActive}
            aria-current={isActive ? "true" : undefined}
            aria-label={isActive ? item.displayName : undefined}
            className="absolute w-48 cursor-grab active:cursor-grabbing sm:w-56"
            style={{ zIndex: items.length - absOffset }}
            animate={{
              x: offset * 120,
              rotate: offset * -8,
              scale: isActive ? 1 : 0.82,
              opacity: absOffset > 2 ? 0 : 1 - absOffset * 0.15,
            }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.12}
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
            <div className="overflow-hidden rounded-card border border-line bg-card-bg shadow-card">
              <FeedPostImage
                imageUrl={item.imageUrl}
                displayName={item.displayName}
              />
            </div>
            {isActive && (
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                <p className="font-display text-sm text-ink">{item.displayName}</p>
              </div>
            )}
          </motion.article>
        );
      })}

      <p className="pointer-events-none absolute bottom-0 text-xs text-muted">
        Drag or use arrow keys to browse. Select the centre card to open detail.
      </p>
    </div>
  );
}
