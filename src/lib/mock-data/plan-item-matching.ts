import { categories, type ItemType } from "@/lib/mock-data/assortment";
import { getGapItemsByCategory } from "@/lib/mock-data/gap-items-catalog";
import type { Seller } from "@/lib/mock-data/sellers";

/** Gap-analysis subcategory buckets → seller lead pool categories. */
const GAP_BUCKET_SELLER_CATEGORY: Record<string, string> = {
  Serveware: "Kitchen & Dining",
  "Glassware & Drinkware": "Kitchen & Dining",
  "Dining & Entertaining": "Kitchen & Dining",
  "Kitchen & Dining Deals": "Kitchen & Dining",
  "Countertop Storage": "Kitchen & Dining",
  "Kitchen & Table Linens": "Kitchen & Dining",
  Cookware: "Kitchen & Dining",
  Bakeware: "Kitchen & Dining",
  "Kitchen Appliances": "Kitchen & Dining",
  "Kids' Dining": "Kitchen & Dining",
  "Bar & Wine": "Kitchen & Dining",
  "Dorm Kitchen & Dining": "Kitchen & Dining",
  "Cutlery & Knife Acc...": "Kitchen & Dining",
  Lighting: "Lighting",
  "Ceiling Lights": "Lighting",
  "Table Lamps": "Lighting",
  "Floor Lamps": "Lighting",
  "Wall Lights": "Lighting",
  "Smart Lighting": "Lighting",
  "Outdoor Lighting": "Lighting",
  Furniture: "Furniture",
  "Living Room": "Furniture",
  Bedroom: "Furniture",
  "Dining Furniture": "Furniture",
  "Office Furniture": "Furniture",
  Entryway: "Furniture",
  "Outdoor Living & Garden": "Outdoor Living & Garden",
  "Patio Furniture": "Outdoor Living & Garden",
  "Outdoor Decor": "Outdoor Living & Garden",
  "Garden Tools": "Outdoor Living & Garden",
  "Grills & Outdoor Cooking": "Outdoor Living & Garden",
  "Planters & Garden": "Outdoor Living & Garden",
  Holiday: "Holiday & Festive Decor",
  Halloween: "Holiday & Festive Decor",
  Christmas: "Holiday & Festive Decor",
  Thanksgiving: "Holiday & Festive Decor",
  Easter: "Holiday & Festive Decor",
  "Party Supplies": "Party Supplies",
  "Party Tableware": "Party Supplies",
  "Party Decorations": "Party Supplies",
  "Party Favors": "Party Supplies",
  "Baking & Serving": "Party Supplies",
  Rugs: "Rugs",
  "Area Rugs": "Rugs",
  Runners: "Rugs",
  "Outdoor Rugs": "Rugs",
};

/** Flat catalog — assortment calendar + gap-analysis item types */
export const CATALOG_ITEM_TYPES: ItemType[] = [
  ...categories.flatMap((c) => c.itemTypes.map((it) => ({ ...it, category: c.name }))),
  ...Object.entries(GAP_BUCKET_SELLER_CATEGORY).flatMap(([bucket, sellerCategory]) =>
    getGapItemsByCategory(bucket).map((item) => ({
      id: item.id,
      name: item.name,
      category: sellerCategory,
      lagPercent: item.lagPercent,
      competitorSkus: item.skuCount,
      estimatedRevenue: 0,
      isPlanned: false,
    })),
  ),
];

