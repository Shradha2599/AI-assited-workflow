import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

/** Semantic marker backgrounds with dark gray label/icon text. */
export const markerToneClass = {
  success: "bg-[var(--color-success-light)] text-[var(--color-foreground)]",
  error: "bg-[var(--color-error-light)] text-[var(--color-foreground)]",
  warning: "bg-[var(--color-warning-light)] text-[var(--color-foreground)]",
  info: "bg-[var(--color-primary-light)] text-[var(--color-foreground)]",
  neutral: "bg-[#f5f5f5] text-[var(--color-foreground)]",
  muted: "bg-[var(--color-muted)] text-[var(--color-foreground)]",
  review: "bg-amber-100 text-[var(--color-foreground)]",
  readonly: "bg-purple-100 text-[var(--color-foreground)]",
} as const;

export type MarkerTone = keyof typeof markerToneClass;

export function StatusTag({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[4px] px-2 py-0.5 text-[var(--text-label-size)] font-normal leading-none text-[var(--color-foreground)]",
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
