"use client";

import { useState } from "react";
import TrendChart from "./TrendChart";
import { bmiCategory, computeBmi } from "@/lib/bodyMetrics";
import type { BodyMetrics } from "@/types/workout";

interface BodyMetricsCardProps {
  metrics: BodyMetrics;
  onLogWeight: (weightKg: number) => void;
  onSetHeight: (heightCm: number) => void;
  prompt: boolean;
  onDismissPrompt: () => void;
}

export default function BodyMetricsCard({
  metrics,
  onLogWeight,
  onSetHeight,
  prompt,
  onDismissPrompt,
}: BodyMetricsCardProps) {
  const [weightInput, setWeightInput] = useState("");
  const [heightInput, setHeightInput] = useState(metrics.heightCm ? String(metrics.heightCm) : "");
  const [metric, setMetric] = useState<"weight" | "bmi">("weight");

  // `metrics` comes from useLocalStorage, whose real value only lands a beat
  // after the initial (server-safe) snapshot, and can also swap out entirely
  // on a profile switch — resync the field whenever the underlying height
  // itself changes (render-phase state adjustment, not an Effect, so it
  // applies before paint with no extra render round-trip).
  const [syncedHeightCm, setSyncedHeightCm] = useState(metrics.heightCm);
  if (metrics.heightCm !== syncedHeightCm) {
    setSyncedHeightCm(metrics.heightCm);
    setHeightInput(metrics.heightCm ? String(metrics.heightCm) : "");
  }

  const latestWeight = metrics.weightLog[0];
  const latestBmi = latestWeight && metrics.heightCm ? computeBmi(latestWeight.weightKg, metrics.heightCm) : null;

  const handleLogWeight = () => {
    const value = parseFloat(weightInput);
    if (!Number.isFinite(value) || value <= 0) return;
    onLogWeight(value);
    setWeightInput("");
  };

  const handleSaveHeight = () => {
    const value = parseFloat(heightInput);
    if (!Number.isFinite(value) || value <= 0) return;
    onSetHeight(value);
  };

  const weightPoints = metrics.weightLog.map((e) => ({ date: e.date, value: e.weightKg }));
  const bmiPoints = metrics.heightCm
    ? metrics.weightLog
        .map((e) => ({ date: e.date, value: computeBmi(e.weightKg, metrics.heightCm as number) }))
        .filter((p): p is { date: string; value: number } => p.value !== null)
    : [];

  return (
    <div className="mb-5 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Body Metrics</h2>
        {latestWeight && (
          <span className="text-xs text-neutral-500">
            {latestWeight.weightKg} kg
            {latestBmi !== null && ` · BMI ${latestBmi.toFixed(1)} (${bmiCategory(latestBmi)})`}
          </span>
        )}
      </div>

      {prompt && (
        <div className="mb-3 flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
          <span>Nice work — log today&apos;s weight?</span>
          <button type="button" onClick={onDismissPrompt} className="font-medium underline hover:text-emerald-800">
            Dismiss
          </button>
        </div>
      )}

      <div className="mb-3 flex gap-2">
        <input
          type="text"
          inputMode="decimal"
          placeholder="Weight (kg)"
          value={weightInput}
          onChange={(e) => setWeightInput(e.target.value)}
          className="w-0 min-w-0 flex-1 rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
        />
        <button
          type="button"
          onClick={handleLogWeight}
          className="shrink-0 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
        >
          Log weight
        </button>
      </div>

      <div className="mb-4 flex items-center gap-2 text-xs text-neutral-500">
        <span>Height</span>
        <input
          type="text"
          inputMode="decimal"
          placeholder="cm"
          value={heightInput}
          onChange={(e) => setHeightInput(e.target.value)}
          className="w-16 rounded-md border border-neutral-300 px-2 py-1 text-sm text-neutral-900"
        />
        <span>cm</span>
        <button type="button" onClick={handleSaveHeight} className="font-medium text-emerald-600 hover:text-emerald-700">
          Save
        </button>
      </div>

      {metrics.weightLog.length === 0 ? (
        <p className="py-4 text-center text-xs text-neutral-400">No weight logged yet.</p>
      ) : (
        <div>
          <div className="mb-2 inline-flex rounded-full border border-neutral-200 bg-neutral-100 p-1 text-xs">
            <button
              type="button"
              onClick={() => setMetric("weight")}
              className={`rounded-full px-3 py-1 font-semibold transition-colors ${
                metric === "weight" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              Weight
            </button>
            <button
              type="button"
              onClick={() => setMetric("bmi")}
              disabled={!metrics.heightCm}
              className={`rounded-full px-3 py-1 font-semibold transition-colors disabled:cursor-not-allowed disabled:text-neutral-300 ${
                metric === "bmi" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              BMI
            </button>
          </div>

          {metric === "weight" && <TrendChart points={weightPoints} unit=" kg" />}
          {metric === "bmi" &&
            (metrics.heightCm ? (
              <TrendChart points={bmiPoints} unit="" />
            ) : (
              <p className="py-6 text-center text-xs text-neutral-400">Set your height to see BMI.</p>
            ))}
        </div>
      )}
    </div>
  );
}
