"use client";

import { useCallback, useId, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { CarouselShell } from "@/components/shells/carousel-shell";
import {
  PlaceholderActionRow,
  PlaceholderBadge,
  PlaceholderPostCard,
  PlaceholderWalletSummary,
  PLACEHOLDER_ITEMS,
} from "@/components/shells/shell-placeholders";
import { useGestureAxisLock } from "@/lib/gesture-axis-lock";

// Swipe up reveals a placeholder detail panel from beneath via sticky positioning. Touch
// gestures lock to the dominant axis so horizontal carousel drags do not fight vertical scroll.
export function UnmaskShell() {
  const reduce = useReducedMotion();
  const headingId = useId();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(2);
  const [carouselDragEnabled, setCarouselDragEnabled] = useState(true);
  const { onTouchStart, resolveAxis, reset } = useGestureAxisLock();

  const activeItem = PLACEHOLDER_ITEMS[activeIndex] ?? PLACEHOLDER_ITEMS[0];

  const onTouchMove = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      const axis = resolveAxis(event);
      if (axis === "horizontal") {
        setCarouselDragEnabled(true);
        if (scrollRef.current) scrollRef.current.style.overflowY = "hidden";
      } else if (axis === "vertical") {
        setCarouselDragEnabled(false);
        if (scrollRef.current) scrollRef.current.style.overflowY = "auto";
      }
    },
    [resolveAxis],
  );

  const onTouchEnd = useCallback(() => {
    reset();
    setCarouselDragEnabled(true);
    if (scrollRef.current) scrollRef.current.style.overflowY = "auto";
  }, [reset]);

  if (reduce) {
    return (
      <div className="space-y-8">
        <section aria-labelledby={`${headingId}-card`}>
          <h3 id={`${headingId}-card`} className="sr-only">
            Active post card
          </h3>
          <PlaceholderPostCard artist={activeItem.artist} label={activeItem.label} />
        </section>
        <section aria-labelledby={`${headingId}-wallet`}>
          <h3 id={`${headingId}-wallet`} className="mb-4 font-display text-xl tracking-tight">
            Wallet preview
          </h3>
          <PlaceholderWalletSummary />
        </section>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="relative h-[min(78vh,640px)] overflow-y-auto rounded-sm border border-line bg-paper"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
    >
      {/* Sticky mask: carousel covers the detail until scrolled away. */}
      <section
        className="sticky top-0 z-10 min-h-[58vh] bg-paper px-6 pb-10 pt-6"
        aria-labelledby={headingId}
      >
        <h3 id={headingId} className="font-display text-xl tracking-tight">
          Swipe up to reveal
        </h3>
        <p className="mt-1 text-sm text-muted">
          Sideways to browse, up to open. Gestures lock to one axis at a time.
        </p>

        <div className="mt-6">
          <CarouselShell
            activeIndex={activeIndex}
            onActiveIndexChange={setActiveIndex}
            dragEnabled={carouselDragEnabled}
            labelledBy={headingId}
          />
        </div>
      </section>

      {/* Detail panel sits beneath the sticky mask and is exposed on scroll. */}
      <section className="relative z-0 -mt-6 px-6 pb-16" aria-label="Post detail">
        <div className="mx-auto max-w-lg space-y-8">
          <article className="rounded-sm border border-card-border bg-surface p-6">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-3xl tracking-tight">{activeItem.artist}</h2>
              <PlaceholderBadge>Brand</PlaceholderBadge>
              <PlaceholderBadge>Pin</PlaceholderBadge>
            </div>
            <p className="mt-2 text-xs uppercase tracking-[0.16em] text-muted">
              {activeItem.label}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Placeholder detail revealed beneath the carousel. Swipe up on touch, or scroll on
              desktop, to expose the full post, badges, and action row.
            </p>
            <div className="mt-6">
              <PlaceholderActionRow />
            </div>
          </article>

          <PlaceholderWalletSummary />
        </div>
      </section>
    </div>
  );
}
