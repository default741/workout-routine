import { readJSON, writeJSON } from "./storage";
import type { ExerciseLogs, PersonId } from "@/types/workout";

const SCHEMA_VERSION = 1;

interface ExportedProfileState {
  logs: ExerciseLogs;
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
    logs: readJSON<ExerciseLogs>(`wt:${profile}:logs`, {}),
    lastCompletedDay: readJSON<string | null>(`wt:${profile}:lastCompletedDay`, null),
    selectedDay: readJSON<string | null>(`wt:${profile}:selectedDay`, null),
  };
}

export function buildExportData(): ExportedState {
  return {
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    selectedProfile: readJSON<PersonId>("wt:selectedProfile", "abdemanaaf"),
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
          reject(new Error("This file doesn't look like a workout tracker backup."));
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
  writeJSON("wt:selectedProfile", data.selectedProfile);
  (Object.keys(data.profiles) as PersonId[]).forEach((profile) => {
    const state = data.profiles[profile];
    writeJSON(`wt:${profile}:logs`, state.logs);
    writeJSON(`wt:${profile}:lastCompletedDay`, state.lastCompletedDay);
    writeJSON(`wt:${profile}:selectedDay`, state.selectedDay);
  });
}
