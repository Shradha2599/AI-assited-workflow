import { notFound } from "next/navigation";

import { ItemListingDetailView } from "@/features/partner-onboarding/components/item-listing-detail-view";
import { getListingItemForPartner } from "@/lib/mock-data/item-listing";
import { getPotentialPartnerById, showsOnboardingChecklist } from "@/lib/mock-data/potential-partners";

interface ItemListingDetailPageProps {
  params: Promise<{ partnerId: string; sku: string }>;
}

export default async function ItemListingDetailPage({ params }: ItemListingDetailPageProps) {
  const { partnerId, sku } = await params;
  const partner = getPotentialPartnerById(partnerId);
  if (!partner || !showsOnboardingChecklist(partner.status)) {
    notFound();
  }

  const decodedSku = decodeURIComponent(sku);
  const item = getListingItemForPartner(partnerId, decodedSku);
  if (!item) {
    notFound();
  }

  return <ItemListingDetailView partner={partner} item={item} />;
}
