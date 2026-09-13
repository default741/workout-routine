import { readJSON, writeJSON } from "./storage";
import { pruneHistoryRecord } from "./history";
import { parseCsvRows, toCsvRow } from "./csv";
import {
  activeSessionKey,
  bodyMetricsKey,
  draftKey,
  historyKey,
  lastCompletedDayKey,
  selectedDayKey,
  sessionHistoryKey,
  SELECTED_PROFILE_KEY,
} from "./storageKeys";
import type {
  ActiveSession,
  BodyMetrics,
  ExerciseDraftRecord,
  ExerciseHistoryEntry,
  ExerciseHistoryRecord,
  PersonId,
  SetEntry,
  WorkoutSessionRecord,
} from "@/types/workout";

const SCHEMA_VERSION = 3;
const PROFILE_IDS: PersonId[] = ["abdemanaaf", "dad"];

function isPersonId(value: string): value is PersonId {
  return value === "abdemanaaf" || value === "dad";
}

interface ExportedProfileState {
  draft: ExerciseDraftRecord;
  history: ExerciseHistoryRecord;
  lastCompletedDay: string | null;
  selectedDay: string | null;
  activeSession: ActiveSession | null;
  sessionHistory: WorkoutSessionRecord;
  bodyMetrics: BodyMetrics;
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
    activeSession: readJSON<ActiveSession | null>(activeSessionKey(profile), null),
    sessionHistory: readJSON<WorkoutSessionRecord>(sessionHistoryKey(profile), {}),
    bodyMetrics: readJSON<BodyMetrics>(bodyMetricsKey(profile), { heightCm: null, weightLog: [] }),
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

// One flat CSV: a `Table` column discriminates the logical record type, and
// each row only fills in the columns relevant to its table (sparse but
// hand-parseable with no external library).
const CSV_HEADER = [
  "Table",
  "Profile",
  "Key",
  "DayId",
  "SectionId",
  "SetIndex",
  "Date",
  "Weight",
  "Reps",
  "Duration",
  "Done",
  "DurationSeconds",
  "WeightKg",
  "HeightCm",
  "MetaKey",
  "MetaValue",
] as const;
type CsvColumn = (typeof CSV_HEADER)[number];

function buildCsv(data: ExportedState): string {
  const lines: string[] = [toCsvRow([...CSV_HEADER])];
  const addRow = (fields: Partial<Record<CsvColumn, string | number | boolean | null | undefined>>) => {
    lines.push(toCsvRow(CSV_HEADER.map((col) => fields[col])));
  };

  addRow({ Table: "Meta", MetaKey: "schemaVersion", MetaValue: data.schemaVersion });
  addRow({ Table: "Meta", MetaKey: "exportedAt", MetaValue: data.exportedAt });
  addRow({ Table: "Meta", MetaKey: "selectedProfile", MetaValue: data.selectedProfile });

  PROFILE_IDS.forEach((profile) => {
    const state = data.profiles[profile];

    if (state.lastCompletedDay !== null) {
      addRow({ Table: "Meta", Profile: profile, MetaKey: "lastCompletedDay", MetaValue: state.lastCompletedDay });
    }
    if (state.selectedDay !== null) {
      addRow({ Table: "Meta", Profile: profile, MetaKey: "selectedDay", MetaValue: state.selectedDay });
    }
    if (state.activeSession) {
      addRow({ Table: "Meta", Profile: profile, MetaKey: "activeSession.dayId", MetaValue: state.activeSession.dayId });
      addRow({ Table: "Meta", Profile: profile, MetaKey: "activeSession.startedAt", MetaValue: state.activeSession.startedAt });
    }
    if (state.bodyMetrics.heightCm !== null) {
      addRow({ Table: "Meta", Profile: profile, MetaKey: "heightCm", MetaValue: state.bodyMetrics.heightCm });
    }

    Object.entries(state.draft).forEach(([key, draft]) => {
      const [dayId, sectionId] = key.split(":");
      if (draft.sets.length === 0) {
        addRow({ Table: "Draft", Profile: profile, Key: key, DayId: dayId, SectionId: sectionId, Done: draft.done ?? false });
        return;
      }
      draft.sets.forEach((set, index) => {
        addRow({
          Table: "Draft",
          Profile: profile,
          Key: key,
          DayId: dayId,
          SectionId: sectionId,
          SetIndex: index,
          Weight: set.weight,
          Reps: set.reps,
          Duration: set.duration,
          Done: draft.done ?? false,
        });
      });
    });

    Object.entries(state.history).forEach(([key, entries]) => {
      const [dayId, sectionId] = key.split(":");
      entries.forEach((entry) => {
        entry.sets.forEach((set, index) => {
          addRow({
            Table: "History",
            Profile: profile,
            Key: key,
            DayId: dayId,
            SectionId: sectionId,
            SetIndex: index,
            Date: entry.date,
            Weight: set.weight,
            Reps: set.reps,
            Duration: set.duration,
          });
        });
      });
    });

    Object.entries(state.sessionHistory).forEach(([dayId, entries]) => {
      entries.forEach((entry) => {
        addRow({
          Table: "SessionHistory",
          Profile: profile,
          DayId: dayId,
          Date: entry.date,
          DurationSeconds: Math.round(entry.durationMs / 1000),
        });
      });
    });

    state.bodyMetrics.weightLog.forEach((entry) => {
      addRow({ Table: "BodyMetrics", Profile: profile, Date: entry.date, WeightKg: entry.weightKg });
    });
  });

  return lines.join("\r\n") + "\r\n";
}

function emptyProfileState(): ExportedProfileState {
  return {
    draft: {},
    history: {},
    lastCompletedDay: null,
    selectedDay: null,
    activeSession: null,
    sessionHistory: {},
    bodyMetrics: { heightCm: null, weightLog: [] },
  };
}

function parseCsv(text: string): ExportedState {
  const rows = parseCsvRows(text).filter((r) => !(r.length === 1 && r[0] === ""));
  const header = rows[0];
  if (!header) throw new Error("This file doesn't look like a workout tracker backup.");

  const colIndex = Object.fromEntries(CSV_HEADER.map((col) => [col, header.indexOf(col)])) as Record<
    CsvColumn,
    number
  >;
  if (["Table", "Profile", "Key", "MetaKey", "MetaValue"].some((col) => colIndex[col as CsvColumn] === -1)) {
    throw new Error("This file doesn't look like a workout tracker backup.");
  }
  const get = (row: string[], col: CsvColumn): string => {
    const i = colIndex[col];
    return i === -1 ? "" : row[i] ?? "";
  };

  let schemaVersion = NaN;
  let exportedAt = "";
  let selectedProfile: PersonId = "abdemanaaf";

  const draftAccum: Record<string, { done: boolean; sets: Map<number, SetEntry> }> = {};
  const historyAccum: Record<string, Map<string, Map<number, SetEntry>>> = {};
  const sessionAccum: Record<PersonId, { dayId: string; date: string; durationMs: number }[]> = {
    abdemanaaf: [],
    dad: [],
  };
  const weightAccum: Record<PersonId, { date: string; weightKg: number }[]> = { abdemanaaf: [], dad: [] };
  const lastCompletedByProfile: Partial<Record<PersonId, string>> = {};
  const selectedDayByProfile: Partial<Record<PersonId, string>> = {};
  const heightByProfile: Partial<Record<PersonId, number>> = {};
  const activeSessionParts: Partial<Record<PersonId, { dayId?: string; startedAt?: string }>> = {};

  const setFromRow = (row: string[]): SetEntry => {
    const set: SetEntry = {};
    const weight = get(row, "Weight");
    const reps = get(row, "Reps");
    const duration = get(row, "Duration");
    if (weight) set.weight = weight;
    if (reps) set.reps = reps;
    if (duration) set.duration = duration;
    return set;
  };

  for (const row of rows.slice(1)) {
    const table = get(row, "Table");
    const profileRaw = get(row, "Profile");

    if (table === "Meta") {
      const metaKey = get(row, "MetaKey");
      const metaValue = get(row, "MetaValue");
      if (!profileRaw) {
        if (metaKey === "schemaVersion") schemaVersion = Number(metaValue);
        else if (metaKey === "exportedAt") exportedAt = metaValue;
        else if (metaKey === "selectedProfile" && isPersonId(metaValue)) selectedProfile = metaValue;
        continue;
      }
      if (!isPersonId(profileRaw)) continue;
      if (metaKey === "lastCompletedDay") lastCompletedByProfile[profileRaw] = metaValue;
      else if (metaKey === "selectedDay") selectedDayByProfile[profileRaw] = metaValue;
      else if (metaKey === "heightCm") heightByProfile[profileRaw] = Number(metaValue);
      else if (metaKey === "activeSession.dayId") {
        activeSessionParts[profileRaw] = { ...activeSessionParts[profileRaw], dayId: metaValue };
      } else if (metaKey === "activeSession.startedAt") {
        activeSessionParts[profileRaw] = { ...activeSessionParts[profileRaw], startedAt: metaValue };
      }
      continue;
    }

    if (!isPersonId(profileRaw)) continue;

    if (table === "Draft") {
      const key = get(row, "Key");
      const accumKey = `${profileRaw} ${key}`;
      const entry = (draftAccum[accumKey] ??= { done: false, sets: new Map() });
      const doneRaw = get(row, "Done");
      if (doneRaw) entry.done = doneRaw === "true";
      const setIndexRaw = get(row, "SetIndex");
      if (setIndexRaw !== "") entry.sets.set(Number(setIndexRaw), setFromRow(row));
      continue;
    }

    if (table === "History") {
      const key = get(row, "Key");
      const date = get(row, "Date");
      const accumKey = `${profileRaw} ${key}`;
      const byDate = (historyAccum[accumKey] ??= new Map());
      const bySet = byDate.get(date) ?? new Map<number, SetEntry>();
      byDate.set(date, bySet);
      const setIndexRaw = get(row, "SetIndex");
      const setIndex = setIndexRaw === "" ? bySet.size : Number(setIndexRaw);
      bySet.set(setIndex, setFromRow(row));
      continue;
    }

    if (table === "SessionHistory") {
      const dayId = get(row, "DayId");
      const date = get(row, "Date");
      const durationMs = Number(get(row, "DurationSeconds") || "0") * 1000;
      sessionAccum[profileRaw].push({ dayId, date, durationMs });
      continue;
    }

    if (table === "BodyMetrics") {
      const date = get(row, "Date");
      const weightKg = Number(get(row, "WeightKg") || "0");
      weightAccum[profileRaw].push({ date, weightKg });
      continue;
    }
  }

  if (!Number.isFinite(schemaVersion) || schemaVersion !== SCHEMA_VERSION) {
    throw new Error(
      Number.isFinite(schemaVersion)
        ? "This backup is from a different version of the app and can't be imported."
        : "This file doesn't look like a workout tracker backup."
    );
  }

  const profiles = {} as Record<PersonId, ExportedProfileState>;
  PROFILE_IDS.forEach((profile) => {
    const prefix = `${profile} `;

    const draft: ExerciseDraftRecord = {};
    Object.entries(draftAccum)
      .filter(([accumKey]) => accumKey.startsWith(prefix))
      .forEach(([accumKey, value]) => {
        const key = accumKey.slice(prefix.length);
        const maxIndex = Math.max(-1, ...value.sets.keys());
        const sets: SetEntry[] = [];
        for (let i = 0; i <= maxIndex; i++) sets.push(value.sets.get(i) ?? {});
        draft[key] = { done: value.done, sets: sets.length ? sets : [{}] };
      });

    const history: ExerciseHistoryRecord = {};
    Object.entries(historyAccum)
      .filter(([accumKey]) => accumKey.startsWith(prefix))
      .forEach(([accumKey, byDate]) => {
        const key = accumKey.slice(prefix.length);
        const entries: ExerciseHistoryEntry[] = Array.from(byDate.entries())
          .map(([date, bySet]) => {
            const maxIndex = Math.max(-1, ...bySet.keys());
            const sets: SetEntry[] = [];
            for (let i = 0; i <= maxIndex; i++) sets.push(bySet.get(i) ?? {});
            return { date, sets };
          })
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        history[key] = entries;
      });

    const sessionHistory: WorkoutSessionRecord = {};
    [...sessionAccum[profile]]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .forEach(({ dayId, date, durationMs }) => {
        (sessionHistory[dayId] ??= []).push({ date, durationMs });
      });

    const weightLog = [...weightAccum[profile]].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const parts = activeSessionParts[profile];
    const activeSession: ActiveSession | null =
      parts?.dayId && parts?.startedAt ? { dayId: parts.dayId, startedAt: parts.startedAt } : null;

    profiles[profile] = {
      draft,
      history,
      lastCompletedDay: lastCompletedByProfile[profile] ?? null,
      selectedDay: selectedDayByProfile[profile] ?? null,
      activeSession,
      sessionHistory,
      bodyMetrics: { heightCm: heightByProfile[profile] ?? null, weightLog },
    };
  });

  return { schemaVersion, exportedAt, selectedProfile, profiles };
}

export function downloadExport(): void {
  const data = buildExportData();
  const csv = buildCsv(data);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `workout-tracker-backup-${data.exportedAt.slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function readImportFile(file: File): Promise<ExportedState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        resolve(parseCsv(String(reader.result)));
      } catch (err) {
        reject(err instanceof Error ? err : new Error("Couldn't read that file."));
      }
    };
    reader.onerror = () => reject(new Error("Couldn't read that file."));
    reader.readAsText(file);
  });
}

export function applyImportData(data: ExportedState): void {
  writeJSON(SELECTED_PROFILE_KEY, data.selectedProfile);
  PROFILE_IDS.forEach((profile) => {
    const state = data.profiles[profile] ?? emptyProfileState();
    writeJSON(draftKey(profile), state.draft);
    writeJSON(historyKey(profile), pruneHistoryRecord(state.history));
    writeJSON(lastCompletedDayKey(profile), state.lastCompletedDay);
    writeJSON(selectedDayKey(profile), state.selectedDay);
    writeJSON(activeSessionKey(profile), state.activeSession);
    writeJSON(sessionHistoryKey(profile), state.sessionHistory);
    writeJSON(bodyMetricsKey(profile), state.bodyMetrics);
  });
}
