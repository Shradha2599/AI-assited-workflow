"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Download, GripVertical, Loader2, MessageSquare, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SvgIcon } from "@/components/ui/svg-icon";
import { TruncatedText } from "@/components/ui/truncated-text";
import { cn } from "@/lib/utils";
import { downloadCalendarPdf } from "@/lib/utils/calendar-pdf";
import {
  usePlanStore,
  type ScheduledCalendarItem,
} from "@/features/assortment-plan/store/plan-store";
import { formatFYShort } from "@/lib/mock-data/fy-plan-seeds";

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
// ── Category inference: maps item name keywords → calendar row ────────────────
const CATEGORY_RULES: Array<{ keywords: string[]; row: string }> = [
  {
    keywords: ["christmas", "halloween", "thanksgiving", "easter", "holiday", "festive",
               "wreath", "garland", "nutcracker", "advent", "nativity", "skeleton",
               "animatronic", "inflatable", "pumpkin", "harvest", "tinsel"],
    row: "Holiday & Festive Decor",
  },
  {
    keywords: ["patio", "grill", "smoker", "propane", "grills", "outdoor cooking",
               "backyard", "griddle station", "camp stove", "pizza oven",
               "adirondack", "bistro", "lounge set", "egg chair", "solar pathway",
               "solar stake", "fire pit", "outdoor umbrella", "weatherproof",
               "outdoor rug", "outdoor flat-weave", "plastic patio",
               "raised garden", "planter", "hanging basket", "garden tool",
               "pruning", "hose reel", "outdoor decor", "garden statue",
               "wind chime", "outdoor lantern", "outdoor throw", "outdoor"],
    row: "Outdoor Living & Garden",
  },
  {
    keywords: ["sofa", "sectional", "armchair", "accent chair", "velvet chair",
               "bookcase", "bookshelf", "ottoman", "storage bench", "coffee table",
               "lift-top", "tv console", "media unit", "platform bed", "bed frame",
               "headboard", "nightstand", "dresser", "6-drawer", "dining table",
               "dining chair", "bar stool", "standing desk", "task chair",
               "l-shaped desk", "wall desk", "hall tree", "coat rack", "console table",
               "entryway bench", "nesting table", "accent table"],
    row: "Furniture",
  },
  {
    keywords: ["chandelier", "pendant light", "pendant kit", "ceiling light",
               "flush mount", "semi-flush", "wall sconce", "swing-arm",
               "picture light", "floor lamp", "arc floor", "tripod lamp",
               "torchiere", "reading lamp", "table lamp", "desk lamp",
               "bedside lamp", "buffet lamp", "outdoor wall lantern",
               "string light", "bistro light", "festoon", "solar light",
               "motion-sensor flood", "deck light", "step light",
               "smart bulb", "led strip", "led lighting", "smart lighting",
               "dimmer", "bias lighting", "lamp", "light", "lighting",
               "sconce", "fixture", "bulb", "luminar"],
    row: "Lighting",
  },
  {
    keywords: ["area rug", "wool rug", "persian rug", "moroccan rug", "jute rug",
               "shag rug", "flat-weave", "dhurrie", "cowhide", "faux-fur",
               "runner set", "kitchen runner", "hallway runner", "anti-fatigue",
               "polypropylene rug", "reversible plastic mat", "boho stripe",
               "washable runner", "non-slip runner", "rug"],
    row: "Rugs",
  },
  {
    keywords: ["party plate", "party tableware", "biodegradable plate",
               "bamboo plate", "paper cup", "acrylic glass", "gold cutlery",
               "balloon arch", "balloon garland", "foil balloon", "led balloon",
               "paper fan", "tassel", "confetti", "custom banner", "photo booth",
               "party favor", "candy bag", "mini succulent", "keychain favor",
               "party cake", "cupcake stand tower", "tiered snack tray",
               "party decoration", "party supply", "party"],
    row: "Party Supplies",
  },
  {
    keywords: ["cookware", "sauté pan", "frying pan", "cast iron", "dutch oven",
               "wok", "stir-fry", "pressure cooker", "instant pot", "griddle pan",
               "grill pan", "stock pot", "pasta insert", "bakeware", "springform",
               "silicone mat", "loaf pan", "bread pan", "bundt", "cookie sheet",
               "muffin tin", "knife", "knives", "steak knife", "knife block",
               "sharpener", "honing", "china", "dinner set", "tablecloth",
               "table runner", "napkin", "placemat", "pot holder", "oven mitt",
               "serving bowl", "sugar bowl", "creamer", "condiment", "dip server",
               "cake stand", "cake dome", "gravy boat", "salad bowl",
               "charcuterie", "cheese board", "fondue", "hot pot", "chafing",
               "buffet dish", "food warmer", "wine glass", "crystal", "tumbler",
               "cocktail shaker", "highball", "rocks glass", "champagne", "flute",
               "coupe", "carafe", "pitcher", "beer mug", "stein",
               "spice rack", "canister", "drawer organizer", "knife strip",
               "pantry label", "cutting board", "bamboo board",
               "air fryer", "espresso", "coffee maker", "kettle", "coffee",
               "stand mixer", "convection oven", "blender", "can opener",
               "meal prep", "container", "bento", "snack cup", "wine rack",
               "wine opener", "countertop", "kitchen"],
    row: "Kitchen & Dining",
  },
];

