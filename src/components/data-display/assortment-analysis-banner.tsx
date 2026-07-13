"use client";

import { useState } from "react";

import { InfoBanner } from "@/components/data-display/info-banner";
import { cn } from "@/lib/utils";

interface AssortmentAnalysisBannerProps {
  lastUpdatedLabel: string;
  className?: string;
}

export function AssortmentAnalysisBanner({
  lastUpdatedLabel,
  className,
}: AssortmentAnalysisBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <InfoBanner
      className={cn("mb-[var(--space-4)]", className)}
      title="Assortment Intelligence Update"
      message={
        <>
          Assortment Intelligence Agent last updated this analysis on{" "}
          <span className="font-medium text-[var(--color-foreground)]">{lastUpdatedLabel}</span>
        </>
      }
      onDismiss={() => setDismissed(true)}
      dismissLabel="Dismiss update"
    />
  );
}
