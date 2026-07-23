"use client";

import { getMatchingPlanItemsForSeller } from "@/lib/mock-data/plan-item-matching";
import type { Seller } from "@/lib/mock-data/sellers";
import { usePlanStore } from "@/features/assortment-plan/store/plan-store";
import { useFYDiscoverySnapshot } from "@/features/lead-discovery/store/discovery-store";

/** Plan item types that match a seller — driven by assortment plan + discovery agent data */
export function useSellerMatchingPlanItems(seller: Seller): string[] {
  const planItems = usePlanStore((s) => s.planItems);
  const fiscalYear = usePlanStore((s) => s.fiscalYear);
  const snap = useFYDiscoverySnapshot(fiscalYear);
  const agentMatch = snap.planMatches[seller.id];
  return getMatchingPlanItemsForSeller(seller, planItems, agentMatch);
}
