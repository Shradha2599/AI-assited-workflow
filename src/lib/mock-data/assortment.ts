export interface Category {
  id: string;
  name: string;
  gapPercent: number;
  topCompetitor: string;
  estimatedRevenue: number;
  priority: "High" | "Medium" | "Low";
  itemTypes: ItemType[];
}

export interface ItemType {
  id: string;
  name: string;
  category: string;
  lagPercent: number;
  competitorSkus: number;
  estimatedRevenue: number;
  isPlanned: boolean;
  quarterTarget?: string;
}

export const categories: Category[] = [
  {
    id: "lighting",
    name: "Lighting",
    gapPercent: 38,
    topCompetitor: "Amazon",
    estimatedRevenue: 8400000,
    priority: "High",
    itemTypes: [
      { id: "it-001", name: "Ceramic Table Lamp", category: "Lighting", lagPercent: 28, competitorSkus: 102, estimatedRevenue: 1400000, isPlanned: true, quarterTarget: "Q1" },
      { id: "it-002", name: "String Lights", category: "Lighting", lagPercent: 22, competitorSkus: 87, estimatedRevenue: 980000, isPlanned: true, quarterTarget: "Q1" },
      { id: "it-003", name: "Pendant Lights", category: "Lighting", lagPercent: 31, competitorSkus: 145, estimatedRevenue: 1600000, isPlanned: false },
      { id: "it-004", name: "Floor Lamps", category: "Lighting", lagPercent: 18, competitorSkus: 64, estimatedRevenue: 720000, isPlanned: false },
      { id: "it-005", name: "Decorative Lighting", category: "Lighting", lagPercent: 25, competitorSkus: 92, estimatedRevenue: 1100000, isPlanned: true, quarterTarget: "Q2" },
    ],
  },
  {
    id: "furniture",
    name: "Furniture",
    gapPercent: 29,
    topCompetitor: "Amazon",
    estimatedRevenue: 6200000,
    priority: "High",
    itemTypes: [
      { id: "it-006", name: "Patio Furniture", category: "Furniture", lagPercent: 24, competitorSkus: 210, estimatedRevenue: 2100000, isPlanned: true, quarterTarget: "Q3" },
      { id: "it-007", name: "Dining Chairs", category: "Furniture", lagPercent: 16, competitorSkus: 88, estimatedRevenue: 880000, isPlanned: false },
      { id: "it-008", name: "Coffee Tables", category: "Furniture", lagPercent: 20, competitorSkus: 120, estimatedRevenue: 1200000, isPlanned: false },
      { id: "it-009", name: "Bar Carts", category: "Furniture", lagPercent: 35, competitorSkus: 56, estimatedRevenue: 560000, isPlanned: false },
    ],
  },
  {
    id: "kitchen-dining",
    name: "Kitchen & Dining",
    gapPercent: 22,
    topCompetitor: "Amazon",
    estimatedRevenue: 5100000,
    priority: "High",
    itemTypes: [
      { id: "it-010", name: "Ceramic Serving High Bowls", category: "Kitchen & Dining", lagPercent: 28, competitorSkus: 102, estimatedRevenue: 1500000, isPlanned: true, quarterTarget: "Q1" },
      { id: "it-011", name: "Sugar Bowl & Creamer Sets", category: "Kitchen & Dining", lagPercent: 18, competitorSkus: 72, estimatedRevenue: 800000, isPlanned: true, quarterTarget: "Q2" },
      { id: "it-012", name: "Cake Stands & Tiered Servers", category: "Kitchen & Dining", lagPercent: 14, competitorSkus: 58, estimatedRevenue: 650000, isPlanned: true, quarterTarget: "Q1" },
      { id: "it-013", name: "Beverage Carafes & Pitchers", category: "Kitchen & Dining", lagPercent: 21, competitorSkus: 90, estimatedRevenue: 950000, isPlanned: true, quarterTarget: "Q2" },
      { id: "it-014", name: "Dip & Condiment Servers", category: "Kitchen & Dining", lagPercent: 10, competitorSkus: 44, estimatedRevenue: 420000, isPlanned: false },
    ],
  },
  {
    id: "outdoor-living",
    name: "Outdoor Living & Garden",
    gapPercent: 27,
    topCompetitor: "Home Depot",
    estimatedRevenue: 7800000,
    priority: "High",
    itemTypes: [
      { id: "it-015", name: "Decorative Planters", category: "Outdoor Living & Garden", lagPercent: 32, competitorSkus: 180, estimatedRevenue: 1800000, isPlanned: false },
      { id: "it-016", name: "Patio Umbrella", category: "Outdoor Living & Garden", lagPercent: 24, competitorSkus: 95, estimatedRevenue: 950000, isPlanned: false },
      { id: "it-017", name: "Garden Decor", category: "Outdoor Living & Garden", lagPercent: 28, competitorSkus: 220, estimatedRevenue: 2200000, isPlanned: false },
    ],
  },
  {
    id: "holiday-festive",
    name: "Holiday & Festive Decor",
    gapPercent: 18,
    topCompetitor: "Amazon",
    estimatedRevenue: 3400000,
    priority: "Medium",
    itemTypes: [
      { id: "it-018", name: "Halloween Decor", category: "Holiday & Festive Decor", lagPercent: 22, competitorSkus: 145, estimatedRevenue: 1100000, isPlanned: false },
      { id: "it-019", name: "Christmas Lighting", category: "Holiday & Festive Decor", lagPercent: 15, competitorSkus: 98, estimatedRevenue: 890000, isPlanned: false },
    ],
  },
  {
    id: "storage-organization",
    name: "Storage & Organization",
    gapPercent: 14,
    topCompetitor: "Amazon",
    estimatedRevenue: 2800000,
    priority: "Medium",
    itemTypes: [
      { id: "it-020", name: "Storage Baskets", category: "Storage & Organization", lagPercent: 18, competitorSkus: 220, estimatedRevenue: 1200000, isPlanned: false },
      { id: "it-021", name: "Laundry Organizers", category: "Storage & Organization", lagPercent: 12, competitorSkus: 88, estimatedRevenue: 480000, isPlanned: false },
    ],
  },
  {
    id: "rugs",
    name: "Rugs",
    gapPercent: 11,
    topCompetitor: "Wayfair",
    estimatedRevenue: 1900000,
    priority: "Low",
    itemTypes: [
      { id: "it-022", name: "Boho Rugs", category: "Rugs", lagPercent: 14, competitorSkus: 310, estimatedRevenue: 980000, isPlanned: false },
      { id: "it-023", name: "Bathroom Rugs", category: "Rugs", lagPercent: 9, competitorSkus: 180, estimatedRevenue: 540000, isPlanned: false },
    ],
  },
  {
    id: "party-supplies",
    name: "Party Supplies",
    gapPercent: 8,
    topCompetitor: "Amazon",
    estimatedRevenue: 1200000,
    priority: "Low",
    itemTypes: [
      { id: "it-024", name: "Cocktail Accessories", category: "Party Supplies", lagPercent: 10, competitorSkus: 65, estimatedRevenue: 420000, isPlanned: false },
    ],
  },
];

export const dashboardKpis = {
  totalRevenue: { value: 1800000000, changePercent: 24 },
  revenueGoal: { value: 2500000000, changePercent: 10.4 },
  assortmentGapCovered: { value: 23, changePercent: 10.2 },
  activeSellers: { value: 2345, changePercent: 9.3 },
  totalGapValue: 52800000,
  highPriorityGaps: 47,
};

export function getCategoryById(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}

export function getHighPriorityCategories(): Category[] {
  return categories.filter((c) => c.priority === "High");
}

export function getPlannedItemTypes(): ItemType[] {
  return categories.flatMap((c) => c.itemTypes.filter((it) => it.isPlanned));
}

export function getTotalPlannedRevenue(): number {
  return getPlannedItemTypes().reduce((sum, it) => sum + it.estimatedRevenue, 0);
}
