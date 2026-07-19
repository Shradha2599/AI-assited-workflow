import type { OnboardingSection, OnboardingTask } from "@/lib/mock-data/onboarding";

export const PROFILE_TM_REVIEW_TASK_TITLE = "Brand profile";

export function isProfileTmReviewTask(task: OnboardingTask): boolean {
  return task.title === PROFILE_TM_REVIEW_TASK_TITLE;
}

export function profileTaskApproveId(taskId: string): string {
  return `profile-${taskId}`;
}

export function isProfileTaskTmApproved(taskId: string, approvedIds: string[]): boolean {
  return approvedIds.includes(profileTaskApproveId(taskId));
}

export function countProfileSectionCompletedSteps(
  section: OnboardingSection,
  approvedIds: string[] = [],
): number {
  return section.tasks.filter((task) => {
    if (!isProfileTmReviewTask(task)) {
      return task.status === "complete";
    }
    return isProfileTaskTmApproved(task.id, approvedIds);
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
