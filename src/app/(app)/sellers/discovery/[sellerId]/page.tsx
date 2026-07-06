import { notFound } from "next/navigation";

import { SellerProfileView } from "@/features/lead-discovery/components/seller-profile-view";
import { getSellerById } from "@/lib/mock-data/sellers";

interface SellerProfilePageProps {
  params: Promise<{ sellerId: string }>;
}

export default async function SellerProfilePage({ params }: SellerProfilePageProps) {
  const { sellerId } = await params;
  const seller = getSellerById(sellerId);

  if (!seller) {
    notFound();
  }

  return <SellerProfileView seller={seller} />;
}
