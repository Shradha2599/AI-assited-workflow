import type { RecommendedTask } from "@/components/ai/tasks-panel";
import type { BeaconPage } from "@/lib/agents/system-prompt";
import type { BusinessContext, BeaconReasoning } from "@/lib/beacon/business-context/types";

export interface RecommendationInput {
  ctx: BusinessContext;
  reasoning: BeaconReasoning;
}

function task(partial: RecommendedTask): RecommendedTask {
  return { priority: "high", ...partial };
}

function sellerIdFromPath(pathname: string): string | undefined {
  const match = pathname.match(/^\/sellers\/discovery\/([^/]+)/);
  return match?.[1];
}

function fallbackForPage(ctx: BusinessContext): RecommendedTask[] {
  return [
    task({
      id: "agent-monitor",
      title: "No urgent actions on this view",
      description: `${ctx.currentCategory} is pacing at ${ctx.projectedAttainmentPct}% of ${ctx.quarterlyRevenueGoalLabel} — I am watching forecast, assortment, and pipeline for this screen.`,
      actionLabel: ctx.page === "assortment-plan" ? "Review Plan →" : "Open Dashboard →",
      actionHref: ctx.page === "assortment-plan" ? "/assortment/plan" : "/dashboard",
      priority: "normal",
    }),
  ];
}

function buildDashboardRecs(ctx: BusinessContext, reasoning: BeaconReasoning): RecommendedTask[] {
  const recs: RecommendedTask[] = [];

  if (reasoning.revenueAtRisk) {
    recs.push(
      task({
        id: "agent-revenue-gap",
        title: "Revenue forecast below target",
        description: `Dashboard forecast shows ${ctx.currentCategory} at ${ctx.projectedAttainmentPct}% of ${ctx.currentQuarter} (${ctx.forecastGapM.toFixed(1)}M gap) — I prioritized sellers and assortment moves you can open from here.`,
        actionLabel: "View Sellers →",
        actionHref: ctx.topQualifiedSeller
          ? `/sellers/discovery/${ctx.topQualifiedSeller.id}`
          : "/sellers/discovery",
        sellerId: ctx.topQualifiedSeller?.id,
        score: ctx.topQualifiedSeller?.score,
        category: "acquisition",
      }),
    );
  }

  if (reasoning.assortmentGap) {
    recs.push(
      task({
        id: "agent-gap",
        title: `${ctx.topGapCategory.label} gap detected`,
        description: `Category KPIs flag ${ctx.topGapCategory.label} ${ctx.topGapCategory.gapPct}% behind Amazon — I mapped item-level opportunities on Gap Analysis.`,
        actionLabel: "Create Opportunities →",
        actionHref: "/assortment/gap",
        category: "acquisition",
      }),
    );
  }

  if (reasoning.seasonalPressure || ctx.acquisitionOutreachPending.length > 0) {
    const label =
      ctx.acquisitionOutreachPending.slice(0, 2).join(", ") ||
      ctx.seasonalEvents.find((e) => e.urgency === "high")?.name ||
      "seasonal item types";
    recs.push(
      task({
        id: "agent-seasonal-plan",
        title: "Holiday assortment behind plan",
        description: `Pipeline and calendar signals show ${label} still need timing — I prepared the merchant calendar and acquisition share flow on Assortment Plan.`,
        actionLabel: "Review Plan →",
        actionHref: "/assortment/plan#calendar",
        actionType: "scroll_plan_calendar",
        category: "plan",
      }),
    );
  }

  if (reasoning.launchBacklog) {
    recs.push(
      task({
        id: "agent-launch-ready",
        title: "Launch-ready partners waiting",
        description: `${ctx.launchReadyPartners} partners cleared onboarding on this dashboard view — I queued launch steps on Partner Onboarding.`,
        actionLabel: "Launch Partners →",
        actionHref: "/sellers/onboarding",
        category: "launch",
      }),
    );
  }

  if (reasoning.onboardingBlocked) {
    recs.push(
      task({
        id: "agent-blockers",
        title: "Onboarding blockers detected",
        description: `${ctx.blockedPartners} partners are stuck in review — each blocker links to the exact onboarding task from the pipeline chart.`,
        actionLabel: "Resolve Blockers →",
        actionHref: "/sellers/onboarding",
        category: "blocker",
      }),
    );
  }

  return recs.length ? recs.slice(0, 4) : fallbackForPage(ctx);
}

