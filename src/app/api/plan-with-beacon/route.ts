import type { GapItem } from "@/components/data-display/gaps-drawer";

// ── Revenue string → millions ─────────────────────────────────────────────────
function revenueToMillions(r: string): number {
  const m = r.match(/\$?([\d.]+)([MK]?)/i);
  if (!m) return 0;
  const n = parseFloat(m[1]);
  return m[2]?.toUpperCase() === "K" ? n / 1000 : n;
}

// ── Full catalog, grouped by category ────────────────────────────────────────
// Items within each category are ordered high-lag → low-lag (opportunity priority)
const CATALOG_BY_CATEGORY: Array<{ cat: string; items: GapItem[] }> = [
  {
    cat: "Kitchen & Dining",
    items: [
      { id: "pb-3",  name: "Enameled Cast Iron Dutch Ovens",     lagPercent: 36, lagSeverity: "high",        estimatedRevenue: "$3.1M", competitor: "Amazon",    skuCount: 167 },
      { id: "pb-2",  name: "Fine China Dinner Sets (12-pc)",     lagPercent: 34, lagSeverity: "high",        estimatedRevenue: "$2.8M", competitor: "Amazon",    skuCount: 156 },
      { id: "pb-4",  name: "Air Fryer Ovens (6-10 Qt)",          lagPercent: 31, lagSeverity: "high",        estimatedRevenue: "$2.9M", competitor: "Amazon",    skuCount: 178 },
      { id: "pb-1",  name: "Ceramic Non-Stick Cookware Sets",    lagPercent: 30, lagSeverity: "high",        estimatedRevenue: "$2.4M", competitor: "Amazon",    skuCount: 148 },
      { id: "pb-13", name: "Buffet & Chafing Dishes",            lagPercent: 29, lagSeverity: "high",        estimatedRevenue: "$2.1M", competitor: "Amazon",    skuCount: 142 },
      { id: "pb-8",  name: "Crystal Wine Glass Sets",            lagPercent: 32, lagSeverity: "high",        estimatedRevenue: "$2.1M", competitor: "Amazon",    skuCount: 134 },
      { id: "pb-12", name: "Stainless Steel Sauté Pans",         lagPercent: 28, lagSeverity: "high",        estimatedRevenue: "$2.2M", competitor: "Amazon",    skuCount: 134 },
      { id: "pb-7",  name: "Ceramic Serving High Bowls",         lagPercent: 28, lagSeverity: "high",        estimatedRevenue: "$1.5M", competitor: "Amazon",    skuCount: 102 },
      { id: "pb-14", name: "Double-Wall Insulated Tumblers",     lagPercent: 27, lagSeverity: "high",        estimatedRevenue: "$1.8M", competitor: "Amazon",    skuCount: 109 },
      { id: "pb-5",  name: "Espresso & Bean-to-Cup Machines",    lagPercent: 24, lagSeverity: "high",        estimatedRevenue: "$2.3M", competitor: "Amazon",    skuCount: 142 },
      { id: "pb-6",  name: "Non-Stick Springform Pan Sets",      lagPercent: 24, lagSeverity: "high",        estimatedRevenue: "$1.6M", competitor: "Amazon",    skuCount: 97  },
      { id: "pb-9",  name: "Knife Block Sets (7-pc)",            lagPercent: 24, lagSeverity: "high",        estimatedRevenue: "$1.9M", competitor: "Amazon",    skuCount: 113 },
      { id: "pb-11", name: "Linen Tablecloths (60x120)",         lagPercent: 22, lagSeverity: "high",        estimatedRevenue: "$1.4M", competitor: "Amazon",    skuCount: 89  },
      { id: "pb-10", name: "Charcuterie & Cheese Boards",        lagPercent: 17, lagSeverity: "medium-high", estimatedRevenue: "$1.6M", competitor: "Amazon",    skuCount: 118 },
    ],
  },
  {
    cat: "Lighting",
    items: [
      { id: "pb-20", name: "Chandelier & Pendant Kits",          lagPercent: 35, lagSeverity: "high",        estimatedRevenue: "$2.7M", competitor: "Amazon",    skuCount: 173 },
      { id: "pb-15", name: "Pendant Light Fixtures",             lagPercent: 33, lagSeverity: "high",        estimatedRevenue: "$2.6M", competitor: "Amazon",    skuCount: 159 },
      { id: "pb-21", name: "Flush Mount Ceiling Lights",         lagPercent: 29, lagSeverity: "high",        estimatedRevenue: "$2.1M", competitor: "Amazon",    skuCount: 141 },
      { id: "pb-16", name: "LED Dimmable Table Lamps",           lagPercent: 27, lagSeverity: "high",        estimatedRevenue: "$2.0M", competitor: "Amazon",    skuCount: 128 },
      { id: "pb-22", name: "Ceramic Bedside Table Lamps",        lagPercent: 26, lagSeverity: "high",        estimatedRevenue: "$1.9M", competitor: "Amazon",    skuCount: 124 },
      { id: "pb-17", name: "Wired Wall Sconces",                 lagPercent: 24, lagSeverity: "high",        estimatedRevenue: "$1.8M", competitor: "Amazon",    skuCount: 112 },
      { id: "pb-19", name: "Outdoor String & Festoon Lights",    lagPercent: 21, lagSeverity: "high",        estimatedRevenue: "$1.6M", competitor: "Amazon",    skuCount: 107 },
      { id: "pb-18", name: "Arc Floor Lamps",                    lagPercent: 19, lagSeverity: "medium-high", estimatedRevenue: "$1.4M", competitor: "Amazon",    skuCount: 94  },
    ],
  },
  {
    cat: "Furniture",
    items: [
      { id: "pb-24", name: "Craftsmen Select Bookcase Shelves",  lagPercent: 22, lagSeverity: "high",        estimatedRevenue: "$3.2M", competitor: "Wayfair",   skuCount: 148 },
      { id: "pb-23", name: "Mid-Century Dining Table Sets",      lagPercent: 25, lagSeverity: "high",        estimatedRevenue: "$2.8M", competitor: "Walmart",   skuCount: 162 },
      { id: "pb-27", name: "Upholstered Accent Chairs",          lagPercent: 22, lagSeverity: "high",        estimatedRevenue: "$2.2M", competitor: "Walmart",   skuCount: 138 },
      { id: "pb-25", name: "Sectional Sofas",                    lagPercent: 23, lagSeverity: "high",        estimatedRevenue: "$2.4M", competitor: "Walmart",   skuCount: 147 },
      { id: "pb-26", name: "Platform Bed Frames (Queen/King)",   lagPercent: 21, lagSeverity: "high",        estimatedRevenue: "$2.1M", competitor: "Wayfair",   skuCount: 131 },
      { id: "pb-29", name: "TV Console & Media Units",           lagPercent: 18, lagSeverity: "medium-high", estimatedRevenue: "$1.6M", competitor: "Walmart",   skuCount: 108 },
      { id: "pb-30", name: "6-Drawer Dresser Sets",              lagPercent: 19, lagSeverity: "medium-high", estimatedRevenue: "$1.6M", competitor: "Walmart",   skuCount: 107 },
      { id: "pb-28", name: "Adjustable Standing Desk Frames",    lagPercent: 18, lagSeverity: "medium-high", estimatedRevenue: "$1.5M", competitor: "Amazon",    skuCount: 97  },
    ],
  },
  {
    cat: "Outdoor Living & Garden",
    items: [
      { id: "pb-31", name: "4-Piece Patio Dining Sets",          lagPercent: 30, lagSeverity: "high",        estimatedRevenue: "$3.2M", competitor: "Home Depot",skuCount: 187 },
      { id: "pb-32", name: "4-Burner Propane Gas Grills",        lagPercent: 29, lagSeverity: "high",        estimatedRevenue: "$2.8M", competitor: "Home Depot",skuCount: 164 },
      { id: "pb-34", name: "All-Weather Wicker Sofa Sets",       lagPercent: 28, lagSeverity: "high",        estimatedRevenue: "$2.9M", competitor: "Home Depot",skuCount: 176 },
      { id: "pb-35", name: "Deep-Seat Sectional Lounge Sets",    lagPercent: 24, lagSeverity: "high",        estimatedRevenue: "$2.5M", competitor: "Amazon",    skuCount: 148 },
      { id: "pb-33", name: "Ceramic Kamado Smoker Grills",       lagPercent: 24, lagSeverity: "high",        estimatedRevenue: "$2.2M", competitor: "Home Depot",skuCount: 138 },
      { id: "pb-36", name: "Hanging Egg Chair Swings",           lagPercent: 21, lagSeverity: "high",        estimatedRevenue: "$1.7M", competitor: "Amazon",    skuCount: 118 },
      { id: "pb-38", name: "Flat-Top Griddle Stations",          lagPercent: 20, lagSeverity: "high",        estimatedRevenue: "$1.7M", competitor: "Amazon",    skuCount: 112 },
      { id: "pb-37", name: "Solar Pathway Stake Lights (12-pk)", lagPercent: 22, lagSeverity: "high",        estimatedRevenue: "$1.5M", competitor: "Amazon",    skuCount: 103 },
    ],
  },
  {
    cat: "Holiday & Festive Decor",
    items: [
      { id: "pb-39", name: "Prelit Flocked Christmas Trees",     lagPercent: 36, lagSeverity: "high",        estimatedRevenue: "$3.6M", competitor: "Amazon",    skuCount: 204 },
      { id: "pb-40", name: "Pre-Lit Christmas Tree Kits (7-9ft)",lagPercent: 34, lagSeverity: "high",        estimatedRevenue: "$3.4M", competitor: "Amazon",    skuCount: 194 },
      { id: "pb-41", name: "Animatronic Skeleton Displays",      lagPercent: 30, lagSeverity: "high",        estimatedRevenue: "$2.5M", competitor: "Amazon",    skuCount: 168 },
      { id: "pb-42", name: "LED Christmas Light Strands",        lagPercent: 27, lagSeverity: "high",        estimatedRevenue: "$2.3M", competitor: "Amazon",    skuCount: 159 },
      { id: "pb-43", name: "Christmas Wreath & Garland Bundles", lagPercent: 23, lagSeverity: "high",        estimatedRevenue: "$1.9M", competitor: "Amazon",    skuCount: 143 },
      { id: "pb-44", name: "Holiday Wreath & Garland Sets",      lagPercent: 22, lagSeverity: "high",        estimatedRevenue: "$1.8M", competitor: "Amazon",    skuCount: 131 },
      { id: "pb-45", name: "Harvest Tablescape Centerpieces",    lagPercent: 22, lagSeverity: "high",        estimatedRevenue: "$1.4M", competitor: "Amazon",    skuCount: 106 },
    ],
  },
  {
    cat: "Rugs",
    items: [
      { id: "pb-46", name: "Moroccan Wool Area Rugs (5x8)",      lagPercent: 24, lagSeverity: "high",        estimatedRevenue: "$2.1M", competitor: "Wayfair",   skuCount: 143 },
      { id: "pb-47", name: "Persian-Style Area Rugs (8x10)",     lagPercent: 22, lagSeverity: "high",        estimatedRevenue: "$1.9M", competitor: "Wayfair",   skuCount: 131 },
      { id: "pb-48", name: "Washable Non-Slip Runner Sets",      lagPercent: 20, lagSeverity: "high",        estimatedRevenue: "$1.7M", competitor: "Amazon",    skuCount: 127 },
      { id: "pb-49", name: "Indoor/Outdoor Polypropylene Rugs",  lagPercent: 18, lagSeverity: "medium-high", estimatedRevenue: "$1.5M", competitor: "Home Depot",skuCount: 112 },
      { id: "pb-50", name: "Shag & High-Pile Area Rugs",         lagPercent: 19, lagSeverity: "medium-high", estimatedRevenue: "$1.5M", competitor: "Amazon",    skuCount: 117 },
      { id: "pb-51", name: "All-Weather Outdoor Flat-Weave Rugs",lagPercent: 18, lagSeverity: "medium-high", estimatedRevenue: "$1.3M", competitor: "Home Depot",skuCount: 94  },
    ],
  },
  {
    cat: "Party Supplies",
    items: [
      { id: "pb-52", name: "Biodegradable Party Plate Sets",     lagPercent: 26, lagSeverity: "high",        estimatedRevenue: "$1.8M", competitor: "Amazon",    skuCount: 138 },
      { id: "pb-53", name: "Balloon Garland Arch Kits",          lagPercent: 22, lagSeverity: "high",        estimatedRevenue: "$1.5M", competitor: "Amazon",    skuCount: 114 },
      { id: "pb-54", name: "LED Balloon & Light-Up Decor",       lagPercent: 19, lagSeverity: "medium-high", estimatedRevenue: "$1.3M", competitor: "Amazon",    skuCount: 104 },
      { id: "pb-55", name: "Party Tableware Sets (24-pc)",       lagPercent: 18, lagSeverity: "medium-high", estimatedRevenue: "$1.2M", competitor: "Amazon",    skuCount: 92  },
    ],
  },
];

