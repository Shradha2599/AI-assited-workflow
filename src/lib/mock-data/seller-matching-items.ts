import type { Seller } from "./sellers";

/** Category → relevant assortment plan item types (subset per seller) */
const CATEGORY_ITEM_TYPES: Record<string, string[]> = {
  "Kitchen & Dining": [
    "Ceramic Serving Bowls",
    "Cake Stands",
    "Glass Beverage Dispensers",
    "Marble Serving Trays",
    "Dinnerware Sets",
    "Cutting Boards",
    "Stoneware Mugs",
    "Salt & Pepper Grinder Sets",
  ],
  Lighting: [
    "Pendant Lights",
    "String Lights",
    "Table Lamps",
    "Floor Lamps",
    "Wall Sconces",
    "Smart Bulbs",
    "LED Lanterns",
    "Outdoor Lighting",
    "Flush Mount Lights",
    "Desk Lamps",
  ],
  "Holiday & Festive Decor": [
    "String Lights",
    "LED Lanterns",
    "Wreaths",
    "Ornaments",
    "Seasonal Table Linens",
  ],
  "Party Supplies": [
    "Disposable Serveware",
    "Party Banners",
    "Balloon Kits",
    "Table Runners",
  ],
  "Outdoor Living & Garden": [
    "Outdoor Lighting",
    "LED Lanterns",
    "Garden Planters",
    "Patio Umbrellas",
    "Outdoor Furniture Covers",
  ],
  "Storage & Organization": [
    "Storage Baskets",
    "Drawer Organizers",
    "Pantry Bins",
    "Closet Shelving",
    "Under-Bed Storage",
  ],
  Furniture: [
    "Dining Chairs",
    "Console Tables",
    "Outdoor Benches",
    "Sideboards",
    "Accent Chairs",
  ],
};

export function getSellerMatchingItemTypes(seller: Seller): string[] {
  if (seller.matchingItemTypes?.length) {
    return seller.matchingItemTypes;
  }

  const seen = new Set<string>();
  const items: string[] = [];
  for (const category of seller.categories) {
    for (const item of CATEGORY_ITEM_TYPES[category] ?? []) {
      if (!seen.has(item)) {
        seen.add(item);
        items.push(item);
      }
      if (items.length >= 5) return items;
    }
  }
  return items;
}
