"use client";

import type { Day } from "@/types/workout";

interface DaySelectorProps {
  days: Day[];
  selectedDayId: string;
  defaultDayId: string | null;
  defaultBadgeLabel: string;
  onSelect: (dayId: string) => void;
}

export default function DaySelector({
  days,
  selectedDayId,
  defaultDayId,
  defaultBadgeLabel,
  onSelect,
}: DaySelectorProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {days.map((day) => {
        const isSelected = day.id === selectedDayId;
        const isDefault = day.id === defaultDayId;
        return (
          <button
            key={day.id}
            type="button"
            onClick={() => onSelect(day.id)}
            className={`relative rounded-full px-3 py-2 text-sm font-medium border ${
              isSelected
                ? "bg-neutral-900 text-white border-neutral-900"
                : "bg-white text-neutral-700 border-neutral-300"
            }`}
          >
            {day.label}
            {isDefault && (
              <span className="ml-1.5 rounded-full bg-emerald-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                {defaultBadgeLabel}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
