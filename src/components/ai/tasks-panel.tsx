"use client";

import { ArrowRight, Loader2, MoreHorizontal, Send, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";

import { cn } from "@/lib/utils";
import type { BeaconPage } from "@/lib/agents/system-prompt";

export interface RecommendedTask {
  id: string;
  title: string;
  description: string;
  actionLabel: string;
  actionHref?: string;
}

const STARTER_PROMPTS = [
  "Which product types are driving growth for competitors?",
  "Which viral products have high search volume but low Target coverage?",
  "Show categories with weak onboarding pipeline coverage.",
  "Who are the top confidence sellers for Lighting?",
];

interface TasksPanelProps {
  tasks: RecommendedTask[];
  defaultTab?: "tasks" | "beacon";
  page?: BeaconPage;
}

export function TasksPanel({ tasks, defaultTab = "tasks", page }: TasksPanelProps) {
  const [activeTab, setActiveTab] = useState<"tasks" | "beacon">(defaultTab);
  const [inputValue, setInputValue] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const { messages, append, isLoading, error } = useChat({
    api: "/api/beacon",
    body: { page },
    id: `beacon-${page ?? "global"}`,
  });

  useEffect(() => {
    if (activeTab === "beacon") {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, activeTab]);

  function handleSubmit(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    setInputValue("");
    append({ role: "user", content: trimmed });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(inputValue);
    }
  }

  return (
    <aside
      className="fixed inset-y-0 right-0 z-[var(--z-drawer)] flex w-[var(--tasks-panel-width)] flex-col border-l border-[var(--color-border)] bg-[var(--color-tasks-panel)]"
      aria-label="Tasks and AI assistant"
    >
      <div className="border-b border-[var(--color-border)] p-[var(--space-3)]">
        <div className="flex rounded-[var(--radius-md)] border border-[var(--color-border)] p-0.5">
          <button
            type="button"
            onClick={() => setActiveTab("tasks")}
            className={cn(
              "flex-1 rounded-[var(--radius-sm)] px-3 py-1.5 text-[var(--text-caption-size)] font-medium transition-colors",
              activeTab === "tasks"
                ? "bg-[var(--color-tasks-tab-active)] text-white"
                : "bg-[var(--color-tasks-tab-inactive)] text-[var(--color-muted-foreground)]",
            )}
          >
            Tasks
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("beacon")}
            className={cn(
              "flex-1 rounded-[var(--radius-sm)] px-3 py-1.5 text-[var(--text-caption-size)] font-medium transition-colors",
              activeTab === "beacon"
                ? "bg-[var(--color-tasks-tab-active)] text-white"
                : "bg-[var(--color-tasks-tab-inactive)] text-[var(--color-muted-foreground)]",
            )}
          >
            Chat with Beacon
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-[var(--space-4)]">
        {activeTab === "tasks" ? (
          <>
            <h2 className="mb-[var(--space-4)] text-[var(--text-section-size)] font-semibold text-[var(--color-foreground)]">
              Recommended Tasks
            </h2>
            <div className="space-y-[var(--space-3)]">
              {tasks.map((task) => (
                <article
                  key={task.id}
                  className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card)] p-[var(--space-4)] shadow-[var(--shadow-low)]"
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <Sparkles
                      className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-ai-sparkle)]"
                      aria-hidden
                    />
                    <button
                      type="button"
                      className="text-[var(--color-muted-foreground)]"
                      aria-label="More options"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                  <h3 className="text-[var(--text-body-size)] font-medium leading-snug text-[var(--color-foreground)]">
                    {task.title}
                  </h3>
                  <p className="mt-1 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
                    {task.description}
                  </p>
                  {task.actionHref ? (
                    <Link
                      href={task.actionHref}
                      className="mt-3 inline-flex items-center gap-1 text-[var(--text-caption-size)] font-medium text-[var(--color-primary)] hover:underline"
                    >
                      {task.actionLabel}
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className="mt-3 inline-flex items-center gap-1 text-[var(--text-caption-size)] font-medium text-[var(--color-primary)] hover:underline"
                    >
                      {task.actionLabel}
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  )}
                </article>
              ))}
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col">
            {messages.length === 0 ? (
              <div className="space-y-[var(--space-2)]">
                <p className="text-[var(--text-label-size)] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                  Try asking
                </p>
                {STARTER_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => handleSubmit(prompt)}
                    className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-[var(--space-3)] py-[var(--space-2)] text-left text-[var(--text-caption-size)] text-[var(--color-foreground)] transition-colors hover:border-[var(--color-primary)] hover:bg-[var(--color-ai-insight)]"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-[var(--space-3)]">
                {messages.map((msg) => (
                  <div key={msg.id} className={msg.role === "user" ? "flex justify-end" : ""}>
                    {msg.role === "user" ? (
                      <div className="max-w-[90%] rounded-[var(--radius-lg)] bg-[var(--color-primary)] px-[var(--space-3)] py-[var(--space-2)] text-[var(--text-caption-size)] text-[var(--color-primary-foreground)]">
                        {msg.content}
                      </div>
                    ) : (
                      <div className="rounded-[var(--radius-md)] border border-[var(--color-ai-insight-border)] bg-[var(--color-ai-insight)] px-[var(--space-3)] py-[var(--space-2)]">
                        <div className="mb-1 flex items-center gap-1">
                          <Sparkles className="h-3 w-3 text-[var(--color-primary)]" aria-hidden />
                          <span className="text-[10px] font-medium text-[var(--color-primary)]">Beacon</span>
                        </div>
                        <p className="whitespace-pre-wrap text-[var(--text-caption-size)] text-[var(--color-foreground)]">
                          {msg.content}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="rounded-[var(--radius-md)] border border-[var(--color-ai-insight-border)] bg-[var(--color-ai-insight)] px-[var(--space-3)] py-[var(--space-2)]">
                    <div className="flex items-center gap-2 text-[var(--color-muted-foreground)]">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span className="text-[var(--text-caption-size)]">Thinking…</span>
                    </div>
                  </div>
                )}
                {error && (
                  <div className="rounded-[var(--radius-md)] border border-red-200 bg-red-50 px-[var(--space-3)] py-[var(--space-2)] text-[var(--text-caption-size)] text-red-700">
                    Error: make sure Ollama is running (<code>ollama serve</code>)
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            )}
          </div>
        )}
      </div>

      {activeTab === "beacon" && (
        <div className="shrink-0 border-t border-[var(--color-border)] p-[var(--space-2)]">
          <div className="flex items-end gap-1.5">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Beacon…"
              rows={1}
              className="flex-1 resize-none rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-[var(--space-2)] py-[var(--space-2)] text-[var(--text-caption-size)] placeholder:text-[var(--color-muted-foreground)] focus:border-[var(--color-primary)] focus:outline-none"
              style={{ maxHeight: "80px", overflowY: "auto" }}
              aria-label="Message Beacon"
            />
            <button
              type="button"
              onClick={() => handleSubmit(inputValue)}
              disabled={isLoading || !inputValue.trim()}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary)] text-[var(--color-primary-foreground)] transition-opacity disabled:opacity-40"
              aria-label="Send"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
