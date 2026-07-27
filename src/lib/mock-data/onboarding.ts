import { isOnboardingSectionLocked, countSectionCompletedSteps } from "@/lib/onboarding/progress";
import type { OnboardingSection, OnboardingTask } from "@/lib/onboarding/types";
import {
  getSectionStatusIconSrc,
  getSubtaskStatusIconSrc,
} from "@/features/partner-onboarding/utils/onboarding-status-icons";

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
  countOnboardingSubtaskProgress,
  countOnboardingSectionProgress,
  getOnboardingSectionProgressPercent,
  getSectionProgressPercent,
  countSectionCompletedSteps,
  isOnboardingSectionLocked,
  taskNeedsReview,
  generateTaskRecommendation,
  LOCKED_ONBOARDING_SECTION_IDS,
} from "@/lib/onboarding";

/** @deprecated Use ONBOARDING_STATUS_ICON.in_review */
export const ASSORTMENT_REVIEW_ICON_SRC = "/icons/clipboard.svg";

/** Assortment stays under review after form submission — not auto-complete. */
export function isAssortmentSectionInReview(
  section: OnboardingSection,
  approvedIds: string[] = [],
  partnerId?: string,
): boolean {
  if (section.id !== "assortment") return false;
  const assortmentPartnerId = partnerId ?? section.tasks[0]?.sellerId;
  if (
    assortmentPartnerId &&
    approvedIds.includes(`assortment-${assortmentPartnerId}`)
  ) {
    return false;
  }
  return true;
}

export function getAssortmentTaskIconSrc(
  task: OnboardingTask,
  approvedIds: string[] = [],
): string {
  return getSubtaskStatusIconSrc(task, "assortment", approvedIds, false, "sm");
}

export function getOnboardingSectionStatusIconSrc(
  section: OnboardingSection,
  sections: OnboardingSection[],
  approvedIds: string[] = [],
  partnerId?: string,
): string {
  return getSectionStatusIconSrc(section, sections, approvedIds, partnerId);
}
