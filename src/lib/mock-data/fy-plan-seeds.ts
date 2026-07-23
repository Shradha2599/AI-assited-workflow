import type { CalendarVersion, ScheduledCalendarItem } from "@/features/assortment-plan/store/plan-store";

export type FiscalYearId = "2025-2026" | "2026-2027";

export const FISCAL_YEAR_OPTIONS: Array<{ id: FiscalYearId; label: string; shortLabel: string }> = [
  { id: "2025-2026", label: "FY 2025-2026", shortLabel: "FY 2025-26" },
  { id: "2026-2027", label: "FY 2026-2027", shortLabel: "FY 2026-27" },
];

export function formatFYShort(fy: FiscalYearId): string {
  const [start, end] = fy.split("-");
  return `${start}–${end.slice(2)}`;
}

export interface FYPlanSeed {
  planItems: string[];
  planRevenues: Record<string, number>;
  scheduledItems: ScheduledCalendarItem[];
  calendarVersions: CalendarVersion[];
  activeVersionId: string;
  baselinePlanItems: string[];
  baselineScheduledItems: ScheduledCalendarItem[];
  revenueGoal: string;
}

/** Kitchen & Dining manager — dense overlapping calendar (18+ items, multi-lane) */
const FY_2025_26_SCHEDULED: ScheduledCalendarItem[] = [
  { id: "seed-1",  label: "Ceramic Serving High Bowls",           row: "Kitchen & Dining", startMonth: 0, span: 3 },
  { id: "seed-2",  label: "Sugar Bowl & Creamer Sets",            row: "Kitchen & Dining", startMonth: 0, span: 2 },
  { id: "seed-3",  label: "Crystal Wine Glass Sets",              row: "Kitchen & Dining", startMonth: 0, span: 2 },
  { id: "seed-4",  label: "Enameled Cast Iron Dutch Ovens",       row: "Kitchen & Dining", startMonth: 1, span: 2 },
  { id: "seed-5",  label: "Stainless Steel Sauté Pans",           row: "Kitchen & Dining", startMonth: 1, span: 2 },
  { id: "seed-6",  label: "Fine China Dinner Sets (12-pc)",       row: "Kitchen & Dining", startMonth: 2, span: 2 },
  { id: "seed-7",  label: "Knife Block Sets (7-pc)",              row: "Kitchen & Dining", startMonth: 2, span: 2 },
  { id: "seed-8",  label: "Ceramic Non-Stick Cookware Sets",      row: "Kitchen & Dining", startMonth: 2, span: 2 },
  { id: "seed-9",  label: "Linen Napkin & Placemat Sets",         row: "Kitchen & Dining", startMonth: 3, span: 2 },
  { id: "seed-10", label: "Buffet & Chafing Dishes",              row: "Kitchen & Dining", startMonth: 3, span: 2 },
  { id: "seed-11", label: "Rotating Spice Rack Towers",           row: "Kitchen & Dining", startMonth: 4, span: 2 },
  { id: "seed-12", label: "Stackable Canister Sets",              row: "Kitchen & Dining", startMonth: 4, span: 2 },
  { id: "seed-13", label: "Linen Tablecloths (60×120)",           row: "Kitchen & Dining", startMonth: 5, span: 2 },
  { id: "seed-14", label: "Charcuterie & Cheese Boards",          row: "Kitchen & Dining", startMonth: 5, span: 2 },
  { id: "seed-15", label: "Electric Kettle & Coffee Bundle",      row: "Kitchen & Dining", startMonth: 7, span: 3 },
  { id: "seed-16", label: "Glass Cake Domes",                     row: "Kitchen & Dining", startMonth: 8, span: 2 },
  { id: "seed-17", label: "Salad Bowl & Server Sets",             row: "Kitchen & Dining", startMonth: 9, span: 2 },
  { id: "seed-18", label: "Biodegradable Party Plate Sets",       row: "Party Supplies",   startMonth: 0, span: 3 },
];

const FY_2025_26_PLAN_ITEMS = FY_2025_26_SCHEDULED.map((item) => item.label);

const FY_2025_26_REVENUES: Record<string, number> = {
  "Ceramic Serving High Bowls": 1.5,
  "Sugar Bowl & Creamer Sets": 1.2,
  "Crystal Wine Glass Sets": 2.1,
  "Enameled Cast Iron Dutch Ovens": 3.1,
  "Stainless Steel Sauté Pans": 2.2,
  "Fine China Dinner Sets (12-pc)": 2.8,
  "Ceramic Non-Stick Cookware Sets": 2.4,
  "Knife Block Sets (7-pc)": 1.9,
  "Linen Napkin & Placemat Sets": 1.6,
  "Buffet & Chafing Dishes": 2.1,
  "Rotating Spice Rack Towers": 1.6,
  "Stackable Canister Sets": 1.3,
  "Linen Tablecloths (60×120)": 1.4,
  "Charcuterie & Cheese Boards": 1.6,
  "Electric Kettle & Coffee Bundle": 1.7,
  "Glass Cake Domes": 1.3,
  "Salad Bowl & Server Sets": 1.4,
  "Biodegradable Party Plate Sets": 1.8,
};

export function getFYPlanSeed(fy: FiscalYearId): FYPlanSeed {
  if (fy === "2026-2027") {
    return {
      planItems: [],
      planRevenues: {},
      scheduledItems: [],
      calendarVersions: [{ id: "v-default", name: "Version 1", scheduledItems: [], createdAt: Date.now() }],
      activeVersionId: "v-default",
      baselinePlanItems: [],
      baselineScheduledItems: [],
      revenueGoal: "",
    };
  }

  const scheduledItems = FY_2025_26_SCHEDULED.map((item) => ({ ...item }));
  return {
    planItems: [...FY_2025_26_PLAN_ITEMS],
    planRevenues: { ...FY_2025_26_REVENUES },
    scheduledItems,
    calendarVersions: [
      {
        id: "v-default",
        name: "Version 1",
        scheduledItems,
        createdAt: Date.now(),
      },
    ],
    activeVersionId: "v-default",
    baselinePlanItems: [...FY_2025_26_PLAN_ITEMS],
    baselineScheduledItems: scheduledItems.map((item) => ({ ...item })),
    revenueGoal: "$24.0M",
  };
}

export const HALLOWEEN_TRENDING_GAP_COUNT = 5;
