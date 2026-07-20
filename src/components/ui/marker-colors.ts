/** Shared marker background palette — text/icons use dark gray via StatusTag. */
export const MARKER_BG = {
  green: "#a9e5a9",
  blue: "#a5bdec",
  purple: "#c9b7e1",
  pink: "#efcbdb",
  red: "#faa69e",
  orange: "#ffab66",
  yellow: "#ffe34d",
  neutral: "#f5f5f5",
  rejected: "#d6d6d6",
} as const;

export const MARKER_TEXT_CLASS = "text-[var(--color-foreground)]";

export const MARKER_RADIUS_CLASS = "rounded-[4px]";

/** Tint raster/SVG icons to match marker dark gray text. */
export const MARKER_ICON_DARK_GRAY_FILTER =
  "brightness(0) saturate(100%) invert(24%) sepia(6%) saturate(501%) hue-rotate(182deg) brightness(95%) contrast(89%)";
