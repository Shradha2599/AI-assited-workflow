import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { markerToneClass } from "@/components/ui/status-tag";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-[4px] px-2 py-0.5 text-[var(--text-label-size)] font-normal text-[var(--color-foreground)]",
  {
    variants: {
      variant: {
        default: markerToneClass.neutral,
        primary: markerToneClass.info,
        success: markerToneClass.success,
        warning: markerToneClass.warning,
        error: markerToneClass.error,
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, className }))} {...props} />
  );
}

export function Tag({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[4px] border border-[var(--color-border)] bg-[var(--color-card)] px-2.5 py-0.5 text-[var(--text-caption-size)] text-[var(--color-foreground)]",
        className,
      )}
      {...props}
    />
  );
}