function buildGapRecs(ctx: BusinessContext, reasoning: BeaconReasoning): RecommendedTask[] {
  const recs: RecommendedTask[] = [];

  if (reasoning.assortmentGap) {
    recs.push(
      task({
        id: "agent-gap",
        title: `${ctx.topGapCategory.label} gap detected`,
        description: `On this heatmap, ${ctx.topGapCategory.label} trails Amazon by ${ctx.topGapCategory.gapPct}% (${ctx.topGapCategory.opportunity} opportunity) — I highlighted item types you can add to ${ctx.fiscalYearLabel}.`,
        actionLabel: "Add to Plan →",
        actionHref: "/assortment/plan",
        category: "acquisition",
      }),
    );
  }

  recs.push(
    task({
      id: "agent-gap-add",
      title: "Expand categories with highest lag",
      description: `Competitor depth is weakest where you are viewing gaps — I prepared a shortlist of ${ctx.opportunities.length} item types aligned to ${ctx.currentCategory}.`,
      actionLabel: "Create Opportunities →",
      actionHref: "/assortment/gap",
      category: "acquisition",
    }),
  );

  if (reasoning.revenueAtRisk) {
    recs.push(
      task({
        id: "agent-gap-revenue",
        title: "Close gap to recover forecast",
        description: `Closing the top gaps here would address roughly $${ctx.forecastGapM.toFixed(1)}M of the ${ctx.currentQuarter} shortfall — sellers on Lead Discovery match the missing item types.`,
        actionLabel: "View Sellers →",
        actionHref: "/sellers/discovery",
        category: "acquisition",
      }),
    );
  }

  if (reasoning.seasonalPressure) {
    const seasonal = ctx.opportunities.find((o) => /halloween|holiday/i.test(o.title));
    if (seasonal) {
      recs.push(
        task({
          id: "agent-gap-seasonal",
          title: "Seasonal items missing from plan",
          description: `${seasonal.title} shows demand in gap data but is not fully scheduled — I set acquisition months on the plan calendar.`,
          actionLabel: "Review Calendar →",
          actionHref: "/assortment/plan#calendar",
          actionType: "scroll_plan_calendar",
          category: "plan",
        }),
      );
    }
  }

  return recs.slice(0, 4);
}

function buildPlanRecs(ctx: BusinessContext, reasoning: BeaconReasoning): RecommendedTask[] {
  const recs: RecommendedTask[] = [];

  if (ctx.unscheduledPlanItems.length > 0) {
    recs.push(
      task({
        id: "agent-plan-schedule",
        title: `${ctx.unscheduledPlanItems.length} item types not on the calendar`,
        description: `On this plan, ${ctx.unscheduledPlanItems.slice(0, 3).join(", ")}${ctx.unscheduledPlanItems.length > 3 ? " and others" : ""} still need launch windows — I suggested ${ctx.currentQuarter} slots below.`,
        actionLabel: "Review Calendar →",
        actionHref: "/assortment/plan#calendar",
        actionType: "scroll_plan_calendar",
        category: "plan",
      }),
    );
  }

  if (ctx.acquisitionOutreachPending.length > 0) {
    recs.push(
      task({
        id: "agent-plan-share",
        title: "Acquisition plan ready to share",
        description: `New calendar adds (${ctx.acquisitionOutreachPending.slice(0, 2).join(", ")}) need Avon’s team to plan outreach for ${ctx.fiscalYearLabel} — the Finalize & Share brief is ready on this page.`,
        actionLabel: "Finalize & Share →",
        actionType: "open_finalize_drawer",
        category: "acquisition",
      }),
    );
  }

  if (reasoning.seasonalPressure || ctx.acquisitionOutreachPending.length > 0) {
    recs.push(
      task({
        id: "agent-seasonal-plan",
        title: "Holiday assortment behind plan",
        description: `Merchant calendar (${ctx.merchantCalendarVersion}) is light ahead of ${ctx.seasonalEvents.find((e) => e.urgency === "high")?.name ?? "peak season"} — I aligned item types with gap analysis.`,
        actionLabel: "Review Calendar →",
        actionHref: "/assortment/plan#calendar",
        actionType: "scroll_plan_calendar",
        category: "plan",
      }),
    );
  }

  if (reasoning.revenueAtRisk) {
    recs.push(
      task({
        id: "agent-plan-target",
        title: "Can we reach the quarterly target?",
        description: `Planned run-rate is $${ctx.currentRevenueM.toFixed(1)}M vs $${ctx.projectedRevenueM.toFixed(1)}M projected (${ctx.projectedAttainmentPct}%) — I flagged sellers to backfill unscheduled revenue.`,
        actionLabel: "View Sellers →",
        actionHref: "/sellers/discovery",
        category: "acquisition",
      }),
    );
  }

  return recs.length ? recs.slice(0, 4) : fallbackForPage(ctx);
}

