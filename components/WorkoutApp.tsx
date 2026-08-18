"use client";

import { useLocalStorage } from "@/lib/useLocalStorage";
import { nextDayId } from "@/lib/rotation";
import { getTodayDayId } from "@/lib/weekday";
import { people } from "@/data";
import type { ExerciseLogs, PersonId } from "@/types/workout";
import ProfileSwitcher from "./ProfileSwitcher";
import DaySelector from "./DaySelector";
import DayView from "./DayView";
import RestDayCard from "./RestDayCard";
import ExportImportControls from "./ExportImportControls";

export default function WorkoutApp() {
  const [selectedProfile, setSelectedProfile] = useLocalStorage<PersonId>(
    "wt:selectedProfile",
    "abdemanaaf"
  );

  // Falls back to abdemanaaf if a corrupted/legacy import ever leaves an invalid profile id in storage.
  const person = people[selectedProfile] ?? people.abdemanaaf;

  const [logs, setLogs] = useLocalStorage<ExerciseLogs>(`wt:${selectedProfile}:logs`, {});
  const [lastCompletedDay, setLastCompletedDay] = useLocalStorage<string | null>(
    `wt:${selectedProfile}:lastCompletedDay`,
    null
  );
  const [selectedDayOverride, setSelectedDayOverride] = useLocalStorage<string | null>(
    `wt:${selectedProfile}:selectedDay`,
    null
  );

  const defaultDayId = person.rotation
    ? nextDayId(person.rotation, lastCompletedDay)
    : getTodayDayId();

  const currentDayId = selectedDayOverride ?? defaultDayId;
  const currentDay = person.days.find((d) => d.id === currentDayId);

  const handleFinish = () => {
    if (person.rotation && currentDay) setLastCompletedDay(currentDay.id);
    setSelectedDayOverride(null);
  };

  const forceReload = () => {
    // Export/import writes directly to localStorage; a full reload is the
    // simplest way to get every hook to pick up the new values.
    window.location.reload();
  };

  return (
    <main className="mx-auto max-w-md px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold">Workout Tracker</h1>
        <ExportImportControls onImported={forceReload} />
      </div>

      <div className="mb-5">
        <ProfileSwitcher
          people={Object.values(people).map((p) => ({ id: p.id, label: p.label }))}
          selected={selectedProfile}
          onSelect={setSelectedProfile}
        />
      </div>

      <DaySelector
        days={person.days}
        selectedDayId={currentDayId ?? ""}
        defaultDayId={defaultDayId}
        defaultBadgeLabel={person.rotation ? "Suggested" : "Today"}
        onSelect={setSelectedDayOverride}
      />

      {currentDay ? (
        <DayView day={currentDay} logs={logs} onLogsChange={setLogs} onFinish={handleFinish} />
      ) : (
        <RestDayCard days={person.days} onSelect={setSelectedDayOverride} />
      )}
    </main>
  );
}
