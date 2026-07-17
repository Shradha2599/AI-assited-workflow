import type { OnboardingSection, OnboardingTask } from "@/lib/mock-data/onboarding";
import {
  ONBOARDING_TASK_COMPLETE_ICON,
} from "./onboarding-task-icons";

/** Matches approve ids used in documentation-review (`doc-w9`, `doc-contract`). */
export function documentationDocApproveId(docKey: string): string {
  return `doc-${docKey}`;
}

export function documentationTaskDocKey(task: OnboardingTask): string {
  const title = task.title.toLowerCase();
  if (title.includes("w9")) return "w9";
  if (title.includes("contract")) return "contract";
  return task.id.replace(/^t-[^-]+-/, "");
}

export function documentationTaskApproveId(task: OnboardingTask): string {
  return documentationDocApproveId(documentationTaskDocKey(task));
}

export function isDocumentationTaskTmApproved(
  task: OnboardingTask,
  approvedIds: string[] = [],
): boolean {
  return approvedIds.includes(documentationTaskApproveId(task));
}

export function isDocumentationTaskSubmitted(task: OnboardingTask): boolean {
  return task.status === "in_progress" || task.status === "complete";
}

export function countDocumentationSectionCompletedSteps(
  section: OnboardingSection,
  approvedIds: string[] = [],
): number {
  return section.tasks.filter((task) => isDocumentationTaskTmApproved(task, approvedIds)).length;
}

export function getDocumentationTaskProgressIconSrc(
  task: OnboardingTask,
  approvedIds: string[] = [],
): string {
  if (isDocumentationTaskTmApproved(task, approvedIds)) {
    return ONBOARDING_TASK_COMPLETE_ICON;
  }
  if (isDocumentationTaskSubmitted(task)) {
    return "/icons/review-document.svg";
  }
  if (task.status === "blocked") return "/icons/warning-fill.svg";
  return "/icons/progress.svg";
}

export function shouldGrayDocumentationTaskProgressIcon(
  task: OnboardingTask,
  approvedIds: string[] = [],
): boolean {
  if (isDocumentationTaskTmApproved(task, approvedIds)) return false;
  return !isDocumentationTaskSubmitted(task);
}

export function documentationTaskNeedsReview(
  task: OnboardingTask,
  approvedIds: string[] = [],
): boolean {
  if (isDocumentationTaskTmApproved(task, approvedIds)) return false;
  return isDocumentationTaskSubmitted(task);
}
