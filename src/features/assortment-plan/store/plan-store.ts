import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ScheduledCalendarItem {
  id: string;
  label: string;
  row: string;
  startMonth: number;
  span: number;
}

export interface CalendarVersion {
  id: string;
  name: string;
  scheduledItems: ScheduledCalendarItem[];
  createdAt: number;
}

const DEFAULT_VERSION_ID = "v-default";

interface PlanStore {
  planItems: string[];
  /** Revenue in millions for each plan item, keyed by item name */
  planRevenues: Record<string, number>;
  scheduledItems: ScheduledCalendarItem[];
  assortmentPlanningStarted: boolean;

  // ── Versioning ─────────────────────────────────────────────────────────────
  calendarVersions: CalendarVersion[];
  activeVersionId: string;

  // ── Plan item actions ──────────────────────────────────────────────────────
  addPlanItem: (name: string, revenueM?: number) => void;
  addPlanItems: (items: Array<{ name: string; revenueM: number }>) => void;
  removePlanItem: (name: string) => void;
  startAssortmentPlanning: () => void;

  // ── Calendar item actions ──────────────────────────────────────────────────
  scheduleItem: (label: string, row: string, startMonth: number, span?: number) => void;
  removeScheduledItem: (id: string) => void;
  updateScheduledItemSpan: (id: string, span: number) => void;
  updateScheduledItemStartMonth: (id: string, startMonth: number) => void;
  setScheduledItems: (items: ScheduledCalendarItem[]) => void;

  // ── Version actions ────────────────────────────────────────────────────────
  createVersion: (name: string) => void;
  switchVersion: (id: string) => void;
  renameVersion: (id: string, name: string) => void;
  deleteVersion: (id: string) => void;
}

/** Sync current scheduledItems back to the active version entry */
function syncActiveVersion(
  versions: CalendarVersion[],
  activeId: string,
  items: ScheduledCalendarItem[],
): CalendarVersion[] {
  return versions.map((v) => (v.id === activeId ? { ...v, scheduledItems: items } : v));
}

export const usePlanStore = create<PlanStore>()(
  persist(
    (set) => ({
      planItems: [],
      planRevenues: {},
      scheduledItems: [],
      assortmentPlanningStarted: false,

      calendarVersions: [
        { id: DEFAULT_VERSION_ID, name: "Version 1", scheduledItems: [], createdAt: Date.now() },
      ],
      activeVersionId: DEFAULT_VERSION_ID,

      // ── Plan items ──────────────────────────────────────────────────────────
      startAssortmentPlanning: () => set({ assortmentPlanningStarted: true }),

      addPlanItem: (name, revenueM) =>
        set((state) => ({
          assortmentPlanningStarted: true,
          planItems: state.planItems.includes(name)
            ? state.planItems
            : [...state.planItems, name],
          planRevenues:
            revenueM !== undefined
              ? { ...state.planRevenues, [name]: revenueM }
              : state.planRevenues,
        })),

      addPlanItems: (items) =>
        set((state) => {
          const newNames = items.map((i) => i.name);
          const merged = [...state.planItems];
          const revenues = { ...state.planRevenues };
          for (const { name, revenueM } of items) {
            if (!merged.includes(name)) merged.push(name);
            revenues[name] = revenueM;
          }
          return {
            assortmentPlanningStarted: true,
            planItems: merged,
            planRevenues: revenues,
          };
        }),

      removePlanItem: (name) =>
        set((state) => {
          const revenues = { ...state.planRevenues };
          delete revenues[name];
          return {
            planItems: state.planItems.filter((item) => item !== name),
            planRevenues: revenues,
          };
        }),

      // ── Calendar items ──────────────────────────────────────────────────────
      scheduleItem: (label, row, startMonth, span = 2) =>
        set((state) => {
          const updated = [
            ...state.scheduledItems.filter((item) => item.label !== label),
            { id: `sch-${Date.now()}`, label, row, startMonth, span },
          ];
          return {
            scheduledItems: updated,
            calendarVersions: syncActiveVersion(state.calendarVersions, state.activeVersionId, updated),
          };
        }),

      removeScheduledItem: (id) =>
        set((state) => {
          const updated = state.scheduledItems.filter((item) => item.id !== id);
          return {
            scheduledItems: updated,
            calendarVersions: syncActiveVersion(state.calendarVersions, state.activeVersionId, updated),
          };
        }),

      updateScheduledItemSpan: (id, span) =>
        set((state) => {
          const updated = state.scheduledItems.map((item) =>
            item.id === id ? { ...item, span } : item,
          );
          return {
            scheduledItems: updated,
            calendarVersions: syncActiveVersion(state.calendarVersions, state.activeVersionId, updated),
          };
        }),

      updateScheduledItemStartMonth: (id, startMonth) =>
        set((state) => {
          const updated = state.scheduledItems.map((item) =>
            item.id === id ? { ...item, startMonth } : item,
          );
          return {
            scheduledItems: updated,
            calendarVersions: syncActiveVersion(state.calendarVersions, state.activeVersionId, updated),
          };
        }),

      setScheduledItems: (items) =>
        set((state) => ({
          scheduledItems: items,
          calendarVersions: syncActiveVersion(state.calendarVersions, state.activeVersionId, items),
        })),

      // ── Versioning ──────────────────────────────────────────────────────────
      createVersion: (name) =>
        set((state) => {
          const newId = `v-${Date.now()}`;
          // Persist current items into the active version before switching
          const savedVersions = syncActiveVersion(
            state.calendarVersions,
            state.activeVersionId,
            state.scheduledItems,
          );
          const newVersion: CalendarVersion = {
            id: newId,
            name: name.trim() || `Version ${savedVersions.length + 1}`,
            scheduledItems: [],
            createdAt: Date.now(),
          };
          return {
            calendarVersions: [...savedVersions, newVersion],
            activeVersionId: newId,
            scheduledItems: [],
          };
        }),

      switchVersion: (id) =>
        set((state) => {
          if (id === state.activeVersionId) return {};
          // Save current items to active version
          const savedVersions = syncActiveVersion(
            state.calendarVersions,
            state.activeVersionId,
            state.scheduledItems,
          );
          const target = savedVersions.find((v) => v.id === id);
          return {
            calendarVersions: savedVersions,
            activeVersionId: id,
            scheduledItems: target?.scheduledItems ?? [],
          };
        }),

      renameVersion: (id, name) =>
        set((state) => ({
          calendarVersions: state.calendarVersions.map((v) =>
            v.id === id ? { ...v, name: name.trim() || v.name } : v,
          ),
        })),

      deleteVersion: (id) =>
        set((state) => {
          if (state.calendarVersions.length <= 1) return {}; // keep at least one
          const remaining = state.calendarVersions.filter((v) => v.id !== id);
          const needsSwitch = state.activeVersionId === id;
          const newActive = needsSwitch ? remaining[0] : remaining.find((v) => v.id === state.activeVersionId);
          return {
            calendarVersions: remaining,
            activeVersionId: newActive!.id,
            scheduledItems: needsSwitch ? newActive!.scheduledItems : state.scheduledItems,
          };
        }),
    }),
    {
      name: "assortment-plan-v4",
      skipHydration: true,
      // Only persist calendar versions & schedule — plan items always start fresh
      partialize: (state) => ({
        calendarVersions: state.calendarVersions,
        activeVersionId: state.activeVersionId,
        scheduledItems: state.scheduledItems,
      }),
    },
  ),
);
