import type { OnboardingSection } from "@/lib/mock-data/onboarding";
import {
  countSectionCompletedSteps,
  getSectionProgressPercent,
  isOnboardingSectionLocked,
} from "@/lib/onboarding/progress";
import {
  getOnboardingSectionStatusIconSrc,
  isAssortmentSectionInReview,
} from "@/lib/mock-data/onboarding";

export interface OnboardingSectionStatusIconState {
  src: string;
  gray: boolean;
  title: string;
}

/** Left status icon on checklist rows — shared by profile checklist and partners table. */
export function resolveOnboardingSectionStatusIcon(
  section: OnboardingSection,
  sections: OnboardingSection[],
  approvedIds: string[] = [],
): OnboardingSectionStatusIconState {
  const locked = isOnboardingSectionLocked(section, sections, approvedIds);
  const src = getOnboardingSectionStatusIconSrc(section, sections, approvedIds);
  const progress = getSectionProgressPercent(section, approvedIds);
  const gray = !locked && progress === 0 && !isAssortmentSectionInReview(section);

  return { src, gray, title: section.title };
}

/** Effective completed steps for a section (respects TM approval on Brand profile). */
export function resolveSectionCompletedSteps(
  section: OnboardingSection,
  approvedIds: string[] = [],
): number {
  return countSectionCompletedSteps(section, approvedIds);
}

/** Effective progress percent for a section. */
export function resolveSectionProgressPercent(
  section: OnboardingSection,
  approvedIds: string[] = [],
): number {
  return getSectionProgressPercent(section, approvedIds);
}
