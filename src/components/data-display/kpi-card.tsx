import { ArrowDown, ArrowUp, Minus } from "lucide-react";

import { cn, formatCurrency, formatNumber, formatPercent } from "@/lib/utils";
import type { MetricValue } from "@/types";

import { Card, CardContent } from "@/components/ui/card";

interface KpiCardProps {
  metric: MetricValue;
  className?: string;
}

function formatValue(metric: MetricValue): string {
  if (typeof metric.value === "string") return metric.value;

  switch (metric.format) {
    case "currency":
      return formatCurrency(metric.value);
    case "percent":
      return formatPercent(metric.value);
    default:
      return formatNumber(metric.value);
  }
}

function TrendIcon({ trend }: { trend: MetricValue["trend"] }) {
  if (trend === "up") {
    return <ArrowUp className="h-3 w-3 text-[var(--color-success)]" aria-hidden />;
  }
  if (trend === "down") {
    return <ArrowDown className="h-3 w-3 text-[var(--color-error)]" aria-hidden />;
  }
  return <Minus className="h-3 w-3 text-[var(--color-muted-foreground)]" aria-hidden />;
}

export function KpiCard({ metric, className }: KpiCardProps) {
  return (
    <Card className={cn(className)}>
      <CardContent className="p-[var(--space-6)]">
        <p className="text-[var(--text-label-size)] font-medium text-[var(--color-muted-foreground)]">
          {metric.label}
        </p>
        <p className="mt-[var(--space-2)] text-[var(--text-display-size)] font-semibold leading-[var(--text-display-line-height)]">
          {formatValue(metric)}
        </p>
        {metric.change !== undefined && (
          <div className="mt-[var(--space-2)] flex items-center gap-1 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
            <TrendIcon trend={metric.trend} />
            <span>{Math.abs(metric.change)}% vs last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
