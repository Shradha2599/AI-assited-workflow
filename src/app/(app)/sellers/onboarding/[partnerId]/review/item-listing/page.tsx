import { notFound } from "next/navigation";

import { ItemListingReview } from "@/features/partner-onboarding/components/item-listing-review";
import { getOnboardingForPartner } from "@/lib/mock-data/onboarding";
import { getPotentialPartnerById, showsOnboardingChecklist } from "@/lib/mock-data/potential-partners";

interface ItemListingPageProps {
  params: Promise<{ partnerId: string }>;
}

export default async function ItemListingPage({ params }: ItemListingPageProps) {
  const { partnerId } = await params;
  const partner = getPotentialPartnerById(partnerId);
  if (!partner || !showsOnboardingChecklist(partner.status)) {
    notFound();
  }

  const onboarding = getOnboardingForPartner(partner);

  return <ItemListingReview partner={partner} onboarding={onboarding} />;
}
