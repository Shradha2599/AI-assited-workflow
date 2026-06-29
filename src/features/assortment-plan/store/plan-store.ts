import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ScheduledCalendarItem {
  id: string;
  label: string;
  row: string;
  startMonth: number;
  span: number;
}

interface PlanStore {
  planItems: string[];
  scheduledItems: ScheduledCalendarItem[];
  addPlanItem: (name: string) => void;
  removePlanItem: (name: string) => void;
  scheduleItem: (label: string, row: string, startMonth: number, span?: number) => void;
  removeScheduledItem: (id: string) => void;
  updateScheduledItemSpan: (id: string, span: number) => void;
  setScheduledItems: (items: ScheduledCalendarItem[]) => void;
}

const defaultScheduled: ScheduledCalendarItem[] = [
  { id: "sch-1", label: "Ceramic Serving High Bowls", row: "Kitchen & Dining", startMonth: 0, span: 3 },
  { id: "sch-2", label: "Cake Stands & Tiered Servers", row: "Kitchen & Dining", startMonth: 2, span: 2 },
  { id: "sch-3", label: "Pendant Lights", row: "Lighting", startMonth: 5, span: 3 },
];

export const usePlanStore = create<PlanStore>()(
  persist(
    (set) => ({
      planItems: [],
      scheduledItems: defaultScheduled,
      addPlanItem: (name) =>
        set((state) => ({
          planItems: state.planItems.includes(name)
            ? state.planItems
            : [...state.planItems, name],
        })),
      removePlanItem: (name) =>
        set((state) => ({
          planItems: state.planItems.filter((item) => item !== name),
        })),
      scheduleItem: (label, row, startMonth, span = 2) =>
        set((state) => ({
          scheduledItems: [
            ...state.scheduledItems.filter((item) => item.label !== label),
            {
              id: `sch-${Date.now()}`,
              label,
              row,
              startMonth,
              span,
            },
          ],
        })),
      removeScheduledItem: (id) =>
        set((state) => ({
          scheduledItems: state.scheduledItems.filter((item) => item.id !== id),
        })),
      updateScheduledItemSpan: (id, span) =>
        set((state) => ({
          scheduledItems: state.scheduledItems.map((item) =>
            item.id === id ? { ...item, span } : item,
          ),
        })),
      setScheduledItems: (items) => set({ scheduledItems: items }),
    }),
    { name: "assortment-plan", skipHydration: true },
  ),
);
