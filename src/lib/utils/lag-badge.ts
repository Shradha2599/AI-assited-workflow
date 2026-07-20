import { MARKER_BG } from "@/components/ui/marker-colors";

/** Lag badge colors and labels by percentage threshold */
export function getLagBadge(lagPercent: number): {
  bg: string;
  label: string;
  showArrowDown: boolean;
  showArrowUp: boolean;
} {
  if (lagPercent < 0) {
    return {
      bg: MARKER_BG.green,
      label: `${Math.abs(lagPercent)}% Ahead`,
      showArrowDown: false,
      showArrowUp: true,
    };
  }
  if (lagPercent >= 20) {
    return {
      bg: MARKER_BG.red,
      label: `${lagPercent}% Lag`,
      showArrowDown: true,
      showArrowUp: false,
    };
  }
  if (lagPercent >= 10) {
    return {
      bg: MARKER_BG.orange,
      label: `${lagPercent}% Lag`,
      showArrowDown: true,
      showArrowUp: false,
    };
  }
  if (lagPercent >= 5) {
    return {
      bg: MARKER_BG.yellow,
      label: `${lagPercent}% Lag`,
      showArrowDown: true,
      showArrowUp: false,
    };
  }
  return {
    bg: MARKER_BG.green,
    label: lagPercent === 0 ? "At Par" : `${lagPercent}% At Par`,
    showArrowDown: false,
    showArrowUp: false,
  };
}

export const LAG_BADGE_TEXT_COLOR = "#3c4043";
