import type { OnboardingSection } from "@/lib/mock-data/onboarding";
import {
  getOnboardingSectionProgressPercent,
  getOnboardingSectionStatusIconSrc,
  isAssortmentSectionInReview,
  isOnboardingSectionLocked,
} from "@/lib/mock-data/onboarding";
import { getProfileSectionProgressPercent } from "@/features/partner-onboarding/utils/profile-task-progress";

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
  const locked = isOnboardingSectionLocked(section, sections);
  const src = getOnboardingSectionStatusIconSrc(section, sections);
  const progress =
    section.id === "profile"
      ? getProfileSectionProgressPercent(section, approvedIds)
      : getOnboardingSectionProgressPercent(section);
  const gray = !locked && progress === 0 && !isAssortmentSectionInReview(section);

  return { src, gray, title: section.title };
}
