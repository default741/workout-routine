import { readJSON, writeJSON } from "./storage";
import { pruneHistoryRecord } from "./history";
import {
  draftKey,
  historyKey,
  lastCompletedDayKey,
  selectedDayKey,
  SELECTED_PROFILE_KEY,
} from "./storageKeys";
import type { ExerciseDraftRecord, ExerciseHistoryRecord, PersonId } from "@/types/workout";

const SCHEMA_VERSION = 2;

interface ExportedProfileState {
  draft: ExerciseDraftRecord;
  history: ExerciseHistoryRecord;
  lastCompletedDay: string | null;
  selectedDay: string | null;
}

export interface ExportedState {
  schemaVersion: number;
  exportedAt: string;
  selectedProfile: PersonId;
  profiles: Record<PersonId, ExportedProfileState>;
}

function readProfileState(profile: PersonId): ExportedProfileState {
  return {
    draft: readJSON<ExerciseDraftRecord>(draftKey(profile), {}),
    history: readJSON<ExerciseHistoryRecord>(historyKey(profile), {}),
    lastCompletedDay: readJSON<string | null>(lastCompletedDayKey(profile), null),
    selectedDay: readJSON<string | null>(selectedDayKey(profile), null),
  };
}

export function buildExportData(): ExportedState {
  return {
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    selectedProfile: readJSON<PersonId>(SELECTED_PROFILE_KEY, "abdemanaaf"),
    profiles: {
      abdemanaaf: readProfileState("abdemanaaf"),
      dad: readProfileState("dad"),
    },
  };
}

export function downloadExport(): void {
  const data = buildExportData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `workout-tracker-backup-${data.exportedAt.slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export function readImportFile(file: File): Promise<ExportedState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (parsed.schemaVersion !== SCHEMA_VERSION || !parsed.profiles) {
          reject(
            typeof parsed.schemaVersion === "number"
              ? new Error("This backup is from an older version of the app and can't be imported.")
              : new Error("This file doesn't look like a workout tracker backup.")
          );
          return;
        }
        if (parsed.selectedProfile !== "abdemanaaf" && parsed.selectedProfile !== "dad") {
          parsed.selectedProfile = "abdemanaaf";
        }
        resolve(parsed as ExportedState);
      } catch {
        reject(new Error("Couldn't read that file as JSON."));
      }
    };
    reader.onerror = () => reject(new Error("Couldn't read that file."));
    reader.readAsText(file);
  });
}

export function applyImportData(data: ExportedState): void {
  writeJSON(SELECTED_PROFILE_KEY, data.selectedProfile);
  (Object.keys(data.profiles) as PersonId[]).forEach((profile) => {
    const state = data.profiles[profile];
    writeJSON(draftKey(profile), state.draft);
    writeJSON(historyKey(profile), pruneHistoryRecord(state.history));
    writeJSON(lastCompletedDayKey(profile), state.lastCompletedDay);
    writeJSON(selectedDayKey(profile), state.selectedDay);
  });
}
