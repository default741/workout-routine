import type { ExerciseHistoryEntry, SetEntry } from "@/types/workout";

/** weight x reps for one set. Null unless both parse to positive finite numbers. */
export function computeSetVolume(weight: string | undefined, reps: string | undefined): number | null {
  const w = parseFloat(weight ?? "");
  const r = parseFloat(reps ?? "");
  if (!Number.isFinite(w) || !Number.isFinite(r) || w <= 0 || r <= 0) return null;
  return w * r;
}

/** Highest single-set volume ever archived for one exercise. 0 when there's no history yet. */
export function historicalMaxVolume(history: ExerciseHistoryEntry[] | undefined): number {
  let max = 0;
  for (const entry of history ?? []) {
    for (const set of entry.sets) {
      const volume = computeSetVolume(set.weight, set.reps);
      if (volume !== null && volume > max) max = volume;
    }
  }
  return max;
}

/** Whether a currently-typed set matches or beats the historical max for that exercise. */
export function isPersonalBestSet(set: SetEntry, maxVolume: number): boolean {
  const volume = computeSetVolume(set.weight, set.reps);
  return volume !== null && volume >= maxVolume;
}
