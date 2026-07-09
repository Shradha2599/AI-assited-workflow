import { create } from "zustand";

import type { PartnerPipelineStatus } from "@/lib/mock-data/potential-partners";
import { useToastStore } from "@/stores/toast-store";

export type LeadDecision = "accept" | "reject" | "future_interest";

const DECISION_STATUS: Record<LeadDecision, PartnerPipelineStatus> = {
  accept: "Onboarding",
  reject: "Rejected",
  future_interest: "Future Interest",
};

const DECISION_TOAST: Record<LeadDecision, { title: string; description: string }> = {
  accept: {
    title: "Lead accepted",
    description: "Partner has been approved and moved to onboarding.",
  },
  reject: {
    title: "Lead rejected",
    description: "Partner application has been marked as rejected.",
  },
  future_interest: {
    title: "Marked as future interest",
    description: "Partner has been saved for future consideration.",
  },
};

interface PartnerReviewStore {
  activePartnerId: string | null;
  analysisOpen: boolean;
  statusOverrides: Record<string, PartnerPipelineStatus>;
  setActivePartner: (partnerId: string) => void;
  openAnalysis: () => void;
  closeAnalysis: () => void;
  setPartnerDecision: (partnerId: string, partnerName: string, decision: LeadDecision) => void;
  getEffectiveStatus: (
    partnerId: string,
    defaultStatus: PartnerPipelineStatus,
  ) => PartnerPipelineStatus;
}

export const usePartnerReviewStore = create<PartnerReviewStore>((set, get) => ({
  activePartnerId: null,
  analysisOpen: false,
  statusOverrides: {},

  setActivePartner: (partnerId) => set({ activePartnerId: partnerId, analysisOpen: false }),

  openAnalysis: () => set({ analysisOpen: true }),

  closeAnalysis: () => set({ analysisOpen: false }),

  setPartnerDecision: (partnerId, partnerName, decision) => {
    const status = DECISION_STATUS[decision];
    set((state) => ({
      statusOverrides: { ...state.statusOverrides, [partnerId]: status },
      analysisOpen: false,
    }));
    const toast = DECISION_TOAST[decision];
    useToastStore.getState().showToast({
      title: toast.title,
      description: toast.description.replace("Partner", partnerName),
    });
  },

  getEffectiveStatus: (partnerId, defaultStatus) =>
    get().statusOverrides[partnerId] ?? defaultStatus,
}));

export function resolvePartnerStatus(
  partnerId: string,
  defaultStatus: PartnerPipelineStatus,
): PartnerPipelineStatus {
  return usePartnerReviewStore.getState().getEffectiveStatus(partnerId, defaultStatus);
}
