export type PersonId = "abdemanaaf" | "dad";

export interface Exercise {
  name: string;
  target: string;
  notes?: string;
}

export interface Section {
  id: string;
  label: string;
  exercises: Exercise[];
}

export interface Day {
  id: string;
  label: string;
  subtitle?: string;
  weekday?: number;
  sections: Section[];
}

export interface Person {
  id: PersonId;
  label: string;
  rotation?: string[];
  days: Day[];
}

export interface SetEntry {
  weight?: string;
  reps?: string;
  duration?: string;
}

// In-progress, not-yet-archived state for one exercise.
export interface ExerciseDraft {
  done?: boolean; // whole-exercise checkbox, independent of individual sets
  sets: SetEntry[]; // always at least 1 row; index-aligned with display order
}
export type ExerciseDraftRecord = Record<string, ExerciseDraft>;

// One archived past session for one exercise.
export interface ExerciseHistoryEntry {
  date: string; // new Date().toISOString()
  sets: SetEntry[]; // only the non-empty sets that existed at commit time
}
// Newest-first per key, so "last time" is always history[key][0].
export type ExerciseHistoryRecord = Record<string, ExerciseHistoryEntry[]>;
