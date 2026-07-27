"use client";

import { Check, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";

export const BEACON_FEEDBACK_REASONS = [
  "Not accurate",
  "Irrelevant to my question",
  "Incomplete response",
  "Harmful or inappropriate",
  "Other",
] as const;

interface BeaconFeedbackModalProps {
  open: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
  zIndexClass?: string;
}

export function BeaconFeedbackModal({
  open,
  onClose,
  onSubmitted,
  zIndexClass = "z-[var(--z-modal)]",
}: BeaconFeedbackModalProps) {
  const [selected, setSelected] = useState<(typeof BEACON_FEEDBACK_REASONS)[number] | "">("");
  const [details, setDetails] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setSelected("");
      setDetails("");
      setSubmitted(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open || !mounted) return null;

  function handleClose() {
    onClose();
  }

  function handleSubmit() {
    if (!selected) return;
    setSubmitted(true);
    onSubmitted?.();
  }

  const modal = submitted ? (
    <div className={`fixed inset-0 ${zIndexClass}`}>
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} aria-hidden />
      <div className="relative flex h-full items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-[var(--radius-lg)] bg-[var(--color-card)] p-6 shadow-[var(--shadow-drawer)]">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <Check className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-[var(--text-body-size)] font-semibold text-[var(--color-foreground)]">
              Feedback submitted
            </p>
            <p className="text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
              Thank you — Beacon will use this to improve future responses.
            </p>
            <Button size="sm" onClick={handleClose} className="mt-1">
              Done
            </Button>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className={`fixed inset-0 ${zIndexClass}`}>
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} aria-hidden />
      <div className="relative flex h-full items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="beacon-feedback-modal-title"
          className="w-full max-w-sm overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-card)] shadow-[var(--shadow-drawer)]"
        >
          <div className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-card)] px-5 py-4">
            <div>
              <p
                id="beacon-feedback-modal-title"
                className="text-[var(--text-body-size)] font-semibold text-[var(--color-foreground)]"
              >
                What went wrong?
              </p>
              <p className="text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
                Help Beacon improve its responses
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="cursor-pointer rounded p-1 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-2 bg-[var(--color-card)] px-5 py-4">
            {BEACON_FEEDBACK_REASONS.map((reason) => (
              <label key={reason} className="flex cursor-pointer items-center gap-2.5">
                <input
                  type="radio"
                  name="beacon-feedback-reason"
                  value={reason}
                  checked={selected === reason}
                  onChange={() => setSelected(reason)}
                  className="accent-[var(--color-primary)]"
                />
                <span className="text-[var(--text-caption-size)] text-[var(--color-foreground)]">{reason}</span>
              </label>
            ))}
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Additional details (optional)"
              rows={2}
              className="mt-2 w-full resize-none rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-[var(--text-caption-size)] placeholder:text-[var(--color-muted-foreground)] focus:border-[var(--color-primary)] focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-2 border-t border-[var(--color-border)] bg-[var(--color-card)] px-5 py-3">
            <Button variant="ghost" size="sm" onClick={handleClose}>
              Cancel
            </Button>
            <Button size="sm" disabled={!selected} onClick={handleSubmit}>
              Submit Feedback
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
