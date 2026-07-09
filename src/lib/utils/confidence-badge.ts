/** Confidence score badge colors — aligned with item-type / lag badge palette */

export const CONFIDENCE_BADGE_TEXT = "#3c4043";

export function getConfidenceBadgeStyle(score: number): { bg: string; text: string } {
  if (score >= 8) return { bg: "#D1F0D1", text: CONFIDENCE_BADGE_TEXT };
  if (score >= 7) return { bg: "#FFE34D", text: CONFIDENCE_BADGE_TEXT };
  return { bg: "#FAA69E", text: CONFIDENCE_BADGE_TEXT };
}

/** Solid pill for profile headers (page 23) */
export function getConfidenceProfileBadgeClass(score: number): string {
  if (score >= 9) return "bg-green-600 text-white";
  if (score >= 8) return "bg-green-500 text-white";
  if (score >= 7) return "bg-amber-500 text-white";
  return "bg-red-500 text-white";
}
