import { generateObject } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { z } from "zod";
import { loadMockJson, type ItemType } from "@/lib/agents/mock-loader";

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

const scheduleSchema = z.object({
  scheduledItems: z.array(
    z.object({
      label: z.string().describe("Exact item name as provided in the input list"),
      row: z
        .enum(["Kitchen & Dining", "Lighting"])
        .describe("Calendar row — use the category the item belongs to"),
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

// Quarter → starting month index mapping (0=Nov, fiscal year start)
const QUARTER_START: Record<string, number> = {
  Q1: 0,  // Nov-Dec
  Q2: 2,  // Jan-Feb
  Q3: 4,  // Mar-Jun
  Q4: 8,  // Jul-Oct (8=Jul in our index)
};

export async function POST(req: Request) {
  const { planItems } = (await req.json()) as { planItems: string[] };

  if (!planItems?.length) {
    return Response.json({ error: "No items to schedule" }, { status: 400 });
  }

  // Load item types to extract launch quarter guidance
  const itemTypes = loadMockJson<ItemType>("mock/target/item_types.json");

  // For each plan item, find a matching item type to get the recommended quarter
  const itemHints = planItems.map((planItem) => {
    const planWords = planItem.toLowerCase().split(/\s+/);
    const match = itemTypes.find((it) =>
      planWords.some(
        (w) => w.length > 3 && it.name.toLowerCase().includes(w),
      ) ||
      it.name
        .toLowerCase()
        .split(/\s+/)
        .some((w) => w.length > 3 && planItem.toLowerCase().includes(w)),
    );
    return {
      name: planItem,
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
            `- ${h.name}: recommended ${h.recommendedQuarter} (startMonth ~${h.recommendedStartMonth})${h.opportunityScore ? `, ${h.opportunityScore}% opportunity score` : ""}`,
        )
        .join("\n")}\n`
    : "";

  const { object } = await generateObject({
    model: groq("llama-3.3-70b-versatile"),
    schema: scheduleSchema,
    prompt: `You are a retail assortment planner for Target Plus. Schedule these product items on the FY 2025-26 calendar.

Items to schedule:
${planItems.map((item, i) => `${i + 1}. ${item}`).join("\n")}
${hintsContext}
Calendar structure:
- 12 months: Nov(0), Dec(1), Jan(2), Feb(3), Mar(4), Apr(5), May(6), Jun(7), Jul(8), Aug(9), Sep(10), Oct(11)
- Two rows: "Kitchen & Dining" and "Lighting"
- Seasons: Fall=Nov-Dec(0-1), Winter=Jan-Feb(2-3), Summer=Mar-Jun(4-7), Spring=Jul-Oct(8-11)
- Key retail events: Thanksgiving(Nov/0), Christmas(Dec/1), New Year(Jan/2), Valentine's(Feb/3), Easter(Mar/4), Labour Day(Jul/8), Back to School(Aug/9), Halloween(Oct/11)

Scheduling rules:
1. Kitchen & Dining items → row "Kitchen & Dining". Lighting items → row "Lighting". If unsure, use "Kitchen & Dining".
2. If Market Intelligence above provides a recommended startMonth, use it (±1 month is fine to avoid collisions).
3. Give each item a span of 2-4 months.
4. Do NOT schedule two items in the same row with overlapping months. Stagger start months.
5. Every item in the input list must appear in the output exactly once.

Return a schedule for all ${planItems.length} items.`,
    temperature: 0.2,
  });

  return Response.json(object);
}
