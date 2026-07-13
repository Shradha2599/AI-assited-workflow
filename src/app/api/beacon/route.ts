import { streamText } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { buildSystemPrompt, type BeaconPage } from "@/lib/agents/system-prompt";
import { loadPageData } from "@/lib/agents/context-loader";

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  if (!process.env.GROQ_API_KEY) {
    return new Response(
      JSON.stringify({ error: "GROQ_API_KEY environment variable is not set." }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const { messages, page, contextSummary, pathname } = (await req.json()) as {
    messages: { role: "user" | "assistant"; content: string }[];
    page?: BeaconPage;
    contextSummary?: string;
    pathname?: string;
  };

  const resolvedPage = page ?? "unknown";
  const pageData = loadPageData(resolvedPage, pathname);
  const systemPrompt = buildSystemPrompt(resolvedPage);

  const sessionContext = [
    contextSummary?.trim(),
    pathname ? `Active URL path: ${pathname}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  const fullSystem = [systemPrompt, pageData, sessionContext].filter(Boolean).join("\n\n");

  const result = streamText({
    model: groq("llama-3.3-70b-versatile"),
    system: fullSystem,
    messages,
    temperature: 0.4,
    maxTokens: 1024,
  });

  return result.toDataStreamResponse();
}
