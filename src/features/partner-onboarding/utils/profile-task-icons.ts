import type { OnboardingTask } from "@/lib/mock-data/onboarding";
import {
  getProfileTaskProgressIconSrc,
  isProfileTmReviewTask,
  resolveProfileTaskProgressState,
  shouldGrayProfileTaskProgressIcon,
} from "./profile-task-progress";

export const ONBOARDING_ICON_GRAY_FILTER =
  "brightness(0) saturate(100%) invert(55%) sepia(8%) saturate(0%) hue-rotate(180deg) brightness(95%) contrast(88%)";

/** Checklist table row icons (profile section sub-tasks). */
export function getProfileSubTaskIconSrc(
  task: OnboardingTask,
  approvedIds: string[] = [],
): string {
  if (!isProfileTmReviewTask(task)) {
    if (task.status === "complete") return "/icons/progress-check-success.svg";
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
    return "/icons/progress-check-success.svg";
  }
  return getProfileTaskProgressIconSrc(task, approvedIds);
}

/** Documentation review nav: submitted docs awaiting approve/reject use review icon. */
export function getDocumentationSubTaskNavIconSrc(task: OnboardingTask): string {
  if (task.status === "pending" && !task.autoValidated) {
    return "/icons/progress-complete.svg";
  }
  return "/icons/review-document.svg";
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

export function shouldGrayDocumentationSubTaskNavIcon(task: OnboardingTask): boolean {
  return task.status === "pending" && !task.autoValidated;
}

export { resolveProfileTaskProgressState };
