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
  reviewCount: number;
  comments: number;
}

export interface SocialPresence {
  platform: string;
  followers: number;
  posts: number;
}

export interface SellerDrawerDetails {
  partnerType: string;
  fullAddress: string;
  marketplaces: MarketplacePresence[];
  officialWebsite: MarketplacePresence;
  socialPlatforms: SocialPresence[];
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

const ADDRESS_OVERRIDES: Record<string, string> = {
  "seller-001": "16350 Ventura Blvd Ste D #503, Encino, CA 91436",
  "seller-004": "200 Clarendon St, Boston, MA 02116",
  "seller-012": "16350 Ventura Blvd Ste D #503, Encino, CA 91436",
};

const PARTNER_TYPE_OVERRIDES: Record<string, string> = {
  "seller-001": "Original manufacturer",
  "seller-004": "Original manufacturer",
};

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

function buildMarketplacePresence(seller: Seller): MarketplacePresence[] {
  const marketplaces: MarketplacePresence[] = [];
  if (seller.walmartPresent) {
    const skus = Math.round(seller.skus * 0.5);
    marketplaces.push({
      name: "Walmart",
      skus,
      rating: seller.rating,
      reviewCount: Math.round(skus * 3.04),
      comments: Math.round(skus * 0.1),
    });
  }
  if (seller.marketplaces.includes("Amazon")) {
    const skus = seller.amazonSkus ?? Math.round(seller.skus * 0.5);
    const rating = seller.amazonRating ?? seller.rating;
    marketplaces.push({
      name: "Amazon",
      skus,
      rating,
      reviewCount: Math.round(skus * 3.04),
      comments: Math.round(skus * 0.1),
    });
  }
  for (const mp of seller.marketplaces.filter((m) => m !== "Amazon" && m !== "Walmart")) {
    const skus = Math.round(seller.skus * 0.15);
    marketplaces.push({
      name: mp,
      skus,
      rating: seller.rating,
      reviewCount: Math.round(skus * 2.5),
      comments: Math.round(skus * 0.08),
    });
  }
  return marketplaces;
}

function buildSocialPlatforms(seller: Seller): SocialPresence[] {
  const followers = seller.socialFollowers ?? 25000;
  return [
    { platform: "Facebook", followers: Math.round(followers * 0.11), posts: 127 },
    { platform: "Instagram", followers, posts: Math.round(followers / 1200) },
  ];
}

export function getSellerDrawerDetails(seller: Seller): SellerDrawerDetails {
  const marketplaces = buildMarketplacePresence(seller);
  const amazon = marketplaces.find((m) => m.name === "Amazon");
  const officialWebsite: MarketplacePresence = {
    name: "Official website",
    skus: amazon?.skus ?? Math.round(seller.skus * 0.4),
    rating: seller.rating,
    reviewCount: amazon?.reviewCount ?? Math.round(seller.skus * 2),
    comments: amazon?.comments ?? Math.round(seller.skus * 0.08),
  };

  return {
    partnerType:
      PARTNER_TYPE_OVERRIDES[seller.id] ??
      (seller.businessType === "Manufacturer" ? "Original manufacturer" : seller.businessType),
    fullAddress: ADDRESS_OVERRIDES[seller.id] ?? seller.location,
    marketplaces,
    officialWebsite,
    socialPlatforms: buildSocialPlatforms(seller),
  };
}

export function getSellerProfileDetails(seller: Seller): SellerProfileDetails {
  const contact = CONTACT_OVERRIDES[seller.id] ?? defaultContact(seller);
  const marketplaces = buildMarketplacePresence(seller);
  const socialPlatforms = buildSocialPlatforms(seller);

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
