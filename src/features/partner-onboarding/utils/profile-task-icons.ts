import type { OnboardingTask } from "@/lib/mock-data/onboarding";
import {
  getProfileTaskProgressIconSrc,
  resolveProfileTaskProgressState,
  shouldGrayProfileTaskProgressIcon,
} from "./profile-task-progress";

export const ONBOARDING_ICON_GRAY_FILTER =
  "brightness(0) saturate(100%) invert(55%) sepia(8%) saturate(0%) hue-rotate(180deg) brightness(95%) contrast(88%)";

/** Checklist table row icons (legacy checklist page). */
export function getProfileSubTaskIconSrc(
  task: OnboardingTask,
  approvedIds: string[] = [],
): string {
  return getProfileTaskProgressIconSrc(task, approvedIds);
}

/** Review-page sub-task nav icons. */
export function getProfileSubTaskNavIconSrc(
  task: OnboardingTask,
  approvedIds: string[] = [],
): string {
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
  return shouldGrayProfileTaskProgressIcon(task, approvedIds);
}

export function shouldGrayProfileSubTaskNavIcon(
  task: OnboardingTask,
  approvedIds: string[] = [],
): boolean {
  return shouldGrayProfileTaskProgressIcon(task, approvedIds);
}

export function shouldGrayDocumentationSubTaskNavIcon(task: OnboardingTask): boolean {
  return task.status === "pending" && !task.autoValidated;
}

export { resolveProfileTaskProgressState };
