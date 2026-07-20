"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowDown, ArrowRight, Info, X } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TruncatedText } from "@/components/ui/truncated-text";
import type { TreemapGridConfig } from "@/lib/mock-data/treemap-hierarchy";
import { cn } from "@/lib/utils";

export type LagLevel = "high" | "medium-high" | "medium" | "low" | "par" | "ahead";

export interface TreemapItem {
  id: string;
  label: string;
  lag: LagLevel;
  gridArea?: string;
  revenue?: string;
  gapPercent?: string;
  competitorLeader?: string;
  categoryId?: string;
  drillDown?: boolean;
  opensDrawer?: string;
  children?: TreemapItem[];
}

const lagColors: Record<LagLevel, string> = {
  high: "#FAA69E",
  "medium-high": "#FFAB66",
  medium: "#FFE34D",
  low: "#FFE34D",
  par: "#D1F0D1",
  ahead: "#79D279",
};

const lagLegend = [
  { label: ">20% Lag", color: "#FAA69E" },
  { label: "10%-20% Lag", color: "#FFAB66" },
  { label: "5%-10% Lag", color: "#FFE34D" },
  { label: "0-5% At Par", color: "#D1F0D1" },
  { label: ">5% Ahead", color: "#79D279" },
];

interface CategoryTreemapProps {
  items: TreemapItem[];
  selectedId?: string | null;
  onSelect?: (item: TreemapItem) => void;
  onViewGaps?: (item: TreemapItem) => void;
  breadcrumbLabels?: string[];
  onBreadcrumbNavigate?: (index: number) => void;
  gridConfig?: TreemapGridConfig;
  competitors?: string[];
  className?: string;
}

export function CategoryTreemap({
  items,
  selectedId,
  onSelect,
  onViewGaps,
  breadcrumbLabels = [],
  onBreadcrumbNavigate,
  gridConfig = { columns: 5, rowTemplate: "1.2fr 1fr 0.8fr" },
  competitors = ["Amazon"],
  className,
}: CategoryTreemapProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [activeTileId, setActiveTileId] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  const activeItem = items.find((item) => item.id === activeTileId) ?? null;
  const gapCompetitor = competitors[0] ?? "Amazon";
  const isDrilledDown = breadcrumbLabels.length > 0;

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  function cancelHide() {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }

  function scheduleHide() {
    cancelHide();
    hideTimerRef.current = setTimeout(() => {
      setActiveTileId(null);
      setTooltipPos(null);
    }, 250);
  }

  function showTileTooltip(item: TreemapItem, event: React.MouseEvent<HTMLButtonElement>) {
    cancelHide();
    setActiveTileId(item.id);
    updateTooltipPosition(event);
  }

  function hideTileTooltip() {
    cancelHide();
    setActiveTileId(null);
    setTooltipPos(null);
  }

  function updateTooltipPosition(event: React.MouseEvent<HTMLButtonElement>) {
    const tileRect = event.currentTarget.getBoundingClientRect();
    const tooltipWidth = 232;
    const tooltipHeight = 280;
    const offset = 8;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Place tooltip to the right of the tile; fall back to left if it overflows viewport
    let x = tileRect.right + offset;
    let y = tileRect.top;

    if (x + tooltipWidth > vw - offset) {
      x = tileRect.left - tooltipWidth - offset;
    }
    // If still off-screen left, place below the tile
    if (x < offset) {
      x = Math.max(offset, tileRect.left);
      y = tileRect.bottom + offset;
    }
    // Clamp vertically
    if (y + tooltipHeight > vh - offset) {
      y = vh - tooltipHeight - offset;
    }

    setTooltipPos({
      x: Math.max(offset, x),
      y: Math.max(offset, y),
    });
  }

  function handleTileEnter(item: TreemapItem, event: React.MouseEvent<HTMLButtonElement>) {
    showTileTooltip(item, event);
  }

  return (
    <Card className={cn(className)}>
      <CardHeader className="space-y-3 px-6 pb-3 pt-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <h3 className="text-[var(--text-section-size)] font-semibold">Assortment Analysis</h3>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="rounded-[var(--radius-sm)] border border-dashed border-[var(--color-border)] px-2 py-1 text-[var(--text-caption-size)] text-[var(--color-primary)]"
              >
                + Competitor
              </button>
              {competitors.map((competitor) => (
                <span
                  key={competitor}
                  className="inline-flex items-center gap-1 rounded-[var(--radius-full)] border border-[var(--color-border)] px-2 py-0.5 text-[var(--text-caption-size)]"
                >
                  {competitor}
                  <button type="button" className="text-[var(--color-muted-foreground)]" aria-label={`Remove ${competitor}`}>
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap justify-end gap-3">
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
        </div>
      </CardHeader>

      <CardContent className="overflow-visible px-6 pb-6 pt-0">
        <nav
          aria-label="Category breadcrumb"
          className="mb-2 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]"
        >
          {isDrilledDown ? (
            <>
              <button
                type="button"
                onClick={() => onBreadcrumbNavigate?.(-1)}
                className="font-normal hover:text-[var(--color-primary)] hover:underline"
              >
                All Categories
              </button>
              {breadcrumbLabels.map((label, index) => {
                const isLast = index === breadcrumbLabels.length - 1;
                return (
                  <span key={`${label}-${index}`}>
                    {" "}
                    /{" "}
                    {isLast ? (
                      <span className="font-semibold text-[var(--color-foreground)]">{label}</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onBreadcrumbNavigate?.(index)}
                        className="hover:text-[var(--color-primary)] hover:underline"
                      >
                        {label}
                      </button>
                    )}
                  </span>
                );
              })}
            </>
          ) : (
            <span className="font-semibold text-[var(--color-foreground)]">All Categories</span>
          )}
        </nav>

        <div
          ref={gridRef}
          className="relative grid w-full gap-0.5"
          style={{
            height: isDrilledDown ? "17.5rem" : items.length > 0 ? "14rem" : "6rem",
            gridTemplateColumns: `repeat(${gridConfig.columns}, minmax(0, 1fr))`,
            gridTemplateRows: gridConfig.rowTemplate,
          }}
        >
          {items.length === 0 ? (
            <div className="col-span-full flex items-center justify-center text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
              No categories match the current filter
            </div>
          ) : null}
          {items.map((item) => {
            const isActive = activeTileId === item.id;
            const isSelected = selectedId === item.id;
            const hasChildren = (item.children?.length ?? 0) > 0;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect?.(item)}
                onMouseEnter={(e) => handleTileEnter(item, e)}
                onMouseMove={(e) => {
                  if (activeTileId !== item.id) handleTileEnter(item, e);
                }}
                onMouseLeave={scheduleHide}
                className={cn(
                  "relative flex items-start justify-start p-2 text-left text-[var(--text-caption-size)] font-medium text-[var(--color-foreground)] transition-[box-shadow,filter,transform] duration-150",
                  isActive && "z-20 scale-[1.02] brightness-[0.92] shadow-[var(--shadow-medium)]",
                  isSelected && "z-10 ring-2 ring-[var(--color-primary)] ring-offset-1",
                  isActive && !isSelected && "ring-2 ring-[var(--color-foreground)]/30 ring-offset-1",
                  hasChildren && "cursor-pointer",
                )}
                style={{
                  backgroundColor: lagColors[item.lag],
                  gridArea: item.gridArea,
                }}
              >
                <span className="line-clamp-2 leading-snug">{item.label}</span>
              </button>
            );
          })}

          {activeItem && tooltipPos && typeof document !== "undefined" &&
            createPortal(
              <TreemapTooltip
                item={activeItem}
                gapCompetitor={gapCompetitor}
                style={{ position: "fixed", left: tooltipPos.x, top: tooltipPos.y, zIndex: 9999 }}
                onViewGaps={
                  onViewGaps
                    ? () => {
                        onViewGaps(activeItem);
                        hideTileTooltip();
                      }
                    : undefined
                }
                onClose={hideTileTooltip}
                onMouseEnter={cancelHide}
                onMouseLeave={scheduleHide}
              />,
              document.body,
            )}
        </div>
      </CardContent>
    </Card>
  );
}

