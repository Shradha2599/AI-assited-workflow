import { cn } from "@/lib/utils";
import {
  CONFIDENCE_BADGE_TEXT,
  getConfidenceBadgeStyle,
  getConfidenceProfileBadgeClass,
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
  if (variant === "profile") {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full px-3 py-1 text-[var(--text-caption-size)] font-semibold tabular-nums",
          getConfidenceProfileBadgeClass(score),
          className,
        )}
      >
        {score.toFixed(1)}/10
      </span>
    );
  }

  const { bg } = getConfidenceBadgeStyle(score);
  return (
    <span
      className={cn(
        "inline-flex min-w-[36px] items-center justify-center rounded px-2 py-0.5 text-[var(--text-caption-size)] font-semibold tabular-nums",
        className,
      )}
      style={{ backgroundColor: bg, color: CONFIDENCE_BADGE_TEXT }}
    >
      {score.toFixed(1)}
    </span>
  );
}
