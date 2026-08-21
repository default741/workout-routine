import { exerciseKey } from "./slug";
import type { Day, ExerciseDraftRecord } from "@/types/workout";

export function getDayProgress(
  day: Day,
  draft: ExerciseDraftRecord
): { completed: number; total: number } {
  let completed = 0;
  let total = 0;

  day.sections.forEach((section) => {
    section.exercises.forEach((exercise) => {
      total += 1;
      const key = exerciseKey(day.id, section.id, exercise.name);
      if (draft[key]?.done) completed += 1;
    });
  });

  return { completed, total };
}
