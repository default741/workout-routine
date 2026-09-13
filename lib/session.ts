import type { ActiveSession, WorkoutSessionRecord } from "@/types/workout";

export function startSession(dayId: string, now: Date = new Date()): ActiveSession {
  return { dayId, startedAt: now.toISOString() };
}

/** Live elapsed time for `dayId`, or null if no session is running for that day. */
export function elapsedMs(
  session: ActiveSession | null,
  dayId: string,
  now: Date = new Date()
): number | null {
  if (!session || session.dayId !== dayId) return null;
  return now.getTime() - new Date(session.startedAt).getTime();
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${minutes}:${pad(seconds)}`;
}

/**
 * Archives the active session's duration (if any) into history and clears it.
 * A no-op on history when Finish is pressed without ever pressing Start.
 */
export function commitSessionToHistory(
  activeSession: ActiveSession | null,
  dayId: string,
  history: WorkoutSessionRecord,
  now: Date = new Date()
): { activeSession: null; history: WorkoutSessionRecord } {
  const duration = elapsedMs(activeSession, dayId, now);
  if (duration === null) return { activeSession: null, history };

  const entry = { date: now.toISOString(), durationMs: duration };
  return {
    activeSession: null,
    history: { ...history, [dayId]: [entry, ...(history[dayId] ?? [])] },
  };
}
