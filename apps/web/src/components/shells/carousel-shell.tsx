"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { PLACEHOLDER_ITEMS, PlaceholderArtBlock } from "@/components/shells/shell-placeholders";

const ITEM_WIDTH = 180;
const ITEM_GAP = 20;
const STEP = ITEM_WIDTH + ITEM_GAP;

function clampIndex(index: number, length: number) {
  return Math.max(0, Math.min(length - 1, index));
}

function itemStyle(distance: number) {
  const abs = Math.abs(distance);
  const scale = Math.max(0.72, 1 - abs * 0.14);
  const opacity = Math.max(0.35, 1 - abs * 0.28);
  const y = abs * 10;
  const rotate = distance * -4;
  const zIndex = 20 - Math.round(abs * 4);

  return { scale, opacity, y, rotate, zIndex };
}

export function CarouselShell({
  activeIndex: controlledIndex,
  onActiveIndexChange,
  dragEnabled = true,
  className = "",
  labelledBy,
}: {
  activeIndex?: number;
  onActiveIndexChange?: (index: number) => void;
  dragEnabled?: boolean;
  className?: string;
  labelledBy?: string;
}) {
  const reduce = useReducedMotion();
  const [internalIndex, setInternalIndex] = useState(2);
  const activeIndex = controlledIndex ?? internalIndex;
  const setActiveIndex = useCallback(
    (index: number) => {
      const next = clampIndex(index, PLACEHOLDER_ITEMS.length);
      if (controlledIndex === undefined) setInternalIndex(next);
      onActiveIndexChange?.(next);
    },
    [controlledIndex, onActiveIndexChange],
  );

  const dragX = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const pointerIdRef = useRef<number | null>(null);
  const pointerStartXRef = useRef(0);
  const dragStartXRef = useRef(0);

  const snapTo = useCallback(
    (index: number) => {
      const next = clampIndex(index, PLACEHOLDER_ITEMS.length);
      setActiveIndex(next);
      if (!reduce) {
        animate(dragX, 0, { type: "spring", stiffness: 320, damping: 32 });
      }
    },
    [dragX, reduce, setActiveIndex],
  );

  const offsetForIndex = useTransform(dragX, (value) => {
    const dragSteps = value / STEP;
    return activeIndex - dragSteps;
  });

  useEffect(() => {
    if (reduce) dragX.set(0);
  }, [activeIndex, dragX, reduce]);

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        snapTo(activeIndex - 1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        snapTo(activeIndex + 1);
      }
    },
    [activeIndex, snapTo],
  );

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!dragEnabled || reduce) return;
      draggingRef.current = true;
      pointerIdRef.current = event.pointerId;
      pointerStartXRef.current = event.clientX;
      dragStartXRef.current = dragX.get();
      event.currentTarget.setPointerCapture(event.pointerId);
      dragX.stop();
    },
    [dragEnabled, dragX, reduce],
  );

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current || pointerIdRef.current !== event.pointerId) return;
      dragX.set(dragStartXRef.current + (event.clientX - pointerStartXRef.current));
    },
    [dragX],
  );

  const onPointerUp = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current || pointerIdRef.current !== event.pointerId) return;
      draggingRef.current = false;
      pointerIdRef.current = null;
      event.currentTarget.releasePointerCapture(event.pointerId);

      const offset = dragX.get() / STEP;
      const next = Math.round(activeIndex - offset);
      snapTo(next);
    },
    [activeIndex, dragX, snapTo],
  );

  if (reduce) {
    return (
      <ReducedMotionCarousel
        activeIndex={activeIndex}
        onSelect={snapTo}
        className={className}
        labelledBy={labelledBy}
      />
    );
  }

  return (
    <div className={className}>
      <div
        ref={containerRef}
        role="listbox"
        aria-labelledby={labelledBy}
        aria-activedescendant={`carousel-item-${activeIndex}`}
        tabIndex={0}
        onKeyDown={onKeyDown}
        className="relative mx-auto h-[340px] max-w-4xl overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <motion.div className="absolute inset-0 flex items-center justify-center">
          {PLACEHOLDER_ITEMS.map((item, index) => (
            <CarouselItem
              key={item.id}
              item={item}
              index={index}
              activeIndex={activeIndex}
              centerOffset={offsetForIndex}
              onSelect={() => snapTo(index)}
            />
          ))}
        </motion.div>
      </div>
      <p className="mt-4 text-center text-xs text-muted">
        Drag sideways or use the arrow keys. Item {activeIndex + 1} of {PLACEHOLDER_ITEMS.length}{" "}
        is active.
      </p>
    </div>
  );
}

function CarouselItem({
  item,
  index,
  activeIndex,
  centerOffset,
  onSelect,
}: {
  item: (typeof PLACEHOLDER_ITEMS)[number];
  index: number;
  activeIndex: number;
  centerOffset: ReturnType<typeof useTransform<number, number>>;
  onSelect: () => void;
}) {
  const distance = useTransform(centerOffset, (center) => index - center);
  const x = useTransform(distance, (d) => d * STEP);
  const scale = useTransform(distance, (d) => itemStyle(d).scale);
  const opacity = useTransform(distance, (d) => itemStyle(d).opacity);
  const y = useTransform(distance, (d) => itemStyle(d).y);
  const rotate = useTransform(distance, (d) => itemStyle(d).rotate);
  const isActive = index === activeIndex;

  return (
    <motion.button
      type="button"
      id={`carousel-item-${index}`}
      role="option"
      aria-selected={isActive}
      aria-label={`${item.label}: ${item.artist}`}
      onClick={onSelect}
      style={{ x, scale, opacity, y, rotate, zIndex: isActive ? 30 : 10 }}
      className="absolute w-[180px] cursor-grab touch-none active:cursor-grabbing"
    >
      <div className="pointer-events-none">
        <PlaceholderArtBlock label={item.label} active={isActive} />
        <p className={`mt-2 text-center text-sm ${isActive ? "text-ink" : "text-muted"}`}>
          {item.artist}
        </p>
      </div>
    </motion.button>
  );
}

function ReducedMotionCarousel({
  activeIndex,
  onSelect,
  className,
  labelledBy,
}: {
  activeIndex: number;
  onSelect: (index: number) => void;
  className?: string;
  labelledBy?: string;
}) {
  return (
    <div className={className}>
      <div
        role="listbox"
        aria-labelledby={labelledBy}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {PLACEHOLDER_ITEMS.map((item, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={item.id}
              type="button"
              id={`carousel-item-${index}`}
              role="option"
              aria-selected={isActive}
              onClick={() => onSelect(index)}
              className={`w-[180px] shrink-0 snap-center ${isActive ? "opacity-100" : "opacity-70"}`}
            >
              <PlaceholderArtBlock label={item.label} active={isActive} />
              <p className={`mt-2 text-center text-sm ${isActive ? "text-ink" : "text-muted"}`}>
                {item.artist}
              </p>
            </button>
          );
        })}
      </div>
      <p className="mt-4 text-center text-xs text-muted">
        Scroll sideways to browse. Item {activeIndex + 1} of {PLACEHOLDER_ITEMS.length} is active.
      </p>
    </div>
  );
}
