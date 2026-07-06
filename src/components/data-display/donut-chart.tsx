"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";

import { AmChartCard } from "@/components/data-display/am-chart-card";
import { cn } from "@/lib/utils";

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
  revenue: string;
}

interface DonutChartProps {
  title: string;
  total: string;
  segments: DonutSegment[];
  filterLabel?: string;
  className?: string;
}

const LOCKED_LABELS = new Set(["Target", "Walmart", "Amazon"]);
const CX = 100;
const CY = 100;
const RADIUS = 72;
const STROKE_WIDTH = 28;
const GAP_DEGREES = 2;

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

export function DonutChart({
  title,
  total,
  segments: initialSegments,
  filterLabel = "Categories (8)",
  className,
}: DonutChartProps) {
  const [segments, setSegments] = useState(initialSegments);
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);

  const arcs = useMemo(() => {
    const totalValue = segments.reduce((sum, s) => sum + s.value, 0);
    if (totalValue === 0) return [];

    let cumulative = 0;
    return segments.map((segment) => {
      const sliceDegrees = (segment.value / totalValue) * 360 - GAP_DEGREES;
      const start = cumulative + GAP_DEGREES / 2;
      cumulative += (segment.value / totalValue) * 360;
      const end = start + sliceDegrees;
      const mid = start + sliceDegrees / 2;
      const labelPos = polarToCartesian(CX, CY, RADIUS, mid);
      return { ...segment, start, end, mid, labelPos };
    });
  }, [segments]);

  const hovered = arcs.find((arc) => arc.label === hoveredLabel);

  function removeSegment(label: string) {
    setSegments((current) => current.filter((segment) => segment.label !== label));
    setHoveredLabel(null);
  }

  return (
    <AmChartCard title={title} filterLabel={filterLabel} className={className}>
      <div className="relative flex flex-col items-start">
          <div className="relative mx-auto">
            <svg width="200" height="200" viewBox="0 0 200 200" aria-hidden className="max-w-full">
              <circle
                cx={CX}
                cy={CY}
                r={RADIUS}
                fill="none"
                stroke="var(--color-muted)"
                strokeWidth={STROKE_WIDTH}
              />
              {arcs.map((arc) => (
                <path
                  key={arc.label}
                  d={describeArc(CX, CY, RADIUS, arc.start, arc.end)}
                  fill="none"
                  stroke={arc.color}
                  strokeWidth={STROKE_WIDTH}
                  strokeLinecap="round"
                  className="cursor-pointer transition-opacity"
                  style={{ opacity: hoveredLabel && hoveredLabel !== arc.label ? 0.45 : 1 }}
                  onMouseEnter={() => setHoveredLabel(arc.label)}
                  onMouseLeave={() => setHoveredLabel(null)}
                />
              ))}
              {arcs.map((arc) => (
                <text
                  key={`${arc.label}-pct`}
                  x={arc.labelPos.x}
                  y={arc.labelPos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="pointer-events-none fill-[var(--color-foreground)] text-[10px] font-semibold"
                >
                  {arc.value}%
                </text>
              ))}
            </svg>

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-semibold text-[var(--color-foreground)]">{total}</span>
            </div>

            {hovered && (
              <div
                className="pointer-events-none absolute z-10 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 shadow-[var(--shadow-medium)]"
                style={{
                  left: hovered.labelPos.x,
                  top: hovered.labelPos.y - 48,
                  transform: "translateX(-50%)",
                }}
              >
                <p className="whitespace-nowrap text-[var(--text-caption-size)] font-semibold text-[var(--color-foreground)]">
                  {hovered.label}
                </p>
                <p className="whitespace-nowrap text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">
                  {hovered.revenue} revenue · {hovered.value}% share
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 flex w-full flex-wrap items-start gap-2">
            {segments.map((segment) => {
              const isLocked = LOCKED_LABELS.has(segment.label);
              return (
                <span
                  key={segment.label}
                  className="inline-flex w-fit max-w-full items-center gap-1.5 rounded-[var(--radius-full)] border border-[var(--color-border)] px-2.5 py-1 text-[var(--text-label-size)] text-[var(--color-muted-foreground)]"
                >
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: segment.color }}
                  />
                  <span className="whitespace-nowrap">{segment.label}</span>
                  {!isLocked && (
                    <button
                      type="button"
                      onClick={() => removeSegment(segment.label)}
                      className="shrink-0 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
                      aria-label={`Remove ${segment.label}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </span>
              );
            })}
            <button
              type="button"
              className="inline-flex w-fit rounded-[var(--radius-full)] border border-dashed border-[var(--color-border)] px-2.5 py-1 text-[var(--text-label-size)] text-[var(--color-primary)]"
            >
              + Competitor
            </button>
          </div>
        </div>
    </AmChartCard>
  );
}
