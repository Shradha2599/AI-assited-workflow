import type { BusinessContext, BeaconReasoning } from "@/lib/beacon/business-context/types";

/** Observe → analyze → detect → reason */
export function runBeaconReasoning(ctx: BusinessContext): BeaconReasoning {
  const revenueAtRisk = ctx.projectedAttainmentPct < 95 && ctx.forecastGapM > 0.5;
  const seasonalPressure =
    ctx.seasonalEvents.some((e) => e.urgency === "high") &&
    (ctx.acquisitionOutreachPending.length > 0 || ctx.unscheduledPlanItems.length > 0);
  const assortmentGap = ctx.topGapCategory.gapPct >= 15;
  const pipelineThin =
    ctx.qualifiedSellerCount > 0 &&
    ctx.sellerPipeline.shortlisted < Math.max(3, ctx.qualifiedSellerCount / 4);
  const launchBacklog = ctx.launchReadyPartners > 0;
  const onboardingBlocked = ctx.blockedPartners > 0;
  const planIncomplete =
    ctx.unscheduledPlanItems.length > 0 || ctx.acquisitionOutreachPending.length > 0;

  const summaryLines: string[] = [];
  if (revenueAtRisk) {
    summaryLines.push(
      `${ctx.currentCategory} is projected at ${ctx.projectedAttainmentPct}% of the ${ctx.currentQuarter} revenue goal ($${ctx.forecastGapM.toFixed(1)}M gap).`,
    );
  }
  if (seasonalPressure) {
    summaryLines.push(
      `Seasonal windows (${ctx.seasonalEvents.map((e) => e.name).join(", ")}) require updated acquisition timing on the merchant calendar.`,
    );
  }
  if (assortmentGap) {
    summaryLines.push(
      `${ctx.topGapCategory.label} remains ${ctx.topGapCategory.gapPct}% behind Amazon assortment depth.`,
    );
  }
  if (pipelineThin && ctx.qualifiedSellerCount > 0) {
    summaryLines.push(
      `${ctx.qualifiedSellerCount} high-confidence sellers can support gap recovery — shortlist depth is still low.`,
    );
  }
  if (launchBacklog) {
    summaryLines.push(`${ctx.launchReadyPartners} partners are launch-ready pending TM action.`);
  }
  if (onboardingBlocked) {
    summaryLines.push(`${ctx.blockedPartners} onboarding partners have blockers before launch.`);
  }

  return {
    revenueAtRisk,
    seasonalPressure,
    assortmentGap,
    pipelineThin,
    launchBacklog,
    onboardingBlocked,
    planIncomplete,
    summaryLines,
  };
}
