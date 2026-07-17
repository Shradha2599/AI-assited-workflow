import type { OnboardingTask } from "@/lib/mock-data/onboarding";
import {
  getProfileSubTaskIconSrc,
  shouldGrayProfileSubTaskIcon,
} from "./profile-task-icons";

function iconForTaskStatus(task: OnboardingTask): string {
  if (task.status === "complete") return "/icons/progress-check-success.svg";
  if (task.status === "in_progress") return "/icons/time-clock.svg";
  if (task.status === "blocked") return "/icons/warning-fill.svg";
  return "/icons/progress.svg";
}

function grayForTaskStatus(task: OnboardingTask): boolean {
  return task.status === "pending" || task.status === "in_progress";
}

/** Checklist sub-task chip for documentation (W9 + contract). */
export function getDocumentationSubTaskIconSrc(task: OnboardingTask): string {
  if (task.status === "complete") return "/icons/progress-check-success.svg";
  if (task.status === "in_progress") return "/icons/review-document.svg";
  if (task.status === "blocked") return "/icons/warning-fill.svg";
  return "/icons/progress.svg";
}

export function shouldGrayDocumentationSubTaskIcon(task: OnboardingTask): boolean {
  return task.status === "pending";
}

/** Checklist sub-task chip for integrations. */
export function getIntegrationsSubTaskIconSrc(task: OnboardingTask): string {
  return iconForTaskStatus(task);
}

export function shouldGrayIntegrationsSubTaskIcon(task: OnboardingTask): boolean {
  return grayForTaskStatus(task);
}

/** Checklist sub-task chip for item listing / stripe / other non-profile sections. */
export function getGenericSubTaskIconSrc(task: OnboardingTask): string {
  return iconForTaskStatus(task);
}

export function shouldGrayGenericSubTaskIcon(task: OnboardingTask): boolean {
  return grayForTaskStatus(task);
}

export function getChecklistSubTaskIconSrc(
  sectionId: string,
  task: OnboardingTask,
  approvedIds: string[] = [],
): string {
  switch (sectionId) {
    case "profile":
      return getProfileSubTaskIconSrc(task, approvedIds);
    case "documentation":
      return getDocumentationSubTaskIconSrc(task);
    case "integrations":
      return getIntegrationsSubTaskIconSrc(task);
    default:
      return getGenericSubTaskIconSrc(task);
  }
}

export function shouldGrayChecklistSubTaskIcon(
  sectionId: string,
  task: OnboardingTask,
  approvedIds: string[] = [],
): boolean {
  switch (sectionId) {
    case "profile":
      return shouldGrayProfileSubTaskIcon(task, approvedIds);
    case "documentation":
      return shouldGrayDocumentationSubTaskIcon(task);
    case "integrations":
      return shouldGrayIntegrationsSubTaskIcon(task);
    default:
      return shouldGrayGenericSubTaskIcon(task);
  }
}
