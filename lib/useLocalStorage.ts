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

interface UseLocalStorageOptions {
  /**
   * Whether writes from OTHER tabs/windows should live-update this hook.
   * Defaults to true - most keys represent shared progress that should stay
   * in sync if the same profile is open in two places at once. Set to false
   * for tab-local preferences (e.g. which profile this tab is viewing) that
   * must not get yanked out from under someone mid-session by another tab.
   */
  syncAcrossTabs?: boolean;
}

/**
 * Reads/writes a JSON value in localStorage via useSyncExternalStore, so the
 * static-export server render (no localStorage available) and the client's
 * real value never disagree during hydration - React re-renders with the
 * real snapshot right after mount instead of us doing it manually.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  { syncAcrossTabs = true }: UseLocalStorageOptions = {}
) {
  const getSnapshot = useCallback(() => readCached(key, initialValue), [key, initialValue]);
  const getServerSnapshot = useCallback(() => initialValue, [initialValue]);

  const subscribe = useCallback(
    (callback: () => void) => {
      window.addEventListener(LOCAL_EVENT, callback);
      // The native `storage` event only ever fires in *other* tabs/windows of
      // the same origin, never the tab that made the change - that's what
      // makes it safe to also use as a live cross-tab sync signal here.
      if (syncAcrossTabs) window.addEventListener("storage", callback);
      return () => {
        window.removeEventListener(LOCAL_EVENT, callback);
        if (syncAcrossTabs) window.removeEventListener("storage", callback);
      };
    },
    [syncAcrossTabs]
  );

  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      // Resolve against the freshest stored value (not this closure's
      // possibly-stale `value`), so a concurrent write from another tab
      // in between renders doesn't get silently overwritten.
      const prev = readCached(key, initialValue);
      const resolved = typeof next === "function" ? (next as (prev: T) => T)(prev) : next;
      writeJSON(key, resolved);
      cache.set(key, { raw: window.localStorage.getItem(key), value: resolved });
      window.dispatchEvent(new Event(LOCAL_EVENT));
    },
    [key, initialValue]
  );

  return [value, setValue] as const;
}
