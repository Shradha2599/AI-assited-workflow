import { create } from "zustand";

import {
  type FiscalYearId,
  getFYPlanSeed,
} from "@/lib/mock-data/fy-plan-seeds";
import { getAcquisitionWindow } from "@/lib/mock-data/seasonal-acquisition";

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

const INITIAL_FY: FiscalYearId = "2025-2026";
const initialSeed = getFYPlanSeed(INITIAL_FY);

interface FYRuntimeState {
  planItems: string[];
  planRevenues: Record<string, number>;
  scheduledItems: ScheduledCalendarItem[];
  calendarVersions: CalendarVersion[];
  activeVersionId: string;
  baselinePlanItems: string[];
  baselineScheduledItems: ScheduledCalendarItem[];
  revenueGoal: string;
}

function snapshotFromState(state: FYRuntimeState): FYRuntimeState {
  return {
    planItems: [...state.planItems],
    planRevenues: { ...state.planRevenues },
    scheduledItems: state.scheduledItems.map((item) => ({ ...item })),
    calendarVersions: state.calendarVersions.map((version) => ({
      ...version,
      scheduledItems: version.scheduledItems.map((item) => ({ ...item })),
    })),
    activeVersionId: state.activeVersionId,
    baselinePlanItems: [...state.baselinePlanItems],
    baselineScheduledItems: state.baselineScheduledItems.map((item) => ({ ...item })),
    revenueGoal: state.revenueGoal,
  };
}

function applySnapshot(snapshot: FYRuntimeState): FYRuntimeState {
  return snapshotFromState(snapshot);
}

interface PlanStore extends FYRuntimeState {
  fiscalYear: FiscalYearId;
  fySnapshots: Partial<Record<FiscalYearId, FYRuntimeState>>;
  assortmentPlanningStarted: boolean;
  setRevenueGoal: (goal: string) => void;
  setFiscalYear: (fy: FiscalYearId) => void;
  getOpportunityItems: () => string[];
  getNewlyScheduledLabels: () => string[];
  hasPendingPlanChanges: () => boolean;

  addPlanItem: (name: string, revenueM?: number) => void;
  addPlanItems: (items: Array<{ name: string; revenueM: number }>) => void;
  removePlanItem: (name: string) => void;
  addGapItemsToCalendar: (itemNames: string[], category: string) => void;
  startAssortmentPlanning: () => void;

  scheduleItem: (label: string, row: string, startMonth: number, span?: number) => void;
  removeScheduledItem: (id: string) => void;
  updateScheduledItemSpan: (id: string, span: number) => void;
  updateScheduledItemStartMonth: (id: string, startMonth: number) => void;
  setScheduledItems: (items: ScheduledCalendarItem[]) => void;

  createVersion: (name: string) => void;
  switchVersion: (id: string) => void;
  renameVersion: (id: string, name: string) => void;
  deleteVersion: (id: string) => void;

  finalizeDrawerOpen: boolean;
  openFinalizeDrawer: () => void;
  closeFinalizeDrawer: () => void;
  notifyChangesDrawerOpen: boolean;
  openNotifyChangesDrawer: () => void;
  closeNotifyChangesDrawer: () => void;
}

function syncActiveVersion(
  versions: CalendarVersion[],
  activeId: string,
  items: ScheduledCalendarItem[],
): CalendarVersion[] {
  return versions.map((v) => (v.id === activeId ? { ...v, scheduledItems: items } : v));
}

export const usePlanStore = create<PlanStore>()((set, get) => ({
  fiscalYear: INITIAL_FY,
  fySnapshots: { [INITIAL_FY]: snapshotFromState(initialSeed) },
  ...applySnapshot(initialSeed),
  assortmentPlanningStarted: true,
  setRevenueGoal: (goal) => set({ revenueGoal: goal }),

  setFiscalYear: (fy) =>
    set((state) => {
      if (fy === state.fiscalYear) return state;

      const currentSnapshot = snapshotFromState(state);
      const nextSnapshots = { ...state.fySnapshots, [state.fiscalYear]: currentSnapshot };
      const loaded =
        nextSnapshots[fy] ?? applySnapshot(getFYPlanSeed(fy));

      return {
        fiscalYear: fy,
        fySnapshots: { ...nextSnapshots, [fy]: loaded },
        ...loaded,
        assortmentPlanningStarted: fy === "2025-2026" || loaded.planItems.length > 0,
      };
    }),

  getOpportunityItems: () => {
    const { planItems, baselinePlanItems } = get();
    const baseline = new Set(baselinePlanItems);
    return planItems.filter((item) => !baseline.has(item));
  },

  getNewlyScheduledLabels: () => {
    const { scheduledItems, baselineScheduledItems } = get();
    const baselineLabels = new Set(baselineScheduledItems.map((item) => item.label));
    return scheduledItems
      .filter((item) => !baselineLabels.has(item.label))
      .map((item) => item.label);
  },

  hasPendingPlanChanges: () => {
    const store = get();
    return store.getOpportunityItems().length > 0 || store.getNewlyScheduledLabels().length > 0;
  },

  startAssortmentPlanning: () => set({ assortmentPlanningStarted: true }),

  addPlanItem: (name, revenueM) =>
    set((state) => ({
      assortmentPlanningStarted: true,
      planItems: state.planItems.includes(name) ? state.planItems : [...state.planItems, name],
      planRevenues:
        revenueM !== undefined
          ? { ...state.planRevenues, [name]: revenueM }
          : state.planRevenues,
    })),

  addPlanItems: (items) =>
    set((state) => {
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
        scheduledItems: state.scheduledItems.filter((item) => item.label !== name),
      };
    }),

  addGapItemsToCalendar: (itemNames, category) => {
    const store = get();
    const targetFy: FiscalYearId = "2025-2026";

    if (store.fiscalYear !== targetFy) {
      store.setFiscalYear(targetFy);
    }

    for (let i = 0; i < itemNames.length; i++) {
      const name = itemNames[i];
      const { row, startMonth, span } = getAcquisitionWindow(category, i);

      if (!get().planItems.includes(name)) {
        get().addPlanItem(name);
      }

      set((state) => {
        const updated = [
          ...state.scheduledItems.filter((item) => item.label !== name),
          { id: `sch-gap-${Date.now()}-${i}`, label: name, row, startMonth, span },
        ];
        return {
          scheduledItems: updated,
          calendarVersions: syncActiveVersion(state.calendarVersions, state.activeVersionId, updated),
        };
      });
    }
  },

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

  createVersion: (name) =>
    set((state) => {
      const newId = `v-${Date.now()}`;
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
      if (state.calendarVersions.length <= 1) return {};
      const remaining = state.calendarVersions.filter((v) => v.id !== id);
      const needsSwitch = state.activeVersionId === id;
      const newActive = needsSwitch ? remaining[0] : remaining.find((v) => v.id === state.activeVersionId);
      return {
        calendarVersions: remaining,
        activeVersionId: newActive!.id,
        scheduledItems: needsSwitch ? newActive!.scheduledItems : state.scheduledItems,
      };
    }),

  finalizeDrawerOpen: false,
  openFinalizeDrawer: () => set({ finalizeDrawerOpen: true }),
  closeFinalizeDrawer: () => set({ finalizeDrawerOpen: false }),
  notifyChangesDrawerOpen: false,
  openNotifyChangesDrawer: () => set({ notifyChangesDrawerOpen: true }),
  closeNotifyChangesDrawer: () => set({ notifyChangesDrawerOpen: false }),
}));
