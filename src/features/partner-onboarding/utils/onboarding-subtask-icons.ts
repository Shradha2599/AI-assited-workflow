import type { OnboardingTask } from "@/lib/mock-data/onboarding";
import {
  getSubtaskStatusIconSrc,
  shouldGraySubtaskStatusIcon,
} from "./onboarding-status-icons";

/** Checklist sub-task chip icon — unified status spec. */
export function getChecklistSubTaskIconSrc(
  sectionId: string,
  task: OnboardingTask,
  approvedIds: string[] = [],
  sectionLocked = false,
): string {
  return getSubtaskStatusIconSrc(task, sectionId, approvedIds, sectionLocked, "sm");
}

export function shouldGrayChecklistSubTaskIcon(
  sectionId: string,
  task: OnboardingTask,
  approvedIds: string[] = [],
  sectionLocked = false,
): boolean {
  return shouldGraySubtaskStatusIcon(task, sectionId, approvedIds, sectionLocked);
}
