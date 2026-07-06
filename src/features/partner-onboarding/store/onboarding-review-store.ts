import { create } from "zustand";

export interface FeedbackContext {
  taskId: string;
  title: string;
  agentMessage: string;
}

interface OnboardingReviewStore {
  activePartnerId: string | null;
  activeSectionId: string | null;
  activeTaskId: string | null;
  commentsOpen: boolean;
  feedbackOpen: boolean;
  feedbackContext: FeedbackContext | null;
  approvedIds: string[];
  dismissedAlerts: string[];
  agentFeedbackLog: Array<{ taskId: string; reason: string; at: string }>;

  setContext: (partnerId: string, sectionId?: string, taskId?: string) => void;
  openComments: (taskId?: string) => void;
  closeComments: () => void;
  openFeedback: (ctx: FeedbackContext) => void;
  closeFeedback: () => void;
  approveItem: (id: string) => void;
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

  approveItem: (id) =>
    set((s) => ({
      approvedIds: s.approvedIds.includes(id) ? s.approvedIds : [...s.approvedIds, id],
    })),

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
