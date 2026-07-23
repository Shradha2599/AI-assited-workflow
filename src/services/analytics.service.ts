import type { RecommendedTask } from "@/components/ai/tasks-panel";
import type { TreemapItem } from "@/components/data-display/category-treemap";
import type { MissingProduct } from "@/components/data-display/missing-products-table";

export interface DashboardMetric {
  label: string;
  value: string;
  change: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: "revenue" | "goal" | "gap" | "sellers";
}

export async function getDashboardMetrics(): Promise<DashboardMetric[]> {
  return [
    { label: "Total Revenue", value: "$ 1.8B", change: "24%", changeType: "positive", icon: "revenue" },
    { label: "Revenue Goal", value: "$ 2.5B", change: "10.4%", changeType: "positive", icon: "goal" },
    { label: "Assortment Gap Covered", value: "23%", change: "4.5%", changeType: "positive", icon: "gap" },
    { label: "Active Sellers", value: "2,345", change: "2.5%", changeType: "positive", icon: "sellers" },
  ];
}

export async function getIndustrySegments() {
  return [
    { label: "Target", value: 30, color: "#ea4335", revenue: "$14.4B" },
    { label: "Walmart", value: 22, color: "#f48fb1", revenue: "$10.6B" },
    { label: "Amazon", value: 20, color: "#4285f4", revenue: "$9.6B" },
    { label: "Lowe's", value: 14, color: "#9c27b0", revenue: "$6.7B" },
    { label: "Home Depot", value: 14, color: "#ff9800", revenue: "$6.7B" },
  ];
}

export async function getGapBarData() {
  return [
    { label: "Serveware", value: 28, revenueOpportunity: "$1.8M" },
    { label: "Dining & Ent...", value: 28, revenueOpportunity: "$4.5M" },
    { label: "Cookware", value: 24, revenueOpportunity: "$3.1M" },
    { label: "Glassware", value: 22, revenueOpportunity: "$2.1M" },
    { label: "Countertop St...", value: 19, revenueOpportunity: "$2.4M" },
    { label: "Table Linens", value: 16, revenueOpportunity: "$1.9M" },
    { label: "Appliances", value: 14, revenueOpportunity: "$1.7M" },
  ];
}

import { cellCount, type PartnerStage } from "@/lib/mock-data/pipeline-partners";

const PIPELINE_STAGES: PartnerStage[] = [
  "Established",
  "Onboarding",
  "New Lead",
  "Contacted",
  "Shortlisted",
  "Discovered",
];

const KITCHEN_CATEGORY_LABEL = "Kitchen & Din...";

export async function getPipelineData() {
  return {
    stageColumns: [...PIPELINE_STAGES],
    categoryRows: [
      {
        category: "Kitchen & Dining",
        values: PIPELINE_STAGES.map((stage) => cellCount(stage, KITCHEN_CATEGORY_LABEL)),
      },
    ],
  };
}

export const dashboardTasks: RecommendedTask[] = [
  {
    id: "dt-1",
    title: "Target has low category penetration in Smart Lighting",
    description: "Competitors lead by 28% assortment depth",
    actionLabel: "Explore Opportunity",
    actionHref: "/assortment/gap",
  },
  {
    id: "dt-2",
    title: "Add trending Outdoor Lighting products before holiday spike",
    description: "Impact: +$1.1M",
    actionLabel: "Explore Opportunity",
    actionHref: "/assortment/gap",
  },
  {
    id: "dt-3",
    title: "Storage & Organization contribution declined by 8% for 2025",
    description: "Review assortment mix and pricing",
    actionLabel: "Analyze Category",
    actionHref: "/assortment/gap",
  },
  {
    id: "dt-4",
    title: "SKU Validation & Ramp up — 42 SKUs failed compliance checks",
    description: "",
    actionLabel: "Review",
  },
];

