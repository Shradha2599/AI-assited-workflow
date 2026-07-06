import { generateObject } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { z } from "zod";
import fs from "fs";
import path from "path";

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

const sourceSchema = z.object({
  status: z.enum(["verified", "partial", "unverified"]),
  detail: z.string().describe("One sentence describing what was found at this source"),
});

const verificationSchema = z.object({
  sources: z.object({
    amazon: sourceSchema,
    walmart: sourceSchema,
    socialMedia: sourceSchema,
    businessRegistry: sourceSchema,
    financialData: sourceSchema,
  }),
  confidenceScore: z.number().min(1).max(10).describe("Overall confidence score 1-10"),
  strengths: z.array(z.string()).describe("3-4 specific strengths of this seller"),
  risks: z.array(z.string()).describe("1-3 risks or gaps, empty array if none"),
  recommendation: z
    .enum(["shortlist", "hold", "pass"])
    .describe("shortlist = strong fit, hold = needs monitoring, pass = not suitable"),
  summary: z
    .string()
    .describe("2-3 sentence verification summary for the acquisition manager"),
});

function loadMockJson<T>(relPath: string): T[] {
  try {
    const absPath = path.join(process.cwd(), relPath);
    return JSON.parse(fs.readFileSync(absPath, "utf8")) as T[];
  } catch {
    return [];
  }
}

interface AmazonSalesRow {
  itemType: string;
  category: string;
  revenueLast90Days: number;
  unitsLast90Days: number;
  growthRate: number;
}
interface AmazonCatalogRow {
  asin: string;
  brand: string;
  category: string;
  itemType: string;
  price: number;
  rating: number;
  reviewCount: number;
  salesRank: number;
}
interface JungleScoutRow {
  keyword: string;
  searchVolume: number;
  avgPrice: number;
  competition: string;
  opportunityScore: number;
}
interface SmartScoutRow {
  brand: string;
  category: string;
  sellerCount: number;
  marketShare: number;
  brandHealth: string;
  launchReadiness: string;
}
interface SocialSignalRow {
  brand: string;
  platform: string;
  followers: number;
  engagementRate: number;
  mentionVelocity: number;
}
interface GoogleTrendRow {
  query: string;
  category: string;
  trendDirection: string;
  trendGrowth: number;
  seasonality: string;
}
interface MarketplaceReviewRow {
  brand: string;
  retailer: string;
  avgRating: number;
  reviewCount: number;
  sentiment: string;
  topIssue: string;
}

