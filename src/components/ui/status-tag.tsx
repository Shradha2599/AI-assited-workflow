import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export function StatusTag({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[var(--text-label-size)] font-normal leading-none text-[var(--color-foreground)]",
        className,
      )}
      {...props}
    />
  );
}
