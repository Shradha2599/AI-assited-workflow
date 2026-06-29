"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type LagLevel = "high" | "medium-high" | "medium" | "low" | "par" | "ahead";

export interface TreemapItem {
  id: string;
  label: string;
  lag: LagLevel;
  gridArea?: string;
  revenue?: string;
  gapPercent?: string;
  drillDown?: boolean;
  opensDrawer?: string;
}

const lagColors: Record<LagLevel, string> = {
  high: "var(--color-lag-high)",
  "medium-high": "var(--color-lag-medium-high)",
  medium: "var(--color-lag-medium)",
  low: "var(--color-lag-low)",
  par: "var(--color-lag-par)",
  ahead: "var(--color-lag-ahead)",
};

const lagLegend = [
  { label: ">20% Lag", color: "var(--color-lag-high)" },
  { label: "10%-20% Lag", color: "var(--color-lag-medium-high)" },
  { label: "5%-10% Lag", color: "var(--color-lag-medium)" },
  { label: "0-5% At Par", color: "var(--color-lag-par)" },
  { label: ">5% Ahead", color: "var(--color-lag-ahead)" },
];

interface CategoryTreemapProps {
  items: TreemapItem[];
  selectedId?: string | null;
  hoveredId?: string | null;
  onSelect?: (item: TreemapItem) => void;
  onHover?: (item: TreemapItem | null) => void;
  breadcrumb?: string;
  onBack?: () => void;
  className?: string;
}

export function CategoryTreemap({
  items,
  selectedId,
  hoveredId,
  onSelect,
  onHover,
  breadcrumb,
  onBack,
  className,
}: CategoryTreemapProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader className="space-y-3 pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="text-[var(--text-caption-size)] font-medium text-[var(--color-primary)] hover:underline"
              >
                ← All Categories
              </button>
            )}
            <h3 className="text-[var(--text-section-size)] font-semibold">
              Assortment Analysis
              {breadcrumb && (
                <span className="ml-1 font-normal text-[var(--color-muted-foreground)]">
                  / {breadcrumb}
                </span>
              )}
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 py-1 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]"
            >
              View by Category ▾
            </button>
            <button
              type="button"
              className="rounded-[var(--radius-sm)] border border-dashed border-[var(--color-border)] px-2 py-1 text-[var(--text-caption-size)] text-[var(--color-primary)]"
            >
              + Competitor
            </button>
            <span className="inline-flex items-center gap-1 rounded-[var(--radius-full)] border border-[var(--color-border)] px-2 py-0.5 text-[var(--text-caption-size)]">
              Amazon
              <button type="button" className="text-[var(--color-muted-foreground)]" aria-label="Remove Amazon">
                ×
              </button>
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {lagLegend.map((item) => (
            <span
              key={item.label}
              className="inline-flex items-center gap-1 text-[var(--text-label-size)] text-[var(--color-muted-foreground)]"
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
              {item.label}
            </span>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div
          className="relative grid h-56 gap-1"
          style={{
            gridTemplateColumns: breadcrumb ? "repeat(4, 1fr)" : "2fr 1fr 1fr 0.6fr 0.5fr",
            gridTemplateRows: breadcrumb ? "1fr 1.2fr 0.8fr" : "1.2fr 1fr 0.8fr",
          }}
        >
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect?.(item)}
              onMouseEnter={() => item.revenue && onHover?.(item)}
              onMouseLeave={() => onHover?.(null)}
              className={cn(
                "flex items-start justify-start rounded-[var(--radius-sm)] p-2 text-left text-[var(--text-caption-size)] font-medium text-white transition-opacity hover:opacity-90",
                (selectedId === item.id || hoveredId === item.id) &&
                  "ring-2 ring-white/70 ring-offset-1",
              )}
              style={{
                backgroundColor: lagColors[item.lag],
                gridArea: item.gridArea,
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="mt-3 text-[var(--text-caption-size)] font-medium text-[var(--color-primary)] hover:underline"
        >
          View All Products →
        </button>
      </CardContent>
    </Card>
  );
}

export function TreemapTooltip({
  item,
  onViewGaps,
  onMouseEnter,
  onMouseLeave,
}: {
  item: TreemapItem;
  onClose?: () => void;
  onViewGaps?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  if (!item.revenue) return null;

  return (
    <div
      className="absolute left-3 top-3 z-10 w-48 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card)] p-3 shadow-[var(--shadow-medium)]"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <p className="text-[var(--text-body-size)] font-semibold leading-tight">{item.label}</p>

      <p className="mt-2.5 text-[10px] uppercase tracking-wide text-[var(--color-muted-foreground)]">
        Revenue Opportunity
      </p>
      <p className="text-[var(--text-section-size)] font-bold text-[var(--color-foreground)]">
        {item.revenue}
      </p>

      <div className="mt-2.5 flex items-center gap-1.5">
        <span className="text-[10px] text-[var(--color-muted-foreground)]">Amazon</span>
        <span className="inline-flex items-center gap-0.5 rounded-full bg-orange-50 px-1.5 py-0.5 text-[10px] font-semibold text-orange-600">
          ↓ {item.gapPercent}
        </span>
      </div>

      <p className="mt-2 text-[10px] text-[var(--color-muted-foreground)]">
        Click on the tile to drill down
      </p>

      {onViewGaps && (
        <button
          type="button"
          onClick={onViewGaps}
          onMouseDown={(e) => e.stopPropagation()}
          className="mt-2 text-[var(--text-caption-size)] font-medium text-[var(--color-primary)] hover:underline"
        >
          View Item Gaps →
        </button>
      )}
    </div>
  );
}
