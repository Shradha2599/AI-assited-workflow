import type { DashboardMetric } from "@/components/data-display/dashboard-kpi-card";
import type { GapBar } from "@/components/data-display/gap-bar-chart";
import type { DonutSegment } from "@/components/data-display/donut-chart";
import type { FiscalYearId } from "@/lib/mock-data/fy-plan-seeds";
import type { PipelineData } from "@/lib/pipeline-discovery-sync";
import type { TreemapHierarchyRoot, TreemapNode } from "@/lib/mock-data/treemap-hierarchy";
import type { GapCategoryFilterOption } from "@/lib/mock-data/assortment-gap-categories";
import { cellCount, type PartnerStage } from "@/lib/mock-data/pipeline-partners";
import {
  formatRevenueGoalDisplay,
  parseRevenueGoalToMillions,
} from "@/lib/utils/revenue-goal-input";

const KITCHEN_TREEMAP_ID = "kitchen";

const PIPELINE_STAGES: PartnerStage[] = [
  "Discovered",
  "Shortlisted",
  "Contacted",
  "New Lead",
  "Onboarding",
  "Established",
];

const TREEMAP_PIPELINE_PRIMARY: Record<string, string> = {
  kitchen: "Kitchen & Dining",
  outdoor: "Outdoor Living",
  holiday: "Holiday & Festive Decor",
  lighting: "Lighting",
  furniture: "Furniture",
  party: "Party Supplies",
  rugs: "Rugs",
};

/** Category-level KPI seeds (FY 2025–26); scaled for other fiscal years */
const TREEMAP_KPI_SEED: Record<
  string,
  {
    revenueB: number;
    goalM: number;
    itemTypes: number;
    /** Item types in the same categories prior fiscal year (YoY comparison) */
    itemTypesLastYear: number;
    revenueChange: string;
  }
> = {
  kitchen: { revenueB: 1.8, goalM: 24, itemTypes: 0, itemTypesLastYear: 22, revenueChange: "24%" },
  outdoor: { revenueB: 0.45, goalM: 8.8, itemTypes: 3, itemTypesLastYear: 2, revenueChange: "18%" },
  holiday: { revenueB: 0.32, goalM: 5.2, itemTypes: 2, itemTypesLastYear: 2, revenueChange: "15%" },
  lighting: { revenueB: 0.55, goalM: 6.1, itemTypes: 4, itemTypesLastYear: 3, revenueChange: "21%" },
  furniture: { revenueB: 0.48, goalM: 7.0, itemTypes: 2, itemTypesLastYear: 2, revenueChange: "12%" },
  party: { revenueB: 0.28, goalM: 4.2, itemTypes: 5, itemTypesLastYear: 4, revenueChange: "19%" },
  rugs: { revenueB: 0.22, goalM: 3.5, itemTypes: 1, itemTypesLastYear: 1, revenueChange: "11%" },
};

const FY_INDUSTRY_TOTAL: Record<FiscalYearId, string> = {
  "2025-2026": "$48B",
  "2026-2027": "$12B",
};

export function getSelectedTreemapIds(
  selectedCategoryIds: string[],
  categoryOptions: GapCategoryFilterOption[],
): string[] {
  const treemapIds = new Set(
    categoryOptions.filter((o) => o.hasGapData).map((o) => o.id),
  );
  return selectedCategoryIds.filter((id) => treemapIds.has(id));
}

function parseRevenueToMillions(revenue?: string): number {
  if (!revenue) return 0;
  const n = parseFloat(revenue.replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(n)) return 0;
  if (revenue.toUpperCase().includes("K")) return n / 1000;
  return n;
}

function goalMillionsForNode(node: TreemapNode, treemapId: string): number {
  const seed = TREEMAP_KPI_SEED[treemapId];
  if (seed) return seed.goalM;
  return parseRevenueToMillions(node.revenue) || 1;
}

function activeSellersForPrimary(primary: string): number {
  return PIPELINE_STAGES.reduce((sum, stage) => sum + cellCount(stage, primary), 0);
}

function fyScale(fiscalYear: FiscalYearId): number {
  return fiscalYear === "2026-2027" ? 0.28 : 1;
}

function formatRevenueBillions(totalB: number): string {
  if (totalB >= 1) return `$ ${totalB.toFixed(1)}B`;
  if (totalB >= 0.001) return `$ ${Math.round(totalB * 1000)}M`;
  return "$ 0";
}

