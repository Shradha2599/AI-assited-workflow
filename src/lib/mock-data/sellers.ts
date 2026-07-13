import leadsJson from "../../../mock/business/leads.json";
import type { LeadRecord, Seller } from "./seller.types";
import { HERO_SELLERS } from "./sellers-heroes";

export type { Seller, LeadRecord } from "./seller.types";

const MARKETPLACE_POOL = ["Amazon", "Walmart", "Wayfair", "Etsy", "Home Depot"] as const;

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 24);
}

function mapLeadStatus(status: string): Seller["status"] {
  switch (status) {
    case "Shortlisted":
      return "shortlisted";
    case "Contacted":
      return "contacted";
    case "Approved":
      return "approved";
    default:
      return "discovered";
  }
}

function marketplacesFor(lead: LeadRecord): string[] {
  const n = lead.sellerId.charCodeAt(lead.sellerId.length - 1) % 3;
  if (n === 0) return ["Amazon"];
  if (n === 1) return ["Amazon", "Walmart"];
  return ["Amazon", "Walmart", "Wayfair"];
}

function leadToSeller(lead: LeadRecord): Seller {
  const primaryCategory = lead.categories[0] ?? "Home Decor";
  const viral = lead.trendScore >= 0.65;
  const marketplaces = marketplacesFor(lead);
  const slug = slugify(lead.companyName);

  return {
    id: lead.sellerId,
    legalBusinessName: lead.companyName,
    category: primaryCategory,
    categories: lead.categories,
    gmv: lead.estimatedGMV,
    skus: Math.max(80, Math.round(lead.estimatedGMV / 2500)),
    viralTrendy: viral,
    rating: Math.round((3.4 + lead.confidenceScore * 0.15) * 10) / 10,
    marketplaces: [...marketplaces],
    confidenceScore: lead.confidenceScore,
    location: lead.headquarters,
    businessType: lead.businessType,
    founded: 2005 + (lead.sellerId.charCodeAt(lead.sellerId.length - 2) % 18),
    website: `www.${slug}.com`,
    description: `${lead.companyName} is a ${lead.businessType.toLowerCase()} focused on ${primaryCategory.toLowerCase()} with ${Math.round(lead.assortmentMatchScore * 100)}% assortment alignment to current category gaps.`,
    walmartPresent: marketplaces.includes("Walmart"),
    socialFollowers: viral ? Math.round(lead.estimatedGMV / 40) : Math.round(lead.estimatedGMV / 120),
    t52wSales: Math.round(lead.estimatedGMV * (1.1 + lead.trendScore * 0.4)),
    status: mapLeadStatus(lead.status),
  };
}

const heroIds = new Set(HERO_SELLERS.map((s) => s.id));
const generatedSellers = (leadsJson as LeadRecord[])
  .filter((lead) => !heroIds.has(lead.sellerId))
  .map(leadToSeller);

/** Full lead pool: 15 rich hero sellers + ~1,219 generated leads ≈ 1,234 total */
export const sellers: Seller[] = [...HERO_SELLERS, ...generatedSellers];

export function getSellerById(id: string): Seller | undefined {
  return sellers.find((s) => s.id === id);
}

export function getSellersByStatus(status: Seller["status"]): Seller[] {
  return sellers.filter((s) => s.status === status);
}

export function getSellersByCategory(category: string): Seller[] {
  return sellers.filter((s) => s.categories.includes(category));
}

export function getTopSellers(limit = 10): Seller[] {
  return [...sellers].sort((a, b) => b.confidenceScore - a.confidenceScore).slice(0, limit);
}

export const TOTAL_LEAD_COUNT = sellers.length;
