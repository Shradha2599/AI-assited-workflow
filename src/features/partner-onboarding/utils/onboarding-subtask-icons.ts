import type { OnboardingTask } from "@/lib/mock-data/onboarding";
import {
  getDocumentationTaskProgressIconSrc,
  isDocumentationTaskTmApproved,
  shouldGrayDocumentationTaskProgressIcon,
} from "./documentation-task-progress";
import {
  ONBOARDING_TASK_COMPLETE_ICON_SM,
} from "./onboarding-task-icons";
import {
  getProfileSubTaskIconSrc,
  shouldGrayProfileSubTaskIcon,
} from "./profile-task-icons";

function iconForTaskStatus(task: OnboardingTask): string {
  if (task.status === "complete") return ONBOARDING_TASK_COMPLETE_ICON_SM;
  if (task.status === "in_progress") return "/icons/time-clock.svg";
  if (task.status === "blocked") return "/icons/warning-fill.svg";
  return "/icons/progress.svg";
}

function grayForTaskStatus(task: OnboardingTask): boolean {
  return task.status === "pending" || task.status === "in_progress";
}

/** Checklist sub-task chip for documentation (W9 + contract) — TM approval required. */
export function getDocumentationSubTaskIconSrc(
  task: OnboardingTask,
  approvedIds: string[] = [],
): string {
  if (isDocumentationTaskTmApproved(task, approvedIds)) {
    return ONBOARDING_TASK_COMPLETE_ICON_SM;
  }
  return getDocumentationTaskProgressIconSrc(task, approvedIds);
}

export function shouldGrayDocumentationSubTaskIcon(
  task: OnboardingTask,
  approvedIds: string[] = [],
): boolean {
  return shouldGrayDocumentationTaskProgressIcon(task, approvedIds);
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
      return getDocumentationSubTaskIconSrc(task, approvedIds);
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
      return shouldGrayDocumentationSubTaskIcon(task, approvedIds);
    case "integrations":
      return shouldGrayIntegrationsSubTaskIcon(task);
    default:
      return shouldGrayGenericSubTaskIcon(task);
  }
}
