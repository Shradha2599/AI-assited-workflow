"use client";

import { ChevronDown } from "lucide-react";

import { DrawerRevenueSummary } from "@/components/data-display/drawer-revenue-summary";
import { GapItemCard } from "@/components/data-display/gap-item-card";
import { Button } from "@/components/ui/button";
import {
  DrawerHeaderShell,
  DrawerPanel,
  DrawerTitleAccent,
} from "@/components/ui/drawer-panel";

export type GapLagSeverity = "high" | "medium-high" | "medium";

export interface GapItem {
  id: string;
  name: string;
  lagPercent: number;
  lagSeverity: GapLagSeverity;
  estimatedRevenue: string;
  competitor: string;
  skuCount: number;
  imageUrl?: string;
  inPlan?: boolean;
}

export type GapsDrawerVariant = "gap-analysis" | "calendar-update";

interface GapsDrawerProps {
  category: string;
  gapCount: number;
  items: GapItem[];
  variant?: GapsDrawerVariant;
  fiscalYearLabel?: string;
  versionLabel?: string;
  revenueGoal?: string;
  revenuePlanned?: string;
  revenuePlannedPercent?: number;
  plannedMessage?: string;
  addToCalendarDisabled?: boolean;
  onClose: () => void;
  onAddToPlan?: (itemId: string) => void;
  onRemoveFromPlan?: (itemId: string) => void;
  onAddToCalendar?: () => void;
}

function DrawerFilterChip({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2.5 py-1 text-[var(--text-caption-size)] text-[var(--color-foreground)]"
    >
      {label}
      <ChevronDown className="h-3 w-3 shrink-0 text-[var(--color-muted-foreground)]" aria-hidden />
    </button>
  );
}

export function GapsDrawer({
  category,
  gapCount,
  items,
  variant = "gap-analysis",
  fiscalYearLabel = "FY 2025-26",
  versionLabel = "Version 1",
  revenueGoal = "$50.0M",
  revenuePlanned = "$0M",
  revenuePlannedPercent = 0,
  plannedMessage = "",
  addToCalendarDisabled = true,
  onClose,
  onAddToPlan,
  onRemoveFromPlan,
  onAddToCalendar,
}: GapsDrawerProps) {
  const isCalendarUpdate = variant === "calendar-update";

  return (
    <DrawerPanel
      ariaLabel={`Gaps identified: ${category}`}
      onClose={onClose}
      header={
        <DrawerHeaderShell
          onClose={onClose}
          title={
            <>
              Gaps Identified: <DrawerTitleAccent>{category}</DrawerTitleAccent>
            </>
          }
        />
      }
      footer={
        isCalendarUpdate ? (
          <Button
            className="w-full"
            disabled={addToCalendarDisabled}
            onClick={onAddToCalendar}
          >
            Add to Calendar
          </Button>
        ) : undefined
      }
    >
      {isCalendarUpdate ? (
        <>
          <div className="flex flex-wrap items-center gap-2 px-[var(--space-4)] pb-[var(--space-3)] pt-[var(--space-4)]">
            <DrawerFilterChip label={fiscalYearLabel} />
            <DrawerFilterChip label={versionLabel} />
          </div>

          <div className="px-[var(--space-4)] pb-[var(--space-3)]">
            <p className="text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
              {gapCount} seasonal item type{gapCount === 1 ? "" : "s"} for {category}
            </p>
          </div>

          <ul className="space-y-[var(--space-3)] px-[var(--space-4)] pb-[var(--space-4)]">
            {items.map((item) => (
              <li key={item.id}>
                <GapItemCard
                  item={item}
                  calendarUpdate
                  onAddToPlan={onAddToPlan}
                  onRemoveFromPlan={onRemoveFromPlan}
                />
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          <div className="px-[var(--space-4)] pb-[var(--space-4)] pt-[var(--space-4)]">
            <DrawerRevenueSummary
              revenueGoal={revenueGoal}
              revenuePlanned={revenuePlanned}
              revenuePlannedPercent={revenuePlannedPercent}
              plannedMessage={plannedMessage}
            />
          </div>

          <div className="flex items-center justify-between px-[var(--space-4)] pb-[var(--space-4)]">
            <div>
              <p className="text-[var(--text-section-size)] font-semibold text-[var(--color-foreground)]">
                {category}
              </p>
              <p className="mt-0.5 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
                {gapCount} Item type gaps identified
              </p>
            </div>
            <button
              type="button"
              className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2.5 py-1 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]"
            >
              Sort by ▾
            </button>
          </div>

          <ul className="space-y-[var(--space-3)] px-[var(--space-4)] pb-[var(--space-4)]">
            {items.map((item) => (
              <li key={item.id}>
                <GapItemCard
                  item={item}
                  onAddToPlan={onAddToPlan}
                  onRemoveFromPlan={onRemoveFromPlan}
                />
              </li>
            ))}
          </ul>
        </>
      )}
    </DrawerPanel>
  );
}
