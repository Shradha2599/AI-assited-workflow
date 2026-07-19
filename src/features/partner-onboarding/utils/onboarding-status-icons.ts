import type { OnboardingSection, OnboardingTask } from "@/lib/mock-data/onboarding";
import {
  countSectionCompletedSteps,
  isOnboardingSectionLocked,
  taskNeedsReview,
} from "@/lib/onboarding/progress";
import { isDocumentationTaskTmApproved } from "./documentation-task-progress";
import {
  isProfileTaskTmApproved,
  isProfileTmReviewTask,
} from "./profile-task-progress-core";
import {
  ONBOARDING_TASK_COMPLETE_ICON,
  ONBOARDING_TASK_COMPLETE_ICON_SM,
} from "./onboarding-task-icons";

/** Section-level status icons (main task row / partner table section column). */
export type OnboardingSectionVisualState =
  | "locked"
  | "not_started"
  | "complete"
  | "in_review"
  | "in_review_warning"
  | "in_progress";

/**
 * Sub-task status icons — spec:
 * locked | started (clock) | complete | to_be_reviewed (clipboard) | incorrect (warning)
 */
export type OnboardingSubtaskVisualState =
  | "locked"
  | "pending"
  | "started"
  | "complete"
  | "to_be_reviewed"
  | "incorrect";

export const ONBOARDING_SECTION_ICON = {
  locked: "/icons/lock-fill.svg",
  not_started: "/icons/time-clock.svg",
  complete: ONBOARDING_TASK_COMPLETE_ICON,
  in_review: "/icons/clipboard.svg",
  in_review_warning: "/icons/warning-fill.svg",
  in_progress: "/icons/progress-complete.svg",
} as const;

export const ONBOARDING_SUBTASK_ICON = {
  locked: "/icons/lock-fill.svg",
  /** Sub-task not started yet. */
  pending: "/icons/time-clock.svg",
  /** Sub-task started but not yet submitted for review. */
  started: "/icons/time-clock.svg",
  complete: ONBOARDING_TASK_COMPLETE_ICON_SM,
  complete_lg: ONBOARDING_TASK_COMPLETE_ICON,
  to_be_reviewed: "/icons/clipboard.svg",
  incorrect: "/icons/warning-fill.svg",
} as const;

/** @deprecated Use ONBOARDING_SECTION_ICON / ONBOARDING_SUBTASK_ICON */
export const ONBOARDING_STATUS_ICON = {
  ...ONBOARDING_SECTION_ICON,
  pending_subtask: ONBOARDING_SUBTASK_ICON.pending,
  complete_sm: ONBOARDING_SUBTASK_ICON.complete,
  in_review: ONBOARDING_SECTION_ICON.in_review,
  in_review_warning: ONBOARDING_SECTION_ICON.in_review_warning,
} as const;

export function isSubtaskComplete(
  task: OnboardingTask,
  sectionId: string,
  approvedIds: string[] = [],
  partnerId?: string,
): boolean {
  if (sectionId === "profile" && isProfileTmReviewTask(task)) {
    return isProfileTaskTmApproved(task.id, approvedIds);
  }
  if (sectionId === "documentation") {
    return isDocumentationTaskTmApproved(task, approvedIds, partnerId);
  }
  return task.status === "complete";
}

export function resolveSectionStatusVisualState(
  section: OnboardingSection,
  sections: OnboardingSection[],
  approvedIds: string[] = [],
): OnboardingSectionVisualState {
  if (isOnboardingSectionLocked(section, sections, approvedIds)) {
    return "locked";
  }

  const completed = countSectionCompletedSteps(section, approvedIds);
  const total = section.totalSteps;

  if (total > 0 && completed >= total) {
    return "complete";
  }

  if (section.tasks.some((task) => task.issue || task.status === "blocked")) {
    return "in_review_warning";
  }

  if (section.tasks.some((task) => taskNeedsReview(task, section.id, approvedIds))) {
    return "in_review";
  }

  if (completed > 0) {
    return "in_progress";
  }

  if (section.tasks.some((task) => task.status === "in_progress" || task.status === "complete")) {
    return "in_progress";
  }

  return "not_started";
}