export async function getTreemapItems(): Promise<TreemapItem[]> {
  return [
    {
      id: "kitchen",
      label: "Kitchen & Dining",
      lag: "high",
      gridArea: "1 / 1 / 3 / 3",
      revenue: "$22.8M",
      gapPercent: "35%",
      drillDown: true,
    },
    { id: "outdoor", label: "Outdoor Living & Garden", lag: "medium-high", gridArea: "1 / 3 / 3 / 4" },
    { id: "holiday", label: "Holiday", lag: "medium-high", gridArea: "1 / 4 / 2 / 5" },
    { id: "lighting", label: "Lighting", lag: "medium-high", gridArea: "2 / 4 / 3 / 5" },
    { id: "furniture", label: "Furniture", lag: "medium", gridArea: "3 / 1 / 4 / 3" },
    { id: "party", label: "Party Supp...", lag: "low", gridArea: "3 / 3 / 4 / 4" },
    { id: "rugs", label: "Rugs", lag: "low", gridArea: "3 / 4 / 4 / 5" },
  ];
}

export async function getKitchenSubcategories(): Promise<TreemapItem[]> {
  return [
    { id: "deals", label: "Kitchen & Dining Deals", lag: "high", gridArea: "1 / 1 / 2 / 3" },
    { id: "dining", label: "Dining & Entertaining", lag: "high", gridArea: "1 / 3 / 2 / 5" },
    { id: "countertop", label: "Countertop Storage", lag: "medium-high", gridArea: "2 / 1 / 3 / 2" },
    { id: "linens", label: "Kitchen & Table Linens", lag: "medium-high", gridArea: "2 / 2 / 3 / 3" },
    {
      id: "serveware",
      label: "Serveware",
      lag: "medium-high",
      gridArea: "2 / 3 / 4 / 5",
      revenue: "$1.8M",
      gapPercent: "18%",
      opensDrawer: "Serveware",
    },
    { id: "appliances", label: "Kitchen Appliances", lag: "medium", gridArea: "3 / 1 / 4 / 2" },
    { id: "bakeware", label: "Bakeware", lag: "medium", gridArea: "3 / 2 / 4 / 3" },
    { id: "serveware2", label: "Serveware", lag: "low", gridArea: "3 / 3 / 4 / 4" },
  ];
}

export async function getServewareGapItems(): Promise<import("@/components/data-display/gaps-drawer").GapItem[]> {
  return [
    {
      id: "gw-1",
      name: "Ceramic Serving High Bowls",
      lagPercent: 28,
      lagSeverity: "high",
      estimatedRevenue: "$1.5M",
      competitor: "Amazon",
      skuCount: 102,
    },
    {
      id: "gw-2",
      name: "Sugar Bowl & Creamer Sets",
      lagPercent: 18.2,
      lagSeverity: "medium-high",
      estimatedRevenue: "$1.5M",
      competitor: "Amazon",
      skuCount: 102,
    },
    {
      id: "gw-3",
      name: "Dip & Condiment Servers",
      lagPercent: 9.8,
      lagSeverity: "medium",
      estimatedRevenue: "$1.5M",
      competitor: "Amazon",
      skuCount: 102,
    },
    {
      id: "gw-4",
      name: "Cake Stands & Tiered Servers",
      lagPercent: 14,
      lagSeverity: "medium-high",
      estimatedRevenue: "$1.5M",
      competitor: "Amazon",
      skuCount: 102,
    },
    {
      id: "gw-5",
      name: "Glass Cake Domes",
      lagPercent: 25,
      lagSeverity: "high",
      estimatedRevenue: "$1.5M",
      competitor: "Amazon",
      skuCount: 102,
    },
  ];
}

export async function getMissingProducts(): Promise<MissingProduct[]> {
  const products = [
    "Ceramic Table Lamp",
    "Glass Beverage Dispenser",
    "Storage Basket Set",
    "Decorative Wall Mirror",
    "Linen Dining Chair",
  ];
  return products.map((name, i) => ({
    id: `mp-${i}`,
    name,
    category: "Lighting",
    gapOpportunity: "High",
    topCompetitor: "Amazon",
    estimatedRevenue: "$1.4M",
  }));
}

