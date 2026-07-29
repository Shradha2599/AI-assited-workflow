import type { BusinessContext, BeaconReasoning } from "@/lib/beacon/business-context/types";
import type { BeaconPage } from "@/lib/agents/system-prompt";

export function generateConversationStarters(
  ctx: BusinessContext,
  reasoning: BeaconReasoning,
  page: BeaconPage,
): string[] {
  const starters: string[] = [];

  if (reasoning.revenueAtRisk) {
    starters.push("Why are we behind target?");
    starters.push("Show sellers that can recover the revenue gap.");
  }

  if (page === "dashboard" || page === "unknown") {
    if (!reasoning.revenueAtRisk) {
      starters.push(`How is ${ctx.currentCategory} pacing vs ${ctx.currentQuarter}?`);
    }
    starters.push("Which partners should we prioritize this week?");
  }

  if (page === "assortment-gap") {
    starters.push("Which categories should we expand first?");
    starters.push("Compare Target+ assortment depth against Amazon.");
  }

  if (page === "assortment-plan") {
    starters.push("Optimize my quarterly acquisition plan.");
    starters.push(`Can we still hit ${ctx.quarterlyRevenueGoalLabel} in ${ctx.currentQuarter}?`);
  }

  if (page === "lead-discovery") {
    starters.push("Why did Beacon choose these sellers?");
    starters.push("Draft outreach for my shortlisted leads.");
  }

  if (page === "partner-onboarding" || ctx.pathname === "/sellers/onboarding") {
    starters.push("What is blocking launch this week?");
    if (reasoning.launchBacklog) {
      starters.push("Launch all ready partners.");
    }
  }

  if (reasoning.seasonalPressure) {
    starters.push(`Are we ready for ${ctx.seasonalEvents[0]?.name ?? "seasonal"} demand?`);
  }

  const unique = [...new Set(starters)];
  return unique.slice(0, 4);
}
