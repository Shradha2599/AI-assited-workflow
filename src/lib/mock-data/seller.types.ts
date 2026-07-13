export interface Seller {
  id: string;
  legalBusinessName: string;
  category: string;
  categories: string[];
  gmv: number;
  skus: number;
  viralTrendy: boolean;
  rating: number;
  marketplaces: string[];
  confidenceScore: number;
  location: string;
  businessType: string;
  founded: number;
  website: string;
  description: string;
  amazonSkus?: number;
  amazonRating?: number;
  walmartPresent: boolean;
  socialFollowers?: number;
  t52wSales?: number;
  status:
    | "discovered"
    | "shortlisted"
    | "contacted"
    | "applied"
    | "approved"
    | "onboarding"
    | "established";
}

export interface LeadRecord {
  id: string;
  sellerId: string;
  companyName: string;
  categories: string[];
  businessType: string;
  headquarters: string;
  estimatedGMV: number;
  confidenceScore: number;
  assortmentMatchScore: number;
  trendScore: number;
  riskScore: number;
  status: string;
  reviewOutcome: string;
  assignedTo: string;
  discoveredDate: string;
}
