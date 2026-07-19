import type { OnboardingTask } from "@/lib/mock-data/onboarding";
import {
  getSubtaskStatusIconSrc,
  resolveSubtaskStatusVisualState,
  shouldGraySubtaskStatusIcon,
} from "./onboarding-status-icons";

export const ONBOARDING_ICON_GRAY_FILTER =
  "brightness(0) saturate(100%) invert(55%) sepia(8%) saturate(0%) hue-rotate(180deg) brightness(95%) contrast(88%)";

/** Checklist table row icons (profile section sub-tasks). */
export function getProfileSubTaskIconSrc(
  task: OnboardingTask,
  approvedIds: string[] = [],
  sectionLocked = false,
): string {
  return getSubtaskStatusIconSrc(task, "profile", approvedIds, sectionLocked, "sm");
}

/** Review-page sub-task nav icons. */
export function getProfileSubTaskNavIconSrc(
  task: OnboardingTask,
  approvedIds: string[] = [],
  sectionLocked = false,
): string {
  return getSubtaskStatusIconSrc(task, "profile", approvedIds, sectionLocked, "lg");
}

/** Documentation review nav — TM approval required before complete icon. */
export function getDocumentationSubTaskNavIconSrc(
  task: OnboardingTask,
  approvedIds: string[] = [],
  sectionLocked = false,
  partnerId?: string,
): string {
  return getSubtaskStatusIconSrc(
    task,
    "documentation",
    approvedIds,
    sectionLocked,
    "lg",
    partnerId,
  );
}

export function shouldGrayProfileSubTaskIcon(
  task: OnboardingTask,
  approvedIds: string[] = [],
  sectionLocked = false,
): boolean {
  return shouldGraySubtaskStatusIcon(task, "profile", approvedIds, sectionLocked);
}

export function shouldGrayProfileSubTaskNavIcon(
  task: OnboardingTask,
  approvedIds: string[] = [],
  sectionLocked = false,
): boolean {
  return shouldGraySubtaskStatusIcon(task, "profile", approvedIds, sectionLocked);
}

export function shouldGrayDocumentationSubTaskNavIcon(
  task: OnboardingTask,
  approvedIds: string[] = [],
  sectionLocked = false,
): boolean {
  return shouldGraySubtaskStatusIcon(task, "documentation", approvedIds, sectionLocked);
}

/** @deprecated Use resolveSubtaskStatusVisualState */
export function resolveProfileTaskProgressState(
  task: OnboardingTask,
  approvedIds: string[] = [],
) {
  const state = resolveSubtaskStatusVisualState(task, "profile", approvedIds);
  switch (state) {
    case "complete":
      return "tm_approved" as const;
    case "incorrect":
      return "issue" as const;
    case "to_be_reviewed":
    case "started":
      return "in_review" as const;
    default:
      return "pending" as const;
  }
}

export {
  getSubtaskStatusIconSrc,
  resolveSubtaskStatusVisualState,
  type OnboardingSubtaskVisualState,
} from "./onboarding-status-icons";
