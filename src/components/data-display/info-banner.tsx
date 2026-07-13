"use client";

import { X } from "lucide-react";

import { SvgIcon } from "@/components/ui/svg-icon";
import { cn } from "@/lib/utils";

interface InfoBannerProps {
  title: string;
  message: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
  onDismiss?: () => void;
  dismissLabel?: string;
}

export function InfoBanner({
  title,
  message,
  className,
  actions,
  onDismiss,
  dismissLabel = "Dismiss alert",
}: InfoBannerProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-info-banner-bg)]",
        className,
      )}
    >
      <div
        className="absolute bottom-0 left-0 top-0 w-1 rounded-l-[var(--radius-lg)] bg-[var(--color-primary)]"
        aria-hidden
      />

      <div className="flex items-start gap-[var(--space-3)] py-[var(--space-4)] pl-[var(--space-5)] pr-[var(--space-4)]">
        <SvgIcon name="infoFill" size={20} className="mt-0.5 shrink-0" alt="" />

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
