"use client";

import { useLayoutEffect, useRef, useState } from "react";

import { MarkerTag } from "@/components/ui/status-tag";
import { cn } from "@/lib/utils";

const GAP_PX = 8;
const OVERFLOW_BUTTON_WIDTH = 76;

export type ItemTypesInlineVariant = "plan" | "tag";

function ItemTypeChip({
  item,
  variant,
  className,
}: {
  item: string;
  variant: ItemTypesInlineVariant;
  className?: string;
}) {
  if (variant === "tag") {
    return (
      <MarkerTag
        tone="neutral"
        className={cn("shrink-0 whitespace-nowrap px-2.5 py-1 text-[var(--text-caption-size)]", className)}
      >
        {item}
      </MarkerTag>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[var(--radius-md)]",
        "border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5",
        "text-[var(--text-caption-size)] font-medium text-[var(--color-foreground)]",
        className,
      )}
    >
      {item}
    </span>
  );
}

interface ItemTypesInlineListProps {
  items: string[];
  onShowAll: () => void;
  variant?: ItemTypesInlineVariant;
  className?: string;
}

export function ItemTypesInlineList({
  items,
  onShowAll,
  variant = "plan",
  className,
}: ItemTypesInlineListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(items.length);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const measure = measureRef.current;
    if (!container || !measure || items.length === 0) return;

    function calculate() {
      const maxWidth = container!.clientWidth;
      const tags = Array.from(measure!.children) as HTMLElement[];
      let used = 0;
      let count = 0;

      for (let i = 0; i < tags.length; i++) {
        const tagWidth = tags[i].offsetWidth;
        const gapBefore = count > 0 ? GAP_PX : 0;
        const remaining = items.length - (i + 1);
        const overflowReserve = remaining > 0 ? OVERFLOW_BUTTON_WIDTH + GAP_PX : 0;

        if (count > 0 && used + gapBefore + tagWidth + overflowReserve > maxWidth) {
          break;
        }

        used += gapBefore + tagWidth;
        count++;
      }

      setVisibleCount(Math.max(1, Math.min(count, items.length)));
    }

    calculate();
    const observer = new ResizeObserver(calculate);
    observer.observe(container);
    return () => observer.disconnect();
  }, [items, variant]);

  if (items.length === 0) return null;

  const hiddenCount = items.length - visibleCount;
  const visibleItems = items.slice(0, visibleCount);

  return (
    <div className={cn("relative w-full min-w-0", className)}>
      <div
        ref={measureRef}
        aria-hidden
        className="pointer-events-none invisible absolute left-0 top-0 flex gap-2"
      >
        {items.map((item) => (
          <ItemTypeChip key={item} item={item} variant={variant} />
        ))}
      </div>

      <div ref={containerRef} className="flex min-w-0 items-center gap-2 overflow-hidden">
        {visibleItems.map((item) => (
          <ItemTypeChip key={item} item={item} variant={variant} />
        ))}
        {hiddenCount > 0 && (
          <button
            type="button"
            onClick={onShowAll}
            className="shrink-0 whitespace-nowrap text-[var(--text-caption-size)] font-medium text-[var(--color-primary)] hover:underline"
          >
            +{hiddenCount} items
          </button>
        )}
      </div>
    </div>
  );
}
