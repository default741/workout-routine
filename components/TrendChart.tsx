"use client";

import { useId, useState } from "react";
import { formatRelativeDate } from "@/lib/setDisplay";

export interface TrendChartPoint {
  date: string;
  value: number;
}

interface TrendChartProps {
  points: TrendChartPoint[];
  unit: string;
  formatValue?: (value: number) => string;
}

const WIDTH = 300;
const HEIGHT = 130;
const PAD_X = 10;
const PAD_TOP = 22;
const PAD_BOTTOM = 22;

function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function TrendChart({ points, unit, formatValue = (v) => v.toFixed(1) }: TrendChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const titleId = useId();

  if (points.length < 2) {
    return (
      <p className="py-6 text-center text-xs text-neutral-400">
        Log a couple of weigh-ins to see your trend.
      </p>
    );
  }

  const sorted = [...points].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const values = sorted.map((p) => p.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueRange = maxValue - minValue || 1;

  const times = sorted.map((p) => new Date(p.date).getTime());
  const minTime = times[0];
  const maxTime = times[times.length - 1];
  const timeRange = maxTime - minTime || 1;

  const plotWidth = WIDTH - PAD_X * 2;
  const plotHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;

  const xAt = (time: number) => PAD_X + ((time - minTime) / timeRange) * plotWidth;
  const yAt = (value: number) => PAD_TOP + plotHeight - ((value - minValue) / valueRange) * plotHeight;

  const coords = sorted.map((p, i) => ({ x: xAt(times[i]), y: yAt(p.value), point: p }));
  const linePath = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L ${coords[coords.length - 1].x.toFixed(1)} ${PAD_TOP + plotHeight} L ${coords[0].x.toFixed(1)} ${PAD_TOP + plotHeight} Z`;

  const latest = sorted[sorted.length - 1];
  const active = activeIndex !== null ? coords[activeIndex] : null;
  const summary = `Trend from ${shortDate(sorted[0].date)} to ${shortDate(latest.date)}, latest ${formatValue(latest.value)}${unit}`;

  return (
    <div>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={summary}
        className="w-full"
      >
        <title id={titleId}>{summary}</title>

        {/* min/max reference lines */}
        <line x1={PAD_X} x2={WIDTH - PAD_X} y1={yAt(maxValue)} y2={yAt(maxValue)} className="stroke-neutral-200" strokeWidth={1} />
        <line x1={PAD_X} x2={WIDTH - PAD_X} y1={yAt(minValue)} y2={yAt(minValue)} className="stroke-neutral-200" strokeWidth={1} />
        <text x={PAD_X} y={yAt(maxValue) - 4} className="fill-neutral-400 text-[8px]">
          {formatValue(maxValue)}
          {unit}
        </text>
        <text x={PAD_X} y={yAt(minValue) + 9} className="fill-neutral-400 text-[8px]">
          {formatValue(minValue)}
          {unit}
        </text>

        {/* trend area + line */}
        <path d={areaPath} className="fill-emerald-600/10" />
        <path d={linePath} className="fill-none stroke-emerald-600" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

        {/* points (with oversized invisible hit targets for hover/focus) */}
        {coords.map((c, i) => {
          const isLatest = i === coords.length - 1;
          return (
            <g key={sorted[i].date + i}>
              <circle
                cx={c.x}
                cy={c.y}
                r={12}
                className="cursor-pointer fill-transparent"
                tabIndex={0}
                role="button"
                aria-label={`${shortDate(c.point.date)}: ${formatValue(c.point.value)}${unit}`}
                onMouseEnter={() => setActiveIndex(i)}
                onMouseLeave={() => setActiveIndex((cur) => (cur === i ? null : cur))}
                onFocus={() => setActiveIndex(i)}
                onBlur={() => setActiveIndex((cur) => (cur === i ? null : cur))}
              />
              <circle
                cx={c.x}
                cy={c.y}
                r={isLatest ? 5 : 4}
                className="fill-emerald-600 stroke-white"
                strokeWidth={2}
                pointerEvents="none"
              />
            </g>
          );
        })}

        {/* endpoint direct label */}
        <text
          x={coords[coords.length - 1].x}
          y={Math.max(10, coords[coords.length - 1].y - 10)}
          textAnchor="end"
          className="fill-neutral-600 text-[9px] font-medium"
        >
          {formatValue(latest.value)}
          {unit}
        </text>

        {/* x-axis date labels at the extremes */}
        <text x={PAD_X} y={HEIGHT - 6} className="fill-neutral-400 text-[8px]">
          {shortDate(sorted[0].date)}
        </text>
        <text x={WIDTH - PAD_X} y={HEIGHT - 6} textAnchor="end" className="fill-neutral-400 text-[8px]">
          {shortDate(latest.date)}
        </text>

        {/* hover/focus tooltip */}
        {active && (
          <g pointerEvents="none">
            <line x1={active.x} x2={active.x} y1={PAD_TOP} y2={PAD_TOP + plotHeight} className="stroke-neutral-300" strokeWidth={1} />
            <rect
              x={Math.min(Math.max(active.x - 34, PAD_X), WIDTH - PAD_X - 68)}
              y={4}
              width={68}
              height={16}
              rx={4}
              className="fill-neutral-900"
            />
            <text
              x={Math.min(Math.max(active.x, PAD_X + 34), WIDTH - PAD_X - 34)}
              y={15}
              textAnchor="middle"
              className="fill-white text-[9px] font-semibold"
            >
              {formatValue(active.point.value)}
              {unit} · {shortDate(active.point.date)}
            </text>
          </g>
        )}
      </svg>

      <details className="mt-1 text-xs text-neutral-500">
        <summary className="cursor-pointer select-none font-medium hover:text-neutral-700">
          View entries · {sorted.length}
        </summary>
        <ul className="mt-1.5 space-y-1 border-l border-neutral-200 pl-2.5">
          {[...sorted].reverse().map((p, i) => (
            <li key={p.date + i}>
              <span className="font-medium text-neutral-600">{formatRelativeDate(p.date)}</span>
              {" — "}
              {formatValue(p.value)}
              {unit}
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
