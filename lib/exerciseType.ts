export type ExerciseKind = "sets_reps" | "duration";

/**
 * Both source routines mix "x" and "/" as the sets x reps separator, and a
 * handful of targets are irregular ("-", "1 x 15, 1 x 15", "2 x 30 sec").
 * Duration keywords are checked first; anything that isn't a clean sets x reps
 * pattern falls back to a single free-text field rather than assuming weight+reps.
 */
export function inferExerciseKind(target: string): ExerciseKind {
  if (/\b\d+\s*(sec|secs|second|seconds|min|mins|minute|minutes)\b/i.test(target)) {
    return "duration";
  }
  if (/^\d+\s*[x/]\s*\d+$/i.test(target.trim())) {
    return "sets_reps";
  }
  return "duration";
}
