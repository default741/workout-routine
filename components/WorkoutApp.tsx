"use client";

import { useLocalStorage } from "@/lib/useLocalStorage";
import { useSwipe } from "@/lib/useSwipe";
import { readJSON } from "@/lib/storage";
import { nextDayId } from "@/lib/rotation";
import { getTodayDayId } from "@/lib/weekday";
import { commitDayToHistory } from "@/lib/history";
import {
  draftKey,
  historyKey,
  lastCompletedDayKey,
  selectedDayKey,
  SELECTED_PROFILE_KEY,
} from "@/lib/storageKeys";
import { people } from "@/data";
import type { ExerciseDraftRecord, ExerciseHistoryRecord, PersonId } from "@/types/workout";
import ProfileSwitcher from "./ProfileSwitcher";
import DaySelector from "./DaySelector";
import DayView from "./DayView";
import RestDayCard from "./RestDayCard";
import ExportImportControls from "./ExportImportControls";

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

  const defaultDayId = person.rotation
    ? nextDayId(person.rotation, lastCompletedDay)
    : getTodayDayId();

  const currentDayId = selectedDayOverride ?? defaultDayId;
  const currentDay = person.days.find((d) => d.id === currentDayId);

  const handleFinishWorkout = () => {
    if (!currentDay) return;
    // Read fresh rather than trust in-memory state: this commit touches two
    // keys (draft + history) together, and the whole read-compute-write
    // sequence below runs synchronously in this one handler, so there's no
    // window for another tab's write to interleave.
    const freshDraft = readJSON<ExerciseDraftRecord>(draftKey(selectedProfile), {});
    const freshHistory = readJSON<ExerciseHistoryRecord>(historyKey(selectedProfile), {});
    const result = commitDayToHistory(currentDay, freshDraft, freshHistory, new Date());
    setDraft(result.drafts);
    setHistory(result.history);
    if (person.rotation) setLastCompletedDay(currentDay.id);
    setSelectedDayOverride(null);
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
            onFinishWorkout={handleFinishWorkout}
          />
        ) : (
          <RestDayCard days={person.days} onSelect={setSelectedDayOverride} />
        )}
      </div>
    </main>
  );
}
