"use client";

import type { PotentialPartner } from "@/lib/mock-data/potential-partners";
import { PartnerProfileHeader } from "./partner-profile-header";

interface OnboardingProfileHeaderProps {
  partner: PotentialPartner;
  launchDate: string;
}

/** @deprecated Use PartnerProfileHeader with launchDate + outreachMailType */
export function OnboardingProfileHeader({ partner, launchDate }: OnboardingProfileHeaderProps) {
  return (
    <PartnerProfileHeader
      partner={partner}
      launchDate={launchDate}
      outreachMailType="onboarding_kickoff"
    />
  );
}
