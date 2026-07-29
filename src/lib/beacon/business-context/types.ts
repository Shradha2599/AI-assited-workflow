import type { FiscalYearId } from "@/lib/mock-data/fy-plan-seeds";
import type { BeaconPage } from "@/lib/agents/system-prompt";

export type FiscalQuarter = "Q1" | "Q2" | "Q3" | "Q4";

export interface SeasonalEvent {
  name: string;
  monthIndex: number;
  urgency: "high" | "medium" | "low";
}

export interface BusinessOpportunity {
  id: string;
  title: string;
  category: string;
  revenueM: number;
  signal: string;
}

export interface PipelineCounts {
  discovered: number;
  shortlisted: number;
  contacted: number;
  onboarding: number;
  established: number;
}

export interface BusinessContext {
  page: BeaconPage;
  pathname: string;
  fiscalYear: FiscalYearId;
  fiscalYearLabel: string;
  currentQuarter: FiscalQuarter;
  remainingWeeksInQuarter: number;

  currentCategory: string;
  quarterlyRevenueGoalM: number;
  quarterlyRevenueGoalLabel: string;
  currentRevenueM: number;
  projectedRevenueM: number;
  projectedAttainmentPct: number;
  forecastGapM: number;

  plannedItemTypes: number;
  scheduledOnCalendar: number;
  unscheduledPlanItems: string[];
  acquisitionOutreachPending: string[];
  merchantCalendarVersion: string;

  sellerPipeline: PipelineCounts;
  qualifiedSellerCount: number;
  topQualifiedSeller?: { id: string; name: string; score: number; category: string };

  launchReadyPartners: number;
  blockedPartners: number;
  onboardingCapacityPct: number;

  topGapCategory: { label: string; gapPct: number; opportunity: string };
  opportunities: BusinessOpportunity[];
  seasonalEvents: SeasonalEvent[];
  marketTrends: string[];
}

export interface BeaconReasoning {
  revenueAtRisk: boolean;
  seasonalPressure: boolean;
  assortmentGap: boolean;
  pipelineThin: boolean;
  launchBacklog: boolean;
  onboardingBlocked: boolean;
  planIncomplete: boolean;
  summaryLines: string[];
}
