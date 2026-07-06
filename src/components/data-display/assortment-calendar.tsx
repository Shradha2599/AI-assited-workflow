"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { GripVertical, Loader2, MessageSquare, Sparkles, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  usePlanStore,
  type ScheduledCalendarItem,
} from "@/features/assortment-plan/store/plan-store";

// ─── Calendar structure ───────────────────────────────────────────────────────

const MONTHS = [
  "Nov", "Dec", "Jan",   // Q1
  "Feb", "Mar", "Apr",   // Q2
  "May", "Jun", "Jul",   // Q3
  "Aug", "Sep", "Oct",   // Q4
];

// 4 equal quarters of 3 months each
const QUARTER_SPANS = [
  { label: "Q1", months: 3 },
  { label: "Q2", months: 3 },
  { label: "Q3", months: 3 },
  { label: "Q4", months: 3 },
];

// Seasons mapped to month indices (0 = Nov … 11 = Oct)
const SEASON_SPANS = [
  { label: "Fall",   span: 2 }, // Nov, Dec
  { label: "Winter", span: 2 }, // Jan, Feb
  { label: "Spring", span: 2 }, // Mar, Apr
  { label: "Summer", span: 3 }, // May, Jun, Jul
  { label: "Fall",   span: 3 }, // Aug, Sep, Oct
];

// One event label per month (empty string = nothing to show)
const EVENTS_PER_MONTH = [
  "Thanksgiving & C.", // Nov
  "",                  // Dec (Christmas absorbed above)
  "New Year",          // Jan
  "Valentine's",       // Feb
  "",                  // Mar
  "Easter",            // Apr
  "Labour Day",        // May
  "",                  // Jun
  "",                  // Jul
  "BTS / BTC",         // Aug
  "",                  // Sep
  "Halloween",         // Oct
];

// Quarter boundary indices (after which months a thick divider appears)
const QUARTER_BOUNDARIES = new Set([2, 5, 8]); // after index 2, 5, 8 (0-based)

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Derive a category row label from an item name */
function rowForItem(itemName: string): string {
  const lower = itemName.toLowerCase();
  if (lower.includes("light") || lower.includes("lamp") || lower.includes("pendant")) {
    return "Lighting";
  }
  return "Kitchen & Dining";
}

const LANE_HEIGHT = 48;

const ROW_COLORS: Record<string, { bg: string; border: string; text: string; handle: string }> = {
  "Kitchen & Dining": {
    bg: "bg-orange-50",
    border: "border-orange-300",
    text: "text-orange-900",
    handle: "bg-orange-300/40",
  },
  Lighting: {
    bg: "bg-amber-50",
    border: "border-amber-300",
    text: "text-amber-900",
    handle: "bg-amber-300/40",
  },
};
const DEFAULT_ROW_COLOR = {
  bg: "bg-blue-50",
  border: "border-blue-300",
  text: "text-blue-900",
  handle: "bg-blue-300/40",
};

function allocateLanes(items: ScheduledCalendarItem[]): Map<string, number> {
  const sorted = [...items].sort((a, b) => a.startMonth - b.startMonth);
  const laneEnds: number[] = [];
  const map = new Map<string, number>();
  for (const item of sorted) {
    let placed = false;
    for (let i = 0; i < laneEnds.length; i++) {
      if (laneEnds[i] <= item.startMonth) {
        laneEnds[i] = item.startMonth + item.span;
        map.set(item.id, i);
        placed = true;
        break;
      }
    }
    if (!placed) {
      map.set(item.id, laneEnds.length);
      laneEnds.push(item.startMonth + item.span);
    }
  }
  return map;
}

// ─── Component ───────────────────────────────────────────────────────────────

interface AssortmentCalendarProps {
  className?: string;
}

