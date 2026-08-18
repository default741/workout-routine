export type PersonId = "abdemanaaf" | "dad";

export interface Exercise {
  name: string;
  target: string;
  notes?: string;
}

export interface Section {
  id: string;
  label: string;
  exercises: Exercise[];
}

export interface Day {
  id: string;
  label: string;
  subtitle?: string;
  weekday?: number;
  sections: Section[];
}

export interface Person {
  id: PersonId;
  label: string;
  rotation?: string[];
  days: Day[];
}

export interface ExerciseLog {
  weight?: string;
  reps?: string;
  duration?: string;
  done?: boolean;
}

export type ExerciseLogs = Record<string, ExerciseLog>;
