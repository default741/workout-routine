export function nextDayId(rotation: string[], lastCompleted: string | null): string {
  if (!rotation.length) return "";
  if (!lastCompleted) return rotation[0];
  const idx = rotation.indexOf(lastCompleted);
  if (idx === -1) return rotation[0];
  return rotation[(idx + 1) % rotation.length];
}
