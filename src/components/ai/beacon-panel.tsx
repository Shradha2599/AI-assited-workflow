"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, X, Send, Loader2 } from "lucide-react";
import { useChat } from "@ai-sdk/react";

import { Button } from "@/components/ui/button";
import { useBeaconStore } from "@/features/beacon/store/beacon-store";
import type { BeaconPage } from "@/lib/agents/system-prompt";

const STARTER_PROMPTS = [
  "Which product types are driving growth for competitors?",
  "Which viral products have high search volume but low Target coverage?",
  "Show categories with weak onboarding pipeline coverage.",
  "Who are the top confidence sellers for Lighting?",
];

interface BeaconPanelProps {
  page?: BeaconPage;
}

export function BeaconPanel({ page }: BeaconPanelProps) {
  const { isOpen, toggle } = useBeaconStore();
  const messagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [inputValue, setInputValue] = useState("");

  const { messages, append, isLoading, error } = useChat({
    api: "/api/beacon",
    body: { page },
    id: `beacon-${page ?? "global"}`,
  });

  useEffect(() => {
    const el = messagesRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

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

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={toggle}
        className="fixed bottom-[var(--space-6)] right-[var(--space-6)] z-[var(--z-drawer)] flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-[var(--color-primary-foreground)] shadow-[var(--shadow-medium)]"
        aria-label="Open Beacon assistant"
      >
        <Sparkles className="h-4 w-4" aria-hidden />
        Beacon
      </button>
    );
  }

  return (
    <aside
      className="fixed inset-y-0 right-0 z-[var(--z-drawer)] flex w-[var(--beacon-width)] flex-col border-l border-[var(--color-border)] bg-[var(--color-beacon)] shadow-[var(--shadow-drawer)]"
      aria-label="Beacon AI assistant"
    >
      {/* Header */}
      <div className="flex h-[var(--topbar-height)] shrink-0 items-center justify-between border-b border-[var(--color-border)] px-[var(--space-4)]">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[var(--color-primary)]" aria-hidden />
          <div>
            <p className="text-sm font-semibold">Beacon</p>
            <p className="text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
              AI workflow assistant
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]"
          onClick={toggle}
          aria-label="Close Beacon"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <div ref={messagesRef} className="flex-1 overflow-y-auto p-[var(--space-4)]">
        {messages.length === 0 && (
          <div className="space-y-[var(--space-3)]">
            <p className="text-[var(--text-label-size)] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
              Try asking
            </p>
            {STARTER_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => handleSubmit(prompt)}
                className="w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] px-[var(--space-3)] py-[var(--space-2)] text-left text-[var(--text-body-size)] text-[var(--color-foreground)] transition-colors hover:border-[var(--color-primary)] hover:bg-[var(--color-ai-insight)]"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-[var(--space-3)] ${msg.role === "user" ? "flex justify-end" : ""}`}
          >
            {msg.role === "user" ? (
              <div className="max-w-[85%] rounded-[var(--radius-lg)] bg-[var(--color-primary)] px-[var(--space-3)] py-[var(--space-2)] text-[var(--text-body-size)] text-[var(--color-primary-foreground)]">
                {msg.content}
              </div>
            ) : (
              <div className="rounded-[var(--radius-lg)] border border-[var(--color-ai-insight-border)] bg-[var(--color-ai-insight)] px-[var(--space-3)] py-[var(--space-2)] text-[var(--text-body-size)] text-[var(--color-foreground)]">
                <div className="mb-1 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-[var(--color-primary)]" aria-hidden />
                  <span className="text-[var(--text-caption-size)] font-medium text-[var(--color-primary)]">
                    Beacon
                  </span>
                </div>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="mb-[var(--space-3)] rounded-[var(--radius-lg)] border border-[var(--color-ai-insight-border)] bg-[var(--color-ai-insight)] px-[var(--space-3)] py-[var(--space-2)]">
            <div className="flex items-center gap-2 text-[var(--color-muted-foreground)]">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span className="text-[var(--text-caption-size)]">Thinking…</span>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-[var(--space-3)] rounded-[var(--radius-lg)] border border-red-200 bg-red-50 px-[var(--space-3)] py-[var(--space-2)] text-[var(--text-body-size)] text-red-700">
            Something went wrong. Make sure Ollama is running: <code className="text-xs">ollama serve</code>
          </div>
        )}

      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-[var(--color-border)] p-[var(--space-3)]">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything…"
            rows={1}
            className="flex-1 resize-none rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-[var(--space-3)] py-[var(--space-2)] text-[var(--text-body-size)] placeholder:text-[var(--color-muted-foreground)] focus:border-[var(--color-primary)] focus:outline-none"
            style={{ maxHeight: "120px", overflowY: "auto" }}
            aria-label="Message Beacon"
          />
          <Button
            size="icon"
            onClick={() => handleSubmit(inputValue)}
            disabled={isLoading || !inputValue.trim()}
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-1 text-center text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
          Powered by Llama 3.1 · running locally
        </p>
      </div>
    </aside>
  );
}
