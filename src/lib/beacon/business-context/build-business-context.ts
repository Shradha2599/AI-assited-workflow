import type { BeaconPage } from "@/lib/agents/system-prompt";
import { cellCount } from "@/lib/mock-data/pipeline-partners";
import { sellers } from "@/lib/mock-data/sellers";
import { formatFYShort, type FiscalYearId } from "@/lib/mock-data/fy-plan-seeds";
import { parseRevenueGoalToMillions } from "@/lib/utils/revenue-goal-input";
import type { BeaconContextInput } from "@/lib/beacon/beacon-context";
import type { BusinessContext, FiscalQuarter, PipelineCounts, SeasonalEvent } from "./types";

const GAP_CATEGORIES = [
  { label: "Kitchen & Dining", gapPct: 28, opportunity: "$5.6M" },
  { label: "Lighting", gapPct: 22, opportunity: "$4.2M" },
  { label: "Holiday & Festive Decor", gapPct: 18, opportunity: "$3.1M" },
] as const;

const KITCHEN_PRIMARY = "Kitchen & Dining";

function inferQuarter(scheduled: { startMonth?: number }[]): FiscalQuarter {
  const counts = [0, 0, 0, 0];
  for (const item of scheduled) {
    const m = item.startMonth ?? 0;
    counts[Math.min(3, Math.floor(m / 3))] += 1;
  }
  const peak = counts.indexOf(Math.max(...counts, 1));
  return (`Q${Math.max(1, peak + 1)}` as FiscalQuarter);
}

function weeksLeftInQuarter(q: FiscalQuarter): number {
  const map: Record<FiscalQuarter, number> = { Q1: 9, Q2: 11, Q3: 8, Q4: 6 };
  return map[q];
}

function sumPlanRevenueM(
  planItems: string[],
  planRevenues: Record<string, number>,
): number {
  return planItems.reduce((sum, name) => sum + (planRevenues[name] ?? 1.2), 0);
}

function pipelineCounts(): PipelineCounts {
  return {
    discovered: cellCount("Discovered", KITCHEN_PRIMARY),
    shortlisted: cellCount("Shortlisted", KITCHEN_PRIMARY),
    contacted: cellCount("Contacted", KITCHEN_PRIMARY),
    onboarding: cellCount("Onboarding", KITCHEN_PRIMARY),
    established: cellCount("Established", KITCHEN_PRIMARY),
  };
}

function seasonalEvents(fy: FiscalYearId): SeasonalEvent[] {
  if (fy === "2026-2027") {
    return [{ name: "Back to School", monthIndex: 8, urgency: "medium" }];
  }
  return [
    { name: "Halloween", monthIndex: 11, urgency: "high" },
    { name: "Thanksgiving", monthIndex: 0, urgency: "high" },
    { name: "Holiday entertaining", monthIndex: 1, urgency: "high" },
  ];
}

export interface BuildBusinessContextOptions extends BeaconContextInput {
  page: BeaconPage;
  fiscalYear: FiscalYearId;
  discoveryShortlisted: number;
  discoveryContacted: number;
  discoveryDiscovered: number;
  acquisitionOutreachShareItems: string[];
  calendarVersionName: string;
}

