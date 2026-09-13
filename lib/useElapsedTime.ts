"use client";

import { useEffect, useState } from "react";

/**
 * Live elapsed milliseconds since `startedAt`, ticking once a second.
 * The tick interval is the only thing that ever calls setState (an external
 * clock signaling a change), so Date.now() is never touched during render.
 */
export function useElapsedTime(startedAt: string | null): number | null {
  const [elapsed, setElapsed] = useState<number | null>(null);

  useEffect(() => {
    if (!startedAt) return;
    const startTime = new Date(startedAt).getTime();
    const id = setInterval(() => setElapsed(Date.now() - startTime), 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  return startedAt ? elapsed : null;
}
