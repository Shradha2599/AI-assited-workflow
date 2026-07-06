import type { Seller } from "@/lib/mock-data/sellers";

export interface SellerContact {
  name: string;
  email: string;
  phone: string;
}

export interface MarketplacePresence {
  name: string;
  skus: number;
  rating: number;
  comments: number;
}

export interface SocialPresence {
  platform: string;
  followers: number;
  posts: number;
}

export interface SellerProfileDetails {
  employeeSize: string;
  contact: SellerContact;
  marketplaces: MarketplacePresence[];
  socialPlatforms: SocialPresence[];
  confidenceSummary: string;
  recommendedMailSubject: string;
  recommendedMailPreview: string;
}

const CONTACT_OVERRIDES: Record<string, SellerContact> = {
  "seller-001": {
    name: "John Matthews",
    email: "john@greenco.com",
    phone: "+1 (313) 555-0142",
  },
  "seller-004": {
    name: "Sarah Chen",
    email: "sarah@pinnaclegoods.com",
    phone: "+1 (617) 555-0198",
  },
};

function defaultContact(seller: Seller): SellerContact {
  const domain = seller.website.replace(/^www\./, "");
  return {
    name: "Primary Contact",
    email: `contact@${domain}`,
    phone: "+1 (555) 000-0000",
  };
}

function employeeSizeFromType(businessType: string): string {
  if (businessType === "Manufacturer") return "51-200";
  if (businessType === "Brand") return "11-50";
  return "1-10";
}

export function getSellerProfilePath(sellerId: string): string {
  return `/sellers/discovery/${sellerId}`;
}

export function getSellerProfileDetails(seller: Seller): SellerProfileDetails {
  const contact = CONTACT_OVERRIDES[seller.id] ?? defaultContact(seller);

  const marketplaces: MarketplacePresence[] = [];
  if (seller.walmartPresent) {
    marketplaces.push({
      name: "Walmart",
      skus: Math.round(seller.skus * 0.5),
      rating: seller.rating,
      comments: seller.rating,
    });
  }
  if (seller.marketplaces.includes("Amazon")) {
    marketplaces.push({
      name: "Amazon",
      skus: seller.amazonSkus ?? Math.round(seller.skus * 0.5),
      rating: seller.amazonRating ?? seller.rating,
      comments: seller.amazonRating ?? seller.rating,
    });
  }
  for (const mp of seller.marketplaces.filter((m) => m !== "Amazon" && m !== "Walmart")) {
    marketplaces.push({
      name: mp,
      skus: Math.round(seller.skus * 0.15),
      rating: seller.rating,
      comments: seller.rating,
    });
  }

  const followers = seller.socialFollowers ?? 25000;
  const socialPlatforms: SocialPresence[] = [
    { platform: "Instagram", followers, posts: Math.round(followers / 1200) },
    { platform: "Facebook", followers: Math.round(followers * 0.6), posts: Math.round(followers / 800) },
  ];

  const confidenceSummary = `${seller.legalBusinessName} shows strong alignment with the current assortment plan. The seller demonstrates ${seller.marketplaces.length > 1 ? "multi-marketplace" : "established marketplace"} presence, a ${seller.rating}/5 average rating, and ${seller.viralTrendy ? "positive viral/trend signals" : "stable category demand"}. Confidence score of ${seller.confidenceScore.toFixed(1)}/10 reflects category fit and operational readiness.`;

  return {
    employeeSize: employeeSizeFromType(seller.businessType),
    contact,
    marketplaces,
    socialPlatforms,
    confidenceSummary,
    recommendedMailSubject: `Introduction to Target Plus — ${seller.legalBusinessName}`,
    recommendedMailPreview: `Hi ${contact.name.split(" ")[0]},\n\nI'm reaching out from Target Plus regarding an opportunity to expand ${seller.legalBusinessName}'s presence on our curated marketplace. Based on your ${seller.category.toLowerCase()} assortment and marketplace track record, we believe there is strong alignment with our upcoming launch plan.\n\nWould you be open to completing our partner application?`,
  };
}