export function buildBusinessContext(opts: BuildBusinessContextOptions): BusinessContext {
  const goalM =
    parseRevenueGoalToMillions(opts.revenueGoal ?? "") ??
    (opts.fiscalYear === "2025-2026" ? 24 : 50);
  const currentM = sumPlanRevenueM(opts.planItems, opts.planRevenues ?? {});
  const pipeline = pipelineCounts();
  const qualified = sellers.filter(
    (s) => s.confidenceScore >= 8.5 && (s.status === "discovered" || s.status === "shortlisted"),
  );
  const top = [...qualified].sort((a, b) => b.confidenceScore - a.confidenceScore)[0];
  const currentQuarter = inferQuarter(opts.scheduledItems);
  const projectedM = currentM * (opts.fiscalYear === "2025-2026" ? 0.91 : 0.78);
  const attainment = goalM > 0 ? Math.round((projectedM / goalM) * 100) : 0;
  const gapM = Math.max(0, goalM - projectedM);

  const unscheduled = opts.planItems.filter(
    (p) => !opts.scheduledItems.some((s) => s.label === p),
  );

  const topGap = GAP_CATEGORIES[0];
  const opportunities = [
    {
      id: "opp-cookware",
      title: "Premium cookware expansion",
      category: "Kitchen & Dining",
      revenueM: 2.4,
      signal: "Competitor depth +28% vs Target",
    },
    {
      id: "opp-halloween",
      title: "Halloween seasonal assortment",
      category: "Kitchen & Dining",
      revenueM: 1.6,
      signal: "Trending items not yet on calendar",
    },
    {
      id: "opp-lighting",
      title: "Smart lighting gap",
      category: "Lighting",
      revenueM: 1.1,
      signal: "Search spike ahead of Q4",
    },
  ];

  const halloweenPlanned = opts.planItems.some((n) => /halloween/i.test(n));
  if (!halloweenPlanned && opts.fiscalYear === "2025-2026") {
    opportunities.unshift({
      id: "opp-halloween-urgent",
      title: "Halloween item types behind plan",
      category: "Kitchen & Dining",
      revenueM: 1.8,
      signal: "Oct 31 demand window closing",
    });
  }

  return {
    page: opts.page,
    pathname: opts.pathname,
    fiscalYear: opts.fiscalYear,
    fiscalYearLabel: formatFYShort(opts.fiscalYear),
    currentQuarter,
    remainingWeeksInQuarter: weeksLeftInQuarter(currentQuarter),
    currentCategory: KITCHEN_PRIMARY,
    quarterlyRevenueGoalM: goalM,
    quarterlyRevenueGoalLabel: opts.revenueGoal?.trim() ? opts.revenueGoal : `$${goalM.toFixed(1)}M`,
    currentRevenueM: currentM,
    projectedRevenueM: projectedM,
    projectedAttainmentPct: attainment,
    forecastGapM: gapM,
    plannedItemTypes: opts.planItems.length,
    scheduledOnCalendar: opts.scheduledItems.length,
    unscheduledPlanItems: unscheduled,
    acquisitionOutreachPending: opts.acquisitionOutreachShareItems,
    merchantCalendarVersion: opts.calendarVersionName,
    sellerPipeline: {
      ...pipeline,
      discovered: Math.max(pipeline.discovered, opts.discoveryDiscovered),
      shortlisted: Math.max(pipeline.shortlisted, opts.discoveryShortlisted),
      contacted: Math.max(pipeline.contacted, opts.discoveryContacted),
    },
    qualifiedSellerCount: qualified.length,
    topQualifiedSeller: top
      ? {
          id: top.id,
          name: top.legalBusinessName,
          score: top.confidenceScore,
          category: top.category,
        }
      : undefined,
    launchReadyPartners: 2,
    blockedPartners: 3,
    onboardingCapacityPct: 72,
    topGapCategory: {
      label: topGap.label,
      gapPct: topGap.gapPct,
      opportunity: topGap.opportunity,
    },
    opportunities,
    seasonalEvents: seasonalEvents(opts.fiscalYear),
    marketTrends: [
      "Halloween tabletop search +34% YoY",
      "Premium cookware velocity up on Amazon",
      "Outdoor lighting early demand in Aug–Sep",
    ],
  };
}

export function businessContextToPrompt(ctx: BusinessContext): string {
  return [
    "=== BEACON BUSINESS CONTEXT (live) ===",
    `Page: ${ctx.page} | FY ${ctx.fiscalYearLabel} | ${ctx.currentQuarter} (${ctx.remainingWeeksInQuarter} weeks left)`,
    `Category: ${ctx.currentCategory}`,
    `Revenue goal: ${ctx.quarterlyRevenueGoalLabel} | Planned run-rate: $${ctx.currentRevenueM.toFixed(1)}M | Projected: $${ctx.projectedRevenueM.toFixed(1)}M (${ctx.projectedAttainmentPct}%) | Gap: $${ctx.forecastGapM.toFixed(1)}M`,
    `Assortment: ${ctx.plannedItemTypes} item types, ${ctx.scheduledOnCalendar} on calendar (${ctx.merchantCalendarVersion})`,
    ctx.unscheduledPlanItems.length
      ? `Unscheduled: ${ctx.unscheduledPlanItems.slice(0, 6).join(", ")}`
      : "All planned items scheduled",
    ctx.acquisitionOutreachPending.length
      ? `Pending acquisition share: ${ctx.acquisitionOutreachPending.join(", ")}`
      : "",
    `Pipeline — shortlisted: ${ctx.sellerPipeline.shortlisted}, contacted: ${ctx.sellerPipeline.contacted}, onboarding: ${ctx.sellerPipeline.onboarding}`,
    `Qualified sellers (≥8.5): ${ctx.qualifiedSellerCount}`,
    `Launch-ready: ${ctx.launchReadyPartners} | Blocked onboarding: ${ctx.blockedPartners} | Onboarding capacity: ${ctx.onboardingCapacityPct}%`,
    `Top gap: ${ctx.topGapCategory.label} (${ctx.topGapCategory.gapPct}% vs Amazon) — ${ctx.topGapCategory.opportunity}`,
    "Trends: " + ctx.marketTrends.join("; "),
    "Opportunities: " +
      ctx.opportunities
        .slice(0, 4)
        .map((o) => `${o.title} ($${o.revenueM}M)`)
        .join("; "),
  ]
    .filter(Boolean)
    .join("\n");
}
