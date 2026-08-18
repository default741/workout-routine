"use client";

import SectionGroup from "./SectionGroup";
import FinishWorkoutButton from "./FinishWorkoutButton";
import type { Day, ExerciseLogs } from "@/types/workout";

interface DayViewProps {
  day: Day;
  logs: ExerciseLogs;
  onLogsChange: (updater: ExerciseLogs | ((prev: ExerciseLogs) => ExerciseLogs)) => void;
  onFinish?: () => void;
}

export default function DayView({ day, logs, onLogsChange, onFinish }: DayViewProps) {
  return (
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-bold">{day.label}</h2>
        {day.subtitle && <p className="text-sm text-neutral-500">{day.subtitle}</p>}
      </div>

      {day.sections.map((section) => (
        <SectionGroup
          key={section.id}
          dayId={day.id}
          section={section}
          logs={logs}
          onLogChange={(key, log) => onLogsChange((prev) => ({ ...prev, [key]: log }))}
        />
      ))}

      <FinishWorkoutButton day={day} onLogsChange={onLogsChange} onFinish={onFinish} />
    </div>
  );
}
