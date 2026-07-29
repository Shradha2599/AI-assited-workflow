import type { BeaconPage } from "@/lib/agents/system-prompt";

const PATH_PAGE: Array<{ test: (p: string) => boolean; page: BeaconPage }> = [
  { test: (p) => p.startsWith("/dashboard"), page: "dashboard" },
  { test: (p) => p.startsWith("/assortment/gap"), page: "assortment-gap" },
  { test: (p) => p.startsWith("/assortment/plan") || p.startsWith("/assortment/finalize"), page: "assortment-plan" },
  { test: (p) => p.startsWith("/sellers/discovery"), page: "lead-discovery" },
  { test: (p) => p === "/sellers/onboarding", page: "partner-onboarding" },
  { test: (p) => /^\/sellers\/onboarding\/[^/]+$/.test(p), page: "partner-onboarding" },
  { test: (p) => /^\/sellers\/onboarding\/[^/]+\/review\//.test(p), page: "partner-onboarding" },
];

export function pageFromPath(pathname: string): BeaconPage {
  for (const { test, page } of PATH_PAGE) {
    if (test(pathname)) return page;
  }
  return "unknown";
}

/** Relative priority when merging recommendation types per page */
export function pageRecommendationPriority(page: BeaconPage): string[] {
  switch (page) {
    case "dashboard":
      return ["agent-revenue-gap", "agent-seasonal-plan", "agent-gap", "agent-sellers", "agent-launch-ready"];
    case "assortment-gap":
      return ["agent-gap", "agent-gap-add", "agent-seasonal-plan", "agent-revenue-gap"];
    case "assortment-plan":
      return ["agent-seasonal-plan", "agent-plan-schedule", "agent-plan-share", "agent-gap"];
    case "lead-discovery":
      return ["agent-discovery-outreach", "agent-sellers", "agent-revenue-gap", "agent-discovery-gap"];
    case "seller-profile":
      return ["agent-seller-fit", "agent-seller-gap", "agent-seller-plan"];
    case "partner-onboarding":
      return ["agent-blockers", "agent-launch-ready", "agent-onboarding-outreach"];
    default:
      return [];
  }
}

export function sortRecommendationsForPage<T extends { id: string }>(
  page: BeaconPage,
  recs: T[],
): T[] {
  const order = pageRecommendationPriority(page);
  if (order.length === 0) return recs;
  return [...recs].sort((a, b) => {
    const ai = order.indexOf(a.id);
    const bi = order.indexOf(b.id);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
}
