import { notFound } from "next/navigation";

import { LeadFormView } from "@/features/partner-onboarding/components/lead-form-view";
import { OnboardingChecklistView } from "@/features/partner-onboarding/components/onboarding-checklist-view";
import { getLeadFormByPartnerId } from "@/lib/mock-data/lead-forms";
import { getOnboardingBySellerID } from "@/lib/mock-data/onboarding";
import {
  getPotentialPartnerById,
  showsLeadForm,
  showsOnboardingChecklist,
} from "@/lib/mock-data/potential-partners";

interface PartnerProfilePageProps {
  params: Promise<{ partnerId: string }>;
}

export default async function PartnerProfilePage({ params }: PartnerProfilePageProps) {
  const { partnerId } = await params;
  const partner = getPotentialPartnerById(partnerId);

  if (!partner) {
    notFound();
  }

  if (showsOnboardingChecklist(partner.status)) {
    const onboarding = getOnboardingBySellerID(partner.sellerId);
    if (!onboarding) {
      notFound();
    }
    return <OnboardingChecklistView partner={partner} onboarding={onboarding} />;
  }

  if (showsLeadForm(partner.status)) {
    const form = getLeadFormByPartnerId(partner.id);
    if (!form) {
      notFound();
    }
    return <LeadFormView partner={partner} form={form} />;
  }

  notFound();
}
