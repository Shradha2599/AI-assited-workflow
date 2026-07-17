import { isOnboardingSectionLocked } from "@/lib/onboarding/progress";
import type { OnboardingSection, OnboardingTask } from "@/lib/onboarding/types";

export type {
  OnboardingTask,
  OnboardingSection,
  OnboardingPartner,
  OnboardingSectionId,
  OnboardingSectionState,
  OnboardingSubtaskState,
  SellerOnboardingState,
  AiSuggestedCta,
  AiSuggestedAction,
} from "@/lib/onboarding/types";

export {
  getSellerOnboardingState,
  getOnboardingForPartner,
  getOnboardingBySellerID,
  getAllOnboardingProfiles,
  getBlockedOnboardingTasks,
  computeOnboardingOverallProgress,
  countOnboardingSectionProgress,
  getOnboardingSectionProgressPercent,
  getSectionProgressPercent,
  countSectionCompletedSteps,
  isOnboardingSectionLocked,
  taskNeedsReview,
  generateTaskRecommendation,
  LOCKED_ONBOARDING_SECTION_IDS,
} from "@/lib/onboarding";

export const ASSORTMENT_REVIEW_ICON_SRC = "/icons/clipboard.svg";

/** Assortment stays under review after form submission — not auto-complete. */
export function isAssortmentSectionInReview(section: OnboardingSection): boolean {
  if (section.id !== "assortment") return false;
  return section.tasks.some((task) => task.status === "in_progress");
}

export function getAssortmentTaskIconSrc(task: OnboardingTask): string {
  if (task.status === "complete") return "/icons/progress-check-success.svg";
  return ASSORTMENT_REVIEW_ICON_SRC;
}

export function getOnboardingSectionStatusIconSrc(
  section: OnboardingSection,
  sections: OnboardingSection[],
): string {
  const locked = isOnboardingSectionLocked(section, sections);
  if (locked) return "/icons/lock-fill.svg";
  if (isAssortmentSectionInReview(section)) {
    return ASSORTMENT_REVIEW_ICON_SRC;
  }
  if (section.completedSteps >= section.totalSteps && section.totalSteps > 0) {
    return "/icons/progress-check.svg";
  }
  if (section.tasks.some((t) => t.status === "in_progress" || t.status === "blocked")) {
    return "/icons/time-clock.svg";
  }
  return "/icons/progress.svg";
}
