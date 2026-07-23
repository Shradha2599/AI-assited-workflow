import {
  rankSellersLocally,
  toDiscoveryPayload,
} from "@/lib/mock-data/discover-leads-ranking";
import { getFYPlanSeed, type FiscalYearId } from "@/lib/mock-data/fy-plan-seeds";

/** Bump when mid-year seed data changes (forces re-apply for FY 2025–26). */
export const FY_DISCOVERY_SEED_VERSION = 1;

export interface FYDiscoverySnapshot {
  discoveredIds: string[];
  shortlistedIds: string[];
  contactedIds: string[];
  relevanceReasons: Record<string, string>;
  planMatches: Record<string, string[]>;
  hasUserInitiatedDiscovery: boolean;
}

/** Mid-year in-progress counts for FY 2025–26 */
const SEED_DISCOVERED_COUNT = 58;
const SEED_SHORTLISTED_COUNT = 55;
const SEED_CONTACTED_COUNT = 36;

function buildMidYearSnapshot(): FYDiscoverySnapshot {
  const planItems = getFYPlanSeed("2025-2026").planItems;
  const { rankedSellers } = rankSellersLocally(planItems);
  const { ids, reasons, planMatches } = toDiscoveryPayload(rankedSellers);

  const discoveredIds = ids.slice(0, Math.min(SEED_DISCOVERED_COUNT, ids.length));
  const shortlistedIds = discoveredIds.slice(0, Math.min(SEED_SHORTLISTED_COUNT, discoveredIds.length));
  const contactedIds = shortlistedIds.slice(0, Math.min(SEED_CONTACTED_COUNT, shortlistedIds.length));

  const relevanceReasons: Record<string, string> = {};
  const seededPlanMatches: Record<string, string[]> = {};
  for (const id of discoveredIds) {
    if (reasons[id]) relevanceReasons[id] = reasons[id];
    if (planMatches[id]) seededPlanMatches[id] = planMatches[id];
  }

  return {
    discoveredIds,
    shortlistedIds,
    contactedIds,
    relevanceReasons,
    planMatches: seededPlanMatches,
    hasUserInitiatedDiscovery: true,
  };
}

let cachedMidYearSnapshot: FYDiscoverySnapshot | null = null;

export function getFYDiscoverySeed(fy: FiscalYearId): FYDiscoverySnapshot {
  if (fy === "2026-2027") {
    return {
      discoveredIds: [],
      shortlistedIds: [],
      contactedIds: [],
      relevanceReasons: {},
      planMatches: {},
      hasUserInitiatedDiscovery: false,
    };
  }

  if (!cachedMidYearSnapshot) {
    cachedMidYearSnapshot = buildMidYearSnapshot();
  }
  return {
    ...cachedMidYearSnapshot,
    discoveredIds: [...cachedMidYearSnapshot.discoveredIds],
    shortlistedIds: [...cachedMidYearSnapshot.shortlistedIds],
    contactedIds: [...cachedMidYearSnapshot.contactedIds],
    relevanceReasons: { ...cachedMidYearSnapshot.relevanceReasons },
    planMatches: { ...cachedMidYearSnapshot.planMatches },
  };
}
