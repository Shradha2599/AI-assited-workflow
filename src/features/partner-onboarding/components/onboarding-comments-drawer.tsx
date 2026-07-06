"use client";

import { Send, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { getTaskEvaluation } from "@/lib/mock-data/onboarding-evaluation";
import type { PotentialPartner } from "@/lib/mock-data/potential-partners";
import { useOnboardingReviewStore } from "../store/onboarding-review-store";

interface OnboardingCommentsDrawerProps {
  partner: PotentialPartner;
}

export function OnboardingCommentsDrawer({ partner }: OnboardingCommentsDrawerProps) {
  const commentsOpen = useOnboardingReviewStore((s) => s.commentsOpen);
  const activeTaskId = useOnboardingReviewStore((s) => s.activeTaskId);
  const closeComments = useOnboardingReviewStore((s) => s.closeComments);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const evaluation = activeTaskId
    ? getTaskEvaluation(partner.sellerId, activeTaskId)
    : undefined;

  useEffect(() => {
    if (commentsOpen && evaluation?.agentRecommendation) {
      setMessage(evaluation.agentRecommendation.suggestedComment);
      setSent(false);
    }
  }, [commentsOpen, evaluation]);

  if (!commentsOpen) return null;

  function handleSend() {
    if (!message.trim()) return;
    setSent(true);
  }

  return (
    <>
      <div className="fixed inset-0 z-[calc(var(--z-drawer)+1)] bg-black/20" onClick={closeComments} aria-hidden />

      <aside
        className="fixed bottom-0 top-[var(--topbar-height)] right-[var(--tasks-panel-width)] z-[calc(var(--z-drawer)+2)] flex w-[380px] flex-col border-l border-[var(--color-border)] bg-[var(--color-card)] shadow-xl"
        aria-label="Comments"
      >
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
          <h2 className="text-[var(--text-body-size)] font-semibold">Comments</h2>
          <button
            type="button"
            onClick={closeComments}
            className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
            aria-label="Close comments"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-4">
            <label className="text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">
              Visibility
            </label>
            <select className="mt-1 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-[var(--text-caption-size)]">
              <option>External</option>
              <option>Internal</option>
            </select>
          </div>

          <div className="space-y-3">
            <div className="flex gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-muted)] text-[var(--text-label-size)] font-semibold">
                JD
              </span>
              <div className="rounded-[var(--radius-md)] bg-[var(--color-muted)] px-3 py-2 text-[var(--text-caption-size)]">
                Will the brand description appear on display page on Target.com?
              </div>
            </div>
            <div className="flex gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-[10px] font-semibold text-white">
                TM
              </span>
              <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2 text-[var(--text-caption-size)]">
                Yes, that is right John.
              </div>
            </div>
          </div>

          {sent && (
            <div className="mt-4 rounded-[var(--radius-md)] border border-[var(--color-success-light)] bg-[var(--color-success-light)] px-3 py-2 text-[var(--text-caption-size)] text-[var(--color-success)]">
              Request sent to {partner.legalBusinessName}.
            </div>
          )}
        </div>

        <div className="border-t border-[var(--color-border)] p-4">
          <div className="mb-2 flex items-center gap-1.5 text-[var(--text-label-size)] text-[var(--color-primary)]">
            <Sparkles className="h-3 w-3" />
            Agent suggested message
          </div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="w-full resize-none rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--text-caption-size)] focus:border-[var(--color-primary)] focus:outline-none"
            aria-label="Comment message"
          />
          <Button size="sm" className="mt-2 w-full gap-1.5" onClick={handleSend} disabled={!message.trim() || sent}>
            <Send className="h-3.5 w-3.5" />
            {sent ? "Sent" : "Send to seller"}
          </Button>
        </div>
      </aside>
    </>
  );
}