function rowForItem(itemName: string): string {
  const lower = itemName.toLowerCase();
  for (const { keywords, row } of CATEGORY_RULES) {
    if (keywords.some((kw) => lower.includes(kw))) return row;
  }
  return "Kitchen & Dining"; // safe fallback
}

/** Clamp start month and span so items stay within the 12-month grid */
function clampSchedule(startMonth: number, span: number): { startMonth: number; span: number } {
  const start = Math.max(0, Math.min(11, startMonth));
  const clampedSpan = Math.max(1, Math.min(12 - start, span));
  return { startMonth: start, span: clampedSpan };
}

const LANE_HEIGHT = 48;

const ROW_COLORS: Record<string, { bg: string; border: string; text: string; handle: string }> = {
  "Kitchen & Dining":       { bg: "bg-orange-50",  border: "border-orange-300",  text: "text-orange-900",  handle: "bg-orange-300/40"  },
  "Lighting":               { bg: "bg-amber-50",   border: "border-amber-300",   text: "text-amber-900",   handle: "bg-amber-300/40"   },
  "Furniture":              { bg: "bg-stone-50",   border: "border-stone-300",   text: "text-stone-900",   handle: "bg-stone-300/40"   },
  "Outdoor Living & Garden":{ bg: "bg-green-50",   border: "border-green-300",   text: "text-green-900",   handle: "bg-green-300/40"   },
  "Holiday & Festive Decor":{ bg: "bg-red-50",     border: "border-red-300",     text: "text-red-900",     handle: "bg-red-300/40"     },
  "Rugs":                   { bg: "bg-purple-50",  border: "border-purple-300",  text: "text-purple-900",  handle: "bg-purple-300/40"  },
  "Party Supplies":         { bg: "bg-pink-50",    border: "border-pink-300",    text: "text-pink-900",    handle: "bg-pink-300/40"    },
};
const DEFAULT_ROW_COLOR = {
  bg: "bg-blue-50",
  border: "border-blue-300",
  text: "text-blue-900",
  handle: "bg-blue-300/40",
};