export const gapAnalysisTasks: RecommendedTask[] = [
  {
    id: "gt-1",
    title: "Add Decorative Planters for Spring",
    description: "Strong Q2 growth across competitor marketplaces",
    actionLabel: "Add to Calendar",
    actionHref: "/assortment/plan",
  },
  {
    id: "gt-2",
    title: "Expand Serveware assortment in Kitchen & Dining",
    description: "Impact: +$1.1M",
    actionLabel: "Explore Opportunity",
  },
  {
    id: "gt-3",
    title: "Competitors increased Smart Lighting assortment depth by 28%",
    description: "Target currently under-indexed in connected lighting",
    actionLabel: "Analyze Category",
  },
];

export const planTasks: RecommendedTask[] = [
  {
    id: "pt-1",
    title: "Your assortment plan is ready for quarterly scheduling",
    description: "Beacon can optimize launch timing based on demand seasonality",
    actionLabel: "Generate Calendar",
  },
  {
    id: "pt-2",
    title: "Serveware and Beverage Collections should begin onboarding",
    description: "Recommended for Q4 entertaining demand",
    actionLabel: "Schedule Launch",
  },
  {
    id: "pt-3",
    title: "Dorm Kitchen products peak during July-August demand window",
    description: "Requires acquisition kickoff before March",
    actionLabel: "Schedule Launch",
  },
];

export const sellerProfileTasks: RecommendedTask[] = [
  {
    id: "sp-1",
    title: "Introduction Mail Ready",
    description: "Beacon has drafted a personalized outreach email for this seller.",
    actionLabel: "Send Mail →",
  },
  {
    id: "sp-2",
    title: "Strong category fit detected",
    description: "This seller aligns with multiple item types in your assortment plan.",
    actionLabel: "View Matches",
  },
];

export const partnerOnboardingDetailTasks: RecommendedTask[] = [
  {
    id: "pod-1",
    title: "Onboarding Mail Ready",
    description: "Send Orange Inc the Onboarding Mail and next steps.",
    actionLabel: "Send Mail →",
  },
  {
    id: "pod-2",
    title: "Banner/ Cover Image",
    description: "Low resolution, does not meet guidelines.",
    actionLabel: "Add Comment",
  },
];

export const partnerOnboardingTasks: RecommendedTask[] = [
  {
    id: "po-1",
    title: "Documents Missing",
    description: "Orange Inc has pending W9 and contract documentation.",
    actionLabel: "Send Reminder Mail →",
  },
  {
    id: "po-2",
    title: "Lag in Assortment Analysis",
    description: "3 partners awaiting assortment file review.",
    actionLabel: "Open →",
  },
  {
    id: "po-3",
    title: "SKU Validation & Ramp up",
    description: "42 SKUs failed compliance checks across onboarding partners.",
    actionLabel: "Review →",
  },
];

export const partnerLeadFormTasks: RecommendedTask[] = [
  {
    id: "plf-1",
    title: "Reject Orange Inc",
    description: "Low marketplace ratings, operational risk indicators, & recurring customer experience concerns.",
    actionLabel: "Reject Lead →",
  },
  {
    id: "plf-2",
    title: "Documents Missing",
    description: "W9 form uploaded but contract signature pending verification.",
    actionLabel: "Send Reminder Mail →",
  },
];

export async function getPlanItemTypes() {
  return [
    "Ceramic Serving High Bowls",
    "Cake Stands & Tiered Servers",
    "Beverage Carafes & Pitchers",
    "Dip & Condiment Servers",
    "Ceramic Pasta Bowls",
  ];
}

export async function getScheduledItems() {
  return [
    { label: "Ceramic Serving High Bowls", startMonth: 0, span: 3, row: "Kitchen & Dining" },
    { label: "Cake Stands & Tiered Servers", startMonth: 2, span: 2, row: "Kitchen & Dining" },
    { label: "Pendant Lights", startMonth: 5, span: 3, row: "Lighting" },
  ];
}
