"use client";

import { ArrowRight, X } from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PipelineStageDrawer } from "./pipeline-stage-drawer";

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

const ROW_HEAT_COLORS = [
  "#89A8E6",
  "#A5BDEC",
  "#D1DDF5",
  "#EEF3FB",
  "#FFFCEB",
  "#FFF9DB",
];

// Stage → avg GMV per seller (calibrated: Onboarding×46 ≈ $12.8M)
const AVG_GMV_PER_SELLER: Record<string, number> = {
  Established: 3_400_000,
  Onboarding:    278_000,
  "New Lead":    180_000,
  Contacted:     140_000,
  Shortlisted:   110_000,
  Discovered:     70_000,
};

function cellGmv(stage: string, count: number): string {
  const avg = AVG_GMV_PER_SELLER[stage] ?? 200_000;
  return `$${((count * avg) / 1_000_000).toFixed(1)}M`;
}

// Badge colors mirror the lag-badge palette + text color from lag-badge.ts
const BADGE_TEXT = "#3c4043";

function cellHealth(count: number): { label: string; bg: string } {
  if (count >= 35) return { label: "On Track",        bg: "#D1F0D1" };
  if (count >= 20) return { label: "Needs Attention", bg: "#FFAB66" };
  return               { label: "At Risk",           bg: "#FAA69E" };
}

// ── Positioning — ported from treemap tooltip ─────────────────────────────────
const POPOVER_W = 260;
const POPOVER_H = 220;

/** Overlap popover onto the cell so the pointer never crosses another cell. */
const CELL_OVERLAP = 16;

