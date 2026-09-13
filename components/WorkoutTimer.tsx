"use client";

import { formatDuration } from "@/lib/session";

interface WorkoutTimerProps {
  isActive: boolean;
  elapsedMs: number | null;
  finishedDurationMs: number | null;
  onStart: () => void;
  onFinish: () => void;
}

export default function WorkoutTimer({
  isActive,
  elapsedMs,
  finishedDurationMs,
  onStart,
  onFinish,
}: WorkoutTimerProps) {
  return (
    <div className="mt-6">
      {finishedDurationMs !== null && !isActive && (
        <p className="mb-2 text-center text-xs font-medium text-neutral-500">
          Finished in {formatDuration(finishedDurationMs)}
        </p>
      )}
      <div className="flex items-stretch gap-2">
        {!isActive && (
          <button
            type="button"
            onClick={onStart}
            className="flex-1 rounded-xl border border-emerald-600 py-3.5 text-sm font-semibold text-emerald-600 transition-colors hover:bg-emerald-50 active:bg-emerald-100"
          >
            Start Workout
          </button>
        )}
        {isActive && (
          <div className="flex flex-1 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 py-3.5 text-sm font-semibold tabular-nums text-emerald-700">
            {formatDuration(elapsedMs ?? 0)}
          </div>
        )}
        <button
          type="button"
          onClick={onFinish}
          className="flex-1 rounded-xl bg-emerald-600 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 active:bg-emerald-800"
        >
          Finish Workout
        </button>
      </div>
    </div>
  );
}
