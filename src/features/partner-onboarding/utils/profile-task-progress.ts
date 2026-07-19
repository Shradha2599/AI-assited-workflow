import type { OnboardingSection, OnboardingTask } from "@/lib/mock-data/onboarding";
import {
  getSubtaskStatusIconSrc,
  shouldGraySubtaskStatusIcon,
} from "./onboarding-status-icons";

export function getProfileTaskProgressIconSrc(
  task: OnboardingTask,
  approvedIds: string[] = [],
  sectionLocked = false,
): string {
  return getSubtaskStatusIconSrc(task, "profile", approvedIds, sectionLocked, "lg");
}

export function shouldGrayProfileTaskProgressIcon(
  task: OnboardingTask,
  approvedIds: string[] = [],
  sectionLocked = false,
): boolean {
  return shouldGraySubtaskStatusIcon(task, "profile", approvedIds, sectionLocked);
}

export {
  PROFILE_TM_REVIEW_TASK_TITLE,
  profileTaskApproveId,
  isProfileTaskTmApproved,
  isProfileTmReviewTask,
  countProfileSectionCompletedSteps,
  getProfileSectionProgressPercent,
  isProfileTaskSubmitted,
} from "./profile-task-progress-core";