export async function POST(req: Request) {
  if (!process.env.GROQ_API_KEY) {
    return Response.json({ error: "GROQ_API_KEY is not set" }, { status: 500 });
  }

  const body = (await req.json()) as {
    revenueGoal: string;
    existingPlanItems?: string[];
  };

  const { revenueGoal, existingPlanItems = [] } = body;
  const goalMillions = revenueToMillions(revenueGoal);
  if (goalMillions <= 0) {
    return Response.json([], { status: 200 });
  }

  // Filter out items already in the plan, per category
  const availableCats = CATALOG_BY_CATEGORY.map(({ cat, items }) => ({
    cat,
    items: items.filter((i) => !existingPlanItems.includes(i.name)),
    pointer: 0,
  }));

  const selected: GapItem[] = [];
  let runningRevM = 0;

  // ── Category-aware round-robin selection ─────────────────────────────────
  // Each "round" picks the next-highest-lag item from each category in order.
  // We stop as soon as the cumulative revenue meets the goal.
  // This ensures:
  //   - Small goals  → fewer items (high-lag, high-revenue picks first)
  //   - Large goals  → more items spanning all categories
  //   - Items are always spread across categories rather than one-category dumps
  const maxRounds = Math.max(...availableCats.map((c) => c.items.length));

  outer: for (let round = 0; round < maxRounds; round++) {
    for (const bucket of availableCats) {
      if (runningRevM >= goalMillions) break outer;
      const item = bucket.items[round];
      if (!item) continue; // this category exhausted for this round
      selected.push(item);
      runningRevM += revenueToMillions(item.estimatedRevenue);
    }
  }

  return Response.json(selected);
}
