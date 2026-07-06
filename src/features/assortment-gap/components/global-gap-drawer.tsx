"use client";

import { GapsDrawer } from "@/components/data-display/gaps-drawer";
import { useGapDrawerStore } from "@/features/assortment-gap/store/gap-drawer-store";
import { usePlanStore } from "@/features/assortment-plan/store/plan-store";

export function GlobalGapDrawer() {
  const { open, category, items, closeDrawer } = useGapDrawerStore();
  const planItems = usePlanStore((s) => s.planItems);
  const addPlanItem = usePlanStore((s) => s.addPlanItem);
  const removePlanItem = usePlanStore((s) => s.removePlanItem);

  if (!open) return null;

  const drawerItems = items.map((item) => ({
    ...item,
    inPlan: planItems.includes(item.name),
  }));

  const revenuePlannedPercent = Math.min(planItems.length * 2, 100);
  const plannedRevenue =
    planItems.length > 0 ? `$${(planItems.length * 1.6).toFixed(1)}M` : "$0M";

  return (
    <GapsDrawer
      category={category}
      gapCount={items.length}
      items={drawerItems}
      revenueGoal="$50.0M"
      revenuePlanned={plannedRevenue}
      revenuePlannedPercent={revenuePlannedPercent}
      plannedMessage={
        planItems.length > 0
          ? `You are $${(50 - planItems.length * 1.6).toFixed(1)}M away from completing your assortment plan`
          : "You are $50.0M away from completing your assortment plan"
      }
      onClose={closeDrawer}
      onAddToPlan={(id) => {
        const item = items.find((g) => g.id === id);
        if (item) addPlanItem(item.name);
      }}
      onRemoveFromPlan={(id) => {
        const item = items.find((g) => g.id === id);
        if (item) removePlanItem(item.name);
      }}
    />
  );
}
