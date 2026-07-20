import type { GapItem } from "@/components/data-display/gaps-drawer";
import { getGapItemsByCategory } from "@/lib/mock-data/gap-items-catalog";
import type { TreemapHierarchyRoot, TreemapNode } from "@/lib/mock-data/treemap-hierarchy";

/** Beacon plan catalog labels keyed by treemap root-node id. */
export const BEACON_CATALOG_BY_TREEMAP_ID: Record<string, string> = {
  kitchen: "Kitchen & Dining",
  outdoor: "Outdoor Living & Garden",
  holiday: "Holiday & Festive Decor",
  lighting: "Lighting",
  furniture: "Furniture",
  party: "Party Supplies",
  rugs: "Rugs",
};

function resolveGapItemsForNode(node: TreemapNode): GapItem[] {
  if (node.opensDrawer) {
    const fromDrawer = getGapItemsByCategory(node.opensDrawer);
    if (fromDrawer.length > 0) return fromDrawer;
  }
  return getGapItemsByCategory(node.label);
}

function collectGapItemsFromNode(node: TreemapNode): GapItem[] {
  if (node.children?.length) {
    return node.children.flatMap(collectGapItemsFromNode);
  }
  return resolveGapItemsForNode(node);
}

function dedupeAndSortItems(items: GapItem[]): GapItem[] {
  const byId = new Map<string, GapItem>();
  for (const item of items) {
    if (!byId.has(item.id)) byId.set(item.id, item);
  }
  return [...byId.values()].sort((a, b) => b.lagPercent - a.lagPercent);
}

/**
 * Builds the Beacon planning catalog from the same gap-item data that drives
 * treemap revenue opportunity — keeps Plan with Beacon aligned to the goal UI.
 */
export function buildBeaconCatalogByCategory(
  treemapRoot: TreemapHierarchyRoot,
): Array<{ cat: string; items: GapItem[] }> {
  return treemapRoot.children
    .map((node) => {
      const cat = BEACON_CATALOG_BY_TREEMAP_ID[node.id];
      if (!cat) return null;
      const items = dedupeAndSortItems(collectGapItemsFromNode(node));
      if (items.length === 0) return null;
      return { cat, items };
    })
    .filter((bucket): bucket is { cat: string; items: GapItem[] } => bucket !== null);
}

export function parseBeaconRevenueMillions(revenue: string): number {
  const m = revenue.match(/\$?([\d.]+)([MK]?)/i);
  if (!m) return 0;
  const n = parseFloat(m[1]);
  return m[2]?.toUpperCase() === "K" ? n / 1000 : n;
}

/**
 * Picks items (high-lag first) until cumulative revenue meets the goal or the
 * catalog is exhausted.
 */
export function selectBeaconPlanItems(
  buckets: Array<{ cat: string; items: GapItem[] }>,
  goalMillions: number,
  existingPlanItems: string[] = [],
): GapItem[] {
  if (goalMillions <= 0) return [];

  const existing = new Set(existingPlanItems);
  const pool = buckets
    .flatMap(({ items }) => items)
    .filter((item) => !existing.has(item.name))
    .sort((a, b) => b.lagPercent - a.lagPercent);

  const selected: GapItem[] = [];
  let runningRevM = 0;

  for (const item of pool) {
    if (runningRevM >= goalMillions) break;
    selected.push(item);
    runningRevM += parseBeaconRevenueMillions(item.estimatedRevenue);
  }

  return selected;
}