function buildDiscoveryRecs(ctx: BusinessContext, reasoning: BeaconReasoning): RecommendedTask[] {
  const recs: RecommendedTask[] = [];

  if (ctx.sellerPipeline.shortlisted > 0) {
    recs.push(
      task({
        id: "agent-discovery-outreach",
        title: "Shortlisted leads need outreach",
        description: `${ctx.sellerPipeline.shortlisted} sellers on this table are shortlisted for ${ctx.fiscalYearLabel} — I drafted Target Plus intro mail with the partner application link.`,
        actionLabel: "Review Outreach →",
        actionHref: "/sellers/discovery",
        category: "acquisition",
      }),
    );
  }

  if (reasoning.pipelineThin && ctx.qualifiedSellerCount >= 1) {
    recs.push(
      task({
        id: "agent-sellers",
        title: "High-value sellers identified",
        description: `Lead Discovery surfaced ${ctx.qualifiedSellerCount} sellers at ≥8.5 confidence for ${ctx.currentCategory} — filters on this page match the revenue gap recovery list.`,
        actionLabel: "Review Outreach →",
        actionHref: "/sellers/discovery",
        category: "acquisition",
      }),
    );
  }

  if (reasoning.revenueAtRisk) {
    recs.push(
      task({
        id: "agent-revenue-gap",
        title: "Sellers that can recover the gap",
        description: `To close the $${ctx.forecastGapM.toFixed(1)}M ${ctx.currentQuarter} gap, I ranked discovery results by confidence and category fit to your plan.`,
        actionLabel: "View Top Seller →",
        actionHref: ctx.topQualifiedSeller
          ? `/sellers/discovery/${ctx.topQualifiedSeller.id}`
          : "/sellers/discovery",
        sellerId: ctx.topQualifiedSeller?.id,
        score: ctx.topQualifiedSeller?.score,
        category: "acquisition",
      }),
    );
  }

  if (reasoning.assortmentGap) {
    recs.push(
      task({
        id: "agent-discovery-gap",
        title: "Why these sellers match gap items",
        description: `${ctx.topGapCategory.label} gaps drive this lead list — each recommended seller covers item types you have not yet scheduled on the plan.`,
        actionLabel: "Add to Plan →",
        actionHref: "/assortment/plan",
        category: "acquisition",
      }),
    );
  }

  return recs.length ? recs.slice(0, 4) : fallbackForPage(ctx);
}

