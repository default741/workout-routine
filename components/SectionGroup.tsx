"use client";

import ExerciseItem from "./ExerciseItem";
import type { ExerciseLogs, Section } from "@/types/workout";
import { exerciseKey } from "@/lib/slug";

interface SectionGroupProps {
  dayId: string;
  section: Section;
  logs: ExerciseLogs;
  onLogChange: (key: string, log: ExerciseLogs[string]) => void;
}

export default function SectionGroup({ dayId, section, logs, onLogChange }: SectionGroupProps) {
  return (
    <section className="mb-6">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-1">
        {section.label}
      </h3>
      <ul className="divide-y divide-neutral-200">
        {section.exercises.map((exercise) => {
          const key = exerciseKey(dayId, section.id, exercise.name);
          return (
            <ExerciseItem
              key={key}
              exercise={exercise}
              log={logs[key]}
              onChange={(log) => onLogChange(key, log)}
            />
          );
        })}
      </ul>
    </section>
  );
}
