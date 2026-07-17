import type { OnboardingTask } from "@/lib/mock-data/onboarding";
import {
  getDocumentationTaskProgressIconSrc,
  shouldGrayDocumentationTaskProgressIcon,
} from "./documentation-task-progress";
import {
  getProfileTaskProgressIconSrc,
  isProfileTmReviewTask,
  resolveProfileTaskProgressState,
  shouldGrayProfileTaskProgressIcon,
} from "./profile-task-progress";
import { ONBOARDING_TASK_COMPLETE_ICON, ONBOARDING_TASK_COMPLETE_ICON_SM } from "./onboarding-task-icons";

export const ONBOARDING_ICON_GRAY_FILTER =
  "brightness(0) saturate(100%) invert(55%) sepia(8%) saturate(0%) hue-rotate(180deg) brightness(95%) contrast(88%)";

/** Checklist table row icons (profile section sub-tasks). */
export function getProfileSubTaskIconSrc(
  task: OnboardingTask,
  approvedIds: string[] = [],
): string {
  if (!isProfileTmReviewTask(task)) {
    if (task.status === "complete") return ONBOARDING_TASK_COMPLETE_ICON_SM;
    if (task.status === "in_progress") return "/icons/time-clock.svg";
    if (task.status === "blocked") return "/icons/warning-fill.svg";
    return "/icons/progress.svg";
  }
  return getProfileTaskProgressIconSrc(task, approvedIds);
}

/** Review-page sub-task nav icons. */
export function getProfileSubTaskNavIconSrc(
  task: OnboardingTask,
  approvedIds: string[] = [],
): string {
  if (!isProfileTmReviewTask(task)) {
    return ONBOARDING_TASK_COMPLETE_ICON;
  }
  return getProfileTaskProgressIconSrc(task, approvedIds);
}

/** Documentation review nav — TM approval required before complete icon. */
export function getDocumentationSubTaskNavIconSrc(
  task: OnboardingTask,
  approvedIds: string[] = [],
): string {
  return getDocumentationTaskProgressIconSrc(task, approvedIds);
}

export function shouldGrayProfileSubTaskIcon(
  task: OnboardingTask,
  approvedIds: string[] = [],
): boolean {
  if (!isProfileTmReviewTask(task)) {
    return task.status === "pending" || task.status === "in_progress";
  }
  return shouldGrayProfileTaskProgressIcon(task, approvedIds);
}

export function shouldGrayProfileSubTaskNavIcon(
  task: OnboardingTask,
  approvedIds: string[] = [],
): boolean {
  if (!isProfileTmReviewTask(task)) return false;
  return shouldGrayProfileTaskProgressIcon(task, approvedIds);
}

export function shouldGrayDocumentationSubTaskNavIcon(
  task: OnboardingTask,
  approvedIds: string[] = [],
): boolean {
  return shouldGrayDocumentationTaskProgressIcon(task, approvedIds);
}

export { resolveProfileTaskProgressState };
