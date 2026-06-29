"use client";

import { ArrowDown, Plus, X } from "lucide-react";

import { ImagePlaceholder } from "@/components/ui/image-placeholder";

export type GapLagSeverity = "high" | "medium-high" | "medium";

export interface GapItem {
  id: string;
  name: string;
  lagPercent: number;
  lagSeverity: GapLagSeverity;
  estimatedRevenue: string;
  competitor: string;
  skuCount: number;
  inPlan?: boolean;
}

const lagStyles: Record<GapLagSeverity, { bg: string; text: string }> = {
  high: { bg: "#fce8e6", text: "var(--color-lag-high)" },
  "medium-high": { bg: "#fef7e0", text: "var(--color-lag-medium-high)" },
  medium: { bg: "#fff8e1", text: "var(--color-lag-medium)" },
};

interface GapsDrawerProps {
  category: string;
  gapCount: number;
  items: GapItem[];
  revenueGoal: string;
  revenuePlanned: string;
  revenuePlannedPercent: number;
  plannedMessage: string;
  onClose: () => void;
  onAddToPlan: (itemId: string) => void;
  onRemoveFromPlan: (itemId: string) => void;
}

export function GapsDrawer({
  category,
  gapCount,
  items,
  revenueGoal,
  revenuePlanned,
  revenuePlannedPercent,
  plannedMessage,
  onClose,
  onAddToPlan,
  onRemoveFromPlan,
}: GapsDrawerProps) {
  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[var(--z-drawer)] bg-black/20"
        aria-label="Close gaps drawer"
        onClick={onClose}
      />
      <aside
        className="fixed inset-y-0 right-0 z-[calc(var(--z-drawer)+1)] flex w-[var(--tasks-panel-width)] flex-col border-l border-[var(--color-border)] bg-[var(--color-card)] shadow-[var(--shadow-drawer)]"
        aria-label={`Gaps identified: ${category}`}
      >
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-[var(--space-4)] py-3">
          <h2 className="text-[var(--text-section-size)] font-semibold">
            Gaps Identified: {category}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)]"
            aria-label="Close drawer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="border-b border-[var(--color-border)] p-[var(--space-4)]">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">
                Revenue Goal
              </p>
              <p className="text-[var(--text-body-size)] font-semibold">{revenueGoal}</p>
            </div>
            <div>
              <p className="text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">
                Planned Revenue
              </p>
              <p className="text-[var(--text-body-size)] font-semibold">{revenuePlanned}</p>
            </div>
          </div>
          <div className="mt-3">
            <div className="mb-1 flex justify-between text-[var(--text-caption-size)]">
              <span className="text-[var(--color-muted-foreground)]">Revenue Planned</span>
              <span className="font-medium">{revenuePlannedPercent}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[var(--color-muted)]">
              <div
                className="h-full rounded-full bg-[var(--color-primary)]"
                style={{ width: `${revenuePlannedPercent}%` }}
              />
            </div>
            <p className="mt-1.5 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
              {plannedMessage}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-[var(--space-4)] py-3">
          <div>
            <p className="text-[var(--text-body-size)] font-semibold">{category}</p>
            <p className="text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
              {gapCount} item type gaps identified
            </p>
          </div>
          <button
            type="button"
            className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 py-1 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]"
          >
            Sort by ▾
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-[var(--space-3)]">
          <ul className="space-y-[var(--space-3)]">
            {items.map((item) => {
              const lag = lagStyles[item.lagSeverity];
              return (
                <li
                  key={item.id}
                  className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card)] p-[var(--space-3)] shadow-[var(--shadow-low)]"
                >
                  <div className="flex gap-3">
                    <ImagePlaceholder size="md" rounded="sm" label={item.name} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-[var(--text-body-size)] font-medium">
                          {item.name}
                        </p>
                        <span
                          className="inline-flex shrink-0 items-center gap-0.5 rounded-[var(--radius-full)] px-2 py-0.5 text-[var(--text-label-size)] font-medium"
                          style={{ backgroundColor: lag.bg, color: lag.text }}
                        >
                          <ArrowDown className="h-3 w-3" aria-hidden />
                          {item.lagPercent}% Lag
                        </span>
                      </div>
                      <p className="mt-1 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
                        Est. Revenue: {item.estimatedRevenue} | {item.competitor}: {item.skuCount} SKUs
                      </p>
                      {item.inPlan ? (
                        <button
                          type="button"
                          onClick={() => onRemoveFromPlan(item.id)}
                          className="mt-2 text-[var(--text-caption-size)] font-medium text-[var(--color-error)] hover:underline"
                        >
                          Remove
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onAddToPlan(item.id)}
                          className="mt-2 inline-flex items-center gap-1 text-[var(--text-caption-size)] font-medium text-[var(--color-primary)] hover:underline"
                        >
                          <Plus className="h-3 w-3" />
                          Add to Plan
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>
    </>
  );
}
