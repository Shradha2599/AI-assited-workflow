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

interface DashboardKpiCardProps {
  metric: DashboardMetric;
  className?: string;
}

export function DashboardKpiCard({ metric, className }: DashboardKpiCardProps) {
  const Icon = iconMap[metric.icon];

  return (
    <Card className={cn("p-[var(--space-4)]", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
            {metric.label}
          </p>
          <p className="mt-1 text-[var(--text-kpi-size)] font-semibold leading-[var(--text-kpi-line-height)] text-[var(--color-foreground)]">
            {metric.value}
          </p>
          <div className="mt-1 flex items-center gap-0.5 text-[var(--text-caption-size)] font-medium text-[var(--color-success)]">
            {metric.change}
            <ArrowUpRight className="h-3 w-3" aria-hidden />
          </div>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-muted)] text-[var(--color-muted-foreground)]">
          <Icon className="h-4 w-4" aria-hidden />
        </div>
      </div>
    </Card>
  );
}
