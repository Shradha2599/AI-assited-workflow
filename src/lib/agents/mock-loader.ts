import fs from "fs";
import path from "path";

import {
  buildTreemapAgentSummary,
} from "@/lib/mock-data/treemap-hierarchy";
import { loadTreemapHierarchy } from "@/lib/mock-data/treemap-hierarchy.server";

export function loadMockJson<T>(relPath: string): T[] {
  try {
    const absPath = path.join(process.cwd(), relPath);
    return JSON.parse(fs.readFileSync(absPath, "utf8")) as T[];
  } catch {
    return [];
  }
}

interface Lead {
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
}

interface SellerProfile {
  sellerId: string;
  companyName: string;
  description: string;
  foundedYear: number;
  headquarters: string;
  employeeCount: number;
  annualRevenue: number;
  primaryCategories: string[];
  marketplaces: string[];
  marketplaceRatings: Record<string, number>;
  fulfillmentCapabilities: string[];
  legalStatus: string;
  socialPresence: { instagramFollowers: number; tiktokFollowers: number };
}

interface TargetCategory {
  id: string;
  name: string;
  businessUnit: string;
  annualRevenue: number;
  growthRate: number;
  assortmentGapScore: number;
  priority: string;
  seasonality: string;
  categoryManager: string;
}

export interface ItemType {
  id: string;
  categoryId: string;
  name: string;
  trendScore: number;
  competitorCoverage: number;
  targetCoverage: number;
  opportunityScore: number;
  estimatedRevenue: number;
  recommendedLaunchQuarter: string;
}

interface PipelineRow {
  category: string;
  discovered: number;
  shortlisted: number;
  contacted: number;
  new: number;
  inReview: number;
  approved: number;
  onboarding: number;
  established: number;
}

interface Partner {
  partnerId: string;
  sellerId: string;
  onboardingOwner: string;
  onboardingStatus: string;
  onboardingProgress: number;
  activationDate: string | null;
  integrationStatus: string;
  stripeStatus: string;
  performanceTier: string;
}

interface AmazonSalesRow {
  itemType: string;
  category: string;
  revenueLast90Days: number;
  unitsLast90Days: number;
  growthRate: number;
}

