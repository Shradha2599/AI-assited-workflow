"use client";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";

interface NoGoalModalProps {
  revenueOpportunity: string;
  onUseOpportunity: () => void;
  onSetManually: () => void;
  onClose: () => void;
}

export function NoGoalModal({
  revenueOpportunity,
  onUseOpportunity,
  onSetManually,
  onClose,
}: NoGoalModalProps) {
  return (
    <div className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="no-goal-title"
        className="w-full max-w-sm rounded-[var(--radius-lg)] bg-[var(--color-card)] shadow-[var(--shadow-drawer)]"
      >
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
          <p id="no-goal-title" className="text-[var(--text-body-size)] font-semibold text-[var(--color-foreground)]">
            No revenue goal set
          </p>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded p-1 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 py-4">
          <p className="text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
            You haven&apos;t set a revenue goal yet. Would you like to use your current revenue
            opportunity as your goal and continue planning?
          </p>

          <div className="mt-4 rounded-[var(--radius-md)] border border-[#D6D6D6] bg-[var(--color-card)] p-3">
            <p className="text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
              Revenue Opportunity
            </p>
            <p className="mt-1 text-[var(--text-body-size)] font-semibold text-[var(--color-foreground)]">
              {revenueOpportunity}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-[var(--color-border)] px-5 py-3">
          <Button variant="ghost" size="sm" onClick={onSetManually}>
            Set it manually
          </Button>
          <Button size="sm" onClick={onUseOpportunity}>
            Use {revenueOpportunity} as goal
          </Button>
        </div>
      </div>
    </div>
  );
}
