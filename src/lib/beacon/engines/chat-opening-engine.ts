import type { BusinessContext, BeaconReasoning } from "@/lib/beacon/business-context/types";

/** Proactive opening when Chat with Beacon opens — not a generic greeting */
export function generateChatOpening(ctx: BusinessContext, reasoning: BeaconReasoning): string {
  const lines: string[] = [];

  if (reasoning.revenueAtRisk) {
    lines.push(
      `${ctx.currentCategory} is currently projected to achieve ${ctx.projectedAttainmentPct}% of its ${ctx.currentQuarter} revenue goal (${ctx.fiscalYearLabel}).`,
    );
    if (ctx.qualifiedSellerCount > 0) {
      lines.push(
        `I found ${Math.min(4, ctx.qualifiedSellerCount)} seller opportunities that can help recover the projected $${ctx.forecastGapM.toFixed(1)}M gap.`,
      );
    }
  } else {
    lines.push(
      `You're working in ${ctx.currentCategory} for ${ctx.fiscalYearLabel} (${ctx.currentQuarter}) — pacing at ${ctx.projectedAttainmentPct}% of ${ctx.quarterlyRevenueGoalLabel} with ${ctx.scheduledOnCalendar} item types on the merchant calendar.`,
    );
  }

  if (reasoning.seasonalPressure && ctx.acquisitionOutreachPending.length > 0) {
    lines.push(
      `Recent calendar changes (${ctx.acquisitionOutreachPending.slice(0, 2).join(", ")}) need acquisition follow-through before ${ctx.seasonalEvents.find((e) => e.urgency === "high")?.name ?? "peak season"}.`,
    );
  }

  if (reasoning.onboardingBlocked) {
    lines.push(`${ctx.blockedPartners} onboarding partners still have blockers I can walk you through.`);
  }

  const last =
    reasoning.revenueAtRisk && ctx.qualifiedSellerCount > 0
      ? "Would you like to review the sellers I prioritized?"
      : "What should we tackle first — assortment, sellers, or launch readiness?";

  lines.push("", last);

  return lines.join("\n");
}
