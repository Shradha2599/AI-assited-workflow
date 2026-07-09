import { Info } from "lucide-react";

interface DrawerRevenueSummaryProps {
  revenueGoal: string;
  revenuePlanned: string;
  revenuePlannedPercent: number;
  plannedMessage: string;
}

export function DrawerRevenueSummary({
  revenueGoal,
  revenuePlanned,
  revenuePlannedPercent,
  plannedMessage,
}: DrawerRevenueSummaryProps) {
  return (
    <div>
      <div className="flex items-stretch py-[var(--space-2)]">
        <div className="flex flex-1 flex-col items-center gap-0.5 text-center">
          <span className="text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
            Revenue Goal
          </span>
          <span
            className={`text-[var(--text-kpi-size)] font-semibold leading-[var(--text-kpi-line-height)] ${
              revenueGoal === "—" || revenueGoal === "NA"
                ? "text-[var(--color-muted-foreground)]"
                : "text-[var(--color-foreground)]"
            }`}
          >
            {revenueGoal}
          </span>
        </div>
        <div className="mx-[var(--space-3)] w-px self-stretch bg-[var(--color-border)]" aria-hidden />
        <div className="flex flex-1 flex-col items-center gap-0.5 text-center">
          <span className="text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
            Planned Revenue
          </span>
          <span className="text-[var(--text-kpi-size)] font-semibold leading-[var(--text-kpi-line-height)] text-[var(--color-foreground)]">
            {revenuePlanned}
          </span>
        </div>
      </div>

      <div className="mt-[var(--space-3)] rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card)] p-[var(--space-4)]">
        <div className="mb-[var(--space-2)] flex items-center justify-between gap-2">
          <span className="text-[var(--text-body-size)] font-semibold text-[var(--color-foreground)]">
            Revenue Planned
          </span>
          <span className="text-[var(--text-body-size)] text-[var(--color-foreground)]">
            {revenuePlannedPercent}%
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[var(--color-progress-track)]">
          <div
            className="h-full rounded-full bg-[var(--color-primary)] transition-all"
            style={{ width: `${revenuePlannedPercent}%` }}
          />
        </div>
        <p className="mt-[var(--space-2)] flex items-start gap-1.5 text-[var(--text-caption-size)] leading-snug text-[var(--color-muted-foreground)]">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          {plannedMessage}
        </p>
      </div>
    </div>
  );
}
