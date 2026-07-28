/** Event- and revenue-aware acquisition windows for assortment calendar items. */

const CATEGORY_RULES: Array<{ keywords: string[]; row: string }> = [
  {
    keywords: [
      "christmas", "halloween", "thanksgiving", "easter", "holiday", "festive",
      "wreath", "garland", "nutcracker", "advent", "nativity", "skeleton",
      "animatronic", "inflatable", "pumpkin", "harvest", "tinsel",
    ],
    row: "Holiday & Festive Decor",
  },
  {
    keywords: [
      "patio", "grill", "smoker", "propane", "outdoor cooking", "backyard",
      "griddle", "camp stove", "pizza oven", "adirondack", "bistro set",
      "lounge set", "egg chair", "solar pathway", "fire pit", "outdoor umbrella",
      "weatherproof", "raised garden", "planter", "garden tool", "pruning",
      "hose reel", "outdoor decor", "garden statue", "wind chime", "outdoor lantern",
      "outdoor rug", "outdoor",
    ],
    row: "Outdoor Living & Garden",
  },
  {
    keywords: [
      "sofa", "sectional", "armchair", "accent chair", "bookcase", "bookshelf",
      "ottoman", "coffee table", "tv console", "platform bed", "bed frame",
      "nightstand", "dresser", "dining table", "bar stool", "standing desk",
      "task chair", "hall tree", "coat rack", "console table",
    ],
    row: "Furniture",
  },
  {
    keywords: [
      "chandelier", "pendant", "ceiling light", "flush mount", "wall sconce",
      "floor lamp", "table lamp", "desk lamp", "bedside lamp", "buffet lamp",
      "string light", "bistro light", "smart bulb", "led strip", "lamp", "sconce",
      "fixture", "torchiere", "reading lamp",
    ],
    row: "Lighting",
  },
  {
    keywords: [
      "area rug", "wool rug", "jute rug", "shag rug", "runner", "dhurrie", " rug",
    ],
    row: "Rugs",
  },
  {
    keywords: [
      "party plate", "party tableware", "biodegradable plate", "paper cup",
      "balloon", "confetti", "banner", "party favor", "party decoration", "party supply",
    ],
    row: "Party Supplies",
  },
  {
    keywords: [
      "bowl", "creamer", "sugar", "saute", "sauté", "kettle", "knife", "napkin",
      "placemat", "ceramic", "serve", "cookware", "pan ", "pans", "block set",
      "kitchen", "dining", "turkey",
    ],
    row: "Kitchen & Dining",
  },
];

export function hashLabel(label: string): number {
  let h = 0;
  for (let i = 0; i < label.length; i++) {
    h = (Math.imul(31, h) + label.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function rowForPlanItem(itemName: string): string {
  const lower = itemName.toLowerCase();
  for (const { keywords, row } of CATEGORY_RULES) {
    if (keywords.some((kw) => lower.includes(kw))) return row;
  }
  return "Kitchen & Dining";
}

export function estimateRevenueM(label: string, planRevenues: Record<string, number>): number {
  const stored = planRevenues[label];
  if (stored != null && stored > 0) return stored;
  return 0.85 + (hashLabel(label) % 14) / 10;
}

function peakSellMonth(label: string): number {
  const lower = label.toLowerCase();
  const h = hashLabel(label);

  if (/\b(halloween|spooky|skeleton|pumpkin|animatronic)\b/.test(lower)) return 10;
  if (/\b(thanksgiving|turkey|harvest)\b/.test(lower)) return 0;
  if (/\b(christmas|wreath|ornament|nutcracker|advent|nativity|tinsel)\b/.test(lower)) return 1;
  if (/\b(valentine|heart)\b/.test(lower)) return 3;
  if (/\b(easter|spring floral)\b/.test(lower)) return 5;
  if (/\b(party|balloon|plate|favor|confetti|cupcake)\b/.test(lower)) return 2 + (h % 4);
  if (/\b(outdoor|patio|grill|garden|umbrella|fire pit|planter)\b/.test(lower)) return 6 + (h % 3);
  if (/\b(school|college|dorm|backpack|btc|bts)\b/.test(lower)) return 9;
  if (/\b(labour|labor day)\b/.test(lower)) return 6;
  if (/\b(lamp|light|sconce|chandelier|pendant)\b/.test(lower)) return 8 + (h % 3);
  if (/\b(rug|runner)\b/.test(lower)) return 4 + (h % 5);

  return 1 + (h % 10);
}

function clampSchedule(startMonth: number, span: number): { startMonth: number; span: number } {
  const start = Math.max(0, Math.min(11, startMonth));
  const spanClamped = Math.max(1, Math.min(6, span, 12 - start));
  return { startMonth: start, span: spanClamped };
}

/** Acquisition window leading into peak sell — staggered per item, longer when revenue is higher. */
export function acquisitionWindowForItem(
  label: string,
  revenueM: number,
): { row: string; startMonth: number; span: number } {
  const h = hashLabel(label);
  const row = rowForPlanItem(label);
  const peak = peakSellMonth(label);

  const spanBase =
    revenueM >= 2.5 ? 4 : revenueM >= 1.8 ? 3 : revenueM >= 1.2 ? 2 : 1 + (h % 3);
  const span = spanBase + (h % 2);

  const leadWeeksJitter = h % 4;
  let startMonth = peak - span + 1 + Math.floor(leadWeeksJitter / 2);
  startMonth = ((startMonth % 12) + 12) % 12;
  startMonth = (startMonth + (h % 3)) % 12;

  const { startMonth: start, span: spanClamped } = clampSchedule(startMonth, span);
  return { row, startMonth: start, span: spanClamped };
}

export function schedulePlanItems(
  labels: string[],
  planRevenues: Record<string, number> = {},
): Array<{ label: string; row: string; startMonth: number; span: number }> {
  return labels.map((label) => {
    const revenueM = estimateRevenueM(label, planRevenues);
    const window = acquisitionWindowForItem(label, revenueM);
    return { label, ...window };
  });
}
