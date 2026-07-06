"use client";

import { useEffect, useState } from "react";

import { BeaconPlanDrawerShimmer } from "@/components/data-display/beacon-plan-shimmer";
import { DrawerRevenueSummary } from "@/components/data-display/drawer-revenue-summary";
import type { GapItem } from "@/components/data-display/gaps-drawer";
import { GapItemCard } from "@/components/data-display/gap-item-card";
import { Button } from "@/components/ui/button";
import { DrawerHeaderShell, DrawerPanel } from "@/components/ui/drawer-panel";
import { SvgIcon } from "@/components/ui/svg-icon";

const BEACON_LOADING_MS = 3000;

interface BeaconPlanDrawerProps {
  open: boolean;
  items: GapItem[];
  existingPlanItems: string[];
  revenueGoal: string;
  revenuePlanned: string;
  revenuePlannedPercent: number;
  plannedMessage: string;
  onClose: () => void;
  onAddToPlan: (itemIds: string[]) => void;
}

export function BeaconPlanDrawer({
  open,
  items,
  existingPlanItems,
  revenueGoal,
  revenuePlanned,
  revenuePlannedPercent,
  plannedMessage,
  onClose,
  onAddToPlan,
}: BeaconPlanDrawerProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) {
      setLoading(true);
      setSelectedIds(new Set());
      return;
    }

    setLoading(true);
    const timer = window.setTimeout(() => setLoading(false), BEACON_LOADING_MS);
    return () => window.clearTimeout(timer);
  }, [open]);

  if (!open) return null;

  const availableItems = items.filter((item) => !existingPlanItems.includes(item.name));

  function toggleItem(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selectedIds.size === availableItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(availableItems.map((item) => item.id)));
    }
  }

  function handleAddSelected() {
    if (selectedIds.size === 0) return;
    onAddToPlan(Array.from(selectedIds));
    setSelectedIds(new Set());
    onClose();
  }

  return (
    <DrawerPanel
      ariaLabel="Plan with Beacon"
      onClose={onClose}
      header={
        <DrawerHeaderShell
          onClose={onClose}
          title={
            <span className="inline-flex items-center gap-2">
              <SvgIcon name="aiSparkle" size={20} />
              Plan with Beacon
            </span>
          }
        />
      }
      footer={
        !loading ? (
          <Button className="w-full" disabled={selectedIds.size === 0} onClick={handleAddSelected}>
            Add to Plan{selectedIds.size > 0 ? ` (${selectedIds.size} selected)` : ""}
          </Button>
        ) : undefined
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

      {loading ? (
        <>
          <div className="px-[var(--space-4)] pb-[var(--space-4)]">
            <div className="h-4 w-48 rounded-[var(--radius-sm)] bg-shimmer" />
            <div className="mt-2 h-3 w-32 rounded-[var(--radius-sm)] bg-shimmer" />
          </div>
          <BeaconPlanDrawerShimmer count={5} />
        </>
      ) : (
        <>
          <div className="flex items-center justify-between px-[var(--space-4)] pb-[var(--space-4)]">
            <div>
              <p className="text-[var(--text-section-size)] font-semibold text-[var(--color-foreground)]">
                Item type recommendations
              </p>
              <p className="mt-0.5 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
                {availableItems.length} item types available
              </p>
            </div>
            {availableItems.length > 0 && (
              <Button variant="ghost" size="sm" className="h-auto px-0 py-0" onClick={toggleAll}>
                {selectedIds.size === availableItems.length ? "Deselect all" : "Select all"}
              </Button>
            )}
          </div>

          <ul className="space-y-[var(--space-3)] px-[var(--space-4)] pb-[var(--space-4)]">
            {availableItems.map((item) => (
              <li key={item.id}>
                <GapItemCard
                  item={item}
                  selectable
                  selected={selectedIds.has(item.id)}
                  onToggleSelect={() => toggleItem(item.id)}
                />
              </li>
            ))}
            {availableItems.length === 0 && (
              <li className="py-8 text-center text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
                All recommended item types are already in your plan.
              </li>
            )}
          </ul>
        </>
      )}
    </DrawerPanel>
  );
}
