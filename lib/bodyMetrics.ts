import type { BodyMetrics } from "@/types/workout";

export function computeBmi(weightKg: number, heightCm: number): number | null {
  if (!(weightKg > 0) || !(heightCm > 0)) return null;
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

export function bmiCategory(bmi: number): string {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

export function addWeightEntry(
  metrics: BodyMetrics,
  weightKg: number,
  now: Date = new Date()
): BodyMetrics {
  return {
    ...metrics,
    weightLog: [{ date: now.toISOString(), weightKg }, ...metrics.weightLog],
  };
}

export function setHeight(metrics: BodyMetrics, heightCm: number): BodyMetrics {
  return { ...metrics, heightCm };
}
