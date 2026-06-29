"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface GapBar {
  label: string;
  value: number;
}

interface GapBarChartProps {
  title?: string;
  data: GapBar[];
  filterLabel?: string;
  className?: string;
}

const Y_TICKS = [40, 30, 25, 20, 15, 10, 5];

export function GapBarChart({
  title = "Assortment Gap Analysis",
  data,
  filterLabel = "Categories (8)",
  className,
}: GapBarChartProps) {
  const maxValue = 40;

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
        <div className="flex gap-2">
          <div className="flex h-52 flex-col justify-between py-1 text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">
            {Y_TICKS.map((tick) => (
              <span key={tick}>{tick}%</span>
            ))}
          </div>
          <div className="relative flex flex-1 items-end gap-2 border-l border-b border-[var(--color-border)] pl-2 pb-1">
            {Y_TICKS.slice(0, -1).map((tick) => (
              <div
                key={tick}
                className="pointer-events-none absolute left-0 right-0 border-t border-dashed border-[var(--color-border)]/60"
                style={{ bottom: `${(tick / maxValue) * 100}%` }}
              />
            ))}
            {data.map((bar) => (
              <div key={bar.label} className="relative z-[1] flex flex-1 flex-col items-center gap-1">
                <span className="text-[var(--text-label-size)] font-medium text-[var(--color-foreground)]">
                  {bar.value}%
                </span>
                <div
                  className="w-full rounded-t-[var(--radius-sm)] bg-[#fa7b17]"
                  style={{ height: `${(bar.value / maxValue) * 100}%`, minHeight: 6 }}
                />
                <span className="max-w-[52px] truncate text-center text-[var(--text-label-size)] leading-tight text-[var(--color-muted-foreground)]">
                  {bar.label}
                </span>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-2 pl-8 text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">Gap%</p>
      </CardContent>
    </Card>
  );
}
