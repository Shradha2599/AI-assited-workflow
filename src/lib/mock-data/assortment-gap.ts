import fs from "fs";
import path from "path";

import type { GapItem } from "@/components/data-display/gaps-drawer";
import type { MissingProduct } from "@/components/data-display/missing-products-table";
import type { TreemapItem } from "@/components/data-display/category-treemap";
import type { TreemapHierarchyRoot } from "@/lib/mock-data/treemap-hierarchy";
import { loadTreemapHierarchy } from "@/lib/mock-data/treemap-hierarchy.server";

interface AssortmentGapAnalysisMock {
  lastUpdatedAt: string;
  revenueOpportunity: string;
  selectedCategoryCount: number;
  competitors: string[];
  missingProducts: MissingProduct[];
  beaconRecommendedItems: Array<{
    id: string;
    name: string;
    lagPercent: number;
    lagSeverity: "high" | "medium-high" | "medium";
    estimatedRevenue: string;
    competitor: string;
    skuCount: number;
    imageUrl?: string;
  }>;
}

function loadAnalysisMock(): AssortmentGapAnalysisMock {
  const filePath = path.join(process.cwd(), "mock/business/assortment_gap_analysis.json");
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as AssortmentGapAnalysisMock;
}

export interface AssortmentGapAnalysisData {
  lastUpdatedAt: string;
  lastUpdatedLabel: string;
  revenueOpportunity: string;
  selectedCategoryCount: number;
  competitors: string[];
  treemapRoot: TreemapHierarchyRoot;
  /** @deprecated use treemapRoot */
  treemapItems: TreemapItem[];
  /** @deprecated use treemapRoot */
  kitchenSubcategories: TreemapItem[];
  missingProducts: MissingProduct[];
  servewareGapItems: GapItem[];
  beaconRecommendedItems: GapItem[];
}

function formatLastUpdated(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Parse a revenue string like "$22.8M" → number in millions */
function parseRevenueMillion(revenue?: string): number {
  if (!revenue) return 0;
  const n = parseFloat(revenue.replace(/[^0-9.]/g, ""));
  if (revenue.toUpperCase().includes("B")) return n * 1000;
  if (revenue.toUpperCase().includes("K")) return n / 1000;
  return isNaN(n) ? 0 : n;
}

/** Compute total revenue opportunity by summing the revenue field of all top-level treemap nodes */
function computeTotalOpportunity(root: TreemapHierarchyRoot): string {
  const totalM = root.children.reduce(
    (sum, node) => sum + parseRevenueMillion(node.revenue),
    0,
  );
  if (totalM >= 1000) return `$${(totalM / 1000).toFixed(1)}B`;
  return `$${totalM.toFixed(1)}M`;
}

export async function getAssortmentGapAnalysis(): Promise<AssortmentGapAnalysisData> {
  const mock = loadAnalysisMock();
  const treemapRoot = loadTreemapHierarchy();

  const topLevel = treemapRoot.children.map((node) => ({
    id: node.id,
    label: node.label,
    lag: node.lag,
    gridArea: node.gridArea,
    revenue: node.revenue,
    gapPercent: node.gapPercent,
    competitorLeader: node.competitorLeader,
    children: node.children,
  }));

  const kitchen = treemapRoot.children.find((c) => c.id === "kitchen");

  return {
    lastUpdatedAt: mock.lastUpdatedAt,
    lastUpdatedLabel: formatLastUpdated(mock.lastUpdatedAt),
    revenueOpportunity: computeTotalOpportunity(treemapRoot),
    selectedCategoryCount: mock.selectedCategoryCount,
    competitors: mock.competitors,
    treemapRoot,
    treemapItems: topLevel,
    kitchenSubcategories: kitchen?.children ?? [],
    missingProducts: mock.missingProducts,
    servewareGapItems: [
      {
        id: "gw-1",
        name: "Ceramic Serving High Bowls",
        lagPercent: 28,
        lagSeverity: "high",
        estimatedRevenue: "$1.5M",
        competitor: "Amazon",
        skuCount: 102,
        imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=96&h=96&fit=crop",
      },
      {
        id: "gw-2",
        name: "Sugar Bowl & Creamer Sets",
        lagPercent: 18.2,
        lagSeverity: "medium-high",
        estimatedRevenue: "$1.5M",
        competitor: "Amazon",
        skuCount: 102,
        imageUrl: "https://images.unsplash.com/photo-1603199508936-b5735cab581e?w=96&h=96&fit=crop",
      },
      {
        id: "gw-3",
        name: "Dip & Condiment Servers",
        lagPercent: 9.8,
        lagSeverity: "medium",
        estimatedRevenue: "$1.5M",
        competitor: "Amazon",
        skuCount: 102,
        imageUrl: "https://images.unsplash.com/photo-1604719312566-8912b06350af?w=96&h=96&fit=crop",
      },
      {
        id: "gw-4",
        name: "Cake Stands & Tiered Servers",
        lagPercent: 14,
        lagSeverity: "medium-high",
        estimatedRevenue: "$1.5M",
        competitor: "Amazon",
        skuCount: 102,
        imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=96&h=96&fit=crop",
      },
      {
        id: "gw-5",
        name: "Glass Cake Domes",
        lagPercent: 25,
        lagSeverity: "high",
        estimatedRevenue: "$1.5M",
        competitor: "Amazon",
        skuCount: 102,
        imageUrl: "https://images.unsplash.com/photo-1464305796206-3f0dd815fc22?w=96&h=96&fit=crop",
      },
    ],
    beaconRecommendedItems: mock.beaconRecommendedItems ?? [],
  };
}
