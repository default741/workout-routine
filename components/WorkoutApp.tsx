"use client";

import { useState } from "react";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { useSwipe } from "@/lib/useSwipe";
import { useElapsedTime } from "@/lib/useElapsedTime";
import { readJSON } from "@/lib/storage";
import { nextDayId } from "@/lib/rotation";
import { getTodayDayId } from "@/lib/weekday";
import { commitDayToHistory } from "@/lib/history";
import { commitSessionToHistory, startSession } from "@/lib/session";
import { addWeightEntry, setHeight as setHeightMetric } from "@/lib/bodyMetrics";
import {
  activeSessionKey,
  bodyMetricsKey,
  draftKey,
  historyKey,
  lastCompletedDayKey,
  selectedDayKey,
  sessionHistoryKey,
  SELECTED_PROFILE_KEY,
} from "@/lib/storageKeys";
import { people } from "@/data";
import type {
  ActiveSession,
  BodyMetrics,
  ExerciseDraftRecord,
  ExerciseHistoryRecord,
  PersonId,
  WorkoutSessionRecord,
} from "@/types/workout";
import ProfileSwitcher from "./ProfileSwitcher";
import DaySelector from "./DaySelector";
import DayView from "./DayView";
import RestDayCard from "./RestDayCard";
import ExportImportControls from "./ExportImportControls";
import BodyMetricsCard from "./BodyMetricsCard";

