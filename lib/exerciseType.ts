import type { ExerciseDraft } from "@/types/workout";

export type ExerciseKind = "sets_reps" | "duration";

/**
 * Both source routines mix "x" and "/" as the sets x reps separator, and a
 * handful of targets are irregular ("-", "1 x 15, 1 x 15", "2 x 30 sec").
 * Duration keywords are checked first; anything that isn't a clean sets x reps
 * pattern falls back to a single free-text field rather than assuming weight+reps.
 */
export function inferExerciseKind(target: string): ExerciseKind {
  if (/\b\d+\s*(sec|secs|second|seconds|min|mins|minute|minutes)\b/i.test(target)) {
    return "duration";
  }
  if (/^\d+\s*[x/]\s*\d+$/i.test(target.trim())) {
    return "sets_reps";
  }
  return "duration";
}

function clampSetCount(n: number): number {
  return Math.min(Math.max(n, 1), 10);
}

/**
 * Derives a sensible default number of set rows from a target string.
 * Compound targets ("1 x 15, 1 x 15") count their comma-separated parts;
 * otherwise the leading number in "N x M" / "N / M" wins (works even when a
 * duration keyword follows, e.g. "2 x 30 sec" -> 2). Anything else ("-", a
 * plain duration) defaults to a single row.
 */
export function deriveDefaultSetCount(target: string): number {
  const trimmed = target.trim();
  if (trimmed.includes(",")) {
    const segments = trimmed.split(",").map((s) => s.trim()).filter(Boolean);
    if (segments.length > 1) return clampSetCount(segments.length);
  }
  const match = trimmed.match(/^(\d+)\s*[x/]/i);
  if (match) return clampSetCount(parseInt(match[1], 10));
  return 1;
}

export function createBlankDraft(target: string): ExerciseDraft {
  return {
    done: false,
    sets: Array.from({ length: deriveDefaultSetCount(target) }, () => ({})),
  };
}
