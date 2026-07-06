import { ArrowUpRight, CircleDollarSign, Goal, Store, Target, type LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface DashboardMetric {
  label: string;
  value: string;
  change: string;
  icon: "revenue" | "goal" | "gap" | "sellers";
}

const iconMap: Record<DashboardMetric["icon"], LucideIcon> = {
  revenue: CircleDollarSign,
  goal: Goal,
  gap: Target,
  sellers: Store,
};

interface DashboardKpiStripProps {
  metrics: DashboardMetric[];
  className?: string;
}

function KpiMetricCell({ metric }: { metric: DashboardMetric }) {
  const Icon = iconMap[metric.icon];

  return (
    <div className="flex min-w-0 flex-1 flex-col px-[var(--space-4)] py-[var(--space-4)] first:pl-[var(--space-5)] last:pr-[var(--space-5)]">
      <div className="flex items-center gap-1.5 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
        <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
        <span>{metric.label}</span>
      </div>
      <p className="mt-1 text-[var(--text-kpi-size)] font-semibold leading-[var(--text-kpi-line-height)] text-[var(--color-foreground)]">
        {metric.value}
      </p>
      <div className="mt-1 flex items-center gap-0.5 text-[var(--text-caption-size)] font-medium text-[var(--color-success)]">
        {metric.change}
        <ArrowUpRight className="h-3 w-3" aria-hidden />
      </div>
    </div>
  );
}

export function DashboardKpiStrip({ metrics, className }: DashboardKpiStripProps) {
  return (
    <Card className={cn("min-w-0 overflow-hidden p-0 shadow-[var(--shadow-low)]", className)}>
      <div className="flex min-w-0 divide-x divide-[var(--color-border)]">
        {metrics.map((metric) => (
          <KpiMetricCell key={metric.label} metric={metric} />
        ))}
      </div>
    </Card>
  );
}
