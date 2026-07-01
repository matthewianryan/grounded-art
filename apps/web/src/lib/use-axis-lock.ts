"use client";

import { useEffect } from "react";

type Axis = "x" | "y" | null;

interface VerticalSwipeOptions {
  // Pixels of travel before the axis is decided.
  decideAt?: number;
  // Downward travel (positive dy) past this fires the swipe once per gesture.
  threshold?: number;
}

/**
 * Touch axis-lock: at the start of a gesture the dominant axis is decided once and held for the
 * rest of that gesture. A mostly downward drag fires onSwipeDown; a mostly sideways drag is left
 * to the carousel and never triggers the reveal. This keeps the vertical reveal from fighting the
 * carousel's horizontal drag (see docs/interactions.md I3).
 */
export function useVerticalSwipe(
  enabled: boolean,
  onSwipeDown: () => void,
  { decideAt = 8, threshold = 40 }: VerticalSwipeOptions = {},
) {
  useEffect(() => {
    if (!enabled) return;

    let startX = 0;
    let startY = 0;
    let axis: Axis = null;
    let fired = false;

    function onTouchStart(event: TouchEvent) {
      const touch = event.touches[0];
      if (!touch) return;
      startX = touch.clientX;
      startY = touch.clientY;
      axis = null;
      fired = false;
    }

    function onTouchMove(event: TouchEvent) {
      const touch = event.touches[0];
      if (!touch) return;
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;

      if (axis === null && (Math.abs(dx) > decideAt || Math.abs(dy) > decideAt)) {
        axis = Math.abs(dy) > Math.abs(dx) ? "y" : "x";
      }

      if (axis === "y" && !fired && dy > threshold) {
        fired = true;
        onSwipeDown();
      }
    }

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, [enabled, onSwipeDown, decideAt, threshold]);
}