function formatGoalMillions(totalM: number): string {
  if (totalM >= 1000) return `$ ${(totalM / 1000).toFixed(1)}B`;
  if (totalM >= 1) return `$ ${totalM.toFixed(1)}M`;
  return "—";
}

function parseGapPercent(gapPercent?: string): number {
  if (!gapPercent) return 15;
  const n = parseInt(gapPercent.replace(/[^0-9]/g, ""), 10);
  return Number.isFinite(n) ? Math.min(n, 40) : 15;
}

function truncateLabel(label: string, max = 16): string {
  return label.length > max ? `${label.slice(0, max - 3)}...` : label;
}

export function buildDashboardMetrics(input: {
  fiscalYear: FiscalYearId;
  planItemCount: number;
  revenueGoal: string;
  selectedCategoryIds: string[];
  categoryOptions: GapCategoryFilterOption[];
  treemapRoot: TreemapHierarchyRoot;
}): DashboardMetric[] {
  const selectedTreemap = getSelectedTreemapIds(
    input.selectedCategoryIds,
    input.categoryOptions,
  );
  const scale = fyScale(input.fiscalYear);

  if (selectedTreemap.length === 0) {
    return [
      { label: "Total Revenue", value: "$ 0", change: "0%", changeType: "neutral", icon: "revenue" },
      { label: "Revenue Goal", value: "—", change: "0%", changeType: "neutral", icon: "goal" },
      { label: "Item Types Added", value: "0", change: "0%", changeType: "neutral", icon: "items" },
      { label: "Active Sellers", value: "0", change: "0%", changeType: "neutral", icon: "sellers" },
    ];
  }

  let totalRevenueB = 0;
  let totalGoalM = 0;
  let totalItems = 0;
  let totalItemsLastYear = 0;
  let totalSellers = 0;
  let weightedChange = 0;

  for (const treemapId of selectedTreemap) {
    const node = input.treemapRoot.children.find((n) => n.id === treemapId);
    const seed = TREEMAP_KPI_SEED[treemapId];
    const primary = TREEMAP_PIPELINE_PRIMARY[treemapId];
    if (!node || !primary) continue;

    totalRevenueB += (seed?.revenueB ?? parseRevenueToMillions(node.revenue) / 1000) * scale;
    weightedChange += parseFloat((seed?.revenueChange ?? "10").replace("%", "")) * (seed?.revenueB ?? 0.3);

    if (treemapId === KITCHEN_TREEMAP_ID && input.revenueGoal.trim()) {
      totalGoalM += parseRevenueGoalToMillions(input.revenueGoal) ?? goalMillionsForNode(node, treemapId);
    } else {
      totalGoalM += goalMillionsForNode(node, treemapId) * scale;
    }

    if (treemapId === KITCHEN_TREEMAP_ID) {
      totalItems += input.planItemCount;
      totalItemsLastYear += Math.max(
        1,
        Math.round((seed?.itemTypesLastYear ?? 22) * scale),
      );
    } else {
      const seeded = Math.round((seed?.itemTypes ?? 0) * scale);
      totalItems += seeded;
      totalItemsLastYear += Math.max(
        1,
        Math.round((seed?.itemTypesLastYear ?? seed?.itemTypes ?? 1) * scale),
      );
    }

    totalSellers += Math.max(1, Math.round(activeSellersForPrimary(primary) * scale));
  }

  const avgChange =
    selectedTreemap.length > 0
      ? `${(weightedChange / Math.max(totalRevenueB, 0.1)).toFixed(1)}%`
      : "0%";

  const goalDisplay =
    input.revenueGoal.trim() && selectedTreemap.length === 1 && selectedTreemap[0] === KITCHEN_TREEMAP_ID
      ? formatRevenueGoalDisplay(input.revenueGoal)
      : formatGoalMillions(totalGoalM);

  const itemYoYPct =
    totalItemsLastYear > 0
      ? ((totalItems - totalItemsLastYear) / totalItemsLastYear) * 100
      : totalItems > 0
        ? 100
        : 0;
  const itemChange = `${Math.abs(itemYoYPct).toFixed(1)}%`;
  const itemChangeType: DashboardMetric["changeType"] =
    itemYoYPct > 0.05 ? "positive" : itemYoYPct < -0.05 ? "negative" : "neutral";

  return [
    {
      label: "Total Revenue",
      value: formatRevenueBillions(totalRevenueB),
      change: avgChange,
      changeType: "positive",
      icon: "revenue",
    },
    {
      label: "Revenue Goal",
      value: goalDisplay,
      change: "10.4%",
      changeType: "positive",
      icon: "goal",
    },
    {
      label: "Item Types Added",
      value: String(totalItems),
      change: itemChange,
      changeType: itemChangeType,
      icon: "items",
    },
    {
      label: "Active Sellers",
      value: totalSellers.toLocaleString(),
      change: input.fiscalYear === "2025-2026" ? "2.5%" : "1.1%",
      changeType: "positive",
      icon: "sellers",
    },
  ];
}

