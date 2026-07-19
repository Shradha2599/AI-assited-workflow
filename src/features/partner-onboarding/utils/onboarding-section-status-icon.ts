import type { OnboardingSection } from "@/lib/mock-data/onboarding";
import {
  countSectionCompletedSteps,
  getSectionProgressPercent,
} from "@/lib/onboarding/progress";
import { getOnboardingSectionStatusIconSrc } from "@/lib/mock-data/onboarding";
import {
  resolveSectionStatusVisualState,
  shouldGraySectionStatusIcon,
} from "./onboarding-status-icons";

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
  const src = getOnboardingSectionStatusIconSrc(section, sections, approvedIds);
  const gray = shouldGraySectionStatusIcon(section, sections, approvedIds);

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

export { resolveSectionStatusVisualState };
