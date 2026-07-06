import { generateObject } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { z } from "zod";
import { loadMockJson, type ItemType } from "@/lib/agents/mock-loader";

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

// ── Category → row (mirrors rowForItem in assortment-calendar.tsx) ─────────────
const CATEGORY_RULES: Array<{ keywords: string[]; row: string }> = [
  {
    keywords: ["christmas", "halloween", "thanksgiving", "easter", "holiday", "festive",
               "wreath", "garland", "nutcracker", "advent", "nativity", "skeleton",
               "animatronic", "inflatable", "pumpkin", "harvest", "tinsel"],
    row: "Holiday & Festive Decor",
  },
  {
    keywords: ["patio", "grill", "smoker", "propane", "outdoor cooking", "backyard",
               "griddle station", "camp stove", "pizza oven", "adirondack", "bistro set",
               "lounge set", "egg chair", "solar pathway", "solar stake", "fire pit",
               "outdoor umbrella", "weatherproof", "raised garden", "planter",
               "hanging basket", "garden tool", "pruning", "hose reel",
               "outdoor decor", "garden statue", "wind chime", "outdoor lantern",
               "outdoor throw", "outdoor rug", "outdoor flat-weave", "plastic patio", "outdoor"],
    row: "Outdoor Living & Garden",
  },
  {
    keywords: ["sofa", "sectional", "armchair", "accent chair", "velvet chair",
               "bookcase", "bookshelf", "ottoman", "storage bench", "coffee table",
               "lift-top", "tv console", "media unit", "platform bed", "bed frame",
               "headboard", "nightstand", "dresser", "drawer", "dining table set",
               "dining chair", "bar stool", "standing desk", "task chair",
               "l-shaped desk", "wall desk", "hall tree", "coat rack", "console table",
               "entryway bench", "nesting table", "accent table"],
    row: "Furniture",
  },
  {
    keywords: ["chandelier", "pendant light", "pendant kit", "ceiling light",
               "flush mount", "semi-flush", "wall sconce", "swing-arm",
               "picture light", "floor lamp", "arc floor", "tripod lamp",
               "torchiere", "reading lamp", "table lamp", "desk lamp",
               "bedside lamp", "buffet lamp", "outdoor wall lantern",
               "string light", "bistro light", "festoon", "motion-sensor flood",
               "deck light", "step light", "smart bulb", "led strip",
               "dimmer", "bias lighting", "lamp", "sconce", "fixture"],
    row: "Lighting",
  },
  {
    keywords: ["area rug", "wool rug", "persian rug", "moroccan rug", "jute rug",
               "shag rug", "flat-weave", "dhurrie", "cowhide", "faux-fur",
               "runner set", "kitchen runner", "hallway runner", "anti-fatigue",
               "polypropylene rug", "reversible plastic mat", "boho stripe",
               "washable runner", "non-slip runner", " rug"],
    row: "Rugs",
  },
  {
    keywords: ["party plate", "party tableware", "biodegradable plate",
               "bamboo plate", "paper cup", "acrylic glass", "gold cutlery",
               "balloon arch", "balloon garland", "foil balloon", "led balloon",
               "paper fan", "tassel", "confetti", "custom banner", "photo booth",
               "party favor", "candy bag", "mini succulent", "keychain favor",
               "party cake", "cupcake stand tower", "tiered snack tray",
               "party decoration", "party supply"],
    row: "Party Supplies",
  },
];

function rowForItem(itemName: string): string {
  const lower = itemName.toLowerCase();
  for (const { keywords, row } of CATEGORY_RULES) {
    if (keywords.some((kw) => lower.includes(kw))) return row;
  }
  return "Kitchen & Dining";
}

