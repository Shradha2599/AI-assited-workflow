import { cn } from "@/lib/utils";

export type GapOpportunityLevel = "high" | "medium" | "low";

const GAP_BADGE_TEXT = "#3c4043";

const GAP_OPPORTUNITY_STYLES: Record<
  GapOpportunityLevel,
  { bg: string; text: string; label: string }
> = {
  high: { bg: "#FAA69E", text: GAP_BADGE_TEXT, label: "High" },
  medium: { bg: "#FFE34D", text: GAP_BADGE_TEXT, label: "Medium" },
  low: { bg: "#f1f3f4", text: GAP_BADGE_TEXT, label: "Low" },
};

function normalizeGapOpportunity(value: string): GapOpportunityLevel {
  const level = value.trim().toLowerCase();
  if (level.startsWith("high")) return "high";
  if (level.startsWith("medium")) return "medium";
  return "low";
}

interface GapOpportunityBadgeProps {
  value: string;
  className?: string;
}

export function GapOpportunityBadge({ value, className }: GapOpportunityBadgeProps) {
  const level = normalizeGapOpportunity(value);
  const style = GAP_OPPORTUNITY_STYLES[level];

  return (
    <span
      className={cn(
        "inline-flex shrink-0 rounded-[var(--radius-full)] px-2 py-0.5 text-[var(--text-label-size)] font-medium",
        className,
      )}
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {style.label}
    </span>
  );
}
