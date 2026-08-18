"use client";

import { inferExerciseKind } from "@/lib/exerciseType";
import type { Exercise, ExerciseLog } from "@/types/workout";

interface ExerciseItemProps {
  exercise: Exercise;
  log: ExerciseLog | undefined;
  onChange: (log: ExerciseLog) => void;
}

export default function ExerciseItem({ exercise, log, onChange }: ExerciseItemProps) {
  const kind = inferExerciseKind(exercise.target);

  return (
    <li className="py-3">
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={log?.done ?? false}
          onChange={(e) => onChange({ ...log, done: e.target.checked })}
          className="mt-1 h-6 w-6 shrink-0 accent-emerald-600"
          aria-label={`Mark ${exercise.name} done`}
        />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm leading-snug">{exercise.name}</p>
          <p className="text-xs text-neutral-500">{exercise.target}</p>
          {exercise.notes && (
            <p className="text-xs italic text-amber-600 mt-0.5">{exercise.notes}</p>
          )}

          <div className="mt-2 flex gap-2">
            {kind === "sets_reps" ? (
              <>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="Weight"
                  value={log?.weight ?? ""}
                  onChange={(e) => onChange({ ...log, weight: e.target.value })}
                  className="w-24 rounded-md border border-neutral-300 px-2 py-1 text-sm"
                />
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Reps"
                  value={log?.reps ?? ""}
                  onChange={(e) => onChange({ ...log, reps: e.target.value })}
                  className="w-20 rounded-md border border-neutral-300 px-2 py-1 text-sm"
                />
              </>
            ) : (
              <input
                type="text"
                placeholder="Duration"
                value={log?.duration ?? ""}
                onChange={(e) => onChange({ ...log, duration: e.target.value })}
                className="w-32 rounded-md border border-neutral-300 px-2 py-1 text-sm"
              />
            )}
          </div>
        </div>
      </label>
    </li>
  );
}
