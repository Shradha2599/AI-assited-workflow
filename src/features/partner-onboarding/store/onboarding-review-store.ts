import { create } from "zustand";

import type { AiFieldSuggestion } from "@/lib/mock-data/onboarding-evaluation";
import { useToastStore } from "@/stores/toast-store";

export interface FeedbackContext {
  taskId: string;
  title: string;
  agentMessage: string;
}

export interface RecommendationModalContext {
  alertId: string;
  taskApproveId?: string;
  title: string;
  subtitle: string;
  fields: AiFieldSuggestion[];
  toastMessage: string;
  /** When true, applying recommendation also marks the sub-task approved. */
  approveOnApply?: boolean;
}

interface OnboardingReviewStore {
  activePartnerId: string | null;
  activeSectionId: string | null;
  activeTaskId: string | null;
  commentsOpen: boolean;
  feedbackOpen: boolean;
  feedbackContext: FeedbackContext | null;
  recommendationModalOpen: boolean;
  recommendationContext: RecommendationModalContext | null;
  approvedIds: string[];
  dismissedAlerts: string[];
  agentFeedbackLog: Array<{ taskId: string; reason: string; at: string }>;

  setContext: (partnerId: string, sectionId?: string, taskId?: string) => void;
  openComments: (taskId?: string) => void;
  closeComments: () => void;
  openFeedback: (ctx: FeedbackContext) => void;
  closeFeedback: () => void;
  openRecommendationModal: (ctx: RecommendationModalContext) => void;
  closeRecommendationModal: () => void;
  applyAiRecommendation: (
    alertId: string,
    taskApproveId?: string,
    toastMessage?: string,
    approveOnApply?: boolean,
  ) => void;
  approveItem: (id: string) => void;
  approveWithAcknowledgement: (id: string, alertId: string, toastMessage: string) => void;
  dismissAlert: (taskId: string) => void;
  submitFeedback: (reason: string) => void;
  isApproved: (id: string) => boolean;
}

export const useOnboardingReviewStore = create<OnboardingReviewStore>((set, get) => ({
  activePartnerId: null,
  activeSectionId: null,
  activeTaskId: null,
  commentsOpen: false,
  feedbackOpen: false,
  feedbackContext: null,
  recommendationModalOpen: false,
  recommendationContext: null,
  approvedIds: [],
  dismissedAlerts: [],
  agentFeedbackLog: [],

  setContext: (partnerId, sectionId, taskId) =>
    set({
      activePartnerId: partnerId,
      activeSectionId: sectionId ?? null,
      activeTaskId: taskId ?? null,
      commentsOpen: false,
      feedbackOpen: false,
    }),

  openComments: (taskId) =>
    set((s) => ({
      commentsOpen: true,
      activeTaskId: taskId ?? s.activeTaskId,
    })),

  closeComments: () => set({ commentsOpen: false }),

  openFeedback: (ctx) => set({ feedbackOpen: true, feedbackContext: ctx }),

  closeFeedback: () => set({ feedbackOpen: false, feedbackContext: null }),

  openRecommendationModal: (ctx) =>
    set({ recommendationModalOpen: true, recommendationContext: ctx }),

  closeRecommendationModal: () =>
    set({ recommendationModalOpen: false, recommendationContext: null }),

  applyAiRecommendation: (alertId, taskApproveId, toastMessage, approveOnApply) => {
    const msg = toastMessage ?? "AI recommendation sent to the partner.";
    set((s) => {
      const nextApproved =
        approveOnApply && taskApproveId && !s.approvedIds.includes(taskApproveId)
          ? [...s.approvedIds, taskApproveId]
          : s.approvedIds;
      return {
        approvedIds: nextApproved,
        dismissedAlerts: s.dismissedAlerts.includes(alertId)
          ? s.dismissedAlerts
          : [...s.dismissedAlerts, alertId],
        recommendationModalOpen: false,
        recommendationContext: null,
      };
    });
    useToastStore.getState().showToast({
      title: "Recommendation applied",
      description: msg,
    });
  },

  approveItem: (id) =>
    set((s) => ({
      approvedIds: s.approvedIds.includes(id) ? s.approvedIds : [...s.approvedIds, id],
    })),

  approveWithAcknowledgement: (id, alertId, toastMessage) => {
    get().approveItem(id);
    set((s) => ({
      dismissedAlerts: s.dismissedAlerts.includes(alertId)
        ? s.dismissedAlerts
        : [...s.dismissedAlerts, alertId],
    }));
    useToastStore.getState().showToast({
      title: "Task approved",
      description: toastMessage,
    });
  },

  dismissAlert: (taskId) =>
    set((s) => ({
      dismissedAlerts: s.dismissedAlerts.includes(taskId)
        ? s.dismissedAlerts
        : [...s.dismissedAlerts, taskId],
    })),

  submitFeedback: (reason) => {
    const ctx = get().feedbackContext;
    if (!ctx) return;
    set((s) => ({
      agentFeedbackLog: [
        ...s.agentFeedbackLog,
        { taskId: ctx.taskId, reason, at: new Date().toISOString() },
      ],
      feedbackOpen: false,
      feedbackContext: null,
      dismissedAlerts: [...s.dismissedAlerts, ctx.taskId],
    }));
  },

  isApproved: (id) => get().approvedIds.includes(id),
}));
