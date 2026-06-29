"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PipelineRow {
  stage: string;
  values: number[];
}

interface PipelineHeatmapProps {
  columns: string[];
  rows: PipelineRow[];
  fyLabel?: string;
  className?: string;
}

function heatmapColor(value: number, min: number, max: number): string {
  const ratio = (value - min) / (max - min);
  if (ratio > 0.7) return "var(--color-heatmap-high)";
  if (ratio > 0.4) return "#aecbfa";
  if (ratio > 0.2) return "#d2e3fc";
  return "var(--color-heatmap-low)";
}

export function PipelineHeatmap({
  columns,
  rows,
  fyLabel = "FY 2025-26",
  className,
}: PipelineHeatmapProps) {
  const allValues = rows.flatMap((r) => r.values);
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);

  return (
    <Card className={cn(className)}>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="text-[var(--text-section-size)] font-semibold">Pipeline Overview</h3>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 py-1 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]"
          >
            {fyLabel} ▾
          </button>
          <button
            type="button"
            className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 py-1 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]"
          >
            Categories (8) ▾
          </button>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-center text-[var(--text-caption-size)]">
          <thead>
            <tr>
              <th className="pb-2 text-left font-medium text-[var(--color-muted-foreground)]" />
              {columns.map((col) => (
                <th
                  key={col}
                  className="px-1 pb-2 font-medium text-[var(--color-muted-foreground)]"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.stage}>
                <td className="py-1 pr-2 text-left font-medium text-[var(--color-foreground)]">
                  {row.stage}
                </td>
                {row.values.map((value, i) => (
                  <td key={i} className="p-0.5">
                    <div
                      className="rounded-[var(--radius-sm)] px-1 py-2 font-medium text-[var(--color-foreground)]"
                      style={{ backgroundColor: heatmapColor(value, min, max) }}
                    >
                      {value}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
