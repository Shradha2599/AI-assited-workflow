"use client";

import { cn } from "@/lib/utils";

function ShimmerBlock({ className }: { className?: string }) {
  return <div className={cn("rounded-[var(--radius-sm)] bg-shimmer", className)} />;
}

export function GapItemCardShimmer() {
  return (
    <div className="flex gap-3 rounded-[var(--radius-lg)] bg-[var(--color-task-card)] px-[var(--space-4)] py-[var(--space-6)]">
      <ShimmerBlock className="h-12 w-12 shrink-0 rounded-[var(--radius-sm)]" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-start gap-[var(--space-4)]">
          <ShimmerBlock className="h-4 flex-1" />
          <ShimmerBlock className="h-5 w-20 shrink-0 rounded-[var(--radius-full)]" />
        </div>
        <ShimmerBlock className="h-3 w-3/5" />
      </div>
    </div>
  );
}

export function BeaconPlanDrawerShimmer({ count = 4 }: { count?: number }) {
  return (
    <ul className="space-y-[var(--space-3)] px-[var(--space-4)] pb-[var(--space-4)]">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i}>
          <GapItemCardShimmer />
        </li>
      ))}
    </ul>
  );
}
