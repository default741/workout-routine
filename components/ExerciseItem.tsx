"use client";

import { useMemo, useState } from "react";
import { createBlankDraft, inferExerciseKind } from "@/lib/exerciseType";
import { formatRelativeDate, formatSetsCompact } from "@/lib/setDisplay";
import { historicalMaxVolume, isPersonalBestSet } from "@/lib/personalBest";
import type { Exercise, ExerciseDraft, ExerciseHistoryEntry, SetEntry } from "@/types/workout";

interface ExerciseItemProps {
  exercise: Exercise;
  sectionId: string;
  draft: ExerciseDraft | undefined;
  history: ExerciseHistoryEntry[] | undefined;
  onChange: (next: ExerciseDraft) => void;
}

const HISTORY_PREVIEW_COUNT = 5;

export default function ExerciseItem({ exercise, sectionId, draft, history, onChange }: ExerciseItemProps) {
  const [historyOpen, setHistoryOpen] = useState(false);
  const kind = inferExerciseKind(exercise.target);
  const hideWeight = sectionId === "warmup";
  const effective = draft ?? createBlankDraft(exercise.target);
  const sets = effective.sets;
  const lastEntry = history?.[0];
  const maxVolume = useMemo(() => historicalMaxVolume(history), [history]);

  const updateSetField = (index: number, field: keyof SetEntry, value: string) => {
    onChange({
      ...effective,
      sets: sets.map((set, i) => (i === index ? { ...set, [field]: value } : set)),
    });
  };

  const addSet = () => {
    onChange({ ...effective, sets: [...sets, {}] });
  };

  const removeSet = (index: number) => {
    onChange({ ...effective, sets: sets.filter((_, i) => i !== index) });
  };

  return (
    <li className="py-4">
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={effective.done ?? false}
          onChange={(e) => onChange({ ...effective, done: e.target.checked })}
          className="mt-1 h-6 w-6 shrink-0 accent-emerald-600"
          aria-label={`Mark ${exercise.name} done`}
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-snug text-neutral-900">{exercise.name}</p>
          <p className="text-xs text-neutral-500">{exercise.target}</p>
          {exercise.notes && <p className="mt-0.5 text-xs italic text-amber-700">{exercise.notes}</p>}
        </div>
      </label>

      <div className="mt-2 space-y-2 pl-8">
        {sets.map((set, index) => {
          const lastSet = lastEntry?.sets?.[index];
          const isPB = kind === "sets_reps" && isPersonalBestSet(set, maxVolume);
          return (
            <div key={index} className="flex items-center gap-1.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-[10px] font-semibold text-neutral-500">
                {index + 1}
              </span>
              {isPB && (
                <span
                  role="img"
                  aria-label="Personal best"
                  title="Personal best"
                  className="shrink-0 text-sm leading-none"
                >
                  👑
                </span>
              )}
              <div className="flex min-w-0 flex-1 gap-1.5">
                {kind === "sets_reps" ? (
                  <>
                    {!hideWeight && (
                      <input
                        type="text"
                        inputMode="decimal"
                        placeholder={lastSet?.weight ? `Last ${lastSet.weight}` : "Weight"}
                        value={set.weight ?? ""}
                        onChange={(e) => updateSetField(index, "weight", e.target.value)}
                        className="w-0 min-w-0 flex-1 rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
                      />
                    )}
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder={lastSet?.reps ? `Last ${lastSet.reps}` : "Reps"}
                      value={set.reps ?? ""}
                      onChange={(e) => updateSetField(index, "reps", e.target.value)}
                      className="w-0 min-w-0 flex-1 rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
                    />
                  </>
                ) : (
                  <input
                    type="text"
                    placeholder={lastSet?.duration ? `Last ${lastSet.duration}` : "Duration"}
                    value={set.duration ?? ""}
                    onChange={(e) => updateSetField(index, "duration", e.target.value)}
                    className="w-0 min-w-0 flex-1 rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
                  />
                )}
              </div>
              {sets.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSet(index)}
                  aria-label={`Remove set ${index + 1}`}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-50 hover:text-red-500"
                >
                  ×
                </button>
              )}
            </div>
          );
        })}

        <button
          type="button"
          onClick={addSet}
          className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
        >
          + Add set
        </button>

        {history && history.length > 0 && (
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setHistoryOpen((open) => !open)}
              className="flex items-center gap-1 text-xs font-medium text-neutral-500 hover:text-neutral-700"
            >
              <span className={`inline-block transition-transform ${historyOpen ? "rotate-90" : ""}`}>
                ›
              </span>
              History · {history.length}
            </button>
            {historyOpen && (
              <ul className="mt-1.5 space-y-1 border-l border-neutral-200 pl-2.5 text-xs text-neutral-500">
                {history.slice(0, HISTORY_PREVIEW_COUNT).map((entry, i) => (
                  <li key={i}>
                    <span className="font-medium text-neutral-600">{formatRelativeDate(entry.date)}</span>
                    {" — "}
                    {formatSetsCompact(entry.sets, kind)}
                  </li>
                ))}
                {history.length > HISTORY_PREVIEW_COUNT && (
                  <li className="text-neutral-400">
                    +{history.length - HISTORY_PREVIEW_COUNT} earlier sessions
                  </li>
                )}
              </ul>
            )}
          </div>
        )}
      </div>
    </li>
  );
}
