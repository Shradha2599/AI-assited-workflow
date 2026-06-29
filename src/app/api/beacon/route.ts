import { streamText } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { buildSystemPrompt, type BeaconPage } from "@/lib/agents/system-prompt";
import { loadPageData } from "@/lib/agents/context-loader";

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  const { messages, page } = (await req.json()) as {
    messages: { role: "user" | "assistant"; content: string }[];
    page?: BeaconPage;
  };

  const resolvedPage = page ?? "unknown";
  const pageData = loadPageData(resolvedPage);
  const systemPrompt = buildSystemPrompt(resolvedPage);

  const fullSystem = pageData
    ? `${systemPrompt}\n\n${pageData}`
    : systemPrompt;

  const result = streamText({
    model: groq("llama-3.3-70b-versatile"),
    system: fullSystem,
    messages,
    temperature: 0.4,
    maxTokens: 512,
  });

  return result.toDataStreamResponse();
}
