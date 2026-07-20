import type { GapItem } from "@/components/data-display/gaps-drawer";
import { normalizeGapCategoryId } from "@/lib/mock-data/assortment-gap-categories";
import type { TreemapHierarchyRoot, TreemapNode } from "@/lib/mock-data/treemap-hierarchy";
import { getGapItemsByCategory } from "@/lib/mock-data/gap-items-catalog";

/** Parse a revenue string like "$22.8M" or "$680K" → number in millions */
export function parseRevenueMillion(revenue?: string): number {
  if (!revenue) return 0;
  const n = parseFloat(revenue.replace(/[^0-9.]/g, ""));
  if (revenue.toUpperCase().includes("B")) return n * 1000;
  if (revenue.toUpperCase().includes("K")) return n / 1000;
  return isNaN(n) ? 0 : n;
}

/** Format millions as "$X.XM" or "$X.XB" */
export function formatRevenueMillion(valueM: number): string {
  if (valueM <= 0) return "$0";
  if (valueM >= 1000) return `$${(valueM / 1000).toFixed(1)}B`;
  if (valueM < 1) return `$${Math.round(valueM * 1000)}K`;
  return `$${valueM.toFixed(1)}M`;
}

function sumGapItemsRevenue(items: GapItem[]): number {
  return items.reduce((sum, item) => sum + parseRevenueMillion(item.estimatedRevenue), 0);
}

function resolveGapItemsForNode(node: TreemapNode): GapItem[] {
  if (node.opensDrawer) {
    const fromDrawer = getGapItemsByCategory(node.opensDrawer);
    if (fromDrawer.length > 0) return fromDrawer;
  }
  return getGapItemsByCategory(node.label);
}

function enrichNode(node: TreemapNode): TreemapNode {
  if (node.children?.length) {
    const children = node.children.map(enrichNode);
    const totalM = children.reduce(
      (sum, child) => sum + parseRevenueMillion(child.revenue),
      0,
    );
    return {
      ...node,
      children,
      revenue: formatRevenueMillion(totalM),
    };
  }

  const gapItems = resolveGapItemsForNode(node);
  if (gapItems.length > 0) {
    return {
      ...node,
      revenue: formatRevenueMillion(sumGapItemsRevenue(gapItems)),
    };
  }

  return node;
}

/** Roll up revenue from item-gap catalog → sub-category → category → overall */
export function enrichTreemapWithComputedRevenue(
  root: TreemapHierarchyRoot,
): TreemapHierarchyRoot {
  return {
    ...root,
    children: root.children.map(enrichNode),
  };
}

export function computeOverallOpportunity(root: TreemapHierarchyRoot): string {
  const totalM = root.children.reduce(
    (sum, node) => sum + parseRevenueMillion(node.revenue),
    0,
  );
  return formatRevenueMillion(totalM);
}

/** Sum revenue for selected treemap root nodes. */
export function computeOpportunityForTreemapNodes(
  root: TreemapHierarchyRoot,
  treemapNodeIds: string[],
): string {
  const selected = new Set(treemapNodeIds);
  const totalM = root.children.reduce((sum, node) => {
    if (!selected.has(node.id)) return sum;
    return sum + parseRevenueMillion(node.revenue);
  }, 0);
  return formatRevenueMillion(totalM);
}

/** @deprecated Use computeOpportunityForTreemapNodes for gap-analysis filters. */
export function computeOpportunityForCategories(
  root: TreemapHierarchyRoot,
  categoryIds: string[],
): string {
  const selected = new Set(categoryIds);
  const totalM = root.children.reduce((sum, node) => {
    const categoryId = normalizeGapCategoryId(node.categoryId);
    if (!categoryId || !selected.has(categoryId)) return sum;
    return sum + parseRevenueMillion(node.revenue);
  }, 0);
  return formatRevenueMillion(totalM);
}
