import { generateObject } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { z } from "zod";

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

export async function POST(req: Request) {
  const { planItems } = (await req.json()) as { planItems: string[] };

  if (!planItems?.length) {
    return Response.json({ error: "No items to schedule" }, { status: 400 });
  }

  const { object } = await generateObject({
    model: groq("llama-3.3-70b-versatile"),
    schema: scheduleSchema,
    prompt: `You are a retail assortment planner for Target Plus. Schedule these product items on the FY 2025-26 calendar.

Items to schedule:
${planItems.map((item, i) => `${i + 1}. ${item}`).join("\n")}

Calendar structure:
- 12 months: Nov(0), Dec(1), Jan(2), Feb(3), Mar(4), Apr(5), May(6), Jun(7), Aug(8), Sep(9), Oct(10), Nov(11)
- Wait — correct month indices: 0=Nov, 1=Dec, 2=Jan, 3=Feb, 4=Mar, 5=Apr, 6=May, 7=Jun, 8=Jul, 9=Aug, 10=Sep, 11=Oct
- Two rows: "Kitchen & Dining" and "Lighting"
- Seasons: Fall=Nov-Dec, Winter=Jan-Feb, Summer=Mar-Jun, Spring=Jul-Oct
- Key retail events: Thanksgiving(Nov), Christmas(Dec), New Year(Jan), Valentine's(Feb), Easter(Mar), Labour Day(Jul), Back to School(Aug), Halloween(Oct)

Scheduling rules:
1. Kitchen & Dining items → row "Kitchen & Dining". Lighting items → row "Lighting". If unsure, use "Kitchen & Dining".
2. Schedule serving/entertaining items (bowls, platters, cake stands) for peak holiday windows: Nov-Jan (startMonth 0-2).
3. Schedule lighting items for spring/summer: Mar-Aug (startMonth 4-8).
4. Give each item a span of 2-4 months.
5. Do NOT schedule two items in the same row with overlapping months. Stagger start months so they don't collide.
6. Every item in the input list must appear in the output exactly once.

Return a schedule for all ${planItems.length} items.`,
    temperature: 0.2,
  });

  return Response.json(object);
}