export function AssortmentCalendar({ className }: AssortmentCalendarProps) {
  const planItems = usePlanStore((s) => s.planItems);
  const scheduledItems = usePlanStore((s) => s.scheduledItems);
  const addPlanItem = usePlanStore((s) => s.addPlanItem);
  const removePlanItem = usePlanStore((s) => s.removePlanItem);
  const scheduleItem = usePlanStore((s) => s.scheduleItem);
  const removeScheduledItem = usePlanStore((s) => s.removeScheduledItem);
  const updateScheduledItemSpan = usePlanStore((s) => s.updateScheduledItemSpan);
  const setScheduledItems = usePlanStore((s) => s.setScheduledItems);

  const [draggingItem, setDraggingItem] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{ row: string; month: number } | null>(null);
  const [resizeOverride, setResizeOverride] = useState<{ id: string; span: number } | null>(null);
  const [generating, setGenerating] = useState(false);

  const tableRef = useRef<HTMLDivElement>(null);

  // Derive unique rows only from scheduled items
  const activeRows = useMemo(() => {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const item of scheduledItems) {
      if (!seen.has(item.row)) {
        seen.add(item.row);
        result.push(item.row);
      }
    }
    // Stable order: Kitchen first, then Lighting, then others
    result.sort((a, b) => {
      const priority: Record<string, number> = { "Kitchen & Dining": 0, Lighting: 1 };
      return (priority[a] ?? 99) - (priority[b] ?? 99);
    });
    return result;
  }, [scheduledItems]);

  const laneMaps = useMemo(() => {
    const result: Record<string, Map<string, number>> = {};
    for (const row of activeRows) {
      const rowItems = scheduledItems
        .filter((item) => item.row === row)
        .map((item) =>
          item.id === resizeOverride?.id ? { ...item, span: resizeOverride.span } : item,
        );
      result[row] = allocateLanes(rowItems);
    }
    return result;
  }, [scheduledItems, activeRows, resizeOverride]);

  const rowLaneCounts = useMemo(() => {
    const result: Record<string, number> = {};
    for (const row of activeRows) {
      const vals = [...(laneMaps[row]?.values() ?? [])];
      result[row] = vals.length === 0 ? 1 : Math.max(...vals) + 1;
    }
    return result;
  }, [laneMaps, activeRows]);

  const handleDragStart = useCallback((label: string) => setDraggingItem(label), []);
  const handleDragEnd = useCallback(() => {
    setDraggingItem(null);
    setDropTarget(null);
  }, []);

  const handleDrop = useCallback(
    (row: string, month: number) => {
      if (!draggingItem) return;
      scheduleItem(draggingItem, row, month, 3);
      if (!planItems.includes(draggingItem)) addPlanItem(draggingItem);
      setDraggingItem(null);
      setDropTarget(null);
    },
    [draggingItem, scheduleItem, addPlanItem, planItems],
  );

  // When dropping on the empty body, derive row from item name
  const handleDropOnEmpty = useCallback(
    (month: number) => {
      if (!draggingItem) return;
      const row = rowForItem(draggingItem);
      handleDrop(row, month);
    },
    [draggingItem, handleDrop],
  );

  function handleResizeStart(e: React.MouseEvent, item: ScheduledCalendarItem) {
    e.preventDefault();
    e.stopPropagation();
    if (!tableRef.current) return;
    const containerWidth = tableRef.current.clientWidth;
    const cellWidth = containerWidth / 12;
    const startX = e.clientX;
    const initialSpan = item.span;

    function onMouseMove(ev: MouseEvent) {
      const delta = Math.round((ev.clientX - startX) / cellWidth);
      const newSpan = Math.max(1, Math.min(12 - item.startMonth, initialSpan + delta));
      setResizeOverride({ id: item.id, span: newSpan });
    }

    function onMouseUp(ev: MouseEvent) {
      const delta = Math.round((ev.clientX - startX) / cellWidth);
      const finalSpan = Math.max(1, Math.min(12 - item.startMonth, initialSpan + delta));
      updateScheduledItemSpan(item.id, finalSpan);
      setResizeOverride(null);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }

  async function handleGenerateCalendar() {
    if (planItems.length === 0) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/generate-calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planItems }),
      });
      if (!res.ok) throw new Error("API error");
      const { scheduledItems: generated } = (await res.json()) as {
        scheduledItems: Omit<ScheduledCalendarItem, "id">[];
      };
      const withIds: ScheduledCalendarItem[] = generated.map((item, i) => ({
        ...item,
        id: `gen-${Date.now()}-${i}`,
      }));
      setScheduledItems(withIds);
    } catch {
      // silent — keep existing schedule on failure
    } finally {
      setGenerating(false);
    }
  }

  // ─── Shared header cell style ───────────────────────────────────────────────
  const headerYellow = "bg-[#F9C74F] text-[#5C4A00]";
  const headerYellowLight = "bg-[#FEF08A]/60 text-[#5C4A00]";
  const headerWhite = "bg-white text-[var(--color-muted-foreground)]";

  return (
    <div className={cn("space-y-[var(--space-4)]", className)}>
      {/* ── Assortment Plan strip ─────────────────────────────────────────── */}
      <Card className="p-[var(--space-4)]">
        <div className="mb-3 flex items-center gap-2">
          <h3 className="text-[var(--text-section-size)] font-semibold">Assortment Plan</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {planItems.map((item) => (
            <span
              key={item}
              draggable
              onDragStart={() => handleDragStart(item)}
              onDragEnd={handleDragEnd}
              className={cn(
                "inline-flex cursor-grab items-center gap-1 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-card)] px-2 py-1.5 text-[var(--text-caption-size)] shadow-[var(--shadow-low)] transition-opacity active:cursor-grabbing",
                draggingItem === item && "opacity-50 ring-2 ring-[var(--color-primary)]",
              )}
            >
              <GripVertical className="h-3 w-3 shrink-0 text-[var(--color-muted-foreground)]" aria-hidden />
              {item}
              <button
                type="button"
                onClick={() => removePlanItem(item)}
                aria-label={`Remove ${item}`}
                className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {planItems.length === 0 && (
            <p className="text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
              Add items from the Gap Analysis page, then generate or drag them onto the calendar.
            </p>
          )}
        </div>
        <div className="mt-3 flex gap-2">
          <Button variant="outline" size="sm">+ Item Types</Button>
          <Button
            size="sm"
            onClick={handleGenerateCalendar}
            disabled={generating || planItems.length === 0}
          >
            {generating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            {generating ? "Generating…" : "Generate Calendar"}
          </Button>
        </div>
      </Card>

      {/* ── Calendar grid ─────────────────────────────────────────────────── */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] p-[var(--space-4)]">
          <h3 className="text-[var(--text-section-size)] font-semibold">Calendar Plan 2025-26</h3>
          <button
            type="button"
            className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 py-1 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]"
          >
            Version 1 ▾
          </button>
        </div>

        <div className="overflow-x-auto" ref={tableRef}>
          <table className="w-full min-w-[860px] border-collapse text-center text-[var(--text-caption-size)]">
            <colgroup>
              {/* Label column */}
              <col style={{ width: "110px", minWidth: "110px" }} />
              {MONTHS.map((_, i) => (
                <col key={i} />
              ))}
            </colgroup>

            <thead>
              {/* ── Quarters row ── */}
              <tr>
                <th className={cn("border border-[var(--color-border)] px-2 py-1.5 text-left text-[var(--text-caption-size)] font-semibold", headerYellow)}>
                  Quarters
                </th>
                {QUARTER_SPANS.map((q) => (
                  <th
                    key={q.label}
                    colSpan={q.months}
                    className={cn(
                      "border border-[var(--color-border)] px-2 py-1.5 text-[var(--text-caption-size)] font-bold tracking-wide",
                      headerYellow,
                    )}
                  >
                    {q.label}
                  </th>
                ))}
              </tr>

              {/* ── Months row ── */}
              <tr>
                <th className={cn("border border-[var(--color-border)] px-2 py-1.5 text-left text-[var(--text-caption-size)] font-semibold", headerYellowLight)}>
                  Months
                </th>
                {MONTHS.map((m, i) => (
                  <th
                    key={i}
                    className={cn(
                      "border border-[var(--color-border)] px-1 py-1.5 text-[var(--text-caption-size)] font-medium",
                      headerYellowLight,
                      QUARTER_BOUNDARIES.has(i) && "border-r-2 border-r-[#5C4A00]/30",
                    )}
                  >
                    {m}
                  </th>
                ))}
              </tr>

              {/* ── Season row ── */}
              <tr>
                <td className={cn("border border-[var(--color-border)] px-2 py-1.5 text-left text-[var(--text-caption-size)] font-semibold", headerWhite)}>
                  Season
                </td>
                {SEASON_SPANS.map((s, i) => (
                  <td
                    key={i}
                    colSpan={s.span}
                    className="border border-[var(--color-border)] px-1 py-1.5 text-[var(--text-caption-size)] font-medium text-[var(--color-muted-foreground)]"
                  >
                    {s.label}
                  </td>
                ))}
              </tr>

              {/* ── Events row ── */}
              <tr>
                <td className={cn("border border-[var(--color-border)] px-2 py-1.5 text-left text-[var(--text-caption-size)] font-semibold", headerWhite)}>
                  Events
                </td>
                {EVENTS_PER_MONTH.map((ev, i) => (
                  <td
                    key={i}
                    className={cn(
                      "border border-[var(--color-border)] px-0.5 py-1 text-[9px] leading-tight text-[var(--color-muted-foreground)]",
                      QUARTER_BOUNDARIES.has(i) && "border-r-2 border-r-[var(--color-border)]",
                    )}
                  >
                    {ev}
                  </td>
                ))}
              </tr>
            </thead>

            <tbody>
              {activeRows.length > 0 ? (
                activeRows.map((row) => {
                  const rowItems = scheduledItems.filter((item) => item.row === row);
                  const laneMap = laneMaps[row] ?? new Map();
                  const numLanes = rowLaneCounts[row] ?? 1;
                  const rowHeight = numLanes * LANE_HEIGHT;
                  const colors = ROW_COLORS[row] ?? DEFAULT_ROW_COLOR;

                  return (
                    <tr key={row}>
                      {/* Row label */}
                      <td
                        className="border border-[var(--color-border)] bg-[var(--color-muted)]/40 px-2 pt-2 text-left align-top text-[var(--text-caption-size)] font-medium text-[var(--color-foreground)]"
                        style={{ height: `${rowHeight}px` }}
                      >
                        {row}
                      </td>

                      {/* Droppable cells (one per month) with absolute-positioned items on top */}
                      <td
                        colSpan={12}
                        className="border border-[var(--color-border)] p-0"
                        style={{ position: "relative", height: `${rowHeight}px` }}
                      >
                        {/* Drop target grid */}
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            display: "grid",
                            gridTemplateColumns: "repeat(12, 1fr)",
                          }}
                        >
                          {MONTHS.map((_, month) => (
                            <div
                              key={month}
                              className={cn(
                                "h-full transition-colors",
                                month < 11 ? (QUARTER_BOUNDARIES.has(month) ? "border-r-2 border-r-[var(--color-border)]" : "border-r border-[var(--color-border)]") : "",
                                dropTarget?.row === row && dropTarget.month === month
                                  ? "bg-[var(--color-primary)]/10"
                                  : draggingItem
                                    ? "hover:bg-[var(--color-muted)]/40"
                                    : "",
                              )}
                              onDragOver={(e) => {
                                e.preventDefault();
                                setDropTarget({ row, month });
                              }}
                              onDragLeave={() => setDropTarget(null)}
                              onDrop={(e) => {
                                e.preventDefault();
                                handleDrop(row, month);
                              }}
                            />
                          ))}
                        </div>

                        {/* Scheduled item bars */}
                        {rowItems.map((item) => {
                          const lane = laneMap.get(item.id) ?? 0;
                          const activeSpan =
                            resizeOverride?.id === item.id ? resizeOverride.span : item.span;
                          return (
                            <div
                              key={item.id}
                              style={{
                                position: "absolute",
                                left: `${(item.startMonth / 12) * 100}%`,
                                width: `${(activeSpan / 12) * 100}%`,
                                top: `${lane * LANE_HEIGHT + 6}px`,
                                height: `${LANE_HEIGHT - 12}px`,
                                zIndex: resizeOverride?.id === item.id ? 10 : 1,
                              }}
                              className={cn(
                                "group flex items-center overflow-hidden rounded-[var(--radius-sm)] border px-2 text-[10px] font-medium shadow-sm transition-shadow",
                                colors.bg,
                                colors.border,
                                colors.text,
                                resizeOverride?.id === item.id && "shadow-md",
                              )}
                            >
                              <span className="flex-1 truncate">{item.label}</span>
                              <button
                                type="button"
                                onClick={() => removeScheduledItem(item.id)}
                                aria-label={`Remove ${item.label}`}
                                className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                              <div
                                className={cn(
                                  "absolute right-0 top-0 h-full w-2.5 cursor-col-resize rounded-r-[var(--radius-sm)] opacity-0 transition-opacity group-hover:opacity-100",
                                  colors.handle,
                                )}
                                onMouseDown={(e) => handleResizeStart(e, item)}
                              />
                            </div>
                          );
                        })}
                      </td>
                    </tr>
                  );
                })
              ) : (
                /* ── Empty body — shown until first item is dropped ── */
                <tr>
                  <td className="border border-[var(--color-border)] bg-[var(--color-muted)]/20 px-2 py-1 text-left text-[var(--text-caption-size)] font-medium text-[var(--color-muted-foreground)]">
                    {/* label column intentionally empty */}
                  </td>
                  <td
                    colSpan={12}
                    className="border border-[var(--color-border)] p-0"
                    style={{ position: "relative", height: "160px" }}
                  >
                    {/* Month drop cells */}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "grid",
                        gridTemplateColumns: "repeat(12, 1fr)",
                      }}
                    >
                      {MONTHS.map((_, month) => (
                        <div
                          key={month}
                          className={cn(
                            "h-full transition-colors",
                            month < 11 ? (QUARTER_BOUNDARIES.has(month) ? "border-r-2 border-r-[var(--color-border)]" : "border-r border-[var(--color-border)]") : "",
                            dropTarget?.month === month && dropTarget.row === "empty"
                              ? "bg-[var(--color-primary)]/10"
                              : draggingItem
                                ? "hover:bg-[var(--color-muted)]/40"
                                : "",
                          )}
                          onDragOver={(e) => {
                            e.preventDefault();
                            setDropTarget({ row: "empty", month });
                          }}
                          onDragLeave={() => setDropTarget(null)}
                          onDrop={(e) => {
                            e.preventDefault();
                            handleDropOnEmpty(month);
                          }}
                        />
                      ))}
                    </div>
                    {/* Centre message */}
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1">
                      <p className="text-[var(--text-body-size)] font-medium text-[var(--color-muted-foreground)]">
                        Drag &amp; Drop Item types to plan your Assortment Calendar
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Button
        variant="secondary"
        size="sm"
        disabled={scheduledItems.length === 0}
        className={scheduledItems.length === 0 ? "opacity-50" : undefined}
      >
        Finalize &amp; Share
      </Button>
    </div>
  );
}

export function PlanPageActions() {
  return (
    <Button variant="outline" size="sm">
      <MessageSquare className="h-3.5 w-3.5" />
      Comments
    </Button>
  );
}
