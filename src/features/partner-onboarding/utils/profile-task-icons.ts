import type { OnboardingTask } from "@/lib/mock-data/onboarding";

export const ONBOARDING_ICON_GRAY_FILTER =
  "brightness(0) saturate(100%) invert(55%) sepia(8%) saturate(0%) hue-rotate(180deg) brightness(95%) contrast(88%)";

export function getProfileSubTaskIconSrc(task: OnboardingTask): string {
  if (task.status === "complete") return "/icons/progress-check.svg";
  if (task.status === "in_progress") return "/icons/time-clock.svg";
  if (task.status === "blocked" || task.issue) return "/icons/warning.svg";
  return "/icons/progress-complete.svg";
}

/** Review-page sub-task nav: validated/submitted steps show green success icons. */
export function getProfileSubTaskNavIconSrc(task: OnboardingTask): string {
  const isValidated =
    task.status === "complete" ||
    task.autoValidated ||
    task.status === "in_progress" ||
    task.status === "blocked";

  if (isValidated) return "/icons/progress-check-success.svg";
  return "/icons/progress-complete.svg";
}

/** Documentation review nav: submitted docs awaiting approve/reject use review icon. */
export function getDocumentationSubTaskNavIconSrc(task: OnboardingTask): string {
  if (task.status === "pending" && !task.autoValidated) {
    return "/icons/progress-complete.svg";
  }
  return "/icons/review-document.svg";
}

export function shouldGrayProfileSubTaskIcon(task: OnboardingTask): boolean {
  return task.status === "pending";
}

export function shouldGrayProfileSubTaskNavIcon(task: OnboardingTask): boolean {
  return task.status === "pending" && !task.autoValidated;
}

export function shouldGrayDocumentationSubTaskNavIcon(task: OnboardingTask): boolean {
  return task.status === "pending" && !task.autoValidated;
}