// Schema: AI only decides WHEN to schedule (not which row — we compute that)
const scheduleSchema = z.object({
  scheduledItems: z.array(
    z.object({
      label: z.string().describe("Exact item name as provided in the input list"),
      startMonth: z
        .number()
        .int()
        .min(0)
        .max(11)
        .describe(
          "Month index: 0=Nov, 1=Dec, 2=Jan, 3=Feb, 4=Mar, 5=Apr, 6=May, 7=Jun, 8=Jul, 9=Aug, 10=Sep, 11=Oct",
        ),
      span: z
        .number()
        .int()
        .min(1)
        .max(6)
        .describe("Duration in months — typically 2 to 4"),
    }),
  ),
});

const QUARTER_START: Record<string, number> = {
  Q1: 0,  // Nov–Jan
  Q2: 3,  // Feb–Apr
  Q3: 6,  // May–Jul
  Q4: 9,  // Aug–Oct
};

export async function POST(req: Request) {
  if (!process.env.GROQ_API_KEY) {
    return new Response(
      JSON.stringify({ error: "GROQ_API_KEY environment variable is not set." }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
  const { planItems } = (await req.json()) as { planItems: string[] };

  if (!planItems?.length) {
    return Response.json({ error: "No items to schedule" }, { status: 400 });
  }

  const itemTypes = loadMockJson<ItemType>("mock/target/item_types.json");

  const itemHints = planItems.map((planItem) => {
    const planWords = planItem.toLowerCase().split(/\s+/);
    const match = itemTypes.find(
      (it) =>
        planWords.some((w) => w.length > 3 && it.name.toLowerCase().includes(w)) ||
        it.name.toLowerCase().split(/\s+/).some((w) => w.length > 3 && planItem.toLowerCase().includes(w)),
    );
    return {
      name: planItem,
      row: rowForItem(planItem),
      recommendedQuarter: match?.recommendedLaunchQuarter ?? null,
      recommendedStartMonth: match ? QUARTER_START[match.recommendedLaunchQuarter] ?? null : null,
      opportunityScore: match ? Math.round(match.opportunityScore * 100) : null,
    };
  });

  const hintsContext = itemHints.some((h) => h.recommendedQuarter)
    ? `\n## Market Intelligence — Recommended Launch Windows\n${itemHints
        .filter((h) => h.recommendedQuarter)
        .map(
          (h) =>
            `- ${h.name} [${h.row}]: recommended ${h.recommendedQuarter} (startMonth ~${h.recommendedStartMonth ?? "?"})${h.opportunityScore ? `, ${h.opportunityScore}% opportunity score` : ""}`,
        )
        .join("\n")}\n`
    : "";

  const { object } = await generateObject({
    model: groq("llama-3.3-70b-versatile"),
    schema: scheduleSchema,
    prompt: `You are a retail assortment planner. Schedule these product items on the FY 2025-26 calendar (only decide WHEN, not which category row).

Items to schedule:
${itemHints.map((h, i) => `${i + 1}. ${h.name} [category: ${h.row}]`).join("\n")}
${hintsContext}
Calendar: 12 months — Nov(0), Dec(1), Jan(2), Feb(3), Mar(4), Apr(5), May(6), Jun(7), Jul(8), Aug(9), Sep(10), Oct(11)
Key retail events: Thanksgiving(0), Christmas(1), New Year(2), Valentine's(3), Easter(5), Labour Day(6), Back to School(9), Halloween(11)

Rules:
1. Use market intelligence startMonth hints when provided.
2. Seasonal items: Holiday → Q1 (Nov-Jan, 0-2). Outdoor/Garden → Q2-Q3 (Mar-Jul, 4-8). Party → any quarter.
3. Give each item a span of 2-4 months.
4. Stagger items within the same category so they don't all start the same month.
5. Every item must appear exactly once.

Return a schedule for all ${planItems.length} items.`,
    temperature: 0.2,
  });

  // Attach the correct row computed server-side (not from AI)
  const withRows = object.scheduledItems.map((item) => ({
    ...item,
    row: rowForItem(item.label),
  }));

  return Response.json({ scheduledItems: withRows });
}
