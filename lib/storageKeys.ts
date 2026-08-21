import type { PersonId } from "@/types/workout";

export const SELECTED_PROFILE_KEY = "wt:selectedProfile";

export function draftKey(profile: PersonId): string {
  return `wt:${profile}:draft`;
}

export function historyKey(profile: PersonId): string {
  return `wt:${profile}:history`;
}

export function lastCompletedDayKey(profile: PersonId): string {
  return `wt:${profile}:lastCompletedDay`;
}

export function selectedDayKey(profile: PersonId): string {
  return `wt:${profile}:selectedDay`;
}
