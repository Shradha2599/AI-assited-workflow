import type { ComponentProps } from "react";

import { MARKER_BG, MARKER_RADIUS_CLASS, MARKER_TEXT_CLASS } from "@/components/ui/marker-colors";
import { cn } from "@/lib/utils";

export { MARKER_BG, MARKER_TEXT_CLASS, MARKER_RADIUS_CLASS } from "@/components/ui/marker-colors";

const markerText = MARKER_TEXT_CLASS;

/** Semantic marker backgrounds with dark gray label/icon text. */
export const markerToneClass = {
  success: `bg-[#a9e5a9] ${markerText}`,
  error: `bg-[#faa69e] ${markerText}`,
  warning: `bg-[#ffab66] ${markerText}`,
  info: `bg-[#a5bdec] ${markerText}`,
  neutral: `bg-[#f5f5f5] ${markerText}`,
  muted: `bg-[#f5f5f5] ${markerText}`,
  review: `bg-[#ffab66] ${markerText}`,
  readonly: `bg-[#c9b7e1] ${markerText}`,
  pink: `bg-[#efcbdb] ${markerText}`,
  yellow: `bg-[#ffe34d] ${markerText}`,
  purple: `bg-[#c9b7e1] ${markerText}`,
  rejected: `bg-[#d6d6d6] ${markerText}`,
} as const;

/** Partner pipeline table status markers */
export const partnerStatusMarkerClass = {
  New: markerToneClass.yellow,
  "In Review": markerToneClass.review,
  Rejected: markerToneClass.rejected,
  Onboarding: markerToneClass.info,
  Approved: markerToneClass.success,
  "Future Interest": markerToneClass.pink,
} as const;

export type MarkerTone = keyof typeof markerToneClass;

export function validationMarkerClass(
  status: "valid" | "invalid" | "partial" | "unverified" | string,
): string {
  if (status === "valid") return markerToneClass.success;
  if (status === "invalid") return markerToneClass.error;
  if (status === "partial") return markerToneClass.yellow;
  return markerToneClass.neutral;
}

export function StatusTag({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-[var(--text-label-size)] font-normal leading-none",
        MARKER_RADIUS_CLASS,
        MARKER_TEXT_CLASS,
        className,
      )}
      {...props}
    />
  );
}

export function MarkerTag({
  tone,
  className,
  ...props
}: { tone: MarkerTone } & ComponentProps<"span">) {
  return <StatusTag className={cn(markerToneClass[tone], className)} {...props} />;
}
