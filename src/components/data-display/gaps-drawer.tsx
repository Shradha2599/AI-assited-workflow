"use client";

import { DrawerRevenueSummary } from "@/components/data-display/drawer-revenue-summary";
import { GapItemCard } from "@/components/data-display/gap-item-card";
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

interface GapsDrawerProps {
  category: string;
  gapCount: number;
  items: GapItem[];
  revenueGoal: string;
  revenuePlanned: string;
  revenuePlannedPercent: number;
  plannedMessage: string;
  onClose: () => void;
  onAddToPlan: (itemId: string) => void;
  onRemoveFromPlan: (itemId: string) => void;
}

export function GapsDrawer({
  category,
  gapCount,
  items,
  revenueGoal,
  revenuePlanned,
  revenuePlannedPercent,
  plannedMessage,
  onClose,
  onAddToPlan,
  onRemoveFromPlan,
}: GapsDrawerProps) {
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
    >
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
    </DrawerPanel>
  );
}
