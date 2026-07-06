/** Lag badge colors and labels by percentage threshold */
export function getLagBadge(lagPercent: number): {
  bg: string;
  label: string;
  showArrowDown: boolean;
  showArrowUp: boolean;
} {
  if (lagPercent < 0) {
    return {
      bg: "#79D279",
      label: `${Math.abs(lagPercent)}% Ahead`,
      showArrowDown: false,
      showArrowUp: true,
    };
  }
  if (lagPercent >= 20) {
    return {
      bg: "#FAA69E",
      label: `${lagPercent}% Lag`,
      showArrowDown: true,
      showArrowUp: false,
    };
  }
  if (lagPercent >= 10) {
    return {
      bg: "#FFAB66",
      label: `${lagPercent}% Lag`,
      showArrowDown: true,
      showArrowUp: false,
    };
  }
  if (lagPercent >= 5) {
    return {
      bg: "#FFE34D",
      label: `${lagPercent}% Lag`,
      showArrowDown: true,
      showArrowUp: false,
    };
  }
  return {
    bg: "#D1F0D1",
    label: lagPercent === 0 ? "At Par" : `${lagPercent}% At Par`,
    showArrowDown: false,
    showArrowUp: false,
  };
}

export const LAG_BADGE_TEXT_COLOR = "#3c4043";
