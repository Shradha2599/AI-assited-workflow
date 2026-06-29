import type { BeaconPage } from "./system-prompt";
import { categories, dashboardKpis, getHighPriorityCategories, getPlannedItemTypes } from "@/lib/mock-data/assortment";
import { sellers, getSellersByStatus, getTopSellers } from "@/lib/mock-data/sellers";
import { onboardingPartners, getBlockedOnboardingTasks } from "@/lib/mock-data/onboarding";

function formatCurrency(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

export function loadPageData(page: BeaconPage): string {
  switch (page) {
    case "dashboard": {
      const kpis = dashboardKpis;
      const topGaps = getHighPriorityCategories().slice(0, 4);
      const pipeline = {
        discovered: getSellersByStatus("discovered").length,
        shortlisted: getSellersByStatus("shortlisted").length,
        contacted: getSellersByStatus("contacted").length,
        onboarding: getSellersByStatus("onboarding").length,
        established: getSellersByStatus("established").length,
      };
      return `
## Live Dashboard Data
- Total Revenue: ${formatCurrency(kpis.totalRevenue.value)} (↑${kpis.totalRevenue.changePercent}% YoY)
- Revenue Goal: ${formatCurrency(kpis.revenueGoal.value)} (${kpis.assortmentGapCovered.value}% gap covered)
- Active Sellers: ${kpis.activeSellers.value.toLocaleString()} (↑${kpis.activeSellers.changePercent}%)
- Total Assortment Gap Opportunity: ${formatCurrency(kpis.totalGapValue)}
- High-Priority Gaps: ${kpis.highPriorityGaps}

## Seller Pipeline
- Discovered: ${pipeline.discovered} | Shortlisted: ${pipeline.shortlisted} | Contacted: ${pipeline.contacted}
- In Onboarding: ${pipeline.onboarding} | Established: ${pipeline.established}

## Top Category Gaps
${topGaps.map((c) => `- ${c.name}: ${c.gapPercent}% lag vs ${c.topCompetitor}, ${formatCurrency(c.estimatedRevenue)} opportunity`).join("\n")}
`;
    }

    case "assortment-gap": {
      const allCats = categories;
      const highPri = getHighPriorityCategories();
      return `
## Assortment Gap Data
Revenue Goal: $50.0M | Total Opportunity: $52.8M | 47 gaps identified

## Category Gap Breakdown (by priority)
${allCats
  .map(
    (c) =>
      `- **${c.name}** [${c.priority}]: ${c.gapPercent}% lag vs ${c.topCompetitor}, ${formatCurrency(c.estimatedRevenue)} opportunity`
  )
  .join("\n")}

## Top Missing Item Types (High Priority Categories)
${highPri
  .flatMap((c) =>
    c.itemTypes
      .filter((it) => !it.isPlanned)
      .slice(0, 2)
      .map((it) => `- ${it.name} (${c.name}): ${it.lagPercent}% lag, ${it.competitorSkus} competitor SKUs, ${formatCurrency(it.estimatedRevenue)} est. revenue`)
  )
  .join("\n")}

## Competitors
- Amazon leads in: Lighting, Kitchen & Dining, Holiday & Festive Decor, Storage & Organization
- Home Depot leads in: Outdoor Living & Garden
- Wayfair leads in: Rugs
`;
    }

    case "assortment-plan": {
      const planned = getPlannedItemTypes();
      const totalRevenue = planned.reduce((s, it) => s + it.estimatedRevenue, 0);
      return `
## Assortment Plan FY 2025-26
Planned Items: ${planned.length} | Planned Revenue: ${formatCurrency(totalRevenue)}

## Planned Item Types by Quarter
${["Q1", "Q2", "Q3", "Q4"]
  .map((q) => {
    const items = planned.filter((it) => it.quarterTarget === q);
    if (!items.length) return null;
    return `**${q}:** ${items.map((it) => `${it.name} (${it.category})`).join(", ")}`;
  })
  .filter(Boolean)
  .join("\n")}

## Seasonal Windows
- Q1 (Nov-Dec): Fall — Thanksgiving & Christmas peak
- Q2 (Jan-Feb): Winter — New Year
- Q3 (Mar-Jun): Summer — Valentine's, Easter
- Q4 (Jul-Oct): Spring — Labour Day, Back to School, Halloween
`;
    }

    case "lead-discovery": {
      const top = getTopSellers(10);
      const shortlisted = getSellersByStatus("shortlisted");
      return `
## Lead Discovery Summary
Total Leads in System: ${sellers.length} | High Match (>8.0 score): ${sellers.filter((s) => s.confidenceScore >= 8).length}
Shortlisted: ${shortlisted.length} | In Onboarding: ${getSellersByStatus("onboarding").length}

## Top 10 Sellers by Confidence Score
${top
  .map(
    (s) =>
      `- **${s.legalBusinessName}** (${s.category}): ${s.confidenceScore}/10 confidence, ${formatCurrency(s.gmv)} GMV, ${s.skus.toLocaleString()} SKUs, ${s.marketplaces.join("/")}${s.viralTrendy ? ", viral/trendy" : ""}`
  )
  .join("\n")}

## Shortlisted Sellers
${shortlisted.map((s) => `- ${s.legalBusinessName} (${s.category}): ${s.confidenceScore}/10`).join("\n")}
`;
    }

    case "partner-onboarding": {
      const blocked = getBlockedOnboardingTasks();
      return `
## Onboarding Pipeline
Partners in Onboarding: ${onboardingPartners.length}

${onboardingPartners
  .map((p) => {
    const totalTasks = p.sections.reduce((s, sec) => s + sec.totalSteps, 0);
    const doneTasks = p.sections.reduce((s, sec) => s + sec.completedSteps, 0);
    const blockers = p.sections.flatMap((sec) => sec.tasks.filter((t) => t.issue));
    return `## ${p.sellerName}
- Progress: ${p.overallProgress}% (${doneTasks}/${totalTasks} tasks)
- Assigned To: ${p.assignedTo}
- Target Launch: ${p.targetLaunchDate}
- Blockers: ${blockers.length > 0 ? blockers.map((t) => t.issue).join("; ") : "None"}
- Section Status: ${p.sections.map((s) => `${s.title} ${s.completedSteps}/${s.totalSteps}`).join(", ")}`;
  })
  .join("\n\n")}

## Active Blockers Across All Partners
${blocked.length > 0 ? blocked.map((t) => `- ${t.sellerId}: ${t.title} — ${t.issue}`).join("\n") : "No blockers"}
`;
    }

    default:
      return "";
  }
}