// Priority order for row display in the calendar
const ROW_PRIORITY: Record<string, number> = {
  "Kitchen & Dining": 0,
  "Lighting": 1,
  "Furniture": 2,
  "Outdoor Living & Garden": 3,
  "Holiday & Festive Decor": 4,
  "Rugs": 5,
  "Party Supplies": 6,
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

// ─── Version picker ───────────────────────────────────────────────────────────

function VersionPicker() {
  const versions       = usePlanStore((s) => s.calendarVersions);
  const activeId       = usePlanStore((s) => s.activeVersionId);
  const createVersion  = usePlanStore((s) => s.createVersion);
  const switchVersion  = usePlanStore((s) => s.switchVersion);
  const deleteVersion  = usePlanStore((s) => s.deleteVersion);

  const [open, setOpen]       = useState(false);
  const [newName, setNewName] = useState("");
  const dropdownRef           = useRef<HTMLDivElement>(null);
  const inputRef              = useRef<HTMLInputElement>(null);

  const active = versions.find((v) => v.id === activeId) ?? versions[0];

  // Close on outside click
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // Focus input when dropdown opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  function handleCreate() {
    const name = newName.trim() || `Version ${versions.length + 1}`;
    createVersion(name);
    setNewName("");
    setOpen(false);
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2.5 py-1 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
      >
        {active?.name ?? "Version 1"}
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-56 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card)] shadow-[var(--shadow-medium)]">
          {/* Version list */}
          <ul className="max-h-48 overflow-y-auto py-1">
            {versions.map((v) => (
              <li
                key={v.id}
                className={cn(
                  "group flex cursor-pointer items-center justify-between gap-2 px-3 py-2 text-[var(--text-caption-size)] hover:bg-[var(--color-muted)]",
                  v.id === activeId && "bg-[var(--color-primary)]/8 font-medium text-[var(--color-primary)]",
                )}
                onClick={() => { switchVersion(v.id); setOpen(false); }}
              >
                <TruncatedText text={v.name} className="min-w-0 flex-1" />
                <span className="flex shrink-0 items-center gap-1">
                  {v.id === activeId && (
                    <Check className="h-3 w-3 text-[var(--color-primary)]" />
                  )}
                  {versions.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); deleteVersion(v.id); }}
                      className="hidden rounded p-0.5 text-[var(--color-muted-foreground)] hover:bg-[var(--color-error-light)] hover:text-[var(--color-error)] group-hover:flex"
                      aria-label={`Delete ${v.name}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </span>
              </li>
            ))}
          </ul>

          <div className="h-px bg-[var(--color-border)]" />

          {/* New version input */}
          <div className="p-2">
            <p className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-muted-foreground)]">
              New version
            </p>
            <div className="flex items-center gap-1.5">
              <input
                ref={inputRef}
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") setOpen(false); }}
                placeholder={`Version ${versions.length + 1}`}
                className="h-7 min-w-0 flex-1 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-[var(--text-caption-size)] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:border-[var(--color-primary)] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCreate}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-colors"
                aria-label="Create version"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

interface AssortmentCalendarProps {
  className?: string;
}

export function AssortmentCalendar({ className }: AssortmentCalendarProps) {
  const fiscalYear = usePlanStore((s) => s.fiscalYear);
  const planItems = usePlanStore((s) => s.planItems);
  const scheduledItems = usePlanStore((s) => s.scheduledItems);
  const getOpportunityItems = usePlanStore((s) => s.getOpportunityItems);
  const addPlanItem = usePlanStore((s) => s.addPlanItem);
  const removePlanItem = usePlanStore((s) => s.removePlanItem);
  const scheduleItem = usePlanStore((s) => s.scheduleItem);
  const removeScheduledItem = usePlanStore((s) => s.removeScheduledItem);
  const updateScheduledItemSpan = usePlanStore((s) => s.updateScheduledItemSpan);
  const updateScheduledItemStartMonth = usePlanStore((s) => s.updateScheduledItemStartMonth);
  const setScheduledItems = usePlanStore((s) => s.setScheduledItems);

  // Items not yet placed on the calendar (available to drag)
  const scheduledLabels = useMemo(
    () => new Set(scheduledItems.map((s) => s.label)),
    [scheduledItems],
  );
  const opportunityItems = useMemo(() => getOpportunityItems(), [getOpportunityItems]);
  const unscheduledOpportunityItems = useMemo(
    () => opportunityItems.filter((name) => !scheduledLabels.has(name)),
    [opportunityItems, scheduledLabels],
  );

  const [draggingItem, setDraggingItem] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{ row: string; month: number } | null>(null);
  const [resizeOverride, setResizeOverride] = useState<{ id: string; startMonth?: number; span: number } | null>(null);
  const [generating, setGenerating] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Deselect when clicking outside any item bar
  useEffect(() => {
    function onDocClick() { setSelectedItemId(null); }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

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
    result.sort((a, b) => (ROW_PRIORITY[a] ?? 99) - (ROW_PRIORITY[b] ?? 99));
    return result;
  }, [scheduledItems]);

  const laneMaps = useMemo(() => {
    const result: Record<string, Map<string, number>> = {};
    for (const row of activeRows) {
      const rowItems = scheduledItems
        .filter((item) => item.row === row)
        .map((item) =>
          item.id === resizeOverride?.id
            ? {
                ...item,
                startMonth: resizeOverride.startMonth ?? item.startMonth,
                span: resizeOverride.span,
              }
            : item,
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
    (_row: string, _month: number) => {
      if (!draggingItem) return;
      // Always derive the correct category row from the item name — ignore drop target row
      const correctRow = rowForItem(draggingItem);
      scheduleItem(draggingItem, correctRow, 0, 12);
      if (!planItems.includes(draggingItem)) addPlanItem(draggingItem);
      setDraggingItem(null);
      setDropTarget(null);
    },
    [draggingItem, scheduleItem, addPlanItem, planItems],
  );

  const handleDropOnEmpty = useCallback(
    (_month: number) => {
      if (!draggingItem) return;
      handleDrop("", 0);
    },
    [draggingItem, handleDrop],
  );

  /** Right-edge resize: adjusts span (item grows/shrinks from right) */
  function handleResizeStart(e: React.MouseEvent, item: ScheduledCalendarItem) {
    e.preventDefault();
    e.stopPropagation();
    setSelectedItemId(item.id);
    if (!tableRef.current) return;
    const cellWidth = tableRef.current.clientWidth / 12;
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

  /** Left-edge resize: adjusts startMonth + span (item grows/shrinks from left) */
  function handleResizeStartLeft(e: React.MouseEvent, item: ScheduledCalendarItem) {
    e.preventDefault();
    e.stopPropagation();
    setSelectedItemId(item.id);
    if (!tableRef.current) return;
    const cellWidth = tableRef.current.clientWidth / 12;
    const startX = e.clientX;
    const initialStart = item.startMonth;
    const initialEnd = item.startMonth + item.span; // fixed right edge

    function onMouseMove(ev: MouseEvent) {
      const delta = Math.round((ev.clientX - startX) / cellWidth);
      const newStart = Math.max(0, Math.min(initialEnd - 1, initialStart + delta));
      const newSpan = initialEnd - newStart;
      setResizeOverride({ id: item.id, startMonth: newStart, span: newSpan });
    }

    function onMouseUp(ev: MouseEvent) {
      const delta = Math.round((ev.clientX - startX) / cellWidth);
      const newStart = Math.max(0, Math.min(initialEnd - 1, initialStart + delta));
      const newSpan = initialEnd - newStart;
      updateScheduledItemSpan(item.id, newSpan);
      // Also update startMonth in store
      updateScheduledItemStartMonth(item.id, newStart);
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
      const withIds: ScheduledCalendarItem[] = generated.map((item, i) => {
        const { startMonth, span } = clampSchedule(item.startMonth, item.span);
        return {
          ...item,
          startMonth,
          span,
          id: `gen-${Date.now()}-${i}`,
        };
      });
      setScheduledItems(withIds);
    } catch {
      // silent — keep existing schedule on failure
    } finally {
      setGenerating(false);
    }
  }

  // ─── Shared header cell styles ───────────────────────────────────────────────
  const headerYellow = "bg-[#FFE34D] text-[#5C4A00]";
  const headerYellowLight = "bg-[#FFF3B2] text-[#5C4A00]";
  const headerSeason = "bg-[#FFF9DB] text-[#4B4B4B]";
  const headerEvents = "bg-[#FFFCEB] text-[#4B4B4B]";

  const fyShort = formatFYShort(fiscalYear);
  const isNewFY = fiscalYear === "2026-2027";

  return (
    <div className={cn("space-y-[var(--space-4)]", className)}>
      {/* ── Assortment Opportunities strip ─────────────────────────────────── */}
      <Card className="p-[var(--space-4)]">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="text-[var(--text-section-size)] font-semibold">Assortment Opportunities</h3>
          <Button variant="outline" size="sm">+ Item Types</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Draggable — new item types not yet placed on calendar */}
          {unscheduledOpportunityItems.map((item) => (
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

          {isNewFY && opportunityItems.length === 0 && (
            <p className="text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
              Start building FY {fyShort} by adding item types from Gap Analysis or generate a calendar below.
            </p>
          )}
          {!isNewFY && opportunityItems.length === 0 && (
            <p className="text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
              Add item types from Gap Analysis or seasonal recommendations. New opportunities will
              appear here to schedule on the calendar below.
            </p>
          )}
          {opportunityItems.length > 0 && unscheduledOpportunityItems.length === 0 && (
            <p className="text-[var(--text-caption-size)] text-[var(--color-primary)]">
              All new opportunities have been placed on the calendar.
            </p>
          )}
        </div>
        <div className="mt-3">
          <Button
            size="sm"
            onClick={handleGenerateCalendar}
            disabled={generating || planItems.length === 0}
          >
            {generating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <SvgIcon name="aiSparkle" size={14} variant="onPrimary" />
            )}
            {generating ? "Generating…" : "Generate Calendar"}
          </Button>
        </div>
      </Card>

      {/* ── Calendar grid ─────────────────────────────────────────────────── */}
      <Card className="overflow-hidden border-0 shadow-none">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] p-[var(--space-4)]">
          <h3 className="text-[var(--text-section-size)] font-semibold">Calendar Plan {fyShort}</h3>
          <CalendarToolbar />
        </div>

        <div className="overflow-x-auto p-6" ref={tableRef}>
          <table className="w-full min-w-[860px] border-collapse text-center text-[var(--text-caption-size)]" style={{ tableLayout: "fixed" }}>
            <colgroup>
              {/* Label column – fixed; remaining 12 cols share the rest equally */}
              <col style={{ width: "110px" }} />
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
                <td className={cn("border border-[var(--color-border)] px-2 py-1.5 text-left text-[var(--text-caption-size)] font-semibold", headerSeason)}>
                  Season
                </td>
                {SEASON_SPANS.map((s, i) => (
                  <td
                    key={i}
                    colSpan={s.span}
                    className={cn("border border-[var(--color-border)] px-1 py-1.5 text-[var(--text-caption-size)] font-medium overflow-hidden", headerSeason)}
                  >
                    {s.label}
                  </td>
                ))}
              </tr>

              {/* ── Events row ── */}
              <tr>
                <td className={cn("border border-[var(--color-border)] px-2 py-1.5 text-left text-[var(--text-caption-size)] font-semibold", headerEvents)}>
                  Events
                </td>
                {EVENTS_PER_MONTH.map((ev, i) => (
                  <td
                    key={i}
                    className={cn(
                      "overflow-hidden border border-[var(--color-border)] px-1 py-1.5 text-[var(--text-caption-size)]",
                      headerEvents,
                      QUARTER_BOUNDARIES.has(i) && "border-r-2 border-r-[var(--color-border)]",
                    )}
                  >
                    <TruncatedText text={ev} />
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
                        className="overflow-hidden border border-[var(--color-border)] p-0"
                        style={{ position: "relative", height: `${rowHeight}px` }}
                      >
                        {/* Drop target grid — vertical lines per month */}
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
                                month < 11
                                  ? QUARTER_BOUNDARIES.has(month)
                                    ? "border-r-2 border-r-[#D1D5DB]"
                                    : "border-r border-r-[#E5E7EB]"
                                  : "",
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
                          const isResizing = resizeOverride?.id === item.id;
                          const rawStart = isResizing ? (resizeOverride.startMonth ?? item.startMonth) : item.startMonth;
                          const rawSpan = isResizing ? resizeOverride.span : item.span;
                          const { startMonth: activeStart, span: activeSpan } = clampSchedule(rawStart, rawSpan);
                          const isSelected = selectedItemId === item.id || isResizing;
                          return (
                            <div
                              key={item.id}
                              style={{
                                position: "absolute",
                                left: `${(activeStart / 12) * 100}%`,
                                width: `${(activeSpan / 12) * 100}%`,
                                top: `${lane * LANE_HEIGHT + 5}px`,
                                height: `${LANE_HEIGHT - 10}px`,
                                zIndex: isSelected ? 10 : 1,
                              }}
                              className={cn(
                                "group flex items-center overflow-hidden rounded-[var(--radius-md)] border bg-[#F5F5F5] text-[10px] font-medium shadow-sm transition-all cursor-pointer",
                                colors.text,
                                isSelected
                                  ? "border-[var(--color-primary)] bg-white shadow-md"
                                  : "border-gray-300 hover:border-[var(--color-primary)] hover:bg-white hover:shadow-md",
                              )}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedItemId((prev) => (prev === item.id ? null : item.id));
                              }}
                            >
                              {/* Left resize handle — blue, visible on hover or when selected */}
                              <div
                                className={cn(
                                  "h-full w-2.5 shrink-0 cursor-col-resize rounded-l-[var(--radius-md)] bg-[var(--color-primary)] transition-opacity",
                                  isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100",
                                )}
                                onMouseDown={(e) => { e.stopPropagation(); handleResizeStartLeft(e, item); }}
                              />

                              {/* Label */}
                              <TruncatedText text={item.label} className="min-w-0 flex-1 px-2 text-center" />

                              {/* Remove button — visible on hover / selected */}
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); removeScheduledItem(item.id); }}
                                aria-label={`Remove ${item.label}`}
                                className={cn(
                                  "mr-1 shrink-0 rounded-full p-0.5 text-[var(--color-muted-foreground)] transition-opacity hover:bg-red-100 hover:text-red-600",
                                  isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100",
                                )}
                              >
                                <X className="h-3 w-3" />
                              </button>

                              {/* Right resize handle — blue, visible on hover or when selected */}
                              <div
                                className={cn(
                                  "h-full w-2.5 shrink-0 cursor-col-resize rounded-r-[var(--radius-md)] bg-[var(--color-primary)] transition-opacity",
                                  isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100",
                                )}
                                onMouseDown={(e) => { e.stopPropagation(); handleResizeStart(e, item); }}
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
                  <td className="border border-[var(--color-border)] bg-white px-2 py-1 text-left text-[var(--text-caption-size)] font-medium text-[var(--color-muted-foreground)]">
                    {/* label column intentionally empty */}
                  </td>
                  <td
                    colSpan={12}
                    className="border border-[var(--color-border)] bg-white p-0"
                    style={{ position: "relative", height: "120px" }}
                  >
                    {/* Month drop cells — vertical lines per month */}
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
                            month < 11
                              ? QUARTER_BOUNDARIES.has(month)
                                ? "border-r-2 border-r-[#D1D5DB]"
                                : "border-r border-r-[#E5E7EB]"
                              : "",
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
                    {/* Centre message — dashed drop box filling full cell */}
                    <div className="pointer-events-none absolute inset-2 flex items-center justify-center rounded-[var(--radius-md)] border-2 border-dashed border-[#D1D5DB] bg-[#F9FAFB]">
                      <p className="text-center text-[var(--text-caption-size)] font-medium text-[var(--color-muted-foreground)]">
                        Drag &amp; drop item to plan your Assortment Calendar
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <PlanActionButton />
    </div>
  );
}

function CalendarToolbar() {
  const scheduledItems = usePlanStore((s) => s.scheduledItems);
  const calendarVersions = usePlanStore((s) => s.calendarVersions);
  const activeVersionId = usePlanStore((s) => s.activeVersionId);

  const activeVersion = calendarVersions.find((v) => v.id === activeVersionId) ?? calendarVersions[0];
  const versionName = activeVersion?.name ?? "Version 1";
  const hasItems = scheduledItems.length > 0;

  function handleDownload() {
    if (!hasItems) return;
    downloadCalendarPdf(versionName, scheduledItems);
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="secondary" size="sm" onClick={handleDownload} disabled={!hasItems}>
        <Download className="h-3.5 w-3.5" />
        Download
      </Button>
      <VersionPicker />
    </div>
  );
}

function PlanActionButton() {
  const scheduledItems = usePlanStore((s) => s.scheduledItems);
  const openFinalizeDrawer = usePlanStore((s) => s.openFinalizeDrawer);

  const hasItems = scheduledItems.length > 0;

  return (
    <Button
      size="sm"
      disabled={!hasItems}
      onClick={() => hasItems && openFinalizeDrawer()}
      className={!hasItems ? "opacity-40" : undefined}
    >
      Finalize &amp; Share
    </Button>
  );
}

interface PlanPageActionsProps {
  onOpenComments?: () => void;
}

export function PlanPageActions({ onOpenComments }: PlanPageActionsProps) {
  return (
    <Button variant="outline" size="sm" className="gap-1.5" onClick={onOpenComments}>
      <MessageSquare className="h-3.5 w-3.5" />
      Comments
    </Button>
  );
}
