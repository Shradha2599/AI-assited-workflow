import { MARKER_BG } from "@/components/ui/marker-colors";

/** Confidence score badge colors — aligned with marker palette */

export const CONFIDENCE_BADGE_TEXT = "#3c4043";

export function getConfidenceBadgeStyle(score: number): { bg: string; text: string } {
  if (score >= 8) return { bg: MARKER_BG.green, text: CONFIDENCE_BADGE_TEXT };
  if (score >= 7) return { bg: MARKER_BG.yellow, text: CONFIDENCE_BADGE_TEXT };
  return { bg: MARKER_BG.red, text: CONFIDENCE_BADGE_TEXT };
}

/** Solid pill for profile headers (page 23) */
export function getConfidenceProfileBadgeClass(score: number): string {
  if (score >= 9) return "bg-[#a9e5a9] text-[var(--color-foreground)]";
  if (score >= 8) return "bg-[#a9e5a9] text-[var(--color-foreground)]";
  if (score >= 7) return "bg-[#ffe34d] text-[var(--color-foreground)]";
  return "bg-[#faa69e] text-[var(--color-foreground)]";
}