export function resolveSubtaskStatusVisualState(
  task: OnboardingTask,
  sectionId: string,
  approvedIds: string[] = [],
  sectionLocked = false,
  partnerId?: string,
): OnboardingSubtaskVisualState {
  if (sectionLocked) return "locked";

  if (isSubtaskComplete(task, sectionId, approvedIds, partnerId)) {
    return "complete";
  }

  if (task.issue || task.status === "blocked") {
    return "incorrect";
  }

  if (taskNeedsReview(task, sectionId, approvedIds)) {
    return "to_be_reviewed";
  }

  if (task.status === "in_progress" || task.status === "complete") {
    return "started";
  }

  return "pending";
}

export function sectionStatusIconSrc(state: OnboardingSectionVisualState): string {
  switch (state) {
    case "locked":
      return ONBOARDING_SECTION_ICON.locked;
    case "not_started":
      return ONBOARDING_SECTION_ICON.not_started;
    case "complete":
      return ONBOARDING_SECTION_ICON.complete;
    case "in_review":
      return ONBOARDING_SECTION_ICON.in_review;
    case "in_review_warning":
      return ONBOARDING_SECTION_ICON.in_review_warning;
    case "in_progress":
      return ONBOARDING_SECTION_ICON.in_progress;
    default:
      return ONBOARDING_SECTION_ICON.not_started;
  }
}

export function subtaskStatusIconSrc(
  state: OnboardingSubtaskVisualState,
  size: "sm" | "lg" = "sm",
): string {
  switch (state) {
    case "locked":
      return ONBOARDING_SUBTASK_ICON.locked;
    case "pending":
      return ONBOARDING_SUBTASK_ICON.pending;
    case "started":
      return ONBOARDING_SUBTASK_ICON.started;
    case "complete":
      return size === "lg"
        ? ONBOARDING_SUBTASK_ICON.complete_lg
        : ONBOARDING_SUBTASK_ICON.complete;
    case "to_be_reviewed":
      return ONBOARDING_SUBTASK_ICON.to_be_reviewed;
    case "incorrect":
      return ONBOARDING_SUBTASK_ICON.incorrect;
    default:
      return ONBOARDING_SUBTASK_ICON.pending;
  }
}

export function shouldGraySectionStatusIcon(
  section: OnboardingSection,
  sections: OnboardingSection[],
  approvedIds: string[] = [],
): boolean {
  const state = resolveSectionStatusVisualState(section, sections, approvedIds);
  return (
    state === "not_started" || state === "in_review" || state === "in_progress"
  );
}

export function shouldGraySubtaskStatusIcon(
  task: OnboardingTask,
  sectionId: string,
  approvedIds: string[] = [],
  sectionLocked = false,
): boolean {
  const state = resolveSubtaskStatusVisualState(task, sectionId, approvedIds, sectionLocked);
  // Sub-task SVGs ship with their own gray/green/orange fills — avoid washing them out.
  if (state === "complete" || state === "incorrect" || state === "locked") return false;
  return false;
}

export function getSectionStatusIconSrc(
  section: OnboardingSection,
  sections: OnboardingSection[],
  approvedIds: string[] = [],
): string {
  const state = resolveSectionStatusVisualState(section, sections, approvedIds);
  return sectionStatusIconSrc(state);
}

export function getSubtaskStatusIconSrc(
  task: OnboardingTask,
  sectionId: string,
  approvedIds: string[] = [],
  sectionLocked = false,
  size: "sm" | "lg" = "sm",
  partnerId?: string,
): string {
  const state = resolveSubtaskStatusVisualState(
    task,
    sectionId,
    approvedIds,
    sectionLocked,
    partnerId,
  );
  return subtaskStatusIconSrc(state, size);
}

/** @deprecated Use section/subtask-specific helpers */
export type OnboardingStatusVisualState = OnboardingSectionVisualState | OnboardingSubtaskVisualState;

export function shouldGrayStatusIcon(state: OnboardingSectionVisualState): boolean {
  return state === "not_started" || state === "in_review" || state === "in_progress";
}
