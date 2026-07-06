"use client";

import { Sparkles, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useOnboardingReviewStore } from "../store/onboarding-review-store";

export function AgentFeedbackModal() {
  const feedbackOpen = useOnboardingReviewStore((s) => s.feedbackOpen);
  const feedbackContext = useOnboardingReviewStore((s) => s.feedbackContext);
  const closeFeedback = useOnboardingReviewStore((s) => s.closeFeedback);
  const submitFeedback = useOnboardingReviewStore((s) => s.submitFeedback);
  const [reason, setReason] = useState("");

  if (!feedbackOpen || !feedbackContext) return null;

  function handleSubmit() {
    const trimmed = reason.trim();
    if (!trimmed) return;
    submitFeedback(trimmed);
    setReason("");
  }

  function handleClose() {
    setReason("");
    closeFeedback();
  }

  return (
    <>
      <div className="fixed inset-0 z-[calc(var(--z-drawer)+3)] bg-black/40" onClick={handleClose} aria-hidden />

      <div
        role="dialog"
        aria-labelledby="feedback-modal-title"
        aria-modal="true"
        className="fixed left-1/2 top-1/2 z-[calc(var(--z-drawer)+4)] w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-2">
            <Sparkles className="mt-0.5 h-5 w-5 text-[var(--color-primary)]" />
            <div>
              <h2 id="feedback-modal-title" className="text-[var(--text-body-size)] font-semibold">
                Reject agent recommendation
              </h2>
              <p className="mt-1 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
                Help train the evaluation agent by explaining why this recommendation is incorrect.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-4 rounded-[var(--radius-md)] border border-[var(--color-ai-insight-border)] bg-[var(--color-ai-insight)] p-3">
          <p className="text-[var(--text-label-size)] font-medium text-[var(--color-primary)]">
            Agent recommendation
          </p>
          <p className="mt-1 text-[var(--text-caption-size)] font-semibold">{feedbackContext.title}</p>
          <p className="mt-0.5 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
            {feedbackContext.agentMessage}
          </p>
        </div>

        <label className="block">
          <span className="text-[var(--text-caption-size)] font-medium">Why are you rejecting this?</span>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Image meets our guidelines; resolution was misread by the agent."
            rows={4}
            className="mt-1.5 w-full resize-none rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--text-caption-size)] placeholder:text-[var(--color-muted-foreground)] focus:border-[var(--color-primary)] focus:outline-none"
          />
        </label>

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={handleClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={!reason.trim()}>
            Submit feedback
          </Button>
        </div>
      </div>
    </>
  );
}
