import { tool } from "ai";
import { z } from "zod";
import { sellers, getSellersByCategory, getSellersByStatus, getTopSellers } from "@/lib/mock-data/sellers";

export const discoveryTool = tool({
  description:
    "Search, filter, and rank sellers. Use this when the user asks about finding sellers, lead discovery, confidence scores, seller matches for a category, shortlisted leads, or seller pipeline status.",
  parameters: z.object({
    query: z.enum([
      "top_sellers",
      "by_category",
      "by_status",
      "pipeline_summary",
      "high_confidence",
      "viral_sellers",
    ]),
    category: z.string().optional().describe("Filter by category name, e.g. 'Lighting'"),
    status: z
      .enum(["discovered", "shortlisted", "contacted", "applied", "approved", "onboarding", "established"])
      .optional(),
    limit: z.number().optional().default(10),
  }),
  execute: async ({ query, category, status, limit }) => {
    const formatSeller = (s: (typeof sellers)[0]) => ({
      id: s.id,
      name: s.legalBusinessName,
      category: s.category,
      gmv: s.gmv,
      skus: s.skus,
      rating: s.rating,
      confidenceScore: s.confidenceScore,
      marketplaces: s.marketplaces,
      viralTrendy: s.viralTrendy,
      status: s.status,
      location: s.location,
    });

    switch (query) {
      case "top_sellers":
        return {
          sellers: getTopSellers(limit ?? 10).map(formatSeller),
          total: sellers.length,
        };

      case "by_category": {
        if (!category) return { error: "category is required for by_category query" };
        const results = getSellersByCategory(category);
        return {
          category,
          count: results.length,
          sellers: results
            .sort((a, b) => b.confidenceScore - a.confidenceScore)
            .slice(0, limit ?? 10)
            .map(formatSeller),
        };
      }

      case "by_status": {
        const targetStatus = status ?? "shortlisted";
        const results = getSellersByStatus(targetStatus);
        return {
          status: targetStatus,
          count: results.length,
          sellers: results.map(formatSeller),
        };
      }

      case "pipeline_summary": {
        const statuses = ["discovered", "shortlisted", "contacted", "applied", "approved", "onboarding", "established"] as const;
        const summary = statuses.reduce(
          (acc, s) => {
            acc[s] = getSellersByStatus(s).length;
            return acc;
          },
          {} as Record<string, number>
        );
        return {
          pipeline: summary,
          total: sellers.length,
          highMatchLeads: sellers.filter((s) => s.confidenceScore >= 8).length,
        };
      }

      case "high_confidence": {
        const threshold = 8.0;
        const results = sellers.filter((s) => s.confidenceScore >= threshold);
        return {
          threshold,
          count: results.length,
          sellers: results
            .sort((a, b) => b.confidenceScore - a.confidenceScore)
            .slice(0, limit ?? 10)
            .map(formatSeller),
        };
      }

      case "viral_sellers": {
        const results = sellers.filter((s) => s.viralTrendy);
        return {
          count: results.length,
          sellers: results
            .sort((a, b) => (b.socialFollowers ?? 0) - (a.socialFollowers ?? 0))
            .slice(0, limit ?? 10)
            .map((s) => ({
              ...formatSeller(s),
              socialFollowers: s.socialFollowers,
              t52wSales: s.t52wSales,
            })),
        };
      }

      default:
        return { error: "Unknown query type" };
    }
  },
});
