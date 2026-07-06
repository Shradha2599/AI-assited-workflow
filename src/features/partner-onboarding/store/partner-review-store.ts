import { create } from "zustand";

interface PartnerReviewStore {
  activePartnerId: string | null;
  analysisOpen: boolean;
  setActivePartner: (partnerId: string) => void;
  openAnalysis: () => void;
  closeAnalysis: () => void;
}

export const usePartnerReviewStore = create<PartnerReviewStore>((set) => ({
  activePartnerId: null,
  analysisOpen: false,
  setActivePartner: (partnerId) => set({ activePartnerId: partnerId, analysisOpen: false }),
  openAnalysis: () => set({ analysisOpen: true }),
  closeAnalysis: () => set({ analysisOpen: false }),
}));
