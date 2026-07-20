import {
  filterSellersMatchingPlan,
  getMatchingPlanItemsForSeller,
  getPlanCategories,
} from "@/lib/mock-data/plan-item-matching";
import { sellers, type Seller } from "@/lib/mock-data/sellers";

export const LLM_RANK_LIMIT = 60;

export interface RankedSellerResult {
  sellerId: string;
  relevanceReason: string;
  planMatch: string[];
}

export function selectCandidatesForRanking(
  allSellers: Seller[],
  planItems: string[],
): Seller[] {
  const pool =
    planItems.length > 0 ? filterSellersMatchingPlan(allSellers, planItems) : allSellers;

  if (pool.length === 0) return [];

  if (pool.length <= LLM_RANK_LIMIT) return pool;

  return [...pool].sort((a, b) => b.confidenceScore - a.confidenceScore).slice(0, LLM_RANK_LIMIT);
}

/** Deterministic local ranking when the discovery agent API is unavailable. */
export function rankSellersLocally(planItems: string[]): {
  rankedSellers: RankedSellerResult[];
  summary: string;
} {
  const candidates = selectCandidatesForRanking(sellers, planItems);

  const scored = candidates
    .map((seller) => {
      const planMatch = getMatchingPlanItemsForSeller(seller, planItems);
      const score =
        planMatch.length * 10 +
        seller.confidenceScore +
        (seller.viralTrendy ? 1 : 0) +
        seller.gmv / 5_000_000;
      return { seller, planMatch, score };
    })
    .filter(({ planMatch }) => planItems.length === 0 || planMatch.length > 0);

  scored.sort((a, b) => b.score - a.score);

  const planCategories = getPlanCategories(planItems);
  const categoryLabel =
    planCategories.length > 0 ? planCategories.join(", ") : "your plan categories";

  const rankedSellers = scored.map(({ seller, planMatch }) => ({
    sellerId: seller.id,
    relevanceReason:
      planMatch.length > 0
        ? `Strong fit for ${planMatch.slice(0, 2).join(", ")}${planMatch.length > 2 ? " and more" : ""} from your assortment plan.`
        : `Matches ${categoryLabel} from your assortment plan.`,
    planMatch,
  }));

  return {
    rankedSellers,
    summary:
      planItems.length > 0
        ? `Found ${rankedSellers.length} sellers aligned to ${categoryLabel}.`
        : `Ranked ${rankedSellers.length} sellers by confidence and GMV.`,
  };
}

export function toDiscoveryPayload(
  rankedSellers: Array<{
    sellerId: string;
    relevanceReason: string;
    planMatch?: string[];
  }>,
) {
  const ids = rankedSellers.map((s) => s.sellerId);
  const reasons: Record<string, string> = {};
  const planMatches: Record<string, string[]> = {};
  for (const row of rankedSellers) {
    reasons[row.sellerId] = row.relevanceReason;
    if (row.planMatch?.length) planMatches[row.sellerId] = row.planMatch;
  }
  return { ids, reasons, planMatches };
}
