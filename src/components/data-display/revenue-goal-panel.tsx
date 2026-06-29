"use client";

import Link from "next/link";
import { Calendar, Info, Save, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface RevenueGoalPanelProps {
  revenueOpportunity: string;
  revenueGoal?: string;
  revenuePlannedPercent: number;
  plannedMessage: string;
  assortmentPlanMessage?: string;
  showCreatePlan?: boolean;
  showGenerateCalendar?: boolean;
  planItems?: string[];
  className?: string;
}

export function RevenueGoalPanel({
  revenueOpportunity,
  revenueGoal,
  revenuePlannedPercent,
  plannedMessage,
  assortmentPlanMessage,
  showCreatePlan = false,
  showGenerateCalendar = false,
  planItems = [],
  className,
}: RevenueGoalPanelProps) {
  return (
    <Card className={cn("mb-[var(--space-4)]", className)}>
      <div className="grid divide-y divide-[var(--color-border)] md:grid-cols-2 md:divide-x md:divide-y-0">
        <div className="p-[var(--space-4)]">
          <div className="mb-3 flex items-center gap-1.5">
            <h3 className="text-[var(--text-section-size)] font-semibold">Set Revenue Goal</h3>
            <Info className="h-3.5 w-3.5 text-[var(--color-muted-foreground)]" aria-hidden />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
                Revenue Opportunity
              </p>
              <p className="mt-0.5 text-[var(--text-kpi-size)] font-semibold">{revenueOpportunity}</p>
            </div>
            <div>
              <p className="text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
                Revenue Goal
              </p>
              <div className="mt-0.5 flex items-center gap-2">
                {revenueGoal ? (
                  <p className="text-[var(--text-kpi-size)] font-semibold">{revenueGoal}</p>
                ) : (
                  <input
                    type="text"
                    placeholder="Enter your goal"
                    className="h-8 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 text-[var(--text-body-size)]"
                  />
                )}
                <button
                  type="button"
                  className="text-[var(--color-primary)]"
                  aria-label="Save revenue goal"
                >
                  <Save className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div className="mb-1 flex items-center justify-between text-[var(--text-caption-size)]">
              <span className="text-[var(--color-muted-foreground)]">Revenue Planned</span>
              <span className="font-medium">{revenuePlannedPercent}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[var(--color-muted)]">
              <div
                className="h-full rounded-full bg-[var(--color-primary)] transition-all"
                style={{ width: `${revenuePlannedPercent}%` }}
              />
            </div>
            <p className="mt-1.5 flex items-center gap-1 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
              <Info className="h-3 w-3 shrink-0" aria-hidden />
              {plannedMessage}
            </p>
          </div>
        </div>

        <div className="p-[var(--space-4)]">
          <div className="mb-3 flex items-center gap-1.5">
            <h3 className="text-[var(--text-section-size)] font-semibold">Assortment Plan</h3>
            <Info className="h-3.5 w-3.5 text-[var(--color-muted-foreground)]" aria-hidden />
          </div>

          {planItems.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {planItems.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1 rounded-[var(--radius-md)] border border-[var(--color-border)] px-2 py-1 text-[var(--text-caption-size)]"
                >
                  {item}
                  <button type="button" className="text-[var(--color-muted-foreground)]" aria-label={`Remove ${item}`}>
                    ×
                  </button>
                </span>
              ))}
              {planItems.length > 3 && (
                <span className="inline-flex items-center rounded-[var(--radius-md)] border border-[var(--color-border)] px-2 py-1 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
                  +{planItems.length - 3} More
                </span>
              )}
            </div>
          ) : assortmentPlanMessage ? (
            <p className="text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
              {assortmentPlanMessage}
            </p>
          ) : null}

          <div className="mt-3 flex flex-wrap gap-2">
            {showCreatePlan && (
              <Button size="sm" asChild>
                <Link href="/assortment/plan">
                  <Sparkles className="h-3.5 w-3.5" />
                  Create Plan
                </Link>
              </Button>
            )}
            {showGenerateCalendar && (
              <Button size="sm" variant="outline" asChild>
                <Link href="/assortment/plan">
                  <Calendar className="h-3.5 w-3.5" />
                  Generate Calendar
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
