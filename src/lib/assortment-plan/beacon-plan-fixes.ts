import type { ScheduledCalendarItem } from "@/features/assortment-plan/store/plan-store";
import {
  acquisitionWindowForItem,
  estimateRevenueM,
  rowForPlanItem,
  schedulePlanItems,
} from "@/lib/assortment-plan/plan-acquisition-schedule";

function applyWindow(
  item: ScheduledCalendarItem,
  planRevenues: Record<string, number>,
  monthOffset = 0,
): ScheduledCalendarItem {
  const revenueM = estimateRevenueM(item.label, planRevenues);
  const { row, startMonth, span } = acquisitionWindowForItem(item.label, revenueM);
  const start = Math.min(11, (startMonth + monthOffset) % 12);
  return { ...item, row, startMonth: start, span };
}

export function applyBeaconPlanFix(
  taskId: string,
  state: {
    planItems: string[];
    scheduledItems: ScheduledCalendarItem[];
    planRevenues: Record<string, number>;
  },
): {
  scheduledItems: ScheduledCalendarItem[];
  planRevenues: Record<string, number>;
} {
  let scheduledItems = state.scheduledItems.map((item) => ({ ...item }));
  const planRevenues = { ...state.planRevenues };

  const scheduledLabels = new Set(scheduledItems.map((s) => s.label));

  if (taskId === "apt-unscheduled" || taskId === "apt-drag") {
    const unscheduled = state.planItems.filter((p) => !scheduledLabels.has(p));
    const planned = schedulePlanItems(unscheduled, planRevenues);
    planned.forEach((entry, index) => {
      scheduledItems = [
        ...scheduledItems.filter((item) => item.label !== entry.label),
        {
          id: `sch-beacon-${Date.now()}-${index}`,
          label: entry.label,
          row: entry.row,
          startMonth: entry.startMonth,
          span: entry.span,
        },
      ];
    });
  }

  if (taskId === "apt-no-revenue") {
    const nextRevenues = { ...planRevenues };
    for (const name of state.planItems) {
      if (!nextRevenues[name] || nextRevenues[name] <= 0) {
        nextRevenues[name] = estimateRevenueM(name, nextRevenues);
      }
    }
    scheduledItems = scheduledItems.map((item) => applyWindow(item, nextRevenues));
    return { scheduledItems, planRevenues: nextRevenues };
  }

  if (taskId === "apt-quarter-cluster") {
    scheduledItems = scheduledItems.map((item, index) =>
      applyWindow(item, planRevenues, (index % 5) * 2),
    );
  }

  if (taskId.startsWith("apt-late-")) {
    scheduledItems = scheduledItems.map((item) => {
      const lower = item.label.toLowerCase();
      if (
        lower.includes("halloween") ||
        lower.includes("holiday") ||
        lower.includes("thanksgiving") ||
        lower.includes("christmas")
      ) {
        return applyWindow(item, planRevenues);
      }
      return item;
    });
  }

  if (taskId === "apt-row-overload") {
    const perRowIndex = new Map<string, number>();
    scheduledItems = scheduledItems.map((item) => {
      const row = rowForPlanItem(item.label);
      const idx = perRowIndex.get(row) ?? 0;
      perRowIndex.set(row, idx + 1);
      return applyWindow({ ...item, row }, planRevenues, idx * 2);
    });
  }

  return { scheduledItems, planRevenues };
}
