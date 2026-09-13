import type { Day } from "@/types/workout";

export function buildWeekdayMap(days: Day[]): Record<number, string> {
  const map: Record<number, string> = {};
  for (const day of days) {
    if (typeof day.weekday === "number") map[day.weekday] = day.id;
  }
  return map;
}

export function getTodayDayId(days: Day[], date: Date = new Date()): string | null {
  return buildWeekdayMap(days)[date.getDay()] ?? null;
}
