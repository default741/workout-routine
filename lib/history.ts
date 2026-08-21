import { exerciseKey } from "./slug";
import type {
  Day,
  ExerciseDraftRecord,
  ExerciseHistoryEntry,
  ExerciseHistoryRecord,
  SetEntry,
} from "@/types/workout";

const RETENTION_DAYS = 365;
const DAY_MS = 24 * 60 * 60 * 1000;

export function isSetEmpty(set: SetEntry): boolean {
  return !set.weight && !set.reps && !set.duration;
}

export function pruneHistoryEntries(
  entries: ExerciseHistoryEntry[],
  now: Date = new Date(),
  retentionDays: number = RETENTION_DAYS
): ExerciseHistoryEntry[] {
  const cutoff = now.getTime() - retentionDays * DAY_MS;
  return entries.filter((entry) => new Date(entry.date).getTime() >= cutoff);
}

export function pruneHistoryRecord(
  record: ExerciseHistoryRecord,
  now: Date = new Date(),
  retentionDays: number = RETENTION_DAYS
): ExerciseHistoryRecord {
  const result: ExerciseHistoryRecord = {};
  for (const key of Object.keys(record)) {
    const pruned = pruneHistoryEntries(record[key], now, retentionDays);
    if (pruned.length > 0) result[key] = pruned;
  }
  return result;
}

/**
 * The whole "Finish Workout" transform: archives every exercise's non-empty
 * draft sets into history (dated `now`), resets those drafts back to blank
 * rows (keeping their current row count rather than snapping back to the
 * plan's default), and prunes the resulting history to the retention window.
 * Exercises with no draft at all are left untouched.
 */
export function commitDayToHistory(
  day: Day,
  drafts: ExerciseDraftRecord,
  history: ExerciseHistoryRecord,
  now: Date = new Date()
): { drafts: ExerciseDraftRecord; history: ExerciseHistoryRecord } {
  const nextDrafts = { ...drafts };
  const nextHistory = { ...history };

  day.sections.forEach((section) => {
    section.exercises.forEach((exercise) => {
      const key = exerciseKey(day.id, section.id, exercise.name);
      const draft = nextDrafts[key];
      if (!draft) return;

      const nonEmptySets = draft.sets.filter((set) => !isSetEmpty(set));
      if (nonEmptySets.length > 0) {
        const entry: ExerciseHistoryEntry = { date: now.toISOString(), sets: nonEmptySets };
        nextHistory[key] = [entry, ...(nextHistory[key] ?? [])];
      }

      nextDrafts[key] = { done: false, sets: draft.sets.map(() => ({})) };
    });
  });

  return { drafts: nextDrafts, history: pruneHistoryRecord(nextHistory, now) };
}
