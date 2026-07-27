"use client";

import { Sparkles, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { AiFieldSuggestion } from "@/lib/mock-data/onboarding-evaluation";
import { useOnboardingReviewStore } from "../store/onboarding-review-store";

export function AiRecommendationModal() {
  const open = useOnboardingReviewStore((s) => s.recommendationModalOpen);
  const context = useOnboardingReviewStore((s) => s.recommendationContext);
  const closeRecommendationModal = useOnboardingReviewStore((s) => s.closeRecommendationModal);
  const applyAiRecommendation = useOnboardingReviewStore((s) => s.applyAiRecommendation);

  if (!open || !context) return null;

  function handleApply() {
    applyAiRecommendation(
      context!.alertId,
      context!.taskApproveId,
      context!.toastMessage,
      context!.approveOnApply,
    );
  }

  return (
    <>
      <div
        className="fixed inset-0 z-[calc(var(--z-drawer)+3)] bg-black/40"
        onClick={closeRecommendationModal}
        aria-hidden
      />

      <div
        role="dialog"
        aria-labelledby="ai-recommendation-title"
        aria-modal="true"
        className="fixed left-1/2 top-1/2 z-[calc(var(--z-drawer)+4)] max-h-[85vh] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-2">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-primary)]" />
            <div>
              <h2 id="ai-recommendation-title" className="text-[var(--text-body-size)] font-semibold">
                {context.title}
              </h2>
              <p className="mt-1 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
                {context.subtitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeRecommendationModal}
            className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          {context.fields.map((field) => (
            <FieldSuggestionBlock key={field.fieldId} field={field} />
          ))}
        </div>

        <div className="mt-6 flex justify-end gap-2 border-t border-[var(--color-border)] pt-4">
          <Button variant="outline" size="sm" onClick={closeRecommendationModal}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleApply}>
            Apply recommendation
          </Button>
        </div>
      </div>
    </>
  );
}

function FieldSuggestionBlock({ field }: { field: AiFieldSuggestion }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-4">
      <p className="text-[var(--text-caption-size)] font-semibold text-[var(--color-foreground)]">
        {field.label}
      </p>
      <p className="mt-1 text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">
        {field.reason}
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="rounded-[var(--radius-sm)] bg-[var(--color-muted)]/40 p-3">
          <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
            Partner submitted
          </p>
          <p className="mt-1 text-[var(--text-caption-size)] text-[var(--color-foreground)]">
            {field.submittedValue}
          </p>
        </div>
        <div className="rounded-[var(--radius-sm)] border border-[var(--color-ai-insight-border)] bg-[var(--color-ai-insight)] p-3">
          <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--color-primary)]">
            AI suggestion
          </p>
          <p className="mt-1 text-[var(--text-caption-size)] text-[var(--color-foreground)]">
            {field.suggestedValue}
          </p>
        </div>
      </div>
    </div>
  );
}