interface GoogleTrendRow {
  query: string;
  category: string;
  trendDirection: string;
  trendGrowth: number;
  seasonality: string;
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

function fmt(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

export function buildDashboardContext(): string {
  const pipeline = loadMockJson<PipelineRow>("mock/workflow/pipeline.json");
  const categories = loadMockJson<TargetCategory>("mock/target/categories.json");
  const leads = loadMockJson<Lead>("mock/business/leads.json");
  const amazonSales = loadMockJson<AmazonSalesRow>("mock/sources/amazon_sales.json");

  const totals = pipeline.reduce(
    (acc, p) => ({
      discovered: acc.discovered + p.discovered,
      shortlisted: acc.shortlisted + p.shortlisted,
      contacted: acc.contacted + p.contacted,
      onboarding: acc.onboarding + p.onboarding,
      established: acc.established + p.established,
    }),
    { discovered: 0, shortlisted: 0, contacted: 0, onboarding: 0, established: 0 },
  );

  const totalRevenue = categories.reduce((s, c) => s + c.annualRevenue, 0);
  const highPri = categories.filter((c) => c.priority === "High");

  // Aggregate Amazon sales by category
  const amazonByCategory: Record<string, number> = {};
  amazonSales.forEach((r) => {
    amazonByCategory[r.category] = (amazonByCategory[r.category] ?? 0) + r.revenueLast90Days;
  });

  return `
## Live Dashboard Data
- Total Category Revenue (Target): ${fmt(totalRevenue)} across ${categories.length} categories
- High-Priority Categories: ${highPri.length} (${highPri.map((c) => c.name).join(", ")})
- Total Leads in System: ${leads.length} | High Confidence (≥8.0): ${leads.filter((l) => l.confidenceScore >= 8).length}

## Seller Acquisition Pipeline
Discovered: ${totals.discovered} | Shortlisted: ${totals.shortlisted} | Contacted: ${totals.contacted}
In Onboarding: ${totals.onboarding} | Established: ${totals.established}

## Category Revenue & Growth (Target)
${categories
  .sort((a, b) => b.annualRevenue - a.annualRevenue)
  .slice(0, 6)
  .map(
    (c) =>
      `- **${c.name}** [${c.priority}]: ${fmt(c.annualRevenue)} revenue, +${(c.growthRate * 100).toFixed(0)}% growth, ${(c.assortmentGapScore * 100).toFixed(0)}% gap score`,
  )
  .join("\n")}

## Amazon Sales (Last 90 Days — by category, from market data)
${Object.entries(amazonByCategory)
  .sort(([, a], [, b]) => b - a)
  .map(([cat, rev]) => `- ${cat}: ${fmt(rev)}`)
  .join("\n")}
`;
}

export function buildAssortmentGapContext(): string {
  const categories = loadMockJson<TargetCategory>("mock/target/categories.json");
  const itemTypes = loadMockJson<ItemType>("mock/target/item_types.json");
  const trends = loadMockJson<GoogleTrendRow>("mock/sources/google_trends.json");
  const smartScout = loadMockJson<SmartScoutRow>("mock/sources/smart_scout.json");
  const amazonSales = loadMockJson<AmazonSalesRow>("mock/sources/amazon_sales.json");

  const highOpp = itemTypes
    .filter((it) => it.opportunityScore > 0.6)
    .sort((a, b) => b.estimatedRevenue - a.estimatedRevenue)
    .slice(0, 12);

  const topTrends = trends
    .filter((t) => t.trendDirection === "Rising")
    .slice(0, 5);

  // Aggregate Amazon sales by category
  const amazonByCategory: Record<string, { revenue: number; units: number; items: string[] }> = {};
  amazonSales.forEach((r) => {
    if (!amazonByCategory[r.category]) {
      amazonByCategory[r.category] = { revenue: 0, units: 0, items: [] };
    }
    amazonByCategory[r.category].revenue += r.revenueLast90Days;
    amazonByCategory[r.category].units += r.unitsLast90Days;
    amazonByCategory[r.category].items.push(r.itemType);
  });

  const treemapRoot = loadTreemapHierarchy();

  return `
## Assortment Gap Analysis
Total Item Types Tracked: ${itemTypes.length} | High Opportunity Items (score >0.6): ${highOpp.length}

## Treemap Category Hierarchy (drill-down paths)
See docs/data/ASSORTMENT_TREEMAP.md | Source: mock/business/treemap_hierarchy.json
${buildTreemapAgentSummary(treemapRoot, 2)}

## Category Gap Breakdown (Target)
${categories
  .map(
    (c) =>
      `- **${c.name}** [${c.priority}]: ${(c.assortmentGapScore * 100).toFixed(0)}% gap score, ${fmt(c.annualRevenue)} Target revenue, +${(c.growthRate * 100).toFixed(0)}% growth, peaks in ${c.seasonality}`,
  )
  .join("\n")}

## Amazon Sales — Last 90 Days (competitor market data)
${Object.entries(amazonByCategory)
  .sort(([, a], [, b]) => b.revenue - a.revenue)
  .map(
    ([cat, d]) =>
      `- **${cat}**: ${fmt(d.revenue)} revenue, ${d.units.toLocaleString()} units sold (items: ${d.items.slice(0, 3).join(", ")}${d.items.length > 3 ? ` +${d.items.length - 3} more` : ""})`,
  )
  .join("\n")}

## Top Opportunity Item Types (by estimated revenue)
${highOpp
  .map((it) => {
    const cat = categories.find((c) => c.id === it.categoryId);
    return `- **${it.name}** (${cat?.name ?? it.categoryId}): ${(it.opportunityScore * 100).toFixed(0)}% opportunity, ${(it.trendScore * 100).toFixed(0)}% trend, ${(it.competitorCoverage * 100).toFixed(0)}% competitor coverage vs ${(it.targetCoverage * 100).toFixed(0)}% Target coverage, ${fmt(it.estimatedRevenue)} est. revenue, launch ${it.recommendedLaunchQuarter}`;
  })
  .join("\n")}

## Rising Market Trends
${topTrends.map((t) => `- ${t.query} (${t.category}): ${t.trendDirection}, +${(t.trendGrowth * 100).toFixed(0)}% growth, ${t.seasonality}`).join("\n")}

## Brand Landscape (SmartScout)
${smartScout
  .slice(0, 5)
  .map((s) => `- ${s.brand} (${s.category}): ${s.sellerCount} sellers, ${(s.marketShare * 100).toFixed(0)}% share, health: ${s.brandHealth}, launch readiness: ${s.launchReadiness}`)
  .join("\n")}
`;
}

export function buildAssortmentPlanContext(): string {
  const itemTypes = loadMockJson<ItemType>("mock/target/item_types.json");
  const categories = loadMockJson<TargetCategory>("mock/target/categories.json");

  const byQuarter: Record<string, ItemType[]> = { Q1: [], Q2: [], Q3: [], Q4: [] };
  itemTypes.forEach((it) => {
    if (byQuarter[it.recommendedLaunchQuarter]) {
      byQuarter[it.recommendedLaunchQuarter].push(it);
    }
  });

  const totalOpp = itemTypes.reduce((s, it) => s + it.estimatedRevenue, 0);

  return `
## Assortment Plan FY 2025-26
Total Item Types Identified: ${itemTypes.length} | Total Opportunity Revenue: ${fmt(totalOpp)}

## Recommended Launch Schedule by Quarter
${["Q1", "Q2", "Q3", "Q4"]
  .map((q) => {
    const items = byQuarter[q];
    const catNames = [
      ...new Set(
        items.map((it) => {
          const cat = categories.find((c) => c.id === it.categoryId);
          return cat?.name ?? it.categoryId;
        }),
      ),
    ];
    return `**${q}** — ${items.length} items across ${catNames.slice(0, 3).join(", ")}:\n${items
      .sort((a, b) => b.estimatedRevenue - a.estimatedRevenue)
      .slice(0, 5)
      .map((it) => `  - ${it.name}: ${(it.opportunityScore * 100).toFixed(0)}% opportunity, ${fmt(it.estimatedRevenue)}`)
      .join("\n")}`;
  })
  .join("\n\n")}

## Seasonal Calendar
- Q1 (Nov-Dec): Fall — Thanksgiving & Christmas peak
- Q2 (Jan-Feb): Winter — New Year
- Q3 (Mar-Jun): Summer — Valentine's, Easter
- Q4 (Jul-Oct): Spring — Labour Day, Back to School, Halloween
`;
}

export function buildLeadDiscoveryContext(): string {
  const leads = loadMockJson<Lead>("mock/business/leads.json");
  const pipeline = loadMockJson<PipelineRow>("mock/workflow/pipeline.json");

  const byStatus: Record<string, number> = {};
  leads.forEach((l) => {
    byStatus[l.status] = (byStatus[l.status] ?? 0) + 1;
  });

  const topLeads = leads
    .sort((a, b) => b.confidenceScore - a.confidenceScore)
    .slice(0, 10);

  return `
## Lead Discovery Data
Total Leads: ${leads.length} | High Confidence (≥8.0): ${leads.filter((l) => l.confidenceScore >= 8).length}
${Object.entries(byStatus)
  .map(([status, count]) => `${status}: ${count}`)
  .join(" | ")}

## Top 10 Leads by Confidence Score
${topLeads
  .map(
    (l) =>
      `- **${l.companyName}** (${l.categories.join(", ")}): ${l.confidenceScore}/10 confidence, ${fmt(l.estimatedGMV)} GMV, ${l.businessType} — ${l.headquarters}`,
  )
  .join("\n")}

## Pipeline by Category
${pipeline
  .slice(0, 6)
  .map((p) => `- **${p.category}**: ${p.discovered} discovered, ${p.shortlisted} shortlisted, ${p.contacted} contacted, ${p.approved} approved`)
  .join("\n")}
`;
}

export function buildPartnerOnboardingContext(): string {
  const partners = loadMockJson<Partner>("mock/business/partners.json");
  const profiles = loadMockJson<SellerProfile>("mock/business/seller_profiles.json");

  const inProgress = partners.filter((p) => p.onboardingStatus === "Onboarding");
  const approved = partners.filter((p) => p.onboardingStatus === "Approved");

  return `
## Partner Onboarding Pipeline
Total Partners: ${partners.length} | In Onboarding: ${inProgress.length} | Approved (not started): ${approved.length}
Stripe Pending: ${partners.filter((p) => p.stripeStatus === "Pending").length} | Integration Not Started: ${partners.filter((p) => p.integrationStatus === "Not Started").length}

## Partners Currently Onboarding
${inProgress
  .slice(0, 8)
  .map((p) => {
    const profile = profiles.find((s) => s.sellerId === p.sellerId);
    return `- **${profile?.companyName ?? p.sellerId}**: ${p.onboardingProgress}% complete, Integration: ${p.integrationStatus}, Stripe: ${p.stripeStatus}, Tier: ${p.performanceTier}, Owner: ${p.onboardingOwner}`;
  })
  .join("\n")}

## Approved Partners (ready to start onboarding)
${approved
  .slice(0, 5)
  .map((p) => {
    const profile = profiles.find((s) => s.sellerId === p.sellerId);
    return `- **${profile?.companyName ?? p.sellerId}**: Integration: ${p.integrationStatus}, Stripe: ${p.stripeStatus}, Tier: ${p.performanceTier}`;
  })
  .join("\n")}

## Potential Blockers
${
  partners.filter((p) => p.integrationStatus === "Not Started" && p.stripeStatus === "Pending").length > 0
    ? partners
        .filter((p) => p.integrationStatus === "Not Started" && p.stripeStatus === "Pending")
        .slice(0, 5)
        .map((p) => {
          const profile = profiles.find((s) => s.sellerId === p.sellerId);
          return `- **${profile?.companyName ?? p.sellerId}**: Integration not started + Stripe pending (${p.performanceTier} tier)`;
        })
        .join("\n")
    : "No blockers identified"
}
`;
}

export function buildMarketIntelligenceContext(planCategories: string[]): string {
  const trends = loadMockJson<GoogleTrendRow>("mock/sources/google_trends.json");
  const jungleScout = loadMockJson<JungleScoutRow>("mock/sources/jungle_scout.json");
  const smartScout = loadMockJson<SmartScoutRow>("mock/sources/smart_scout.json");

  const catWords = planCategories.flatMap((c) => c.toLowerCase().split(/\s+/));

  const relevantTrends = trends
    .filter((t) =>
      catWords.some(
        (w) => w.length > 3 && (t.category.toLowerCase().includes(w) || t.query.toLowerCase().includes(w)),
      ),
    )
    .slice(0, 6);

  const relevantKeywords = jungleScout
    .filter((j) => catWords.some((w) => w.length > 3 && j.keyword.toLowerCase().includes(w)))
    .slice(0, 6);

  const relevantBrands = smartScout
    .filter((s) =>
      catWords.some(
        (w) => w.length > 3 && (s.category.toLowerCase().includes(w) || s.brand.toLowerCase().includes(w)),
      ),
    )
    .slice(0, 4);

  const parts: string[] = [];
  if (relevantTrends.length > 0) {
    parts.push(
      `### Google Trends\n${relevantTrends.map((t) => `- ${t.query} (${t.category}): ${t.trendDirection}, +${(t.trendGrowth * 100).toFixed(0)}% growth, ${t.seasonality}`).join("\n")}`,
    );
  }
  if (relevantKeywords.length > 0) {
    parts.push(
      `### JungleScout Opportunities\n${relevantKeywords.map((j) => `- "${j.keyword}": ${j.searchVolume.toLocaleString()} monthly searches, $${j.avgPrice} avg price, ${j.competition} competition, ${(j.opportunityScore * 100).toFixed(0)}% opportunity score`).join("\n")}`,
    );
  }
  if (relevantBrands.length > 0) {
    parts.push(
      `### Brand Landscape (SmartScout)\n${relevantBrands.map((s) => `- ${s.brand} (${s.category}): ${s.sellerCount} sellers, health: ${s.brandHealth}, launch readiness: ${s.launchReadiness}`).join("\n")}`,
    );
  }

  return parts.length > 0 ? `\n## Market Intelligence\n${parts.join("\n\n")}\n` : "";
}
