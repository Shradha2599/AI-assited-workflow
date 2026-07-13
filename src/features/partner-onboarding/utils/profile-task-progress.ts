import type { OnboardingSection, OnboardingTask } from "@/lib/mock-data/onboarding";

export function profileTaskApproveId(taskId: string): string {
  return `profile-${taskId}`;
}

export function isProfileTaskTmApproved(taskId: string, approvedIds: string[]): boolean {
  return approvedIds.includes(profileTaskApproveId(taskId));
}

export type ProfileTaskProgressState =
  | "tm_approved"
  | "seller_complete"
  | "in_review"
  | "issue"
  | "pending";

export function resolveProfileTaskProgressState(
  task: OnboardingTask,
  approvedIds: string[] = [],
): ProfileTaskProgressState {
  if (isProfileTaskTmApproved(task.id, approvedIds)) return "tm_approved";
  if (task.status === "complete") return "seller_complete";
  if (task.issue || task.status === "blocked") return "issue";
  if (task.status === "in_progress") return "in_review";
  return "pending";
}

export function getProfileTaskProgressIconSrc(
  task: OnboardingTask,
  approvedIds: string[] = [],
): string {
  switch (resolveProfileTaskProgressState(task, approvedIds)) {
    case "tm_approved":
      return "/icons/progress-check-success.svg";
    case "seller_complete":
      return "/icons/progress-check.svg";
    case "issue":
      return "/icons/warning-fill.svg";
    case "in_review":
      return "/icons/time-clock.svg";
    default:
      return "/icons/progress.svg";
  }
}

export function shouldGrayProfileTaskProgressIcon(
  task: OnboardingTask,
  approvedIds: string[] = [],
): boolean {
  const state = resolveProfileTaskProgressState(task, approvedIds);
  return state === "pending" || state === "in_review";
}

export function countProfileSectionCompletedSteps(
  section: OnboardingSection,
  approvedIds: string[] = [],
): number {
  return section.tasks.filter((task) => {
    const state = resolveProfileTaskProgressState(task, approvedIds);
    return state === "tm_approved" || state === "seller_complete";
  }).length;
}

export function getProfileSectionProgressPercent(
  section: OnboardingSection,
  approvedIds: string[] = [],
): number {
  if (!section.totalSteps) return 0;
  const completed = countProfileSectionCompletedSteps(section, approvedIds);
  return Math.round((completed / section.totalSteps) * 100);
}

export function isProfileTaskSubmitted(task: OnboardingTask): boolean {
  return task.status === "complete" || task.status === "in_progress" || Boolean(task.issue);
}
