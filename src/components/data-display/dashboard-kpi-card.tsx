import { ArrowDown, ArrowUp, CircleDollarSign, Goal, Store, Target, type LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface DashboardMetric {
  label: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: "revenue" | "goal" | "gap" | "sellers";
}

const iconMap: Record<DashboardMetric["icon"], LucideIcon> = {
  revenue: CircleDollarSign,
  goal:    Goal,
  gap:     Target,
  sellers: Store,
};

/** Infer direction from the change string if changeType is not provided */
function inferDirection(change: string, changeType?: DashboardMetric["changeType"]): "positive" | "negative" | "neutral" {
  if (changeType) return changeType;
  if (change.startsWith("+") || (!change.startsWith("-") && parseFloat(change) > 0)) return "positive";
  if (change.startsWith("-") || parseFloat(change) < 0) return "negative";
  return "neutral";
}

// ── Shared KPI cell used as a standalone component too ────────────────────────

export interface KpiMetricProps {
  label: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon?: LucideIcon;
  className?: string;
  showChange?: boolean;
}

export function KpiMetric({
  label,
  value,
  change,
  changeType,
  icon: Icon,
  className,
  showChange = true,
}: KpiMetricProps) {
  const showBadge = showChange && change != null && change !== "";
  const dir = showBadge ? inferDirection(change, changeType) : "neutral";

  const badgeCls =
    dir === "positive"
      ? "bg-[#D1F0D1] text-[#1A7F1A]"
      : dir === "negative"
        ? "bg-[#FAA69E] text-[#8B1A1A]"
        : "bg-[var(--color-muted)] text-[var(--color-muted-foreground)]";

  const ArrowIcon = dir === "positive" ? ArrowUp : dir === "negative" ? ArrowDown : null;

  return (
    <div className={cn("flex min-w-0 flex-1 flex-col px-[var(--space-4)] py-[var(--space-4)] first:pl-[var(--space-5)] last:pr-[var(--space-5)]", className)}>
      {/* Label — single line, truncated */}
      <div className="flex min-w-0 items-center gap-1.5 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
        {Icon && <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />}
        <span className="truncate whitespace-nowrap">{label}</span>
      </div>
      {/* Value + badge inline */}
      <div className="mt-1 flex items-center gap-2">
        <p className="text-[21px] font-bold leading-tight tracking-tight text-[var(--color-foreground)]">
          {value}
        </p>
        {showBadge && (
          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-0.5 rounded-[var(--radius-sm)] px-1.5 py-0.5 text-[var(--text-caption-size)] font-semibold",
              badgeCls,
            )}
          >
            {change}
            {ArrowIcon && <ArrowIcon className="h-3 w-3 shrink-0" aria-hidden />}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Strip variant (dashboard card) ───────────────────────────────────────────

interface DashboardKpiStripProps {
  metrics: DashboardMetric[];
  className?: string;
  showChange?: boolean;
}

function KpiMetricCell({
  metric,
  showChange,
}: {
  metric: DashboardMetric;
  showChange?: boolean;
}) {
  const Icon = iconMap[metric.icon];
  return (
    <KpiMetric
      label={metric.label}
      value={metric.value}
      change={metric.change}
      changeType={metric.changeType}
      icon={Icon}
      showChange={showChange}
    />
  );
}

export function DashboardKpiStrip({ metrics, className, showChange = true }: DashboardKpiStripProps) {
  return (
    <Card className={cn("min-w-0 overflow-hidden p-0 shadow-[var(--shadow-low)]", className)}>
      <div className="flex min-w-0 divide-x divide-[var(--color-border)]">
        {metrics.map((metric) => (
          <KpiMetricCell key={metric.label} metric={metric} showChange={showChange} />
        ))}
      </div>
    </Card>
  );
}
