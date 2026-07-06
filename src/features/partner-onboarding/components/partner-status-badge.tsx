import { Check, Clock, Lock } from "lucide-react";

import { cn } from "@/lib/utils";
import type { PartnerPipelineStatus, ProgressStepState } from "@/lib/mock-data/potential-partners";

const STATUS_STYLES: Record<PartnerPipelineStatus, string> = {
  New: "bg-[var(--color-muted)] text-[var(--color-foreground)]",
  "In Review": "bg-[var(--color-warning-light)] text-[var(--color-warning)]",
  Approved: "bg-[var(--color-success-light)] text-[var(--color-success)]",
  Rejected: "bg-[var(--color-error-light)] text-[var(--color-error)]",
  Onboarding: "bg-[var(--color-primary-light)] text-[var(--color-primary)]",
  "Future Interest": "bg-purple-100 text-purple-700",
};

export function PartnerStatusBadge({ status }: { status: PartnerPipelineStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-[var(--text-label-size)] font-medium",
        STATUS_STYLES[status],
      )}
    >
      {status}
    </span>
  );
}

export function OnboardingProgressSteps({ steps }: { steps: ProgressStepState[] }) {
  return (
    <div className="flex items-center gap-1">
      {steps.map((step, index) => (
        <div
          key={index}
          className={cn(
            "flex h-5 w-5 items-center justify-center rounded-full border",
            step === "complete" && "border-[var(--color-success)] bg-[var(--color-success-light)] text-[var(--color-success)]",
            step === "current" && "border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)]",
            step === "pending" && "border-[var(--color-border)] bg-[var(--color-muted)] text-[var(--color-muted-foreground)]",
            step === "locked" && "border-[var(--color-border)] bg-[var(--color-muted)] text-[var(--color-muted-foreground)]",
          )}
        >
          {step === "complete" && <Check className="h-2.5 w-2.5" />}
          {step === "current" && <Clock className="h-2.5 w-2.5" />}
          {step === "pending" && <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-muted-foreground)]" />}
          {step === "locked" && <Lock className="h-2.5 w-2.5" />}
        </div>
      ))}
    </div>
  );
}