export function filterIndustrySegments(
  segments: DonutSegment[],
  fiscalYear: FiscalYearId,
  selectedCategoryIds: string[],
  categoryOptions: GapCategoryFilterOption[],
  treemapRoot: TreemapHierarchyRoot,
): { total: string; segments: DonutSegment[] } {
  const selectedTreemap = getSelectedTreemapIds(selectedCategoryIds, categoryOptions);
  if (selectedTreemap.length === 0) {
    return { total: "$0", segments: [] };
  }

  const scale = fyScale(fiscalYear);
  let revenueSumM = 0;
  for (const id of selectedTreemap) {
    const node = treemapRoot.children.find((n) => n.id === id);
    revenueSumM += parseRevenueToMillions(node?.revenue) * scale;
  }

  const segmentScale = Math.min(1, selectedTreemap.length / 7) * scale;

  return {
    total:
      revenueSumM >= 1000
        ? `$${(revenueSumM / 1000).toFixed(0)}B`
        : revenueSumM >= 1
          ? `$${Math.round(revenueSumM)}M`
          : FY_INDUSTRY_TOTAL[fiscalYear],
    segments: segments.map((s) => ({
      ...s,
      value: Math.max(1, Math.round(s.value * segmentScale)),
    })),
  };
}

export function filterGapBarData(
  subcategoryBars: GapBar[],
  treemapRoot: TreemapHierarchyRoot,
  fiscalYear: FiscalYearId,
  selectedCategoryIds: string[],
  categoryOptions: GapCategoryFilterOption[],
): GapBar[] {
  const selectedTreemap = getSelectedTreemapIds(selectedCategoryIds, categoryOptions);
  if (selectedTreemap.length === 0) return [];

  let bars: GapBar[];

  if (selectedTreemap.length === 1) {
    const node = treemapRoot.children.find((n) => n.id === selectedTreemap[0]);
    if (node?.children?.length) {
      bars = node.children
        .filter((child) => child.gapPercent)
        .map((child) => ({
          label: truncateLabel(child.label),
          value: parseGapPercent(child.gapPercent),
          revenueOpportunity: child.revenue ?? "$1.0M",
        }));
    } else {
      bars = subcategoryBars;
    }
  } else {
    bars = selectedTreemap
      .map((id) => treemapRoot.children.find((n) => n.id === id))
      .filter(Boolean)
      .map((node) => ({
        label: truncateLabel(node!.label),
        value: parseGapPercent(node!.gapPercent),
        revenueOpportunity: node!.revenue ?? "$1.0M",
      }));
  }

  if (fiscalYear === "2026-2027") {
    return bars.map((bar) => ({
      ...bar,
      value: Math.max(8, Math.round(bar.value * 0.6)),
    }));
  }
  return bars;
}

export function filterPipelineData(
  pipeline: PipelineData,
  treemapRoot: TreemapHierarchyRoot,
  selectedCategoryIds: string[],
  categoryOptions: GapCategoryFilterOption[],
): PipelineData {
  const selectedTreemap = getSelectedTreemapIds(selectedCategoryIds, categoryOptions);
  if (selectedTreemap.length === 0) {
    return { stageColumns: pipeline.stageColumns, categoryRows: [] };
  }

  const categoryRows = selectedTreemap
    .map((treemapId) => {
      const node = treemapRoot.children.find((n) => n.id === treemapId);
      const primary = TREEMAP_PIPELINE_PRIMARY[treemapId];
      if (!node || !primary) return null;

      const values = PIPELINE_STAGES.map((stage) => cellCount(stage, primary));
      return {
        category: node.label,
        values,
      };
    })
    .filter(Boolean) as PipelineData["categoryRows"];

  return {
    stageColumns: pipeline.stageColumns,
    categoryRows,
  };
}
