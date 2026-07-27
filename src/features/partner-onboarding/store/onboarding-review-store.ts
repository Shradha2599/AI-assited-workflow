import { create } from "zustand";

import type { AiFieldSuggestion } from "@/lib/mock-data/onboarding-evaluation";
import {
  subtaskRejectionKey,
  type SubtaskRejectionRecord,
} from "@/features/partner-onboarding/utils/subtask-rejection";
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

export interface SubtaskRejectContext {
  partnerId: string;
  subtaskName: string;
  alertId: string;
  taskApproveId: string;
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
  subtaskRejectOpen: boolean;
  subtaskRejectContext: SubtaskRejectContext | null;
  approvedIds: string[];
  dismissedAlerts: string[];
  appliedFieldValues: Record<string, string>;
  agentFeedbackLog: Array<{ taskId: string; reason: string; at: string }>;
  rejectedSubtasks: Record<string, SubtaskRejectionRecord>;
  subtaskSubmissionGeneration: Record<string, number>;
  documentRejections: Record<
    string,
    { reason: string; documentLabel: string; requestedAt: string }
  >;
  commentPrefill: string | null;

  setContext: (partnerId: string, sectionId?: string, taskId?: string) => void;
  openComments: (taskId?: string, prefill?: string) => void;
  closeComments: () => void;
  clearCommentPrefill: () => void;
  openFeedback: (ctx: FeedbackContext) => void;
  closeFeedback: () => void;
  openRecommendationModal: (ctx: RecommendationModalContext) => void;
  closeRecommendationModal: () => void;
  openSubtaskReject: (ctx: SubtaskRejectContext) => void;
  closeSubtaskReject: () => void;
  submitSubtaskReject: (reason: string) => void;
  registerSubtaskResubmission: (partnerId: string, taskApproveId: string) => void;
  isSubtaskRejected: (partnerId: string, taskApproveId: string) => boolean;
  getSubtaskRejection: (partnerId: string, taskApproveId: string) => SubtaskRejectionRecord | null;
  requestValidDocument: (
    approveId: string,
    documentLabel: string,
    reason: string,
    suggestedComment: string,
  ) => void;
  getAppliedFieldValue: (alertId: string, fieldId: string) => string | undefined;
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
  subtaskRejectOpen: false,
  subtaskRejectContext: null,
  approvedIds: [],
  dismissedAlerts: [],
  appliedFieldValues: {},
  agentFeedbackLog: [],
  rejectedSubtasks: {},
  subtaskSubmissionGeneration: {},
  documentRejections: {},
  commentPrefill: null,

  setContext: (partnerId, sectionId, taskId) =>
    set({
      activePartnerId: partnerId,
      activeSectionId: sectionId ?? null,
      activeTaskId: taskId ?? null,
      commentsOpen: false,
      feedbackOpen: false,
    }),

  openComments: (taskId, prefill) =>
    set((s) => ({
      commentsOpen: true,
      activeTaskId: taskId ?? s.activeTaskId,
      commentPrefill: prefill ?? null,
    })),

  closeComments: () => set({ commentsOpen: false, commentPrefill: null }),

  clearCommentPrefill: () => set({ commentPrefill: null }),

  openFeedback: (ctx) => set({ feedbackOpen: true, feedbackContext: ctx }),

  closeFeedback: () => set({ feedbackOpen: false, feedbackContext: null }),

  openRecommendationModal: (ctx) =>
    set({ recommendationModalOpen: true, recommendationContext: ctx }),

  closeRecommendationModal: () =>
    set({ recommendationModalOpen: false, recommendationContext: null }),

  openSubtaskReject: (ctx) => set({ subtaskRejectOpen: true, subtaskRejectContext: ctx }),

  closeSubtaskReject: () => set({ subtaskRejectOpen: false, subtaskRejectContext: null }),

  submitSubtaskReject: (reason) => {
    const ctx = get().subtaskRejectContext;
    if (!ctx) return;
    const key = subtaskRejectionKey(ctx.partnerId, ctx.taskApproveId);
    const submissionGeneration = get().subtaskSubmissionGeneration[key] ?? 0;
    set((s) => ({
      rejectedSubtasks: {
        ...s.rejectedSubtasks,
        [key]: {
          reason,
          rejectedAt: new Date().toISOString(),
          submissionGeneration,
        },
      },
      dismissedAlerts: s.dismissedAlerts.includes(ctx.alertId)
        ? s.dismissedAlerts
        : [...s.dismissedAlerts, ctx.alertId],
      subtaskRejectOpen: false,
      subtaskRejectContext: null,
    }));
    useToastStore.getState().showToast({
      title: "Sub-task rejected",
      description: `${ctx.subtaskName} was rejected and the partner will be notified.`,
    });
  },

  registerSubtaskResubmission: (partnerId, taskApproveId) => {
    const key = subtaskRejectionKey(partnerId, taskApproveId);
    set((s) => ({
      subtaskSubmissionGeneration: {
        ...s.subtaskSubmissionGeneration,
        [key]: (s.subtaskSubmissionGeneration[key] ?? 0) + 1,
      },
    }));
  },

  isSubtaskRejected: (partnerId, taskApproveId) => {
    const key = subtaskRejectionKey(partnerId, taskApproveId);
    const record = get().rejectedSubtasks[key];
    if (!record) return false;
    const generation = get().subtaskSubmissionGeneration[key] ?? 0;
    return generation === record.submissionGeneration;
  },

  getSubtaskRejection: (partnerId, taskApproveId) => {
    const key = subtaskRejectionKey(partnerId, taskApproveId);
    const record = get().rejectedSubtasks[key];
    if (!record) return null;
    if (!get().isSubtaskRejected(partnerId, taskApproveId)) return null;
    return record;
  },

  requestValidDocument: (approveId, documentLabel, reason, suggestedComment) => {
    set((s) => ({
      documentRejections: {
        ...s.documentRejections,
        [approveId]: {
          reason,
          documentLabel,
          requestedAt: new Date().toISOString(),
        },
      },
      commentsOpen: true,
      activeTaskId: approveId,
      commentPrefill: suggestedComment,
    }));
    useToastStore.getState().showToast({
      title: "Valid document requested",
      description: `Your request was sent to the seller for ${documentLabel}.`,
    });
  },

  getAppliedFieldValue: (alertId, fieldId) => {
    const key = `${alertId}:${fieldId}`;
    return get().appliedFieldValues[key];
  },

  applyAiRecommendation: (alertId, taskApproveId, toastMessage, approveOnApply) => {
    const msg = toastMessage ?? "AI recommendation sent to the partner.";
    const ctx = get().recommendationContext;
    set((s) => {
      const appliedFieldValues = { ...s.appliedFieldValues };
      ctx?.fields.forEach((field) => {
        appliedFieldValues[`${ctx.alertId}:${field.fieldId}`] = field.suggestedValue;
      });
      const nextApproved =
        approveOnApply && taskApproveId && !s.approvedIds.includes(taskApproveId)
          ? [...s.approvedIds, taskApproveId]
          : s.approvedIds;
      return {
        appliedFieldValues,
        approvedIds: nextApproved,
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