function computePos(rect: DOMRect): { x: number; y: number; side: "right" | "left" | "below" } {
  const EDGE = 6;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Prefer right — overlap onto the cell
  let x = rect.right - CELL_OVERLAP;
  let y = rect.top;
  let side: "right" | "left" | "below" = "right";

  if (x + POPOVER_W > vw - EDGE) {
    x = rect.left - POPOVER_W + CELL_OVERLAP;
    side = "left";
  }
  if (x < EDGE) {
    x = Math.max(EDGE, rect.left);
    y = rect.bottom - CELL_OVERLAP;
    side = "below";
  }
  if (y + POPOVER_H > vh - EDGE) {
    y = vh - POPOVER_H - EDGE;
  }

  return { x: Math.max(EDGE, x), y: Math.max(EDGE, y), side };
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface HoverState {
  category: string;
  stage: string;
  value: number;
  pos: { x: number; y: number };
  /** Source cell rect — used to render an invisible hover bridge */
  anchor: DOMRect;
}

interface DrawerState {
  category: string;
  stage: string;
  count: number;
  colIndex: number;
  rowIndex: number;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function PipelineHeatmap({
  columns,
  rows,
  fyLabel = "FY 2025-26",
  className,
}: PipelineHeatmapProps) {
  const [hover, setHover] = useState<HoverState | null>(null);
  const [drawer, setDrawer] = useState<DrawerState | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (hideTimer.current) clearTimeout(hideTimer.current); }, []);

  function cancelHide() {
    if (hideTimer.current) { clearTimeout(hideTimer.current); hideTimer.current = null; }
  }

  function scheduleHide() {
    cancelHide();
    // 500ms gives enough time to cross the gap between the cell and the popover
    hideTimer.current = setTimeout(() => setHover(null), 500);
  }

  function handleCellEnter(
    e: React.MouseEvent<HTMLTableCellElement>,
    category: string,
    stage: string,
    value: number,
  ) {
    cancelHide();
    const anchor = e.currentTarget.getBoundingClientRect();
    const { x, y } = computePos(anchor);
    setHover({ category, stage, value, pos: { x, y }, anchor });
  }

  function openDrawer() {
    if (!hover) return;
    const colIndex = columns.indexOf(hover.category);
    const rowIndex = rows.findIndex((r) => r.stage === hover.stage);
    setDrawer({ category: hover.category, stage: hover.stage, count: hover.value, colIndex, rowIndex });
    setHover(null);
  }

  return (
    <>
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
              {columns.map((col) => <col key={col} />)}
            </colgroup>
            <thead>
              <tr className="align-top">
                <th className="bg-[var(--color-card)] pb-2 pl-0 pr-3 pt-0 text-left font-medium text-[var(--color-muted-foreground)]" />
                {columns.map((col) => (
                  <th key={col} className="bg-[var(--color-card)] px-1 pb-2 pt-0 text-center align-top font-medium text-[var(--color-muted-foreground)]">
                    <span className="block truncate" title={col}>{col}</span>
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
                    {row.values.map((value, colIndex) => {
                      const isHovered = hover?.category === columns[colIndex] && hover?.stage === row.stage;
                      return (
                        <td
                          key={`${row.stage}-${colIndex}`}
                          className="cursor-pointer border border-[#D6D6D6] px-1 py-2 text-center align-middle font-medium text-[var(--color-foreground)] transition-[filter]"
                          style={{
                            backgroundColor: rowColor,
                            outline: isHovered ? "2px solid var(--color-primary)" : "none",
                            outlineOffset: "-2px",
                            filter: isHovered ? "brightness(0.93)" : "none",
                          }}
                          onMouseEnter={(e) => handleCellEnter(e, columns[colIndex], row.stage, value)}
                          onMouseLeave={scheduleHide}
                        >
                          {value}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* ── Hover popover — same style + positioning as treemap tooltip ───── */}
      {hover && typeof document !== "undefined" &&
        createPortal(
          <>
            {/* Invisible bridge keeps hover alive while moving from cell → popover */}
            <div
              aria-hidden
              className="pointer-events-auto fixed z-[9998]"
              style={{
                left: Math.min(hover.anchor.left, hover.pos.x),
                top: Math.min(hover.anchor.top, hover.pos.y),
                width: Math.max(hover.anchor.right, hover.pos.x + POPOVER_W) - Math.min(hover.anchor.left, hover.pos.x),
                height: Math.max(hover.anchor.bottom, hover.pos.y + POPOVER_H) - Math.min(hover.anchor.top, hover.pos.y),
              }}
              onMouseEnter={cancelHide}
              onMouseLeave={scheduleHide}
            />
            <div
              className="pointer-events-auto w-[260px] rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card)] shadow-[var(--shadow-medium)]"
              style={{ position: "fixed", left: hover.pos.x, top: hover.pos.y, zIndex: 9999 }}
              onMouseEnter={cancelHide}
              onMouseLeave={scheduleHide}
            >
            {/* Header — min 12px gap between headline and close icon */}
            <div className="flex items-center justify-between gap-3 bg-[var(--color-drawer-header)] px-[var(--space-3)] py-[var(--space-2)]">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[var(--text-body-size)] font-semibold text-[var(--color-foreground)]">
                  {hover.category}
                </p>
                <p className="text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
                  {hover.stage}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setHover(null)}
                className="ml-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)]"
                aria-label="Close"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Potential GMV row */}
            <div className="flex items-center justify-between gap-3 px-[var(--space-3)] py-[var(--space-3)]">
              <span className="text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
                Potential GMV
              </span>
              <span className="text-[var(--text-body-size)] font-semibold text-[var(--color-foreground)]">
                {cellGmv(hover.stage, hover.value)}
              </span>
            </div>

            <div className="h-px bg-[var(--color-border)]" />

            {/* Pipeline Health row */}
            <div className="flex items-center justify-between gap-3 px-[var(--space-3)] py-[var(--space-3)]">
              <span className="text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
                Pipeline Health
              </span>
              {(() => {
                const h = cellHealth(hover.value);
                return (
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                    style={{ backgroundColor: h.bg, color: BADGE_TEXT }}
                  >
                    {h.label}
                  </span>
                );
              })()}
            </div>

            <div className="h-px bg-[var(--color-border)]" />

            {/* CTA */}
            <div className="px-[var(--space-2)] py-[var(--space-2)]">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={openDrawer}
                className="h-auto w-full justify-start px-[var(--space-1)] py-[var(--space-1)]"
              >
                View more details
                <ArrowRight className="h-3 w-3" aria-hidden />
              </Button>
            </div>
          </div>
          </>,
          document.body,
        )}

      {/* ── Stage drawer ─────────────────────────────────────────────────── */}
      {drawer && (
        <PipelineStageDrawer
          category={drawer.category}
          stage={drawer.stage}
          count={drawer.count}
          colIndex={drawer.colIndex}
          rowIndex={drawer.rowIndex}
          onClose={() => setDrawer(null)}
        />
      )}
    </>
  );
}
