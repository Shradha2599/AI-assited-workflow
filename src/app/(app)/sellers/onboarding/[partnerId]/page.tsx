import { notFound } from "next/navigation";

import { PartnerProfileShell } from "@/features/partner-onboarding/components/partner-profile-shell";
import { getLeadFormByPartnerId } from "@/lib/mock-data/lead-forms";
import { getOnboardingForPartner } from "@/lib/mock-data/onboarding";
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

  const form = getLeadFormByPartnerId(partner.id);
  const onboarding = showsOnboardingChecklist(partner.status)
    ? getOnboardingForPartner(partner)
    : undefined;

  if (showsLeadForm(partner.status) && !form) {
    notFound();
  }

  return (
    <PartnerProfileShell
      partner={partner}
      form={form ?? undefined}
      onboarding={onboarding ?? undefined}
    />
  );
}
