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

const MONTHS = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];

const QUARTER_SPANS = [
  { label: "Q1", span: 2 },
  { label: "Q2", span: 2 },
  { label: "Q3", span: 4 },
  { label: "Q4", span: 4 },
];

const SEASON_SPANS = [
  { label: "Fall", span: 2 },
  { label: "Winter", span: 2 },
  { label: "Summer", span: 4 },
  { label: "Spring", span: 4 },
];

const EVENTS_PER_MONTH = [
  "Thanksgiving",
  "Christmas",
  "New Year",
  "Valentine's",
  "Easter",
  "",
  "",
  "",
  "Labour Day",
  "BTS / BTC",
  "",
  "Halloween",
];

const CALENDAR_ROWS = ["Kitchen & Dining", "Lighting"];
const LANE_HEIGHT = 52;
const LABEL_COL_WIDTH = 140;

const ITEM_COLORS: Record<string, { bg: string; border: string; text: string; handle: string }> = {
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
const DEFAULT_COLOR = {
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

interface AssortmentCalendarProps {
  defaultItemTypes?: string[];
  className?: string;
}

export function AssortmentCalendar({ defaultItemTypes = [], className }: AssortmentCalendarProps) {
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

  const itemTypes = planItems.length > 0 ? planItems : defaultItemTypes;

  const laneMaps = useMemo(() => {
    const result: Record<string, Map<string, number>> = {};
    for (const row of CALENDAR_ROWS) {
      const rowItems = scheduledItems
        .filter((item) => item.row === row)
        .map((item) =>
          item.id === resizeOverride?.id ? { ...item, span: resizeOverride.span } : item,
        );
      result[row] = allocateLanes(rowItems);
    }
    return result;
  }, [scheduledItems, resizeOverride]);

  const rowLaneCounts = useMemo(() => {
    const result: Record<string, number> = {};
    for (const row of CALENDAR_ROWS) {
      const vals = [...(laneMaps[row]?.values() ?? [])];
      result[row] = vals.length === 0 ? 1 : Math.max(...vals) + 1;
    }
    return result;
  }, [laneMaps]);

  const handleDragStart = useCallback((label: string) => setDraggingItem(label), []);
  const handleDragEnd = useCallback(() => {
    setDraggingItem(null);
    setDropTarget(null);
  }, []);

  const handleDrop = useCallback(
    (row: string, month: number) => {
      if (!draggingItem) return;
      scheduleItem(draggingItem, row, month, 2);
      if (!planItems.includes(draggingItem)) addPlanItem(draggingItem);
      setDraggingItem(null);
      setDropTarget(null);
    },
    [draggingItem, scheduleItem, addPlanItem, planItems],
  );

  function handleResizeStart(e: React.MouseEvent, item: ScheduledCalendarItem) {
    e.preventDefault();
    e.stopPropagation();
    if (!tableRef.current) return;
    const containerWidth = tableRef.current.clientWidth - LABEL_COL_WIDTH;
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
    if (itemTypes.length === 0) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/generate-calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planItems: itemTypes }),
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

  return (
    <div className={cn("space-y-[var(--space-4)]", className)}>
      {/* Item types panel */}
      <Card className="p-[var(--space-4)]">
        <h3 className="mb-3 text-[var(--text-section-size)] font-semibold">Assortment Plan</h3>
        <div className="flex flex-wrap gap-2">
          {itemTypes.map((item) => (
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
          {itemTypes.length === 0 && (
            <p className="text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
              Add items from the Gap Analysis page, then generate or drag them onto the calendar.
            </p>
          )}
        </div>
        <div className="mt-3 flex gap-2">
          <Button variant="outline" size="sm">
            + Item Types
          </Button>
          <Button
            size="sm"
            onClick={handleGenerateCalendar}
            disabled={generating || itemTypes.length === 0}
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

      {/* Calendar grid */}
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
              <col style={{ width: `${LABEL_COL_WIDTH}px`, minWidth: `${LABEL_COL_WIDTH}px` }} />
              {MONTHS.map((_, i) => (
                <col key={i} />
              ))}
            </colgroup>

            <thead>
              {/* Quarters — blue */}
              <tr className="bg-blue-50">
                <th className="border border-[var(--color-border)] px-2 py-1.5 text-left text-[var(--text-caption-size)] font-medium text-blue-600" />
                {QUARTER_SPANS.map((q) => (
                  <th
                    key={q.label}
                    colSpan={q.span}
                    className="border border-[var(--color-border)] px-2 py-1.5 text-[var(--text-caption-size)] font-semibold text-blue-700"
                  >
                    {q.label}
                  </th>
                ))}
              </tr>

              {/* Months — amber */}
              <tr className="bg-amber-50">
                <th className="border border-[var(--color-border)] px-2 py-1 text-left text-[var(--text-caption-size)] font-medium text-amber-700">
                  Months
                </th>
                {MONTHS.map((m) => (
                  <th
                    key={m}
                    className="border border-[var(--color-border)] px-1 py-1 text-[var(--text-caption-size)] font-medium text-amber-700"
                  >
                    {m}
                  </th>
                ))}
              </tr>

              {/* Seasons — orange */}
              <tr className="bg-orange-50">
                <td className="border border-[var(--color-border)] px-2 py-1 text-left text-[var(--text-caption-size)] font-medium text-orange-700">
                  Season
                </td>
                {SEASON_SPANS.map((s) => (
                  <td
                    key={s.label}
                    colSpan={s.span}
                    className="border border-[var(--color-border)] px-1 py-1 text-[var(--text-caption-size)] text-orange-600"
                  >
                    {s.label}
                  </td>
                ))}
              </tr>

              {/* Events — purple */}
              <tr className="bg-purple-50">
                <td className="border border-[var(--color-border)] px-2 py-1 text-left text-[var(--text-caption-size)] font-medium text-purple-700">
                  Events
                </td>
                {EVENTS_PER_MONTH.map((ev, i) => (
                  <td
                    key={i}
                    className="border border-[var(--color-border)] px-0.5 py-1 text-[9px] leading-tight text-purple-600"
                  >
                    {ev}
                  </td>
                ))}
              </tr>
            </thead>

            <tbody>
              {CALENDAR_ROWS.map((row) => {
                const rowItems = scheduledItems.filter((item) => item.row === row);
                const laneMap = laneMaps[row] ?? new Map();
                const numLanes = rowLaneCounts[row] ?? 1;
                const rowHeight = numLanes * LANE_HEIGHT;

                return (
                  <tr key={row}>
                    <td
                      className="border border-[var(--color-border)] bg-[var(--color-muted)] px-2 pt-2 text-left align-top text-[var(--text-caption-size)] font-medium"
                      style={{ height: `${rowHeight}px` }}
                    >
                      {row}
                    </td>
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
                              "h-full border-r border-[var(--color-border)] last:border-r-0 transition-colors",
                              dropTarget?.row === row && dropTarget.month === month
                                ? "bg-[var(--color-primary-light)]"
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

                      {/* Placed items */}
                      {rowItems.map((item) => {
                        const lane = laneMap.get(item.id) ?? 0;
                        const activeSpan =
                          resizeOverride?.id === item.id ? resizeOverride.span : item.span;
                        const colors = ITEM_COLORS[item.row] ?? DEFAULT_COLOR;
                        return (
                          <div
                            key={item.id}
                            style={{
                              position: "absolute",
                              left: `${(item.startMonth / 12) * 100}%`,
                              width: `${(activeSpan / 12) * 100}%`,
                              top: `${lane * LANE_HEIGHT + 5}px`,
                              height: `${LANE_HEIGHT - 10}px`,
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

                            {/* Delete button — revealed on hover */}
                            <button
                              type="button"
                              onClick={() => removeScheduledItem(item.id)}
                              aria-label={`Remove ${item.label}`}
                              className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>

                            {/* Right-edge resize handle */}
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

                      {rowItems.length === 0 && draggingItem && (
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">
                          Drop here to schedule
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}

              {scheduledItems.length === 0 && !draggingItem && (
                <tr>
                  <td
                    colSpan={13}
                    className="border border-[var(--color-border)] bg-[var(--color-muted)]/30 px-4 py-10 text-center text-[var(--text-body-size)] text-[var(--color-muted-foreground)]"
                  >
                    Drag items onto the calendar, or click{" "}
                    <strong className="text-[var(--color-foreground)]">Generate Calendar</strong> to
                    let Beacon schedule them automatically.
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
