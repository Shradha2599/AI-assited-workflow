"use client";

import { X } from "lucide-react";

import { cn } from "@/lib/utils";

interface AssortmentPlanItemsProps {
  items: string[];
  onRemove?: (name: string) => void;
  className?: string;
}

export function AssortmentPlanItems({ items, onRemove, className }: AssortmentPlanItemsProps) {
  if (items.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {items.map((item) => (
        <span
          key={item}
          className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-[var(--text-caption-size)] font-medium text-[var(--color-foreground)] shadow-[var(--shadow-low)]"
        >
          {item}
          {onRemove && (
            <button
              type="button"
              onClick={() => onRemove(item)}
              className="flex h-4 w-4 items-center justify-center rounded-full text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]"
              aria-label={`Remove ${item} from plan`}
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </span>
      ))}
    </div>
  );
}
