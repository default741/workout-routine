"use client";

import { formatDuration } from "@/lib/session";

interface WorkoutTimerProps {
  isActive: boolean;
  elapsedMs: number | null;
  finishedDurationMs: number | null;
  onStart: () => void;
}

export default function WorkoutTimer({ isActive, elapsedMs, finishedDurationMs, onStart }: WorkoutTimerProps) {
  return (
    <div className="mb-5">
      {isActive ? (
        <div className="flex items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 py-3.5 text-sm font-semibold tabular-nums text-emerald-700">
          {formatDuration(elapsedMs ?? 0)}
        </div>
      ) : (
        <>
          {finishedDurationMs !== null && (
            <p className="mb-2 text-center text-xs font-medium text-neutral-500">
              Finished in {formatDuration(finishedDurationMs)}
            </p>
          )}
          <button
            type="button"
            onClick={onStart}
            className="w-full rounded-xl border border-emerald-600 py-3.5 text-sm font-semibold text-emerald-600 transition-colors hover:bg-emerald-50 active:bg-emerald-100"
          >
            Start Workout
          </button>
        </>
      )}
    </div>
  );
}
