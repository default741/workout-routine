export function getDayIcon(dayId: string): string {
  if (dayId.startsWith("push")) return "🏋️";
  if (dayId.startsWith("pull")) return "🚣";
  if (dayId.startsWith("legs")) return "🦵";
  return "📅";
}
