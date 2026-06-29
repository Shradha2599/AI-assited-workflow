import { tool } from "ai";
import { z } from "zod";
import { categories, getHighPriorityCategories, getPlannedItemTypes, getTotalPlannedRevenue, dashboardKpis } from "@/lib/mock-data/assortment";

export const assortmentTool = tool({
  description:
    "Analyze assortment gaps, categories, competitor positioning, revenue opportunities, and planned item types. Use this when the user asks about gaps, categories, competitors, assortment planning, or revenue targets.",
  parameters: z.object({
    query: z.enum([
      "all_gaps",
      "high_priority",
      "planned_items",
      "revenue_summary",
      "competitor_comparison",
      "category_detail",
    ]),
    categoryId: z.string().optional().describe("Filter by specific category ID (e.g. 'lighting', 'kitchen-dining')"),
  }),
  execute: async ({ query, categoryId }) => {
    switch (query) {
      case "all_gaps":
        return {
          totalGapValue: dashboardKpis.totalGapValue,
          highPriorityGaps: dashboardKpis.highPriorityGaps,
          categories: categories.map((c) => ({
            name: c.name,
            gapPercent: c.gapPercent,
            priority: c.priority,
            topCompetitor: c.topCompetitor,
            estimatedRevenue: c.estimatedRevenue,
          })),
        };

      case "high_priority":
        return {
          categories: getHighPriorityCategories().map((c) => ({
            name: c.name,
            gapPercent: c.gapPercent,
            topCompetitor: c.topCompetitor,
            estimatedRevenue: c.estimatedRevenue,
            topItemGaps: c.itemTypes.slice(0, 3).map((it) => it.name),
          })),
        };

      case "planned_items": {
        const planned = getPlannedItemTypes();
        return {
          totalPlanned: planned.length,
          totalPlannedRevenue: getTotalPlannedRevenue(),
          items: planned.map((it) => ({
            name: it.name,
            category: it.category,
            quarterTarget: it.quarterTarget,
            estimatedRevenue: it.estimatedRevenue,
            lagPercent: it.lagPercent,
          })),
        };
      }

      case "revenue_summary":
        return {
          totalRevenue: dashboardKpis.totalRevenue,
          revenueGoal: dashboardKpis.revenueGoal,
          assortmentGapCovered: dashboardKpis.assortmentGapCovered,
          activeSellers: dashboardKpis.activeSellers,
          totalGapOpportunity: dashboardKpis.totalGapValue,
        };

      case "competitor_comparison":
        return {
          categories: categories.map((c) => ({
            category: c.name,
            targetGap: `${c.gapPercent}% lag`,
            topCompetitor: c.topCompetitor,
            revenueAtRisk: c.estimatedRevenue,
          })),
        };

      case "category_detail": {
        const cat = categoryId
          ? categories.find((c) => c.id === categoryId || c.name.toLowerCase() === categoryId.toLowerCase())
          : null;
        if (!cat) return { error: "Category not found. Available: " + categories.map((c) => c.id).join(", ") };
        return {
          name: cat.name,
          gapPercent: cat.gapPercent,
          priority: cat.priority,
          topCompetitor: cat.topCompetitor,
          estimatedRevenue: cat.estimatedRevenue,
          itemTypes: cat.itemTypes.map((it) => ({
            name: it.name,
            lagPercent: it.lagPercent,
            competitorSkus: it.competitorSkus,
            estimatedRevenue: it.estimatedRevenue,
            isPlanned: it.isPlanned,
            quarterTarget: it.quarterTarget,
          })),
        };
      }

      default:
        return { error: "Unknown query type" };
    }
  },
});
