"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

export interface GalleryShellItem {
  id: string;
  image: string;
  label: string;
}

const PLACEHOLDER_ITEMS: GalleryShellItem[] = [
  {
    id: "1",
    image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600&h=800&fit=crop",
    label: "Studio light",
  },
  {
    id: "2",
    image: "https://images.unsplash.com/photo-1578301978693-1781dacf0a5c?w=600&h=800&fit=crop",
    label: "Opening night",
  },
  {
    id: "3",
    image: "https://images.unsplash.com/photo-1515405295571-0211a45f8711?w=600&h=800&fit=crop",
    label: "Woodland forms",
  },
  {
    id: "4",
    image: "https://images.unsplash.com/photo-1549490349-8643362247b5?w=600&h=800&fit=crop",
    label: "Coastal study",
  },
  {
    id: "5",
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&h=800&fit=crop",
    label: "Still life",
  },
  {
    id: "6",
    image: "https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=600&h=800&fit=crop",
    label: "Gallery wall",
  },
  {
    id: "7",
    image: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=600&h=800&fit=crop",
    label: "Ceramic forms",
  },
];

interface CircularGalleryShellProps {
  items?: GalleryShellItem[];
}

export function CircularGalleryShell({ items = PLACEHOLDER_ITEMS }: CircularGalleryShellProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <ReducedMotionGallery items={items} />;
  }

  return <MotionGallery items={items} />;
}

function ReducedMotionGallery({ items }: { items: GalleryShellItem[] }) {
  return (
    <div
      className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4"
      role="list"
      aria-label="Feed browse gallery"
    >
      {items.map((item) => (
        <article
          key={item.id}
          role="listitem"
          className="w-56 shrink-0 snap-center"
          tabIndex={0}
        >
          <div className="overflow-hidden rounded-card border border-line bg-card-bg shadow-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.image}
              alt=""
              className="aspect-[3/4] w-full object-cover"
              loading="lazy"
            />
          </div>
          <p className="mt-2 font-display text-sm text-ink">{item.label}</p>
        </article>
      ))}
    </div>
  );
}

function MotionGallery({ items }: { items: GalleryShellItem[] }) {
  const [activeIndex, setActiveIndex] = useState(Math.floor(items.length / 2));
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef(0);

  const goTo = useCallback(
    (index: number) => {
      setActiveIndex(Math.max(0, Math.min(items.length - 1, index)));
    },
    [items.length],
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
      }
    }

    container.addEventListener("keydown", onKeyDown);
    return () => container.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, goTo]);

  return (
    <div
      ref={containerRef}
      className="relative flex h-[28rem] w-full items-center justify-center overflow-hidden"
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
            aria-label={isActive ? item.label : undefined}
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
            }}
          >
            <div className="overflow-hidden rounded-card border border-line bg-card-bg shadow-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.image}
                alt=""
                className="aspect-[3/4] w-full object-cover"
                loading="lazy"
                draggable={false}
              />
            </div>
            {isActive && (
              <p className="mt-3 text-center font-display text-sm text-ink">{item.label}</p>
            )}
          </motion.article>
        );
      })}

      <p className="pointer-events-none absolute bottom-0 text-xs text-muted">
        Drag or use arrow keys to browse
      </p>
    </div>
  );
}
