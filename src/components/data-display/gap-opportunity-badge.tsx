import { StatusTag } from "@/components/ui/status-tag";
import { MARKER_BG } from "@/components/ui/marker-colors";

export type GapOpportunityLevel = "high" | "medium" | "low";

const GAP_OPPORTUNITY_STYLES: Record<GapOpportunityLevel, { bg: string; label: string }> = {
  high: { bg: MARKER_BG.red, label: "High" },
  medium: { bg: MARKER_BG.yellow, label: "Medium" },
  low: { bg: MARKER_BG.neutral, label: "Low" },
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
    <StatusTag className={className} style={{ backgroundColor: style.bg }}>
      {style.label}
    </StatusTag>
  );
}
