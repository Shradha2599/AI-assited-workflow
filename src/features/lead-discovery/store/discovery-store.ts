import { create } from "zustand";
import { persist } from "zustand/middleware";

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

interface DiscoveryStore {
  discoveredIds: string[];
  shortlistedIds: string[];
  relevanceReasons: Record<string, string>;
  verifications: Record<string, VerificationResult>;
  isDiscovering: boolean;
  verifyingId: string | null;
  activeFilters: DiscoveryFilters;
  setDiscovered: (ids: string[], reasons: Record<string, string>) => void;
  shortlistSeller: (id: string) => void;
  removeFromShortlist: (id: string) => void;
  setVerification: (id: string, result: VerificationResult) => void;
  setIsDiscovering: (v: boolean) => void;
  setVerifyingId: (id: string | null) => void;
  setFilter: (filters: Partial<DiscoveryFilters>) => void;
}

const DEFAULT_FILTERS: DiscoveryFilters = {
  search: "",
  category: "",
  businessType: "",
  marketplace: "",
  minConfidence: 0,
  viralOnly: false,
};

export const useDiscoveryStore = create<DiscoveryStore>()(
  persist(
    (set) => ({
      discoveredIds: [],
      shortlistedIds: [],
      relevanceReasons: {},
      verifications: {},
      isDiscovering: false,
      verifyingId: null,
      activeFilters: DEFAULT_FILTERS,
      setDiscovered: (ids, reasons) =>
        set({ discoveredIds: ids, relevanceReasons: reasons }),
      shortlistSeller: (id) =>
        set((state) => ({
          shortlistedIds: state.shortlistedIds.includes(id)
            ? state.shortlistedIds
            : [...state.shortlistedIds, id],
        })),
      removeFromShortlist: (id) =>
        set((state) => ({
          shortlistedIds: state.shortlistedIds.filter((s) => s !== id),
        })),
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
    }),
    { name: "lead-discovery", skipHydration: true },
  ),
);
