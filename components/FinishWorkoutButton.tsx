"use client";

interface FinishWorkoutButtonProps {
  onFinish: () => void;
}

export default function FinishWorkoutButton({ onFinish }: FinishWorkoutButtonProps) {
  return (
    <button
      type="button"
      onClick={onFinish}
      className="mt-6 w-full rounded-xl bg-emerald-600 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 active:bg-emerald-800"
    >
      Finish Workout
    </button>
  );
}
