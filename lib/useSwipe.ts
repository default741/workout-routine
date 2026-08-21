"use client";

import { useRef } from "react";

const MIN_DISTANCE = 50;
const MAX_OFF_AXIS_RATIO = 0.5;

/**
 * Passive horizontal-swipe detector: only listens to touchstart/touchend
 * (never touchmove, never preventDefault), so it can safely sit on top of a
 * page that already scrolls, taps, and has text inputs - it can't intercept
 * or cancel anything. Fires `onSwipe` once a completed single-touch gesture
 * travels far enough and is clearly horizontal rather than a vertical scroll.
 */
export function useSwipe(onSwipe: () => void) {
  const start = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    start.current = { x: touch.clientX, y: touch.clientY };
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!start.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - start.current.x;
    const dy = touch.clientY - start.current.y;
    start.current = null;
    if (Math.abs(dx) >= MIN_DISTANCE && Math.abs(dy) <= Math.abs(dx) * MAX_OFF_AXIS_RATIO) {
      onSwipe();
    }
  };

  const onTouchCancel = () => {
    start.current = null;
  };

  return { onTouchStart, onTouchEnd, onTouchCancel };
}
