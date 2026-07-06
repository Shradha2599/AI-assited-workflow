import type { BeaconPage } from "./system-prompt";
import {
  buildDashboardContext,
  buildAssortmentGapContext,
  buildAssortmentPlanContext,
  buildLeadDiscoveryContext,
  buildPartnerOnboardingContext,
} from "./mock-loader";

export function loadPageData(page: BeaconPage): string {
  switch (page) {
    case "dashboard":
      return buildDashboardContext();
    case "assortment-gap":
      return buildAssortmentGapContext();
    case "assortment-plan":
      return buildAssortmentPlanContext();
    case "lead-discovery":
      return buildLeadDiscoveryContext();
    case "partner-onboarding":
      return buildPartnerOnboardingContext();
    default:
      return "";
  }
}
