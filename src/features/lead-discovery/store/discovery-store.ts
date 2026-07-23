import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { FiscalYearId } from "@/lib/mock-data/fy-plan-seeds";
import {
  FY_DISCOVERY_SEED_VERSION,
  getFYDiscoverySeed,
  type FYDiscoverySnapshot,
} from "@/lib/mock-data/fy-discovery-seeds";
import { LEAD_POOL_VERSION } from "@/lib/mock-data/lead-pool-meta";

export type { FYDiscoverySnapshot };

export interface VerificationSource {
  status: "verified" | "partial" | "unverified";
  detail: string;
}

export interface VerificationResult {
  confidenceScore: number;
  recommendation: "shortlist" | "hold" | "pass";
  summary: string;
  strengths: string[];
  risks: string[];
  sources: {
    amazon: VerificationSource;
    walmart: VerificationSource;
    socialMedia: VerificationSource;
    businessRegistry: VerificationSource;
    financialData: VerificationSource;
  };
}

export interface DiscoveryFilters {
  search: string;
  category: string;
  businessType: string;
  marketplace: string;
  minConfidence: number;
  viralOnly: boolean;
}

function emptySnapshot(): FYDiscoverySnapshot {
  return {
    discoveredIds: [],
    shortlistedIds: [],
    contactedIds: [],
    relevanceReasons: {},
    planMatches: {},
    hasUserInitiatedDiscovery: false,
  };
}

function emptyFYSnapshots(): Record<FiscalYearId, FYDiscoverySnapshot> {
  return {
    "2025-2026": getFYDiscoverySeed("2025-2026"),
    "2026-2027": getFYDiscoverySeed("2026-2027"),
  };
}

interface DiscoveryStore {
  leadPoolVersion: number;
  fyDiscoverySeedVersion: number;
  fySnapshots: Record<FiscalYearId, FYDiscoverySnapshot>;
  verifications: Record<string, VerificationResult>;
  isDiscovering: boolean;
  verifyingId: string | null;
  activeFilters: DiscoveryFilters;
  setDiscovered: (
    fy: FiscalYearId,
    ids: string[],
    reasons: Record<string, string>,
    planMatches?: Record<string, string[]>,
  ) => void;
  shortlistSeller: (fy: FiscalYearId, id: string) => void;
  removeFromShortlist: (fy: FiscalYearId, id: string) => void;
  markContacted: (fy: FiscalYearId, id: string) => void;
  setVerification: (id: string, result: VerificationResult) => void;
  setIsDiscovering: (v: boolean) => void;
  setVerifyingId: (id: string | null) => void;
  setFilter: (filters: Partial<DiscoveryFilters>) => void;
  clearDiscoveryResults: (fy: FiscalYearId) => void;
  syncLeadPoolVersion: () => void;
  syncFYDiscoverySeed: () => void;
  getSnapshot: (fy: FiscalYearId) => FYDiscoverySnapshot;
}

const DEFAULT_FILTERS: DiscoveryFilters = {
  search: "",
  category: "",
  businessType: "",
  marketplace: "",
  minConfidence: 0,
  viralOnly: false,
};

function updateSnapshot(
  fy: FiscalYearId,
  updater: (snap: FYDiscoverySnapshot) => FYDiscoverySnapshot,
): (state: DiscoveryStore) => Partial<DiscoveryStore> {
  return (state) => ({
    fySnapshots: {
      ...state.fySnapshots,
      [fy]: updater(state.fySnapshots[fy] ?? emptySnapshot()),
    },
  });
}

