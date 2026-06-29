"use client";

import { useCallback, useRef } from "react";

export type GestureAxis = "horizontal" | "vertical" | null;

const LOCK_THRESHOLD_PX = 8;

// Locks touch gestures to the dominant axis so a horizontal carousel drag does not fight a
// vertical scroll reveal. Returns null until the user moves past the threshold.
export function useGestureAxisLock() {
  const originRef = useRef<{ x: number; y: number } | null>(null);
  const axisRef = useRef<GestureAxis>(null);

  const reset = useCallback(() => {
    originRef.current = null;
    axisRef.current = null;
  }, []);

  const onTouchStart = useCallback((event: React.TouchEvent) => {
    const touch = event.touches[0];
    if (!touch) return;
    originRef.current = { x: touch.clientX, y: touch.clientY };
    axisRef.current = null;
  }, []);

  const resolveAxis = useCallback((event: React.TouchEvent): GestureAxis => {
    if (axisRef.current) return axisRef.current;

    const origin = originRef.current;
    const touch = event.touches[0];
    if (!origin || !touch) return null;

    const dx = touch.clientX - origin.x;
    const dy = touch.clientY - origin.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (absX < LOCK_THRESHOLD_PX && absY < LOCK_THRESHOLD_PX) return null;

    axisRef.current = absX > absY ? "horizontal" : "vertical";
    return axisRef.current;
  }, []);

  return { axisRef, onTouchStart, resolveAxis, reset };
}
