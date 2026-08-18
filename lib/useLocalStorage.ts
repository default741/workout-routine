"use client";

import { useCallback, useSyncExternalStore } from "react";
import { readJSON, writeJSON } from "./storage";

const LOCAL_EVENT = "wt-local-storage";

// Keyed by raw string so repeated reads return the same object reference
// when nothing changed - required by useSyncExternalStore to avoid
// re-rendering (or looping) on every render.
const cache = new Map<string, { raw: string | null; value: unknown }>();

function readCached<T>(key: string, initialValue: T): T {
  const raw = window.localStorage.getItem(key);
  const cached = cache.get(key);
  if (cached && cached.raw === raw) return cached.value as T;
  const value = readJSON(key, initialValue);
  cache.set(key, { raw, value });
  return value;
}

function subscribe(callback: () => void) {
  window.addEventListener(LOCAL_EVENT, callback);
  return () => window.removeEventListener(LOCAL_EVENT, callback);
}

/**
 * Reads/writes a JSON value in localStorage via useSyncExternalStore, so the
 * static-export server render (no localStorage available) and the client's
 * real value never disagree during hydration - React re-renders with the
 * real snapshot right after mount instead of us doing it manually.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const getSnapshot = useCallback(() => readCached(key, initialValue), [key, initialValue]);
  const getServerSnapshot = useCallback(() => initialValue, [initialValue]);

  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setValue = useCallback(
    (next: T) => {
      writeJSON(key, next);
      cache.set(key, { raw: window.localStorage.getItem(key), value: next });
      window.dispatchEvent(new Event(LOCAL_EVENT));
    },
    [key]
  );

  return [value, setValue] as const;
}
