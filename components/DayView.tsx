"use client";

import SectionGroup from "./SectionGroup";
import FinishWorkoutButton from "./FinishWorkoutButton";
import { getDayProgress } from "@/lib/progress";
import type { Day, ExerciseDraftRecord, ExerciseHistoryRecord } from "@/types/workout";

interface DayViewProps {
  day: Day;
  draft: ExerciseDraftRecord;
  history: ExerciseHistoryRecord;
  onDraftChange: (updater: ExerciseDraftRecord | ((prev: ExerciseDraftRecord) => ExerciseDraftRecord)) => void;
  onFinishWorkout: () => void;
}

export default function DayView({ day, draft, history, onDraftChange, onFinishWorkout }: DayViewProps) {
  const { completed, total } = getDayProgress(day, draft);

  return (
    <div>
      <div className="mb-5">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold text-neutral-900">{day.label}</h2>
          <span className="text-xs font-medium text-neutral-500">
            {completed}/{total} done
          </span>
        </div>
        {day.subtitle && <p className="text-sm text-neutral-500">{day.subtitle}</p>}
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: total > 0 ? `${(completed / total) * 100}%` : "0%" }}
          />
        </div>
      </div>

      {day.sections.map((section) => (
        <SectionGroup
          key={section.id}
          dayId={day.id}
          section={section}
          draft={draft}
          history={history}
          onDraftChange={(key, next) => onDraftChange((prev) => ({ ...prev, [key]: next }))}
        />
      ))}

      <FinishWorkoutButton onFinish={onFinishWorkout} />
    </div>
  );
}
