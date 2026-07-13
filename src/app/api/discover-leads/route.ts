import { generateObject } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { z } from "zod";
import { sellers, type Seller } from "@/lib/mock-data/sellers";
import { buildMarketIntelligenceContext, loadMockJson, type ItemType } from "@/lib/agents/mock-loader";

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

const LLM_RANK_LIMIT = 60;

function selectCandidatesForRanking(allSellers: Seller[], planItems: string[]): Seller[] {
  if (allSellers.length <= LLM_RANK_LIMIT) return allSellers;

  let pool = allSellers;
  if (planItems.length > 0) {
    const matched = allSellers.filter((s) =>
      planItems.some((pi) => {
        const piLower = pi.toLowerCase();
        return s.categories.some(
          (c) =>
            piLower.includes(c.toLowerCase().split(" ")[0]) ||
            c.toLowerCase().includes(piLower.split(" ")[0]),
        );
      }),
    );
    if (matched.length >= 20) pool = matched;
  }

  return [...pool].sort((a, b) => b.confidenceScore - a.confidenceScore).slice(0, LLM_RANK_LIMIT);
}

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
  if (!process.env.GROQ_API_KEY) {
    return new Response(
      JSON.stringify({ error: "GROQ_API_KEY environment variable is not set." }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
  const { planItems } = (await req.json()) as { planItems: string[] };

  const candidates = selectCandidatesForRanking(sellers, planItems);

  const sellerProfiles = candidates.map((s) => ({
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

Task: Rank ALL ${candidates.length} sellers by how well they match the assortment plan requirements.

Ranking criteria:
- Category alignment with plan item types (most important)
- Confidence score and GMV potential
- Marketplace presence (multi-marketplace = higher trust)
- Viral/trendy signal and trend alignment with market data
- Operational readiness (more SKUs = broader coverage)
- Use market intelligence above to validate trend fit

Every seller must appear exactly once in the output, sorted best-match first.
Use ONLY seller ids from the provided list — do not invent ids.
For planMatch, list only item types from the plan that this seller could realistically supply.
If a seller has no category match to the plan, planMatch can be empty but still include the seller.`,
    temperature: 0.2,
  });

  const candidateIds = new Set(candidates.map((s) => s.id));
  const rankedById = new Map(
    object.rankedSellers
      .filter((row) => candidateIds.has(row.sellerId))
      .map((row) => [row.sellerId, row]),
  );

  const rankedSellers = candidates.map((seller, index) => {
    const fromModel = rankedById.get(seller.id);
    if (fromModel) return fromModel;
    return {
      sellerId: seller.id,
      relevanceReason: `Ranked #${index + 1} by confidence and category fit for the current plan.`,
      planMatch: [] as string[],
    };
  });

  return Response.json({ ...object, rankedSellers });
}
