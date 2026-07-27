"use client";

import { Check, X } from "lucide-react";

import { SvgIcon } from "@/components/ui/svg-icon";
import { cn } from "@/lib/utils";

export type InfoBannerVariant = "info" | "warning" | "success";

const variantStyles: Record<
  InfoBannerVariant,
  { container: string; stripe: string; icon: React.ReactNode }
> = {
  info: {
    container: "border-[var(--color-border)] bg-[var(--color-info-banner-bg)]",
    stripe: "bg-[var(--color-primary)]",
    icon: <SvgIcon name="infoFill" size={20} className="mt-0.5 shrink-0" alt="" />,
  },
  warning: {
    container: "border-[var(--color-warning-light)] bg-[var(--color-warning-light)]",
    stripe: "bg-[var(--color-warning)]",
    icon: <SvgIcon name="warningFill" size={20} className="mt-0.5 shrink-0" alt="" />,
  },
  success: {
    container: "border-[#D1F0D1] bg-[#F0FAF0]",
    stripe: "bg-[var(--color-success)]",
    icon: (
      <span
        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-success)]"
        aria-hidden
      >
        <Check className="h-3 w-3 text-white" strokeWidth={3} />
      </span>
    ),
  },
};

interface InfoBannerProps {
  title: React.ReactNode;
  message: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
  onDismiss?: () => void;
  dismissLabel?: string;
  variant?: InfoBannerVariant;
}

export function InfoBanner({
  title,
  message,
  className,
  actions,
  onDismiss,
  dismissLabel = "Dismiss alert",
  variant = "info",
}: InfoBannerProps) {
  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[var(--radius-lg)] border",
        styles.container,
        className,
      )}
    >
      <div
        className={cn("absolute bottom-0 left-0 top-0 w-1 rounded-l-[var(--radius-lg)]", styles.stripe)}
        aria-hidden
      />

      <div className="flex items-start gap-[var(--space-3)] py-[var(--space-4)] pl-[var(--space-5)] pr-[var(--space-4)]">
        {styles.icon}

        <div className="min-w-0 flex-1">
          <p className="text-[var(--text-body-size)] font-semibold text-[var(--color-foreground)]">
            {title}
          </p>
          <div className="mt-0.5 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
            {message}
          </div>
        </div>

        {actions}

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)]"
            aria-label={dismissLabel}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
