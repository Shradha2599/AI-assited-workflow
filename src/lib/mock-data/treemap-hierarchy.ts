import type { LagLevel } from "@/components/data-display/category-treemap";

export interface TreemapGridConfig {
  columns: number;
  rowTemplate: string;
}

export interface TreemapNode {
  id: string;
  label: string;
  lag: LagLevel;
  gridArea?: string;
  revenue?: string;
  gapPercent?: string;
  gapRate?: number;
  competitorLeader?: string;
  categoryId?: string;
  opensDrawer?: string;
  children?: TreemapNode[];
  gridConfig?: TreemapGridConfig;
}

export interface TreemapHierarchyRoot {
  id: string;
  label: string;
  gridConfig: TreemapGridConfig;
  children: TreemapNode[];
}

export function findTreemapNode(
  root: TreemapHierarchyRoot,
  pathIds: string[],
): TreemapNode | TreemapHierarchyRoot {
  let current: TreemapNode | TreemapHierarchyRoot = root;
  for (const id of pathIds) {
    const next: TreemapNode | undefined = current.children?.find((child) => child.id === id);
    if (!next) break;
    current = next;
  }
  return current;
}

export function getTreemapLevelItems(
  root: TreemapHierarchyRoot,
  pathIds: string[],
): TreemapNode[] {
  const node = findTreemapNode(root, pathIds);
  return node.children ?? [];
}

export function getTreemapGridConfig(
  root: TreemapHierarchyRoot,
  pathIds: string[],
): TreemapGridConfig {
  const node = findTreemapNode(root, pathIds);
  if ("gridConfig" in node && node.gridConfig) return node.gridConfig;
  return root.gridConfig;
}

export function getTreemapBreadcrumbLabels(
  root: TreemapHierarchyRoot,
  pathIds: string[],
): string[] {
  const labels: string[] = [];
  let current: TreemapNode | TreemapHierarchyRoot = root;
  for (const id of pathIds) {
    const next: TreemapNode | undefined = current.children?.find((child) => child.id === id);
    if (!next) break;
    labels.push(next.label);
    current = next;
  }
  return labels;
}

/** Flat summary for Assortment Intelligence Agent context */
export function buildTreemapAgentSummary(root: TreemapHierarchyRoot, depth = 2): string {
  const lines: string[] = [];

  function walk(node: TreemapNode, level: number, prefix: string) {
    const lag = node.gapPercent ? `${node.gapPercent} lag` : node.lag;
    const rev = node.revenue ? `, ${node.revenue} opportunity` : "";
    lines.push(`${prefix}- **${node.label}** (${lag}${rev})`);
    if (level < depth && node.children?.length) {
      for (const child of node.children) {
        walk(child, level + 1, `${prefix}  `);
      }
    }
  }

  for (const category of root.children) {
    walk(category, 1, "");
  }

  return lines.join("\n");
}
