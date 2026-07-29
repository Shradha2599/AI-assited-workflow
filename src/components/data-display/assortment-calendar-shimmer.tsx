"use client";

import { cn } from "@/lib/utils";

function ShimmerBlock({ className }: { className?: string }) {
  return <div className={cn("rounded-[var(--radius-sm)] bg-shimmer", className)} />;
}

/** Placeholder while gap / seasonal items are applied to the calendar. */
export function AssortmentCalendarShimmer() {
  return (
    <div className="space-y-3 p-6 animate-pulse" aria-hidden>
      <ShimmerBlock className="h-4 w-48" />
      <ShimmerBlock className="h-8 w-full" />
      {Array.from({ length: 4 }).map((_, row) => (
        <ShimmerBlock key={row} className="h-10 w-full" />
      ))}
    </div>
  );
}
