import { generateObject } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { z } from "zod";
import { sellers } from "@/lib/mock-data/sellers";
import { buildMarketIntelligenceContext, loadMockJson, type ItemType } from "@/lib/agents/mock-loader";

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

const schema = z.object({
  rankedSellers: z.array(
    z.object({
      sellerId: z.string().describe("The seller id from the provided list"),
      relevanceReason: z
        .string()
        .describe("One sentence: why this seller fits the assortment plan requirements"),
      planMatch: z
        .array(z.string())
        .describe("Which plan item types this seller can supply"),
    }),
  ),
  summary: z.string().describe("2-sentence summary of the discovery results"),
});

export async function POST(req: Request) {
  const { planItems } = (await req.json()) as { planItems: string[] };

  const sellerProfiles = sellers.map((s) => ({
    id: s.id,
    name: s.legalBusinessName,
    category: s.category,
    categories: s.categories,
    confidenceScore: s.confidenceScore,
    gmv: s.gmv,
    skus: s.skus,
    marketplaces: s.marketplaces,
    viralTrendy: s.viralTrendy,
    rating: s.rating,
    description: s.description,
  }));

  const planContext =
    planItems.length > 0
      ? `The assortment plan requires these item types:\n${planItems.map((item, i) => `${i + 1}. ${item}`).join("\n")}`
      : "No specific plan items provided. Rank all sellers by overall quality.";

  // Derive categories from plan items for market intelligence lookup
  const itemTypes = loadMockJson<ItemType>("mock/target/item_types.json");
  const matchedItemTypes = planItems.length > 0
    ? itemTypes.filter((it) =>
        planItems.some(
          (pi) =>
            it.name.toLowerCase().includes(pi.toLowerCase().split(" ")[0]) ||
            pi.toLowerCase().includes(it.name.toLowerCase().split(" ")[0]),
        ),
      )
    : itemTypes.slice(0, 10);

  const planCategories = [
    ...new Set([
      ...sellers.flatMap((s) => s.categories),
      ...matchedItemTypes.map((it) => it.categoryId.replace("cat_", "").replace(/_/g, " ")),
    ]),
  ];

  const marketIntelligence = buildMarketIntelligenceContext(planCategories);

  const itemTypesContext =
    matchedItemTypes.length > 0
      ? `\n## Target Item Types Intelligence (from market analysis)\n${matchedItemTypes
          .slice(0, 8)
          .map(
            (it) =>
              `- ${it.name}: ${(it.opportunityScore * 100).toFixed(0)}% opportunity score, ${(it.trendScore * 100).toFixed(0)}% trend, launch ${it.recommendedLaunchQuarter}`,
          )
          .join("\n")}`
      : "";

  const { object } = await generateObject({
    model: groq("llama-3.3-70b-versatile"),
    schema,
    prompt: `You are a Discovery Agent for Target Plus Marketplace.

${planContext}

Available sellers in our database:
${JSON.stringify(sellerProfiles, null, 2)}
${itemTypesContext}
${marketIntelligence}

Task: Rank ALL ${sellers.length} sellers by how well they match the assortment plan requirements.

Ranking criteria:
- Category alignment with plan item types (most important)
- Confidence score and GMV potential
- Marketplace presence (multi-marketplace = higher trust)
- Viral/trendy signal and trend alignment with market data
- Operational readiness (more SKUs = broader coverage)
- Use market intelligence above to validate trend fit

Every seller must appear exactly once in the output, sorted best-match first.
For planMatch, list only item types from the plan that this seller could realistically supply.
If a seller has no category match to the plan, planMatch can be empty but still include the seller.`,
    temperature: 0.2,
  });

  return Response.json(object);
}
