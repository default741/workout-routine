"use client";

import ExerciseItem from "./ExerciseItem";
import type { ExerciseDraft, ExerciseDraftRecord, ExerciseHistoryRecord, Section } from "@/types/workout";
import { exerciseKey } from "@/lib/slug";

interface SectionGroupProps {
  dayId: string;
  section: Section;
  draft: ExerciseDraftRecord;
  history: ExerciseHistoryRecord;
  onDraftChange: (key: string, next: ExerciseDraft) => void;
}

export default function SectionGroup({ dayId, section, draft, history, onDraftChange }: SectionGroupProps) {
  return (
    <section className="mb-5 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
        {section.label}
      </h3>
      <ul className="divide-y divide-neutral-100">
        {section.exercises.map((exercise) => {
          const key = exerciseKey(dayId, section.id, exercise.name);
          return (
            <ExerciseItem
              key={key}
              exercise={exercise}
              sectionId={section.id}
              draft={draft[key]}
              history={history[key]}
              onChange={(next) => onDraftChange(key, next)}
            />
          );
        })}
      </ul>
    </section>
  );
}
