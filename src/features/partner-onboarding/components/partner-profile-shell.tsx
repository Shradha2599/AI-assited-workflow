"use client";

import { useEffect, useMemo } from "react";

import { LeadFormView } from "@/features/partner-onboarding/components/lead-form-view";
import { OnboardingChecklistView } from "@/features/partner-onboarding/components/onboarding-checklist-view";
import { PartnerProfileHeader } from "@/features/partner-onboarding/components/partner-profile-header";
import type { LeadFormData } from "@/lib/mock-data/lead-forms";
import type { OnboardingPartner } from "@/lib/mock-data/onboarding";
import { getOnboardingForPartner } from "@/lib/mock-data/onboarding";
import type { PotentialPartner } from "@/lib/mock-data/potential-partners";
import {
  showsLeadForm,
  showsOnboardingChecklist,
} from "@/lib/mock-data/potential-partners";
import { usePartnerReviewStore } from "../store/partner-review-store";

interface PartnerProfileShellProps {
  partner: PotentialPartner;
  form?: LeadFormData;
  onboarding?: OnboardingPartner;
}

export function PartnerProfileShell({ partner, form, onboarding }: PartnerProfileShellProps) {
  const setActivePartner = usePartnerReviewStore((s) => s.setActivePartner);
  const statusOverrides = usePartnerReviewStore((s) => s.statusOverrides);

  const effectiveStatus = statusOverrides[partner.id] ?? partner.status;
  const displayPartner = useMemo(
    () => ({ ...partner, status: effectiveStatus }),
    [partner, effectiveStatus],
  );

  useEffect(() => {
    setActivePartner(partner.id);
  }, [partner.id, setActivePartner]);

  if (showsOnboardingChecklist(effectiveStatus)) {
    const resolvedOnboarding =
      onboarding ?? getOnboardingForPartner(displayPartner);
    return (
      <OnboardingChecklistView
        partner={displayPartner}
        onboarding={resolvedOnboarding}
      />
    );
  }

  if (showsLeadForm(effectiveStatus) && form) {
    return (
      <div className="space-y-[var(--space-4)]">
        <PartnerProfileHeader partner={displayPartner} />
        <LeadFormView partner={displayPartner} form={form} />
      </div>
    );
  }

  return null;
}
