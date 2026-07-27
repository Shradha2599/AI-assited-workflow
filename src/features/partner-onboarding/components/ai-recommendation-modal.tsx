"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { BeaconFeedbackModal } from "@/components/ai/beacon-feedback-modal";
import { Button } from "@/components/ui/button";
import { SvgIcon } from "@/components/ui/svg-icon";
import type { AiFieldSuggestion } from "@/lib/mock-data/onboarding-evaluation";
import { useOnboardingReviewStore } from "../store/onboarding-review-store";

export function AiRecommendationModal() {
  const open = useOnboardingReviewStore((s) => s.recommendationModalOpen);
  const context = useOnboardingReviewStore((s) => s.recommendationContext);
  const closeRecommendationModal = useOnboardingReviewStore((s) => s.closeRecommendationModal);
  const applyAiRecommendation = useOnboardingReviewStore((s) => s.applyAiRecommendation);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) setFeedbackOpen(false);
  }, [open]);

  useEffect(() => {
    if (!open && !feedbackOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open, feedbackOpen]);

  if (!mounted) return null;

  if (!open && feedbackOpen) {
    return (
      <BeaconFeedbackModal
        open
        onClose={() => setFeedbackOpen(false)}
        zIndexClass="z-[calc(var(--z-drawer)+5)]"
      />
    );
  }

  if (!open || !context) return null;

  function handleApply() {
    applyAiRecommendation(
      context!.alertId,
      context!.taskApproveId,
      context!.toastMessage,
      context!.approveOnApply,
    );
  }

  function handleReject() {
    closeRecommendationModal();
    setFeedbackOpen(true);
  }

  const modal = (
    <>
      <div className="fixed inset-0 z-[calc(var(--z-drawer)+3)] bg-black/40" aria-hidden />

      <div className="fixed inset-0 z-[calc(var(--z-drawer)+4)] flex items-center justify-center p-4">
        <div
          role="dialog"
          aria-labelledby="ai-recommendation-title"
          aria-modal="true"
          className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-card)] shadow-[var(--shadow-drawer)]"
        >
          <div className="flex shrink-0 items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
            <h2
              id="ai-recommendation-title"
              className="text-[var(--text-body-size)] font-semibold text-[var(--color-foreground)]"
            >
              {context.title}
            </h2>
            <button
              type="button"
              onClick={closeRecommendationModal}
              className="rounded p-1 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
            <div className="space-y-6">
              {context.fields.map((field) => (
                <FieldSuggestionBlock key={field.fieldId} field={field} />
              ))}
            </div>
          </div>

          <div className="flex shrink-0 justify-end gap-2 border-t border-[var(--color-border)] px-5 py-3">
            <Button variant="ghost" size="sm" onClick={handleReject}>
              Reject
            </Button>
            <Button size="sm" onClick={handleApply}>
              Apply recommendation
            </Button>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(modal, document.body);
}

function FieldSuggestionBlock({ field }: { field: AiFieldSuggestion }) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-[var(--text-caption-size)] font-semibold text-[var(--color-foreground)]">
          {field.label}
        </p>
        <p className="mt-1 text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">
          {field.reason}
        </p>
      </div>
      <div className="flex flex-col gap-3">
        <AiSuggestionPanel value={field.suggestedValue} />
        <ComparisonPanel title="Partner submitted" value={field.submittedValue} />
      </div>
    </div>
  );
}

function AiSuggestionPanel({ value }: { value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[#f5f5f5] p-3">
      <SvgIcon name="aiSparkle" size={20} variant="primary" className="mt-0.5 shrink-0" alt="" />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
          AI suggestion
        </p>
        <p className="mt-1 text-[var(--text-caption-size)] text-[var(--color-foreground)]">{value}</p>
      </div>
    </div>
  );
}

function ComparisonPanel({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white p-3">
      <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
        {title}
      </p>
      <p className="mt-1 text-[var(--text-caption-size)] text-[var(--color-foreground)]">{value}</p>
    </div>
  );
}
