"use client";

import type { Day } from "@/types/workout";

interface RestDayCardProps {
  days: Day[];
  onSelect: (dayId: string) => void;
}

export default function RestDayCard({ days, onSelect }: RestDayCardProps) {
  return (
    <div className="rounded-lg border border-dashed border-neutral-300 p-6 text-center">
      <p className="text-lg font-semibold">Rest day 🎉</p>
      <p className="text-sm text-neutral-500 mt-1 mb-4">
        No workout scheduled for today. Pick a day below if you want to do one anyway.
      </p>
      <div className="flex justify-center gap-2">
        {days.map((day) => (
          <button
            key={day.id}
            type="button"
            onClick={() => onSelect(day.id)}
            className="rounded-full px-3 py-1.5 text-sm font-medium border border-neutral-300 bg-white text-neutral-700"
          >
            {day.label}
          </button>
        ))}
      </div>
    </div>
  );
}
