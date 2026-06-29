import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-[var(--radius-sm)] px-2 py-0.5 text-[var(--text-caption-size)] font-medium",
  {
    variants: {
      variant: {
        default: "bg-[var(--color-muted)] text-[var(--color-muted-foreground)]",
        primary: "bg-[#eff6ff] text-[var(--color-primary)]",
        success: "bg-[#f0fdf4] text-[var(--color-success)]",
        warning: "bg-[#fffbeb] text-[var(--color-warning)]",
        error: "bg-[#fef2f2] text-[var(--color-error)]",
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
        "inline-flex items-center rounded-full border border-[var(--color-border)] bg-[var(--color-card)] px-2.5 py-0.5 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]",
        className,
      )}
      {...props}
    />
  );
}
