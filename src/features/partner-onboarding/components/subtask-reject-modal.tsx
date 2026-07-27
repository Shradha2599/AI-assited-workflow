"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";
import { useOnboardingReviewStore } from "../store/onboarding-review-store";

export function SubtaskRejectModal() {
  const open = useOnboardingReviewStore((s) => s.subtaskRejectOpen);
  const context = useOnboardingReviewStore((s) => s.subtaskRejectContext);
  const closeSubtaskReject = useOnboardingReviewStore((s) => s.closeSubtaskReject);
  const submitSubtaskReject = useOnboardingReviewStore((s) => s.submitSubtaskReject);
  const [reason, setReason] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) setReason("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!mounted || !open || !context) return null;

  function handleClose() {
    setReason("");
    closeSubtaskReject();
  }

  function handleSubmit() {
    const trimmed = reason.trim();
    if (!trimmed) return;
    submitSubtaskReject(trimmed);
    setReason("");
  }

  const modal = (
    <div className="fixed inset-0 z-[calc(var(--z-drawer)+5)]">
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} aria-hidden />
      <div className="relative flex h-full items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="subtask-reject-title"
          className="w-full max-w-md overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-card)] shadow-[var(--shadow-drawer)]"
        >
          <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
            <h2
              id="subtask-reject-title"
              className="text-[var(--text-body-size)] font-semibold text-[var(--color-foreground)]"
            >
              Reject {context.subtaskName}
            </h2>
            <button
              type="button"
              onClick={handleClose}
              className="rounded p-1 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="px-5 py-4">
            <label className="block">
              <span className="text-[var(--text-caption-size)] font-medium text-[var(--color-foreground)]">
                Reason for rejection
              </span>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain why this sub-task cannot be approved."
                rows={4}
                className="mt-1.5 w-full resize-none rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-[var(--text-caption-size)] placeholder:text-[var(--color-muted-foreground)] focus:border-[var(--color-primary)] focus:outline-none"
              />
            </label>
          </div>

          <div className="flex justify-end gap-2 border-t border-[var(--color-border)] px-5 py-3">
            <Button variant="ghost" size="sm" onClick={handleClose}>
              Cancel
            </Button>
            <Button size="sm" disabled={!reason.trim()} onClick={handleSubmit}>
              Reject
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
