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

const STAGE_COLUMN_WIDTH = 132;
const DATA_CELL_BORDER = "#D6D6D6";

const ROW_HEAT_COLORS = [
  "#89A8E6",
  "#A5BDEC",
  "#D1DDF5",
  "#EEF3FB",
  "#FFFCEB",
  "#FFF9DB",
];

export function PipelineHeatmap({
  columns,
  rows,
  fyLabel = "FY 2025-26",
  className,
}: PipelineHeatmapProps) {
  return (
    <Card className={cn("min-w-0 overflow-hidden", className)}>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="text-[var(--text-section-size)] font-semibold">Pipeline Overview</h3>
        <div className="flex shrink-0 gap-2">
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
      <CardContent className="min-w-0 overflow-hidden p-[var(--space-4)] pt-0">
        <table className="w-full table-fixed border-collapse text-[var(--text-caption-size)]">
          <colgroup>
            <col style={{ width: STAGE_COLUMN_WIDTH }} />
            {columns.map((col) => (
              <col key={col} />
            ))}
          </colgroup>
          <thead>
            <tr className="align-top">
              <th className="bg-[var(--color-card)] pb-2 pl-0 pr-3 pt-0 text-left font-medium text-[var(--color-muted-foreground)]" />
              {columns.map((col) => (
                <th
                  key={col}
                  className="bg-[var(--color-card)] px-1 pb-2 pt-0 text-center align-top font-medium text-[var(--color-muted-foreground)]"
                >
                  <span className="block truncate" title={col}>
                    {col}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => {
              const rowColor = ROW_HEAT_COLORS[rowIndex] ?? ROW_HEAT_COLORS.at(-1)!;
              return (
                <tr key={row.stage}>
                  <td className="bg-[var(--color-card)] px-0 py-2 pr-3 text-left align-middle font-medium text-[var(--color-foreground)]">
                    {row.stage}
                  </td>
                  {row.values.map((value, colIndex) => (
                    <td
                      key={`${row.stage}-${colIndex}`}
                      className="border border-[#D6D6D6] px-1 py-2 text-center align-middle font-medium text-[var(--color-foreground)]"
                      style={{ backgroundColor: rowColor }}
                    >
                      {value}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
