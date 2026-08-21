import type { ExerciseKind } from "./exerciseType";
import type { SetEntry } from "@/types/workout";

function formatSet(set: SetEntry, kind: ExerciseKind): string {
  if (kind === "duration") return set.duration ?? "";
  if (set.weight && set.reps) return `${set.weight}×${set.reps}`;
  return set.weight || set.reps || "";
}

export function formatSetsCompact(sets: SetEntry[], kind: ExerciseKind): string {
  return sets
    .map((set) => formatSet(set, kind))
    .filter(Boolean)
    .join(", ");
}

function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function formatRelativeDate(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((today.getTime() - target.getTime()) / (24 * 60 * 60 * 1000));

  if (isSameCalendarDay(date, now)) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays > 1 && diffDays < 7) return `${diffDays} days ago`;

  const sameYear = date.getFullYear() === now.getFullYear();
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: sameYear ? undefined : "numeric",
  });
}
