"use client";

import { getDayIcon } from "@/lib/dayIcon";
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
    <div className="no-scrollbar mb-5 flex snap-x snap-proximity gap-2 overflow-x-auto pb-1">
      {days.map((day) => {
        const isSelected = day.id === selectedDayId;
        const isDefault = day.id === defaultDayId;
        return (
          <button
            key={day.id}
            type="button"
            onClick={() => onSelect(day.id)}
            className={`relative flex shrink-0 snap-start items-center gap-1.5 rounded-full border px-3 py-2 text-sm font-medium transition-colors ${
              isSelected
                ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
            }`}
          >
            <span aria-hidden="true">{getDayIcon(day.id)}</span>
            {day.label}
            {isDefault && (
              <span
                className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                  isSelected ? "bg-white/20 text-white" : "bg-emerald-500 text-white"
                }`}
              >
                {defaultBadgeLabel}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
