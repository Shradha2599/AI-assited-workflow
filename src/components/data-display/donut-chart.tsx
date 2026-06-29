"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  title: string;
  total: string;
  segments: DonutSegment[];
  filterLabel?: string;
  className?: string;
}

export function DonutChart({
  title,
  total,
  segments,
  filterLabel = "Categories (8)",
  className,
}: DonutChartProps) {
  const totalValue = segments.reduce((sum, s) => sum + s.value, 0);
  const gapDegrees = 2;
  let cumulative = 0;

  const arcs = segments.map((segment) => {
    const sliceDegrees = (segment.value / totalValue) * 360 - gapDegrees;
    const start = cumulative + gapDegrees / 2;
    cumulative += (segment.value / totalValue) * 360;
    const end = start + sliceDegrees;
    return { ...segment, start, end };
  });

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

  return (
    <Card className={cn(className)}>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="text-[var(--text-section-size)] font-semibold">{title}</h3>
        <button
          type="button"
          className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 py-1 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]"
        >
          {filterLabel} ▾
        </button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <div className="relative">
            <svg width="180" height="180" viewBox="0 0 180 180" aria-hidden>
              <circle cx="90" cy="90" r="68" fill="none" stroke="var(--color-muted)" strokeWidth="18" />
              {arcs.map((arc) => (
                <path
                  key={arc.label}
                  d={describeArc(90, 90, 68, arc.start, arc.end)}
                  fill="none"
                  stroke={arc.color}
                  strokeWidth="18"
                  strokeLinecap="round"
                />
              ))}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-semibold text-[var(--color-foreground)]">{total}</span>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {segments.map((segment) => (
              <span
                key={segment.label}
                className="inline-flex items-center gap-1 rounded-[var(--radius-full)] border border-[var(--color-border)] px-2 py-0.5 text-[var(--text-label-size)] text-[var(--color-muted-foreground)]"
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: segment.color }}
                />
                {segment.label}
              </span>
            ))}
            <button
              type="button"
              className="rounded-[var(--radius-full)] border border-dashed border-[var(--color-border)] px-2 py-0.5 text-[var(--text-label-size)] text-[var(--color-primary)]"
            >
              + Competitor
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
