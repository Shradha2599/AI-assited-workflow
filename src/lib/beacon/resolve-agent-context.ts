import type { RecommendedTask } from "@/components/ai/tasks-panel";
import type { BeaconContextInput, BeaconContextResult } from "@/lib/beacon/beacon-context";
import { getPageForPath } from "@/lib/beacon/beacon-context";
import {
  buildBusinessContext,
  businessContextToPrompt,
  type BuildBusinessContextOptions,
} from "@/lib/beacon/business-context/build-business-context";
import { runBeaconReasoning } from "@/lib/beacon/engines/beacon-reasoning";
import { generateAgentRecommendations } from "@/lib/beacon/engines/recommendation-engine";
import { generateConversationStarters } from "@/lib/beacon/engines/conversation-starter-engine";
import { generateChatOpening } from "@/lib/beacon/engines/chat-opening-engine";
import { pageFromPath, sortRecommendationsForPage } from "@/lib/beacon/engines/page-recommendation-mapper";
import type { FiscalYearId } from "@/lib/mock-data/fy-plan-seeds";

export interface AgentContextInput extends BeaconContextInput {
  fiscalYear: FiscalYearId;
  discoveryShortlisted: number;
  discoveryContacted: number;
  discoveryDiscovered: number;
  acquisitionOutreachShareItems: string[];
  calendarVersionName: string;
}

export interface AgentBeaconContext extends BeaconContextResult {
  openingMessage: string;
  businessContextSummary: string;
}

export function resolveAgentBeaconContext(input: AgentContextInput): AgentBeaconContext {
  const page = getPageForPath(input.pathname) ?? pageFromPath(input.pathname);

  const ctx = buildBusinessContext({
    ...input,
    page,
  } as BuildBusinessContextOptions);

  const reasoning = runBeaconReasoning(ctx);
  let tasks = generateAgentRecommendations({ ctx, reasoning });
  tasks = sortRecommendationsForPage(page, tasks);

  const starters = generateConversationStarters(ctx, reasoning, page);
  const openingMessage = generateChatOpening(ctx, reasoning);
  const contextSummary = [
    businessContextToPrompt(ctx),
    "",
    "Beacon reasoning:",
    ...reasoning.summaryLines.map((l) => `- ${l}`),
  ].join("\n");

  return {
    page,
    tasks,
    insights: [],
    starters,
    contextSummary,
    openingMessage,
    businessContextSummary: businessContextToPrompt(ctx),
  };
}

export function mergeWorkflowTasks(
  agentTasks: RecommendedTask[],
  workflowTasks: RecommendedTask[],
): RecommendedTask[] {
  const seen = new Set(agentTasks.map((t) => t.id));
  const merged = [...agentTasks];
  for (const t of workflowTasks) {
    if (!seen.has(t.id)) merged.push(t);
  }
  return merged.slice(0, 8);
}
