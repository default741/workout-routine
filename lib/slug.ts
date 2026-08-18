export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function exerciseKey(dayId: string, sectionId: string, name: string): string {
  return `${dayId}:${sectionId}:${slugify(name)}`;
}