export function TreemapTooltip({
  item,
  gapCompetitor,
  style,
  onViewGaps,
  onClose,
  onMouseEnter,
  onMouseLeave,
}: {
  item: TreemapItem;
  gapCompetitor: string;
  style?: React.CSSProperties;
  onViewGaps?: () => void;
  onClose?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  const hasChildren = (item.children?.length ?? 0) > 0;
  // Show "View Item Gaps" on every tile when a handler is provided
  const showViewGaps = Boolean(onViewGaps);

  return (
    <div
      className="pointer-events-auto w-[232px] rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card)] shadow-[var(--shadow-medium)]"
      style={style}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 bg-[var(--color-drawer-header)] px-[var(--space-3)] py-[var(--space-2)]">
        <TruncatedText
          text={item.label}
          className="min-w-0 text-[var(--text-body-size)] font-semibold text-[var(--color-foreground)]"
        />
        <button
          type="button"
          onClick={onClose}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)]"
          aria-label="Close tooltip"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Revenue Opportunity */}
      <div className="flex items-center justify-between gap-3 px-[var(--space-3)] py-[var(--space-3)]">
        <span className="text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
          Revenue Opportunity
        </span>
        <span className="text-[var(--text-body-size)] font-semibold text-[var(--color-foreground)]">
          {item.revenue ?? "—"}
        </span>
      </div>

      <div className="h-px bg-[var(--color-border)]" />

      {/* Gaps Identified */}
      <div className="px-[var(--space-3)] py-[var(--space-3)]">
        <p className="mb-[var(--space-2)] text-[var(--text-body-size)] font-semibold text-[var(--color-foreground)]">
          Gaps Identified
        </p>
        <div className="flex items-center justify-between gap-3">
          <span className="text-[var(--text-caption-size)] text-[var(--color-foreground)]">
            {gapCompetitor}
          </span>
          {item.gapPercent && (
            <span className="inline-flex items-center gap-0.5 text-[var(--text-caption-size)] font-semibold text-[#e37400]">
              <ArrowDown className="h-3 w-3" aria-hidden />
              {item.gapPercent}
            </span>
          )}
        </div>
        <p className="mt-[var(--space-2)] flex items-start gap-1 text-[10px] leading-snug text-[#757575]">
          <Info className="mt-0.5 h-2.5 w-2.5 shrink-0" aria-hidden />
          {hasChildren ? "Click on the tile to drill down" : "Click on the tile to view details"}
        </p>
      </div>

      {showViewGaps && (
        <>
          <div className="h-px bg-[var(--color-border)]" aria-hidden />
          <div className="px-[var(--space-2)] py-[var(--space-2)]">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onViewGaps}
              onMouseDown={(e) => e.stopPropagation()}
              className="h-auto w-full justify-start px-[var(--space-1)] py-[var(--space-1)]"
            >
              View Item Gaps
              <ArrowRight className="h-3 w-3" aria-hidden />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
