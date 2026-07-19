import type { OnboardingSection, OnboardingTask } from "@/lib/mock-data/onboarding";
import {
  getSubtaskStatusIconSrc,
  shouldGraySubtaskStatusIcon,
} from "./onboarding-status-icons";

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

export function documentationSubtaskApproveId(
  partnerId: string,
  subSection: "general" | "brands",
): string {
  return `doc-subtask-${subSection}-${partnerId}`;
}

export function isDocumentationSubtaskTmApproved(
  partnerId: string,
  subSection: "general" | "brands",
  approvedIds: string[] = [],
): boolean {
  return approvedIds.includes(documentationSubtaskApproveId(partnerId, subSection));
}

export function isDocumentationTaskTmApproved(
  task: OnboardingTask,
  approvedIds: string[] = [],
  partnerId?: string,
): boolean {
  const pid = partnerId ?? task.sellerId;
  if (task.id.endsWith("-09")) {
    return isDocumentationSubtaskTmApproved(pid, "general", approvedIds);
  }
  if (task.id.endsWith("-10")) {
    return isDocumentationSubtaskTmApproved(pid, "brands", approvedIds);
  }
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
  sectionLocked = false,
): string {
  return getSubtaskStatusIconSrc(task, "documentation", approvedIds, sectionLocked, "lg");
}

export function shouldGrayDocumentationTaskProgressIcon(
  task: OnboardingTask,
  approvedIds: string[] = [],
  sectionLocked = false,
): boolean {
  return shouldGraySubtaskStatusIcon(task, "documentation", approvedIds, sectionLocked);
}

export function documentationTaskNeedsReview(
  task: OnboardingTask,
  approvedIds: string[] = [],
): boolean {
  if (isDocumentationTaskTmApproved(task, approvedIds)) return false;
  return isDocumentationTaskSubmitted(task);
}
