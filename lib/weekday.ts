const WEEKDAY_TO_DAY_ID: Record<number, string> = {
  1: "monday",
  3: "wednesday",
  5: "friday",
};

export function getTodayDayId(date: Date = new Date()): string | null {
  return WEEKDAY_TO_DAY_ID[date.getDay()] ?? null;
}
