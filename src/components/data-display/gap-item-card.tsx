"use client";

import { ArrowDown, ArrowUp, Plus } from "lucide-react";

import type { GapItem } from "@/components/data-display/gaps-drawer";
import { Button } from "@/components/ui/button";
import { ProductThumbnail } from "@/components/ui/product-thumbnail";
import { TruncatedText } from "@/components/ui/truncated-text";
import { getLagBadge, LAG_BADGE_TEXT_COLOR } from "@/lib/utils/lag-badge";
import { cn } from "@/lib/utils";

interface GapItemCardProps {
  item: GapItem;
  onAddToPlan?: (itemId: string) => void;
  onRemoveFromPlan?: (itemId: string) => void;
  className?: string;
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: () => void;
  /** List-only mode for calendar-update drawers — no revenue, keeps Add to Plan ghost CTA */
  calendarUpdate?: boolean;
  /** @deprecated use calendarUpdate */
  compact?: boolean;
}

export function GapItemCard({
  item,
  onAddToPlan,
  onRemoveFromPlan,
  className,
  selectable = false,
  selected = false,
  onToggleSelect,
  calendarUpdate = false,
  compact = false,
}: GapItemCardProps) {
  const lag = getLagBadge(item.lagPercent);

  const cardBody = (
    <>
      <ProductThumbnail size="md" src={item.imageUrl} itemId={item.id} alt={item.name} />
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-[var(--space-4)]">
          <TruncatedText
            text={item.name}
            className="min-w-0 flex-1 text-[var(--text-body-size)] font-semibold text-[var(--color-foreground)]"
          />
          <span
            className="inline-flex shrink-0 items-center gap-0.5 rounded-[4px] px-2 py-0.5 text-[var(--text-label-size)] font-medium"
            style={{ backgroundColor: lag.bg, color: LAG_BADGE_TEXT_COLOR }}
          >
            {lag.showArrowDown && <ArrowDown className="h-3 w-3" aria-hidden />}
            {lag.showArrowUp && <ArrowUp className="h-3 w-3" aria-hidden />}
            {lag.label}
          </span>
        </div>
        {!compact && (
        <p className="mt-1 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
          Est. Revenue: {item.estimatedRevenue} | {item.competitor}: {item.skuCount} SKUs
        </p>
        )}
        {!selectable &&
          (item.inPlan ? (
            <Button
              variant="ghost"
              size="sm"
              className="mt-1 h-auto px-0 py-0 text-[var(--color-error)] hover:bg-[var(--color-error-light)] hover:text-[var(--color-error)]"
              onClick={() => onRemoveFromPlan?.(item.id)}
            >
              Remove
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="mt-1 h-auto px-0 py-0"
              onClick={() => onAddToPlan?.(item.id)}
            >
              <Plus className="h-3 w-3" />
              Add to Plan
            </Button>
          ))}
      </div>
    </>
  );

  const cardClassName = cn(
    "flex gap-3 rounded-[var(--radius-lg)] bg-[var(--color-task-card)] px-[var(--space-4)] py-[var(--space-6)]",
    selectable && selected && "bg-[var(--color-primary)]/10",
    className,
  );

  if (selectable) {
    return (
      <label className={cn("relative cursor-pointer", cardClassName)}>
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggleSelect}
          className="mt-3 h-4 w-4 shrink-0 accent-[var(--color-primary)]"
        />
        {cardBody}
      </label>
    );
  }

  return <div className={cardClassName}>{cardBody}</div>;
}
