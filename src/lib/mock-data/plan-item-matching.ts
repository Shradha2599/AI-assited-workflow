import { categories, type ItemType } from "@/lib/mock-data/assortment";
import type { Seller } from "@/lib/mock-data/sellers";

/** Flat catalog — same item-type source used by gap analysis & assortment calendar */
export const CATALOG_ITEM_TYPES: ItemType[] = categories.flatMap((c) =>
  c.itemTypes.map((it) => ({ ...it, category: c.name })),
);

function normalizeCategory(name: string): string {
  return name.trim().toLowerCase();
}

function categoriesOverlap(sellerCategories: string[], itemCategory: string): boolean {
  const itemNorm = normalizeCategory(itemCategory);
  return sellerCategories.some((sc) => {
    const scNorm = normalizeCategory(sc);
    return scNorm === itemNorm || scNorm.includes(itemNorm) || itemNorm.includes(scNorm);
  });
}

/** Resolve a plan item name to its assortment catalog category */
export function getCatalogCategoryForPlanItem(planItemName: string): string | undefined {
  const lower = planItemName.toLowerCase();
  const exact = CATALOG_ITEM_TYPES.find((it) => it.name.toLowerCase() === lower);
  if (exact) return exact.category;

  const partial = CATALOG_ITEM_TYPES.find(
    (it) =>
      lower.includes(it.name.toLowerCase()) ||
      it.name.toLowerCase().includes(lower) ||
      lower.split(" ")[0] === it.name.toLowerCase().split(" ")[0],
  );
  return partial?.category;
}

/**
 * Plan items from the assortment store that align with a seller's categories.
 * Used by lead discovery UI and agents — single source of truth with the calendar.
 */
export function getMatchingPlanItemsForSeller(
  seller: Seller,
  planItems: string[],
  agentPlanMatch?: string[],
): string[] {
  if (planItems.length === 0) return [];

  if (agentPlanMatch?.length) {
    const fromAgent = agentPlanMatch.filter((item) => planItems.includes(item));
    if (fromAgent.length > 0) return fromAgent;
  }

  return planItems.filter((planItem) => {
    const itemCategory = getCatalogCategoryForPlanItem(planItem);
    if (itemCategory) return categoriesOverlap(seller.categories, itemCategory);
    return categoriesOverlap(seller.categories, seller.category);
  });
}
