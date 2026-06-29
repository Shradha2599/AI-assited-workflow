import { tool } from "ai";
import { z } from "zod";
import { getSellerById, sellers } from "@/lib/mock-data/sellers";

export const evaluationTool = tool({
  description:
    "Evaluate, score, and summarize sellers. Use this when the user asks to evaluate a specific seller, understand their confidence score breakdown, assess risks, or get a recommendation on whether to shortlist or approve a seller.",
  parameters: z.object({
    query: z.enum(["seller_summary", "score_breakdown", "risk_assessment", "shortlist_recommendation"]),
    sellerId: z.string().describe("The seller ID to evaluate"),
  }),
  execute: async ({ query, sellerId }) => {
    const seller = getSellerById(sellerId);
    if (!seller) {
      return { error: `Seller not found: ${sellerId}. Available IDs: ${sellers.map((s) => s.id).join(", ")}` };
    }

    switch (query) {
      case "seller_summary":
        return {
          name: seller.legalBusinessName,
          location: seller.location,
          founded: seller.founded,
          businessType: seller.businessType,
          description: seller.description,
          primaryCategory: seller.category,
          allCategories: seller.categories,
          gmv: seller.gmv,
          skus: seller.skus,
          rating: seller.rating,
          confidenceScore: seller.confidenceScore,
          marketplaces: seller.marketplaces,
          viralTrendy: seller.viralTrendy,
          socialFollowers: seller.socialFollowers,
          t52wSales: seller.t52wSales,
          walmartPresent: seller.walmartPresent,
          status: seller.status,
        };

      case "score_breakdown": {
        // Simulate sub-scores that add up to the overall confidence score
        const categoryFit = seller.categories.length > 1 ? 9.5 : 8.0;
        const marketplacePresence = seller.marketplaces.length >= 2 ? 9.0 : 7.0;
        const gmvPotential = seller.gmv > 1000000 ? 9.0 : seller.gmv > 500000 ? 7.5 : 6.0;
        const reputationScore = seller.rating >= 4.4 ? 9.5 : seller.rating >= 4.0 ? 8.0 : 6.5;
        const operationalReadiness = seller.businessType === "Manufacturer" ? 8.5 : 7.0;
        const viralSignal = seller.viralTrendy ? 9.0 : 6.0;
        const multiMarketplace = seller.marketplaces.length >= 2 ? 8.5 : 5.0;

        return {
          name: seller.legalBusinessName,
          overallScore: seller.confidenceScore,
          breakdown: {
            categoryFit: categoryFit.toFixed(1),
            marketplacePresence: marketplacePresence.toFixed(1),
            gmvPotential: gmvPotential.toFixed(1),
            reputation: reputationScore.toFixed(1),
            operationalReadiness: operationalReadiness.toFixed(1),
            viralTrendySignal: viralSignal.toFixed(1),
            multiMarketplacePresence: multiMarketplace.toFixed(1),
          },
          interpretation:
            seller.confidenceScore >= 9.0
              ? "Excellent match — strong across all dimensions"
              : seller.confidenceScore >= 7.5
                ? "Good match — a few areas to watch"
                : "Moderate match — evaluate carefully before shortlisting",
        };
      }

      case "risk_assessment": {
        const risks = [];
        const strengths = [];

        if (!seller.walmartPresent) risks.push("No Walmart presence — limited multi-marketplace diversification");
        if (seller.rating < 4.0) risks.push(`Below-average rating (${seller.rating}) — customer satisfaction concern`);
        if (seller.skus < 100) risks.push("Low SKU count — limited assortment depth for Target Plus requirements");
        if (seller.marketplaces.length === 1) risks.push("Single-marketplace dependency — operational risk if platform changes");
        if (!seller.viralTrendy) risks.push("No viral/trendy signal — may lag in trend-driven category demand");
        if ((seller.t52wSales ?? 0) < 500000) risks.push("Low T52W sales — limited proven market traction");

        if (seller.rating >= 4.4) strengths.push(`Strong customer rating (${seller.rating}/5)`);
        if (seller.walmartPresent) strengths.push("Present on Walmart — multi-marketplace operational readiness");
        if (seller.viralTrendy) strengths.push("Viral/trendy signal — strong social demand alignment");
        if ((seller.socialFollowers ?? 0) > 50000) strengths.push(`Large social audience (${(seller.socialFollowers ?? 0).toLocaleString()} followers)`);
        if ((seller.t52wSales ?? 0) > 2000000) strengths.push(`Strong T52W sales ($${((seller.t52wSales ?? 0) / 1000000).toFixed(1)}M)`);
        if (seller.marketplaces.length >= 2) strengths.push("Multi-marketplace presence — operationally proven");

        return {
          name: seller.legalBusinessName,
          confidenceScore: seller.confidenceScore,
          risks: risks.length > 0 ? risks : ["No significant risks identified"],
          strengths,
          netAssessment:
            seller.confidenceScore >= 8.5
              ? "Recommended for shortlisting — strong profile with manageable risks"
              : seller.confidenceScore >= 7.0
                ? "Consider shortlisting — review risks carefully before proceeding"
                : "Proceed with caution — multiple risk factors present",
        };
      }

      case "shortlist_recommendation":
        return {
          name: seller.legalBusinessName,
          confidenceScore: seller.confidenceScore,
          recommendation:
            seller.confidenceScore >= 8.0
              ? "Shortlist"
              : seller.confidenceScore >= 6.5
                ? "Review Further"
                : "Deprioritize",
          reasoning:
            seller.confidenceScore >= 8.0
              ? `${seller.legalBusinessName} scores ${seller.confidenceScore}/10 and meets Target Plus quality thresholds. ${seller.marketplaces.length >= 2 ? "Multi-marketplace presence confirms operational readiness. " : ""}${seller.viralTrendy ? "Viral signal adds demand upside. " : ""}Recommend immediate shortlisting.`
              : `Score of ${seller.confidenceScore}/10 falls below the 8.0 shortlist threshold. Consider monitoring but do not prioritize for current cycle.`,
          nextAction:
            seller.confidenceScore >= 8.0
              ? "Send acquisition outreach email"
              : "Flag for next quarter review",
        };

      default:
        return { error: "Unknown query type" };
    }
  },
});