const PLAN_ITEM_CATEGORY_LOOKUP = new Map<string, string>(
  CATALOG_ITEM_TYPES.map((it) => [it.name.toLowerCase(), it.category]),
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

function resolvePlanItemCategory(planItemName: string): string | undefined {
  const lower = planItemName.toLowerCase();

  const exact = PLAN_ITEM_CATEGORY_LOOKUP.get(lower);
  if (exact) return exact;

  for (const [name, category] of PLAN_ITEM_CATEGORY_LOOKUP) {
    if (lower.includes(name) || name.includes(lower)) return category;
  }

  const firstToken = lower.split(/[\s(]/)[0];
  if (firstToken.length >= 4) {
    for (const [name, category] of PLAN_ITEM_CATEGORY_LOOKUP) {
      if (name.startsWith(firstToken) || firstToken.startsWith(name.split(/[\s(]/)[0])) {
        return category;
      }
    }
  }

  return undefined;
}

/** Resolve a plan item name to its seller-facing category. */
export function getCatalogCategoryForPlanItem(planItemName: string): string | undefined {
  return resolvePlanItemCategory(planItemName);
}

/** Unique seller categories represented by the current assortment plan. */
export function getPlanCategories(planItems: string[]): string[] {
  const cats = new Set<string>();
  for (const item of planItems) {
    const category = resolvePlanItemCategory(item);
    if (category) cats.add(category);
  }
  return [...cats];
}

/** Sellers whose categories overlap at least one plan item category. */
export function filterSellersMatchingPlan(sellers: Seller[], planItems: string[]): Seller[] {
  if (planItems.length === 0) return sellers;

  return sellers.filter((seller) => getMatchingPlanItemsForSeller(seller, planItems).length > 0);
}

const MAX_ITEM_MATCHES = 5;
const MIN_ITEM_MATCHES = 1;

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[\s(,./-]+/)
    .filter((token) => token.length > 3);
}

function hashString(value: string): number {
  let hash = 0;
  for (const char of value) hash = (hash + char.charCodeAt(0)) % 997;
  return hash;
}

function maxMatchesForSeller(seller: Seller): number {
  return Math.min(
    MAX_ITEM_MATCHES,
    Math.max(MIN_ITEM_MATCHES, Math.min(4, Math.floor(seller.skus / 250) + 1)),
  );
}

function scorePlanItemForSeller(planItem: string, seller: Seller): number {
  const itemCategory = resolvePlanItemCategory(planItem);
  if (!itemCategory || !categoriesOverlap(seller.categories, itemCategory)) return -1;

  const sellerText =
    `${seller.legalBusinessName} ${seller.description} ${seller.category} ${seller.categories.join(" ")}`.toLowerCase();
  const itemTokens = tokenize(planItem);

  let score = 10;
  for (const token of itemTokens) {
    if (sellerText.includes(token)) score += 5;
  }

  score += hashString(`${seller.id}:${planItem}`) % 4;
  return score;
}

function rankPlanItemsForSeller(seller: Seller, planItems: string[]): string[] {
  const limit = maxMatchesForSeller(seller);

  return planItems
    .map((planItem) => ({ planItem, score: scorePlanItemForSeller(planItem, seller) }))
    .filter((row) => row.score >= 0)
    .sort((a, b) => b.score - a.score || a.planItem.localeCompare(b.planItem))
    .slice(0, limit)
    .map((row) => row.planItem);
}

/**
 * Plan items from the assortment store that align with a seller's categories.
 * Returns a realistic subset (not every item in a shared category).
 */
export function getMatchingPlanItemsForSeller(
  seller: Seller,
  planItems: string[],
  agentPlanMatch?: string[],
): string[] {
  if (planItems.length === 0) return [];

  const ranked = rankPlanItemsForSeller(seller, planItems);
  if (ranked.length === 0) return [];

  if (agentPlanMatch?.length) {
    const limit = maxMatchesForSeller(seller);
    const validated = agentPlanMatch
      .filter((item) => planItems.includes(item))
      .filter((item) => scorePlanItemForSeller(item, seller) >= 0)
      .sort(
        (a, b) =>
          scorePlanItemForSeller(b, seller) - scorePlanItemForSeller(a, seller) ||
          a.localeCompare(b),
      );

    if (validated.length > 0) {
      const merged = [...new Set([...validated, ...ranked])];
      return merged.slice(0, limit);
    }
  }

  return ranked;
}
