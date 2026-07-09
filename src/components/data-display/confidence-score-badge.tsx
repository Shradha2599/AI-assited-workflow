import { cn } from "@/lib/utils";
import { StatusTag } from "@/components/ui/status-tag";
import {
  CONFIDENCE_BADGE_TEXT,
  getConfidenceBadgeStyle,
} from "@/lib/utils/confidence-badge";

interface ConfidenceScoreBadgeProps {
  score: number;
  /** Compact table cell (e.g. "9.2") vs full profile pill (e.g. "9.2/10") */
  variant?: "table" | "profile";
  className?: string;
}

export function ConfidenceScoreBadge({
  score,
  variant = "table",
  className,
}: ConfidenceScoreBadgeProps) {
  const { bg } = getConfidenceBadgeStyle(score);

  if (variant === "profile") {
    return (
      <StatusTag
        className={cn("rounded px-2 tabular-nums", className)}
        style={{ backgroundColor: bg, color: CONFIDENCE_BADGE_TEXT }}
      >
        {score.toFixed(1)}/10
      </StatusTag>
    );
  }

  return (
    <StatusTag
      className={cn("min-w-[36px] justify-center rounded tabular-nums", className)}
      style={{ backgroundColor: bg, color: CONFIDENCE_BADGE_TEXT }}
    >
      {score.toFixed(1)}
    </StatusTag>
  );
}
