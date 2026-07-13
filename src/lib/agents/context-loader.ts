import type { BeaconPage } from "./system-prompt";
import {
  buildDashboardContext,
  buildAssortmentGapContext,
  buildAssortmentPlanContext,
  buildLeadDiscoveryContext,
  buildPartnerOnboardingContext,
} from "./mock-loader";
import { getSellerById } from "@/lib/mock-data/sellers";
import { getPotentialPartnerById } from "@/lib/mock-data/potential-partners";
import { getReviewableEvaluations } from "@/lib/mock-data/onboarding-evaluation";

export function loadPageData(page: BeaconPage, pathname?: string): string {
  switch (page) {
    case "dashboard":
      return buildDashboardContext();
    case "assortment-gap":
      return buildAssortmentGapContext();
    case "assortment-plan":
      return buildAssortmentPlanContext();
    case "lead-discovery":
      return buildLeadDiscoveryContext();
    case "partner-onboarding": {
      let extra = "";
      const partnerId = pathname?.match(/^\/sellers\/onboarding\/([^/]+)/)?.[1];
      const partner = partnerId ? getPotentialPartnerById(partnerId) : undefined;
      if (partner) {
        const evals = getReviewableEvaluations(partner.sellerId);
        const issues = evals.filter((e) => e.validationStatus === "invalid" || e.validationStatus === "partial");
        extra = `\n\n### Active partner: ${partner.legalBusinessName}\nStatus: ${partner.status}\nValidation issues: ${issues.map((e) => e.title).join(", ") || "none"}`;
      }
      return buildPartnerOnboardingContext() + extra;
    }
    case "seller-profile": {
      const sellerId = pathname?.match(/^\/sellers\/discovery\/([^/]+)/)?.[1];
      const seller = sellerId ? getSellerById(sellerId) : undefined;
      if (!seller) return "";
      return `## Active seller profile\nCompany: ${seller.legalBusinessName}\nCategory: ${seller.category}\nConfidence: ${seller.confidenceScore}/10\nGMV: $${(seller.gmv / 1_000_000).toFixed(1)}M\nMarketplaces: ${seller.marketplaces.join(", ")}\nRating: ${seller.rating}/5\nWebsite: ${seller.website}\nDescription: ${seller.description}`;
    }
    default:
      return "";
  }
}
