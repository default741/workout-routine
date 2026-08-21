"use client";

import type { Day } from "@/types/workout";

interface RestDayCardProps {
  days: Day[];
  onSelect: (dayId: string) => void;
}

export default function RestDayCard({ days, onSelect }: RestDayCardProps) {
  return (
    <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-8 text-center shadow-sm">
      <p className="text-lg font-semibold text-neutral-900">Rest day 🎉</p>
      <p className="mt-1 mb-4 text-sm text-neutral-500">
        No workout scheduled for today. Pick a day below if you want to do one anyway.
      </p>
      <div className="flex justify-center gap-2">
        {days.map((day) => (
          <button
            key={day.id}
            type="button"
            onClick={() => onSelect(day.id)}
            className="rounded-full border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            {day.label}
          </button>
        ))}
      </div>
    </div>
  );
}