function buildSellerProfileRecs(ctx: BusinessContext, reasoning: BeaconReasoning): RecommendedTask[] {
  const sellerId = sellerIdFromPath(ctx.pathname);
  const recs: RecommendedTask[] = [];

  recs.push(
    task({
      id: "agent-seller-fit",
      title: "Seller fit for your plan",
      description: `This profile matches ${ctx.currentCategory} gaps for ${ctx.fiscalYearLabel} — I compared SKUs and confidence score against unscheduled plan item types.`,
      actionLabel: sellerId ? "Draft Outreach →" : "Back to Discovery →",
      actionHref: sellerId ? undefined : "/sellers/discovery",
      actionType: sellerId ? "open_outreach" : undefined,
      sellerId,
      mailType: "acquisition_outreach",
      category: "acquisition",
    }),
  );

  if (reasoning.revenueAtRisk && ctx.topQualifiedSeller) {
    recs.push(
      task({
        id: "agent-seller-gap",
        title: "Recover revenue from this category",
        description: `Shortlisting this seller supports the $${ctx.forecastGapM.toFixed(1)}M ${ctx.currentQuarter} gap alongside ${Math.min(3, ctx.qualifiedSellerCount)} similar leads.`,
        actionLabel: "View Similar Sellers →",
        actionHref: "/sellers/discovery",
        category: "acquisition",
      }),
    );
  }

  recs.push(
    task({
      id: "agent-seller-plan",
      title: "Add coverage to assortment plan",
      description: `If onboarded, this seller backfills item types still off the ${ctx.merchantCalendarVersion} calendar — I linked the plan rows that need coverage.`,
      actionLabel: "Review Plan →",
      actionHref: "/assortment/plan",
      category: "plan",
    }),
  );

  return recs.slice(0, 3);
}

function buildOnboardingRecs(ctx: BusinessContext, reasoning: BeaconReasoning): RecommendedTask[] {
  const recs: RecommendedTask[] = [];
  const onList = ctx.pathname === "/sellers/onboarding";

  // Pipeline-wide nudges belong on the onboarding list. A partner profile shows
  // only that partner's own review sub-tasks.
  if (onList && reasoning.onboardingBlocked) {
    recs.push(
      task({
        id: "agent-blockers",
        title: "Onboarding blockers detected",
        description: `${ctx.blockedPartners} partners on this list cannot launch until review tasks clear — I sorted them by revenue impact.`,
        actionLabel: "Resolve Blockers →",
        actionHref: "/sellers/onboarding",
        category: "blocker",
      }),
    );
  }

  if (onList && reasoning.launchBacklog) {
    recs.push(
      task({
        id: "agent-launch-ready",
        title: "Launch-ready partners waiting",
        description: `${ctx.launchReadyPartners} partners completed requirements on this pipeline view — launch actions are prepared without re-reading docs.`,
        actionLabel: "Launch Partners →",
        actionHref: "/sellers/onboarding",
        category: "launch",
      }),
    );
  }

  if (onList && ctx.sellerPipeline.contacted > 0) {
    recs.push(
      task({
        id: "agent-onboarding-outreach",
        title: "Contacted leads awaiting onboarding",
        description: `${ctx.sellerPipeline.contacted} contacted sellers should move into onboarding for ${ctx.currentQuarter} launches — I prepared kickoff mail templates.`,
        actionLabel: "Review Outreach →",
        actionHref: "/sellers/discovery",
        category: "acquisition",
      }),
    );
  }

  return recs.length ? recs.slice(0, 4) : fallbackForPage(ctx);
}

function buildForPage(
  page: BeaconPage,
  ctx: BusinessContext,
  reasoning: BeaconReasoning,
): RecommendedTask[] {
  switch (page) {
    case "dashboard":
      return buildDashboardRecs(ctx, reasoning);
    case "assortment-gap":
      return buildGapRecs(ctx, reasoning);
    case "assortment-plan":
      return buildPlanRecs(ctx, reasoning);
    case "lead-discovery":
      return buildDiscoveryRecs(ctx, reasoning);
    case "seller-profile":
      return buildSellerProfileRecs(ctx, reasoning);
    case "partner-onboarding":
      return buildOnboardingRecs(ctx, reasoning);
    default:
      return buildDashboardRecs(ctx, reasoning);
  }
}

/** Page-scoped recommendation cards for the side panel */
export function generateAgentRecommendations(input: RecommendationInput): RecommendedTask[] {
  const { ctx, reasoning } = input;
  return buildForPage(ctx.page, ctx, reasoning);
}
