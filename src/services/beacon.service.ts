import type { RecommendedTask } from "@/components/ai/tasks-panel";
import { dashboardTasks, gapAnalysisTasks, planTasks } from "@/services/analytics.service";

export const defaultRecommendedTasks: RecommendedTask[] = dashboardTasks;

export { dashboardTasks, gapAnalysisTasks, planTasks };

export const dashboardBeaconContext = {
  pageId: "dashboard",
  pageTitle: "Dashboard",
  summary:
    "47 active assortment gaps identified with $2.4M revenue opportunity. Electronics category shows highest priority.",
  recommendations: [],
};

export const assortmentGapBeaconContext = {
  pageId: "assortment-gap",
  pageTitle: "Assortment Gap Analysis",
  summary: "4 high-priority gaps detected across Electronics and Home & Garden categories.",
  recommendations: [],
};

export const assortmentPlanBeaconContext = {
  pageId: "assortment-plan",
  pageTitle: "Assortment Plan",
  summary: "2 active plans in progress. Q3 Electronics plan is ready for calendar generation.",
  recommendations: [],
};

export const calendarBeaconContext = {
  pageId: "calendar",
  pageTitle: "Calendar",
  summary: "3 upcoming events in the next 30 days including 1 seller kickoff.",
  recommendations: [],
};
