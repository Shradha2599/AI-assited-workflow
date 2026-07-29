"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { GapsDrawer } from "@/components/data-display/gaps-drawer";
import { useGapDrawerStore } from "@/features/assortment-gap/store/gap-drawer-store";
import { usePlanStore } from "@/features/assortment-plan/store/plan-store";
import type { FiscalYearId } from "@/lib/mock-data/fy-plan-seeds";

const CALENDAR_UPDATE_FY: FiscalYearId = "2025-2026";

export function GlobalGapDrawer() {
  const router = useRouter();
  const { open, category, displayCategory, items, mode, closeDrawer } = useGapDrawerStore();
  const fiscalYear = usePlanStore((s) => s.fiscalYear);
  const setFiscalYear = usePlanStore((s) => s.setFiscalYear);
  const planItems = usePlanStore((s) => s.planItems);
  const baselinePlanItems = usePlanStore((s) => s.baselinePlanItems);
  const addPlanItem = usePlanStore((s) => s.addPlanItem);
  const removePlanItem = usePlanStore((s) => s.removePlanItem);
  const addGapItemsToCalendar = usePlanStore((s) => s.addGapItemsToCalendar);
  const startGapCalendarImport = usePlanStore((s) => s.startGapCalendarImport);
  const calendarVersions = usePlanStore((s) => s.calendarVersions);
  const activeVersionId = usePlanStore((s) => s.activeVersionId);

  const isCalendarUpdate = mode === "calendar-update";

  useEffect(() => {
    if (open && isCalendarUpdate && fiscalYear !== CALENDAR_UPDATE_FY) {
      setFiscalYear(CALENDAR_UPDATE_FY);
    }
  }, [open, isCalendarUpdate, fiscalYear, setFiscalYear]);

  if (!open) return null;
  const activeVersion =
    calendarVersions.find((v) => v.id === activeVersionId) ?? calendarVersions[0];

  const drawerItems = items.map((item) => ({
    ...item,
    inPlan: planItems.includes(item.name),
  }));

  const newlyAddedItems = drawerItems.filter(
    (item) => planItems.includes(item.name) && !baselinePlanItems.includes(item.name),
  );
  const canAddToCalendar = newlyAddedItems.length >= 1;

  const revenuePlannedPercent = Math.min(planItems.length * 2, 100);
  const plannedRevenue =
    planItems.length > 0 ? `$${(planItems.length * 1.6).toFixed(1)}M` : "$0M";

  function handleAddToCalendar() {
    if (!canAddToCalendar) return;

    const namesToAdd = newlyAddedItems.map((item) => item.name);
    startGapCalendarImport();
    addGapItemsToCalendar(namesToAdd, category);
    closeDrawer();
    router.push("/assortment/plan");
  }

  function ensureCalendarUpdateFy() {
    if (isCalendarUpdate && fiscalYear !== CALENDAR_UPDATE_FY) {
      setFiscalYear(CALENDAR_UPDATE_FY);
    }
  }

  return (
    <GapsDrawer
      category={displayCategory}
      gapCount={items.length}
      items={drawerItems}
      variant={isCalendarUpdate ? "calendar-update" : "gap-analysis"}
      fiscalYearLabel="FY 2025-26"
      versionLabel={activeVersion?.name ?? "Version 1"}
      addToCalendarDisabled={!canAddToCalendar}
      revenueGoal="$50.0M"
      revenuePlanned={plannedRevenue}
      revenuePlannedPercent={revenuePlannedPercent}
      plannedMessage={
        planItems.length > 0
          ? `You are $${(50 - planItems.length * 1.6).toFixed(1)}M away from completing your assortment plan`
          : "You are $50.0M away from completing your assortment plan"
      }
      onClose={closeDrawer}
      onAddToCalendar={handleAddToCalendar}
      onAddToPlan={(id) => {
        ensureCalendarUpdateFy();
        const item = items.find((g) => g.id === id);
        if (item) addPlanItem(item.name);
      }}
      onRemoveFromPlan={(id) => {
        ensureCalendarUpdateFy();
        const item = items.find((g) => g.id === id);
        if (item) removePlanItem(item.name);
      }}
    />
  );
}
