"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Info, Pencil, Save } from "lucide-react";

import { AssortmentPlanItems } from "@/components/data-display/assortment-plan-items";
import { BeaconPlanDrawer } from "@/components/data-display/beacon-plan-drawer";
import type { GapItem } from "@/components/data-display/gaps-drawer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SvgIcon } from "@/components/ui/svg-icon";
import {
  abbreviateRevenueGoalInput,
  formatRevenueGoalDisplay,
  isValidRevenueGoalInput,
  normalizeRevenueGoalInput,
  parseRevenueGoalToMillions,
} from "@/lib/utils/revenue-goal-input";
import { useToastStore } from "@/stores/toast-store";
import { cn } from "@/lib/utils";

interface RevenueGoalPanelProps {
  revenueOpportunity: string;
  revenuePlannedPercent: number;
  plannedMessage: string;
  beaconRecommendedItems: GapItem[];
  planItemCount: number;
  planItemNames: string[];
  onAddToPlan: (itemIds: string[], items: GapItem[]) => void;
  onRemoveFromPlan?: (name: string) => void;
  onBeaconDrawerOpen?: () => void;
  className?: string;
}

export function RevenueGoalPanel({
  revenueOpportunity,
  revenuePlannedPercent,
  plannedMessage,
  beaconRecommendedItems,
  planItemCount,
  planItemNames,
  onAddToPlan,
  onRemoveFromPlan,
  onBeaconDrawerOpen,
  className,
}: RevenueGoalPanelProps) {
  const showToast = useToastStore((state) => state.showToast);
  const [goalInput, setGoalInput] = useState("");
  const [savedGoal, setSavedGoal] = useState("");
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [beaconDrawerOpen, setBeaconDrawerOpen] = useState(false);

  const hasSavedGoal = savedGoal.length > 0;
  const canSave = isValidRevenueGoalInput(goalInput);
  const goalMillions = hasSavedGoal ? parseRevenueGoalToMillions(savedGoal) : null;
  const isReadOnly = hasSavedGoal && !isEditingGoal;

  useEffect(() => {
    if (hasSavedGoal && !isEditingGoal) {
      setGoalInput(savedGoal);
    }
  }, [hasSavedGoal, isEditingGoal, savedGoal]);

  function handleGoalChange(raw: string) {
    if (!raw) {
      setGoalInput("");
      return;
    }
    setGoalInput(normalizeRevenueGoalInput(raw));
  }

  function handleGoalBlur() {
    if (!goalInput) return;
    setGoalInput(abbreviateRevenueGoalInput(goalInput));
  }

  function handleSaveGoal() {
    if (!canSave) return;
    const abbreviated = abbreviateRevenueGoalInput(goalInput);
    setGoalInput(abbreviated);
    setSavedGoal(abbreviated);
    setIsEditingGoal(false);
    showToast({
      title: "Revenue goal saved",
      description: `Your revenue goal of ${formatRevenueGoalDisplay(abbreviated)} has been saved.`,
    });
  }

  function handleEditGoal() {
    setIsEditingGoal(true);
  }

  function handleAddSelected(itemIds: string[]) {
    onAddToPlan(itemIds, beaconRecommendedItems);
    showToast({
      title: "Items added to plan",
      description: `${itemIds.length} item type${itemIds.length === 1 ? "" : "s"} added to your assortment plan.`,
    });
  }

  const revenuePlannedMessage = !hasSavedGoal
    ? "You haven't set your revenue goal yet"
    : goalMillions != null
      ? plannedMessage.replace("$50.0M", formatRevenueGoalDisplay(savedGoal)).replace("$50M", formatRevenueGoalDisplay(savedGoal))
      : plannedMessage;

  const displayPercent = hasSavedGoal ? revenuePlannedPercent : 0;

  return (
    <>
      <Card className={cn("mb-[var(--space-4)] p-[var(--space-4)] shadow-[var(--shadow-low)]", className)}>
        <div className="mb-[var(--space-3)] flex items-center gap-1.5">
          <h3 className="text-[var(--text-section-size)] font-semibold text-[var(--color-foreground)]">
            Set Revenue Goal
          </h3>
          <Info className="h-3.5 w-3.5 text-[var(--color-muted-foreground)]" aria-hidden />
        </div>

        <div className="mb-[var(--space-5)] flex flex-col gap-[var(--space-3)] sm:flex-row">
          <div className="flex w-full shrink-0 flex-col items-center justify-center rounded-[var(--radius-lg)] border border-[var(--color-border)] px-[var(--space-4)] py-[var(--space-5)] text-center sm:w-[168px]">
            <p className="text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
              Revenue Opportunity
            </p>
            <p className="mt-2 text-[var(--text-kpi-size)] font-semibold leading-[var(--text-kpi-line-height)] text-[var(--color-foreground)]">
              {revenueOpportunity}
            </p>
          </div>

          <div className="flex min-w-0 flex-1 items-start gap-[80px] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] p-[var(--space-4)]">
            <div className="w-[200px] shrink-0">
              <div className="mb-[var(--space-2)] flex items-center gap-1.5">
                <span className="text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
                  Revenue Goal
                </span>
                {hasSavedGoal && !isEditingGoal ? (
                  <button
                    type="button"
                    onClick={handleEditGoal}
                    className="cursor-pointer rounded-[var(--radius-sm)] p-0.5 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/10"
                    aria-label="Edit revenue goal"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSaveGoal}
                    disabled={!canSave}
                    className={cn(
                      "rounded-[var(--radius-sm)] p-0.5 transition-colors",
                      canSave
                        ? "cursor-pointer text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10"
                        : "cursor-not-allowed text-[var(--color-muted-foreground)] opacity-40",
                    )}
                    aria-label="Save revenue goal"
                  >
                    <Save className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-body-size)] text-[var(--color-muted-foreground)]">
                  $
                </span>
                <input
                  type="text"
                  value={goalInput}
                  onChange={(e) => handleGoalChange(e.target.value)}
                  onBlur={handleGoalBlur}
                  readOnly={isReadOnly}
                  placeholder="Enter your goal"
                  className={cn(
                    "h-9 w-full max-w-[200px] rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-card)] pl-6 pr-3 text-[var(--text-body-size)] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:border-[var(--color-primary)] focus:outline-none",
                    isReadOnly && "cursor-default bg-[var(--color-muted)]/30",
                  )}
                />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-[var(--space-2)] flex items-center justify-between gap-2">
                <span className="text-[var(--text-caption-size)] font-semibold text-[var(--color-foreground)]">
                  Revenue Planned
                </span>
                <span className="text-[var(--text-caption-size)] font-medium text-[var(--color-foreground)]">
                  {displayPercent}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[var(--color-muted)]">
                <div
                  className="h-full rounded-full bg-[var(--color-primary)] transition-all"
                  style={{ width: `${displayPercent}%` }}
                />
              </div>
              <p className="mt-[var(--space-2)] flex items-start gap-1 text-[var(--text-caption-size)] leading-snug text-[var(--color-muted-foreground)]">
                <Info className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
                {revenuePlannedMessage}
              </p>
            </div>
          </div>
        </div>

        <div>
          <div className="mb-[var(--space-2)] flex items-center gap-1.5">
            <h3 className="text-[var(--text-section-size)] font-semibold text-[var(--color-foreground)]">
              Assortment Plan
            </h3>
            <Info className="h-3.5 w-3.5 text-[var(--color-muted-foreground)]" aria-hidden />
          </div>

          {planItemCount === 0 && (
            <p className="text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
              You haven&apos;t added any item in your assortment plan
            </p>
          )}

          {planItemCount > 0 && (
            <div className="space-y-3">
              <AssortmentPlanItems items={planItemNames} onRemove={onRemoveFromPlan} />
              <Button variant="ghost" size="sm" className="h-auto px-0 py-0" asChild>
                <Link href="/assortment/plan">
                  View full plan
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            </div>
          )}

          <div className="mt-[var(--space-3)]">
            <Button
              size="sm"
              onClick={() => {
                onBeaconDrawerOpen?.();
                setBeaconDrawerOpen(true);
              }}
            >
              <SvgIcon name="aiSparkle" size={14} variant="onPrimary" />
              Plan with Beacon
            </Button>
          </div>
        </div>
      </Card>

      <BeaconPlanDrawer
        open={beaconDrawerOpen}
        items={beaconRecommendedItems}
        existingPlanItems={planItemNames}
        revenueGoal={hasSavedGoal ? formatRevenueGoalDisplay(savedGoal) : "$50.0M"}
        revenuePlanned={planItemCount > 0 ? `$${(planItemCount * 1.6).toFixed(1)}M` : "$0M"}
        revenuePlannedPercent={displayPercent}
        plannedMessage={revenuePlannedMessage}
        onClose={() => setBeaconDrawerOpen(false)}
        onAddToPlan={handleAddSelected}
      />
    </>
  );
}