export default function WorkoutApp() {
  // Deliberately not synced across tabs: if two tabs are open on the same
  // device (one per person), switching profile in one shouldn't yank the
  // other tab over to a different person's routine mid-workout.
  const [selectedProfile, setSelectedProfile] = useLocalStorage<PersonId>(
    SELECTED_PROFILE_KEY,
    "abdemanaaf",
    { syncAcrossTabs: false }
  );

  // Falls back to abdemanaaf if a corrupted/legacy import ever leaves an invalid profile id in storage.
  const person = people[selectedProfile] ?? people.abdemanaaf;

  const personIds = Object.keys(people) as PersonId[];
  const toggleProfile = () =>
    setSelectedProfile((prev) => personIds.find((id) => id !== prev) ?? prev);
  const swipe = useSwipe(toggleProfile);

  const [draft, setDraft] = useLocalStorage<ExerciseDraftRecord>(draftKey(selectedProfile), {});
  const [history, setHistory] = useLocalStorage<ExerciseHistoryRecord>(
    historyKey(selectedProfile),
    {}
  );
  const [lastCompletedDay, setLastCompletedDay] = useLocalStorage<string | null>(
    lastCompletedDayKey(selectedProfile),
    null
  );
  const [selectedDayOverride, setSelectedDayOverride] = useLocalStorage<string | null>(
    selectedDayKey(selectedProfile),
    null
  );
  const [activeSession, setActiveSession] = useLocalStorage<ActiveSession | null>(
    activeSessionKey(selectedProfile),
    null
  );
  const [sessionHistory, setSessionHistory] = useLocalStorage<WorkoutSessionRecord>(
    sessionHistoryKey(selectedProfile),
    {}
  );
  const [bodyMetrics, setBodyMetrics] = useLocalStorage<BodyMetrics>(
    bodyMetricsKey(selectedProfile),
    { heightCm: null, weightLog: [] }
  );

  // Ephemeral (not persisted): whether the post-finish "log your weight?" nudge should be showing.
  const [justFinished, setJustFinished] = useState(false);

  const defaultDayId = person.rotation
    ? nextDayId(person.rotation, lastCompletedDay)
    : getTodayDayId(person.days);

  const currentDayId = selectedDayOverride ?? defaultDayId;
  const currentDay = person.days.find((d) => d.id === currentDayId);

  const isSessionActive = !!(activeSession && currentDay && activeSession.dayId === currentDay.id);
  const liveElapsedMs = useElapsedTime(isSessionActive ? activeSession!.startedAt : null);
  // The most recently recorded duration for the day being viewed (persisted,
  // so it's still shown if the day is revisited later, not just right after Finish).
  const lastFinishedDurationMs = currentDay ? sessionHistory[currentDay.id]?.[0]?.durationMs ?? null : null;

  const handleStartWorkout = () => {
    if (!currentDay) return;
    setActiveSession(startSession(currentDay.id));
    setJustFinished(false);
  };

  const handleFinishWorkout = () => {
    if (!currentDay) return;
    const now = new Date();
    // Read fresh rather than trust in-memory state: this commit touches
    // several keys together, and the whole read-compute-write sequence below
    // runs synchronously in this one handler, so there's no window for
    // another tab's write to interleave.
    const freshDraft = readJSON<ExerciseDraftRecord>(draftKey(selectedProfile), {});
    const freshHistory = readJSON<ExerciseHistoryRecord>(historyKey(selectedProfile), {});
    const freshActiveSession = readJSON<ActiveSession | null>(activeSessionKey(selectedProfile), null);
    const freshSessionHistory = readJSON<WorkoutSessionRecord>(sessionHistoryKey(selectedProfile), {});

    const result = commitDayToHistory(currentDay, freshDraft, freshHistory, now);
    const sessionResult = commitSessionToHistory(freshActiveSession, currentDay.id, freshSessionHistory, now);

    setDraft(result.drafts);
    setHistory(result.history);
    setActiveSession(sessionResult.activeSession);
    setSessionHistory(sessionResult.history);
    if (person.rotation) setLastCompletedDay(currentDay.id);
    setSelectedDayOverride(null);
    setJustFinished(true);
  };

  const handleLogWeight = (weightKg: number) => {
    setBodyMetrics((prev) => addWeightEntry(prev, weightKg));
    setJustFinished(false);
  };

  const handleSetHeight = (heightCm: number) => {
    setBodyMetrics((prev) => setHeightMetric(prev, heightCm));
  };

  const forceReload = () => {
    // Export/import writes directly to localStorage; a full reload is the
    // simplest way to get every hook to pick up the new values.
    window.location.reload();
  };

  return (
    <main className="mx-auto w-full max-w-md px-4 py-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold tracking-tight text-neutral-900">Workout Tracker</h1>
        <ExportImportControls onImported={forceReload} />
      </div>

      <div className="mb-5 flex items-center gap-2">
        <button
          type="button"
          onClick={toggleProfile}
          aria-label="Switch profile"
          className="shrink-0 rounded-full p-1.5 text-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
        >
          ‹
        </button>
        <ProfileSwitcher
          people={Object.values(people).map((p) => ({ id: p.id, label: p.label }))}
          selected={selectedProfile}
          onSelect={setSelectedProfile}
        />
        <button
          type="button"
          onClick={toggleProfile}
          aria-label="Switch profile"
          className="shrink-0 rounded-full p-1.5 text-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
        >
          ›
        </button>
      </div>

      <DaySelector
        days={person.days}
        selectedDayId={currentDayId ?? ""}
        defaultDayId={defaultDayId}
        defaultBadgeLabel={person.rotation ? "Suggested" : "Today"}
        onSelect={setSelectedDayOverride}
      />

      <div onTouchStart={swipe.onTouchStart} onTouchEnd={swipe.onTouchEnd} onTouchCancel={swipe.onTouchCancel}>
        {currentDay ? (
          <DayView
            day={currentDay}
            draft={draft}
            history={history}
            onDraftChange={setDraft}
            isSessionActive={isSessionActive}
            elapsedMs={liveElapsedMs}
            finishedDurationMs={lastFinishedDurationMs}
            onStartWorkout={handleStartWorkout}
            onFinishWorkout={handleFinishWorkout}
          />
        ) : (
          <RestDayCard days={person.days} onSelect={setSelectedDayOverride} />
        )}
      </div>

      <div className="mt-5">
        <BodyMetricsCard
          metrics={bodyMetrics}
          onLogWeight={handleLogWeight}
          onSetHeight={handleSetHeight}
          prompt={justFinished}
          onDismissPrompt={() => setJustFinished(false)}
        />
      </div>
    </main>
  );
}
