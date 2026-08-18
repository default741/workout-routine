"use client";

import { exerciseKey } from "@/lib/slug";
import type { Day, ExerciseLogs } from "@/types/workout";

interface FinishWorkoutButtonProps {
  day: Day;
  onLogsChange: (updater: ExerciseLogs | ((prev: ExerciseLogs) => ExerciseLogs)) => void;
  onFinish?: () => void;
}

export default function FinishWorkoutButton({ day, onLogsChange, onFinish }: FinishWorkoutButtonProps) {
  const handleFinish = () => {
    onLogsChange((prev) => {
      const next = { ...prev };
      day.sections.forEach((section) => {
        section.exercises.forEach((exercise) => {
          const key = exerciseKey(day.id, section.id, exercise.name);
          if (next[key]) next[key] = { ...next[key], done: false };
        });
      });
      return next;
    });
    onFinish?.();
  };

  return (
    <button
      type="button"
      onClick={handleFinish}
      className="w-full rounded-lg bg-emerald-600 py-3 text-sm font-semibold text-white active:bg-emerald-700"
    >
      Finish Workout
    </button>
  );
}
