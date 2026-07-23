import type { GapItem } from "@/components/data-display/gaps-drawer";

/** Real product photos (Unsplash) — stable crop URLs for gap item cards */
const U = (id: string) =>
  `https://images.unsplash.com/${id}?w=96&h=96&fit=crop`;

const BY_ID: Record<string, string> = {
  // Serveware
  "sw-1": U("photo-1578662996442-48f60103fc96"),
  "sw-2": U("photo-1603199508936-b5735cab581e"),
  "sw-3": U("photo-1604719312566-8912b06350af"),
  "sw-4": U("photo-1578985545062-69928b1d9587"),
  "sw-5": U("photo-1464305796206-3f0dd815fc22"),
  "sw-6": U("photo-1556910103-1c02745aae4d"),
  "sw-7": U("photo-1606787366850-de6330128b31"),
  "sw-8": U("photo-1584994276607-c4995b5a882f"),
  // Kitchen & Dining — Halloween
  "kdh-1": U("photo-1605844554468-64d8a859baaa"),
  "kdh-2": U("photo-1607954431657-ef3f03525891"),
  "kdh-3": U("photo-1509556907-9b9837d8acee"),
  "kdh-4": U("photo-1514362545857-3bc16c4c7d1b"),
  "kdh-5": U("photo-1530103862676-de8c9debad1d"),
  // Cookware
  "cw-1": U("photo-1584994276607-c4995b5a882f"),
  "cw-2": U("photo-1556911220-bff31c812dba"),
  "cw-3": U("photo-1585666225885-0726a3930a38"),
  "cw-4": U("photo-1596394516093-501ba68a0ba6"),
  "cw-5": U("photo-1585515326630-5031f0402c29"),
  // Glassware
  "gd-1": U("photo-1514362545857-3bc16c4c7d1b"),
  "gd-2": U("photo-1602143407151-7111542de6e8"),
  "gd-3": U("photo-1514362545857-3bc16c4c7d1b"),
  "gd-4": U("photo-1567225551728-1aa51779a6b4"),
  // Dining & Entertaining
  "de-1": U("photo-1603199508936-b5735cab581e"),
  "de-2": U("photo-1556910103-1c02745aae4d"),
  "de-3": U("photo-1509556907-9b9837d8acee"),
  "de-4": U("photo-1578985545062-69928b1d9587"),
};

const CATEGORY_POOLS: Record<string, string[]> = {
  Serveware: [
    U("photo-1578662996442-48f60103fc96"),
    U("photo-1603199508936-b5735cab581e"),
    U("photo-1578985545062-69928b1d9587"),
    U("photo-1464305796206-3f0dd815fc22"),
  ],
  Cookware: [
    U("photo-1584994276607-c4995b5a882f"),
    U("photo-1556911220-bff31c812dba"),
    U("photo-1585666225885-0726a3930a38"),
  ],
  "Kitchen & Dining — Halloween": [
    U("photo-1605844554468-64d8a859baaa"),
    U("photo-1607954431657-ef3f03525891"),
    U("photo-1509556907-9b9837d8acee"),
  ],
  default: [
    U("photo-1556910103-1c02745aae4d"),
    U("photo-1604719312566-8912b06350af"),
    U("photo-1514362545857-3bc16c4c7d1b"),
    U("photo-1530103862676-de8c9debad1d"),
    U("photo-1606787366850-de6330128b31"),
  ],
};

function poolIndex(itemId: string, poolSize: number): number {
  const n = parseInt(itemId.replace(/\D/g, ""), 10);
  return Number.isFinite(n) ? (n - 1) % poolSize : 0;
}

export function resolveGapItemImage(item: GapItem, category: string): string {
  if (item.imageUrl?.startsWith("http")) return item.imageUrl;
  if (BY_ID[item.id]) return BY_ID[item.id];

  const pool =
    CATEGORY_POOLS[category] ??
    Object.entries(CATEGORY_POOLS).find(([key]) =>
      category.toLowerCase().includes(key.toLowerCase().slice(0, 8)),
    )?.[1] ??
    CATEGORY_POOLS.default;

  return pool[poolIndex(item.id, pool.length)]!;
}

export function enrichGapItem(item: GapItem, category: string): GapItem {
  return { ...item, imageUrl: resolveGapItemImage(item, category) };
}
