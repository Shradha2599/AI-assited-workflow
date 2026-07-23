"use client";

import { ArrowRight, X } from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { MARKER_BG } from "@/components/ui/marker-colors";
import { StatusTag } from "@/components/ui/status-tag";
import { TruncatedText } from "@/components/ui/truncated-text";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PipelineStageDrawer } from "./pipeline-stage-drawer";

export interface PipelineCategoryRow {
  category: string;
  values: number[];
}

interface PipelineHeatmapProps {
  stageColumns: string[];
  categoryRows: PipelineCategoryRow[];
  fyLabel?: string;
  categoryFilterLabel?: string;
  className?: string;
}

const CATEGORY_COLUMN_WIDTH = 140;

const STAGE_HEAT_COLORS = [
  "#89A8E6",
  "#A5BDEC",
  "#D1DDF5",
  "#EEF3FB",
  "#FFFCEB",
  "#FFF9DB",
];

const AVG_GMV_PER_SELLER: Record<string, number> = {
  Established: 3_400_000,
  Onboarding: 278_000,
  "New Lead": 180_000,
  Contacted: 140_000,
  Shortlisted: 110_000,
  Discovered: 70_000,
};

function cellGmv(stage: string, count: number): string {
  const avg = AVG_GMV_PER_SELLER[stage] ?? 200_000;
  return `$${((count * avg) / 1_000_000).toFixed(1)}M`;
}

function cellHealth(count: number): { label: string; bg: string } {
  if (count >= 35) return { label: "On Track", bg: MARKER_BG.green };
  if (count >= 20) return { label: "Needs Attention", bg: MARKER_BG.orange };
  return { label: "At Risk", bg: MARKER_BG.red };
}

const POPOVER_W = 260;
const POPOVER_H = 220;
const CELL_OVERLAP = 16;

function computePos(rect: DOMRect): { x: number; y: number } {
  const EDGE = 6;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let x = rect.right - CELL_OVERLAP;
  let y = rect.top;

  if (x + POPOVER_W > vw - EDGE) {
    x = rect.left - POPOVER_W + CELL_OVERLAP;
  }
  if (x < EDGE) {
    x = Math.max(EDGE, rect.left);
    y = rect.bottom - CELL_OVERLAP;
  }
  if (y + POPOVER_H > vh - EDGE) {
    y = vh - POPOVER_H - EDGE;
  }

  return { x: Math.max(EDGE, x), y: Math.max(EDGE, y) };
}

interface HoverState {
  category: string;
  stage: string;
  value: number;
  pos: { x: number; y: number };
  anchor: DOMRect;
}

interface DrawerState {
  category: string;
  stage: string;
  count: number;
  colIndex: number;
  rowIndex: number;
}

export function PipelineHeatmap({
  stageColumns,
  categoryRows,
  fyLabel = "FY 2025-26",
  categoryFilterLabel = "Categories (1)",
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
    const colIndex = stageColumns.indexOf(hover.stage);
    const rowIndex = categoryRows.findIndex((r) => r.category === hover.category);
    setDrawer({
      category: hover.category,
      stage: hover.stage,
      count: hover.value,
      colIndex,
      rowIndex,
    });
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
              {categoryFilterLabel} ▾
            </button>
          </div>
        </CardHeader>

        <CardContent className="min-w-0 overflow-x-auto p-[var(--space-4)] pt-0">
          <table className="w-full min-w-[640px] border-collapse text-[var(--text-caption-size)]">
            <colgroup>
              <col style={{ width: CATEGORY_COLUMN_WIDTH }} />
              {stageColumns.map((stage) => (
                <col key={stage} />
              ))}
            </colgroup>
            <thead>
              <tr className="align-top">
                <th className="bg-[var(--color-card)] pb-2 pl-0 pr-3 pt-0 text-left font-medium text-[var(--color-muted-foreground)]">
                  Category
                </th>
                {stageColumns.map((stage) => (
                  <th
                    key={stage}
                    className="bg-[var(--color-card)] px-1 pb-2 pt-0 text-center align-top font-medium text-[var(--color-muted-foreground)]"
                  >
                    <TruncatedText text={stage} className="text-center" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categoryRows.map((row, rowIndex) => (
                <tr key={row.category}>
                  <td className="bg-[var(--color-card)] px-0 py-2 pr-3 text-left align-middle font-medium text-[var(--color-foreground)]">
                    {row.category}
                  </td>
                  {row.values.map((value, colIndex) => {
                    const stage = stageColumns[colIndex];
                    const stageColor = STAGE_HEAT_COLORS[colIndex] ?? STAGE_HEAT_COLORS.at(-1)!;
                    const isHovered =
                      hover?.category === row.category && hover?.stage === stage;

                    return (
                      <td
                        key={`${row.category}-${stage}`}
                        className="cursor-pointer border border-[#D6D6D6] px-1 py-2 text-center align-middle font-medium text-[var(--color-foreground)] transition-[filter]"
                        style={{
                          backgroundColor: stageColor,
                          outline: isHovered ? "2px solid var(--color-primary)" : "none",
                          outlineOffset: "-2px",
                          filter: isHovered ? "brightness(0.93)" : "none",
                        }}
                        onMouseEnter={(e) => handleCellEnter(e, row.category, stage, value)}
                        onMouseLeave={scheduleHide}
                      >
                        {value}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {hover && typeof document !== "undefined" &&
        createPortal(
          <>
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
              <div className="flex items-center justify-between gap-3 bg-[var(--color-drawer-header)] px-[var(--space-3)] py-[var(--space-2)]">
                <div className="min-w-0 flex-1">
                  <TruncatedText
                    text={hover.category}
                    className="text-[var(--text-body-size)] font-semibold text-[var(--color-foreground)]"
                  />
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

              <div className="flex items-center justify-between gap-3 px-[var(--space-3)] py-[var(--space-3)]">
                <span className="text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
                  Potential GMV
                </span>
                <span className="text-[var(--text-body-size)] font-semibold text-[var(--color-foreground)]">
                  {cellGmv(hover.stage, hover.value)}
                </span>
              </div>

              <div className="h-px bg-[var(--color-border)]" />

              <div className="flex items-center justify-between gap-3 px-[var(--space-3)] py-[var(--space-3)]">
                <span className="text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
                  Pipeline Health
                </span>
                {(() => {
                  const h = cellHealth(hover.value);
                  return (
                    <StatusTag className="text-[10px]" style={{ backgroundColor: h.bg }}>
                      {h.label}
                    </StatusTag>
                  );
                })()}
              </div>

              <div className="h-px bg-[var(--color-border)]" />

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