export async function POST(req: Request) {
  const { seller } = await req.json();
  const categories: string[] = seller.categories ?? [seller.category];

  // Load all source files
  const amazonSales = loadMockJson<AmazonSalesRow>("mock/sources/amazon_sales.json");
  const amazonCatalog = loadMockJson<AmazonCatalogRow>("mock/sources/amazon_catalog.json");
  const jungleScout = loadMockJson<JungleScoutRow>("mock/sources/jungle_scout.json");
  const smartScout = loadMockJson<SmartScoutRow>("mock/sources/smart_scout.json");
  const socialSignals = loadMockJson<SocialSignalRow>("mock/sources/social_signals.json");
  const googleTrends = loadMockJson<GoogleTrendRow>("mock/sources/google_trends.json");
  const reviews = loadMockJson<MarketplaceReviewRow>("mock/sources/marketplace_reviews.json");

  // Filter by seller's categories (take top 3 entries per source)
  const relevantAmazonSales = amazonSales
    .filter((r) => categories.some((c) => r.category.toLowerCase().includes(c.toLowerCase()) || c.toLowerCase().includes(r.category.toLowerCase())))
    .slice(0, 3);
  const relevantCatalog = amazonCatalog
    .filter((r) => categories.some((c) => r.category.toLowerCase().includes(c.toLowerCase()) || c.toLowerCase().includes(r.category.toLowerCase())))
    .slice(0, 3);
  const relevantJungleScout = jungleScout
    .filter((r) => categories.some((c) => r.keyword.toLowerCase().includes(c.toLowerCase().split(" ")[0])))
    .slice(0, 3);
  const relevantTrends = googleTrends
    .filter((r) => categories.some((c) => r.category.toLowerCase().includes(c.toLowerCase()) || c.toLowerCase().includes(r.category.toLowerCase())))
    .slice(0, 3);
  const relevantSmartScout = smartScout
    .filter((r) => categories.some((c) => r.category.toLowerCase().includes(c.toLowerCase()) || c.toLowerCase().includes(r.category.toLowerCase())))
    .slice(0, 3);

  // Brand-level data (partial match by first word of company name)
  const brandKeyword = seller.legalBusinessName.split(" ")[0].toLowerCase();
  const brandSocial = socialSignals
    .filter((r) => r.brand.toLowerCase().includes(brandKeyword))
    .slice(0, 2);
  const brandReviews = reviews
    .filter(
      (r) =>
        r.brand.toLowerCase().includes(brandKeyword) ||
        r.retailer.toLowerCase().includes("amazon") ||
        r.retailer.toLowerCase().includes("walmart"),
    )
    .slice(0, 2);
  const brandSmartScout = relevantSmartScout.slice(0, 2);

  const { object } = await generateObject({
    model: groq("llama-3.3-70b-versatile"),
    schema: verificationSchema,
    prompt: `You are a Verification Agent for Target Plus Marketplace.
Your job is to verify a seller across multiple data sources and produce an objective confidence assessment.

## Seller Profile
- Name: ${seller.legalBusinessName}
- Category: ${seller.category} (also covers: ${categories.join(", ")})
- Business Type: ${seller.businessType}
- Founded: ${seller.founded}
- Location: ${seller.location}
- GMV: $${(seller.gmv / 1_000_000).toFixed(1)}M
- SKUs: ${seller.skus.toLocaleString()}
- T52W Sales: ${seller.t52wSales ? "$" + (seller.t52wSales / 1_000_000).toFixed(1) + "M" : "N/A"}
- Amazon SKUs: ${seller.amazonSkus ?? "N/A"} | Amazon Rating: ${seller.amazonRating ?? "N/A"}/5
- Walmart Present: ${seller.walmartPresent ? "Yes" : "No"}
- Other Marketplaces: ${seller.marketplaces?.join(", ") ?? "N/A"}
- Platform Rating: ${seller.rating}/5
- Social Followers: ${seller.socialFollowers ? seller.socialFollowers.toLocaleString() : "N/A"}
- Viral/Trendy Signal: ${seller.viralTrendy ? "Yes" : "No"}
- Description: ${seller.description}

## Amazon Sales Data (category-level market intelligence)
${relevantAmazonSales.length > 0 ? JSON.stringify(relevantAmazonSales, null, 2) : "No direct Amazon sales data available for this category."}

## Amazon Catalog Data (product-level)
${relevantCatalog.length > 0 ? JSON.stringify(relevantCatalog, null, 2) : "No catalog data available."}

## JungleScout Market Opportunity
${relevantJungleScout.length > 0 ? JSON.stringify(relevantJungleScout, null, 2) : "No JungleScout data available."}

## Google Trends
${relevantTrends.length > 0 ? JSON.stringify(relevantTrends, null, 2) : "No trends data available."}

## SmartScout Brand Intelligence
${brandSmartScout.length > 0 ? JSON.stringify(brandSmartScout, null, 2) : "No SmartScout data available."}

## Social Media Signals
${brandSocial.length > 0 ? JSON.stringify(brandSocial, null, 2) : "No direct social data found; use seller's reported followers and viral signal."}

## Marketplace Reviews
${brandReviews.length > 0 ? JSON.stringify(brandReviews, null, 2) : "No marketplace reviews available."}

## Verification Instructions
Use all data above to produce an objective assessment.
Cross-reference the seller profile with the market data:

- **amazon**: Assess based on seller's Amazon SKU count (${seller.amazonSkus ?? "unknown"}), rating (${seller.amazonRating ?? "unknown"}), and category-level sales data above.
- **walmart**: Assess based on whether seller is on Walmart (${seller.walmartPresent ? "yes" : "no"}) and category performance signals.
- **socialMedia**: Assess based on seller's reported followers (${seller.socialFollowers ?? 0}) and any brand social data found above.
- **businessRegistry**: Assess based on founded year (${seller.founded}), business type (${seller.businessType}), and location legitimacy.
- **financialData**: Assess based on GMV ($${(seller.gmv / 1_000_000).toFixed(1)}M), T52W Sales, and category revenue trends from Amazon sales data.

Status guide:
- "verified" = strong data confirms the signal
- "partial" = some data but gaps remain
- "unverified" = insufficient data

Confidence score 1-10:
- Marketplace presence & diversification: 30%
- GMV and T52W revenue scale: 25%
- Ratings and customer satisfaction: 20%
- Viral/social signal and brand momentum: 15%
- Business age, type, and operational readiness: 10%

A score above 9 requires exceptional data on nearly all dimensions. Be analytical and realistic.`,
    temperature: 0.2,
  });

  return Response.json(object);
}
