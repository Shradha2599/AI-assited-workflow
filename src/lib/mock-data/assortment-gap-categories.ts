import type { TreemapHierarchyRoot } from "@/lib/mock-data/treemap-hierarchy";

export interface AssortmentGapCategory {
  id: string;
  name: string;
  hasSubcategories: boolean;
}

export interface GapCategoryFilterOption extends AssortmentGapCategory {
  /** True when this row maps to a treemap tile on the gap analysis page. */
  hasGapData: boolean;
  /** Treemap node id — only set for gap-data rows. */
  treemapNodeId?: string;
  /** Taxonomy id used for missing-product filtering. */
  taxonomyId?: string;
}

/** Taxonomy categories replaced by treemap-specific rows in the filter. */
const TREEMAP_REPLACED_TAXONOMY_IDS = new Set([
  "cat_kitchen_dining",
  "cat_outdoor_living_garden",
  "cat_party_supplies",
  "cat_gift_ideas",
  "cat_home_decor",
]);

/** Maps legacy treemap / product category IDs to the gap-analysis taxonomy. */
export const LEGACY_GAP_CATEGORY_IDS: Record<string, string> = {
  cat_outdoor_living: "cat_outdoor_living_garden",
  cat_holiday_decor: "cat_gift_ideas",
  cat_lighting: "cat_home_decor",
  cat_furniture: "cat_home_decor",
  cat_storage_org: "cat_household_essentials",
};

export function normalizeGapCategoryId(categoryId?: string): string | undefined {
  if (!categoryId) return undefined;
  return LEGACY_GAP_CATEGORY_IDS[categoryId] ?? categoryId;
}

/** Seven treemap tiles + remaining Target taxonomy rows for the filter dropdown. */
export function buildGapCategoryFilterOptions(
  treemapRoot: TreemapHierarchyRoot,
  taxonomyCategories: AssortmentGapCategory[],
): GapCategoryFilterOption[] {
  const treemapOptions: GapCategoryFilterOption[] = treemapRoot.children.map((node) => ({
    id: node.id,
    name: node.label,
    hasSubcategories: Boolean(node.children?.length),
    hasGapData: true,
    treemapNodeId: node.id,
    taxonomyId: normalizeGapCategoryId(node.categoryId),
  }));

  const additionalOptions: GapCategoryFilterOption[] = taxonomyCategories
    .filter((category) => !TREEMAP_REPLACED_TAXONOMY_IDS.has(category.id))
    .map((category) => ({
      ...category,
      hasGapData: false,
      taxonomyId: category.id,
    }));

  return [...treemapOptions, ...additionalOptions];
}

/** Default selection — all treemap-backed categories (7). */
export function getDefaultGapCategoryIds(treemapRoot: TreemapHierarchyRoot): string[] {
  return treemapRoot.children.map((node) => node.id);
}

export function getTreemapBackedCategoryIds(options: GapCategoryFilterOption[]): string[] {
  return options.filter((option) => option.hasGapData).map((option) => option.id);
}

export function resolveSelectedTaxonomyIds(
  selectedIds: string[],
  options: GapCategoryFilterOption[],
): Set<string> {
  const selected = new Set(selectedIds);
  const taxonomyIds = new Set<string>();

  for (const option of options) {
    if (!selected.has(option.id) || !option.taxonomyId) continue;
    taxonomyIds.add(option.taxonomyId);
  }

  return taxonomyIds;
}