export const useDiscoveryStore = create<DiscoveryStore>()(
  persist(
    (set, get) => ({
      leadPoolVersion: LEAD_POOL_VERSION,
      fyDiscoverySeedVersion: FY_DISCOVERY_SEED_VERSION,
      fySnapshots: emptyFYSnapshots(),
      verifications: {},
      isDiscovering: false,
      verifyingId: null,
      activeFilters: DEFAULT_FILTERS,
      getSnapshot: (fy) => get().fySnapshots[fy] ?? emptySnapshot(),
      setDiscovered: (fy, ids, reasons, planMatches = {}) =>
        set(
          updateSnapshot(fy, (snap) => ({
            ...snap,
            discoveredIds: ids,
            relevanceReasons: reasons,
            planMatches,
            hasUserInitiatedDiscovery: true,
          })),
        ),
      shortlistSeller: (fy, id) =>
        set(
          updateSnapshot(fy, (snap) => ({
            ...snap,
            shortlistedIds: snap.shortlistedIds.includes(id)
              ? snap.shortlistedIds
              : [...snap.shortlistedIds, id],
          })),
        ),
      removeFromShortlist: (fy, id) =>
        set(
          updateSnapshot(fy, (snap) => ({
            ...snap,
            shortlistedIds: snap.shortlistedIds.filter((s) => s !== id),
          })),
        ),
      markContacted: (fy, id) =>
        set(
          updateSnapshot(fy, (snap) => ({
            ...snap,
            contactedIds: snap.contactedIds.includes(id)
              ? snap.contactedIds
              : [...snap.contactedIds, id],
            shortlistedIds: snap.shortlistedIds.includes(id)
              ? snap.shortlistedIds
              : [...snap.shortlistedIds, id],
          })),
        ),
      setVerification: (id, result) =>
        set((state) => ({
          verifications: { ...state.verifications, [id]: result },
        })),
      setIsDiscovering: (v) => set({ isDiscovering: v }),
      setVerifyingId: (id) => set({ verifyingId: id }),
      setFilter: (filters) =>
        set((state) => ({
          activeFilters: { ...state.activeFilters, ...filters },
        })),
      clearDiscoveryResults: (fy) =>
        set(
          updateSnapshot(fy, () => emptySnapshot()),
        ),
      syncLeadPoolVersion: () => {
        if (get().leadPoolVersion === LEAD_POOL_VERSION) return;
        set({
          leadPoolVersion: LEAD_POOL_VERSION,
          fyDiscoverySeedVersion: FY_DISCOVERY_SEED_VERSION,
          fySnapshots: emptyFYSnapshots(),
          verifications: {},
        });
      },
      syncFYDiscoverySeed: () => {
        if (get().fyDiscoverySeedVersion === FY_DISCOVERY_SEED_VERSION) return;
        set((state) => ({
          fyDiscoverySeedVersion: FY_DISCOVERY_SEED_VERSION,
          fySnapshots: {
            ...state.fySnapshots,
            "2025-2026": getFYDiscoverySeed("2025-2026"),
          },
        }));
      },
    }),
    {
      name: "lead-discovery",
      skipHydration: true,
      migrate: (persisted: unknown, version: number) => {
        const state = persisted as Record<string, unknown>;
        if (version === 0 && state && !state.fySnapshots) {
          const legacy = state as {
            discoveredIds?: string[];
            shortlistedIds?: string[];
            relevanceReasons?: Record<string, string>;
            planMatches?: Record<string, string[]>;
          };
          return {
            ...state,
            fyDiscoverySeedVersion: FY_DISCOVERY_SEED_VERSION,
            fySnapshots: {
              "2025-2026": getFYDiscoverySeed("2025-2026"),
              "2026-2027": emptySnapshot(),
            },
          };
        }
        if (version <= 1 && state?.fySnapshots) {
          return {
            ...state,
            fyDiscoverySeedVersion: FY_DISCOVERY_SEED_VERSION,
            fySnapshots: {
              ...(state.fySnapshots as Record<FiscalYearId, FYDiscoverySnapshot>),
              "2025-2026": getFYDiscoverySeed("2025-2026"),
            },
          };
        }
        return persisted;
      },
      version: 2,
    },
  ),
);

/** Hook helper: read discovery snapshot for the active fiscal year */
export function useFYDiscoverySnapshot(fiscalYear: FiscalYearId): FYDiscoverySnapshot {
  return useDiscoveryStore((s) => s.fySnapshots[fiscalYear] ?? emptySnapshot());
}
