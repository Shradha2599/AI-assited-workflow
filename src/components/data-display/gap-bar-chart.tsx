"use client";

import { useState } from "react";

import { AmChartCard } from "@/components/data-display/am-chart-card";
import { TruncatedText } from "@/components/ui/truncated-text";
import { cn } from "@/lib/utils";

export interface GapBar {
  label: string;
  value: number;
  revenueOpportunity: string;
}

interface GapBarChartProps {
  title?: string;
  data: GapBar[];
  filterLabel?: string;
  className?: string;
}

const Y_MAX = 40;
const Y_TICKS = [30, 25, 20, 15, 10, 5];

export function GapBarChart({
  title = "Assortment Gap Analysis",
  data,
  filterLabel = "Categories (8)",
  className,
}: GapBarChartProps) {
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);

  return (
    <AmChartCard title={title} filterLabel={filterLabel} className={className}>
      <div className="flex h-full min-h-[220px] w-full min-w-0 flex-col">
        <div className="flex min-h-0 flex-1 gap-1">
          <div className="relative w-9 shrink-0 self-stretch">
            <span className="absolute left-0 top-0 z-10 text-[var(--text-label-size)] leading-none text-[var(--color-muted-foreground)]">
              Gap%
            </span>
            <div className="absolute bottom-0 left-0 right-0 top-3">
              {Y_TICKS.map((tick) => (
                <span
                  key={tick}
                  className="absolute right-0 -translate-y-1/2 text-[var(--text-label-size)] leading-none text-[var(--color-muted-foreground)]"
                  style={{ bottom: `${(tick / Y_MAX) * 100}%` }}
                >
                  {tick}%
                </span>
              ))}
            </div>
          </div>

          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <div className="relative min-h-0 flex-1 border-b border-l border-[var(--color-border)] pt-4">
              {Y_TICKS.map((tick) => (
                <div
                  key={tick}
                  className="pointer-events-none absolute left-0 right-0 border-t border-dashed border-[var(--color-border)]/60"
                  style={{ bottom: `${(tick / Y_MAX) * 100}%` }}
                />
              ))}

              <div className="absolute inset-x-0 bottom-0 top-4 flex items-end">
                {data.map((bar, idx) => {
                  const heightPct = Math.min((bar.value / Y_MAX) * 100, 100);
                  const isHovered = hoveredLabel === bar.label;
                  const isFirst = idx === 0;
                  const isLast = idx === data.length - 1;
                  const tooltipAlign = isFirst
                    ? "left-0"
                    : isLast
                      ? "right-0"
                      : "left-1/2 -translate-x-1/2";
                  return (
                    <div
                      key={bar.label}
                      className="relative flex h-full min-w-0 flex-1 flex-col items-center justify-end px-0.5"
                    >
                      <div
                        className="relative flex w-full max-w-[40px] flex-col items-center justify-start"
                        style={{ height: `${heightPct}%`, minHeight: heightPct > 0 ? 4 : 0 }}
                      >
                        {isHovered && (
                          <div className={`pointer-events-none absolute bottom-full z-20 mb-6 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 shadow-[var(--shadow-medium)] ${tooltipAlign}`}>
                            <p className="whitespace-nowrap text-[var(--text-caption-size)] font-semibold text-[var(--color-foreground)]">
                              {bar.label}
                            </p>
                            <p className="whitespace-nowrap text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">
                              Revenue Opportunity: {bar.revenueOpportunity}
                            </p>
                          </div>
                        )}
                        <span className="absolute -top-4 left-1/2 w-max -translate-x-1/2 text-[var(--text-label-size)] font-medium leading-none text-[var(--color-foreground)]">
                          {bar.value}%
                        </span>
                        <button
                          type="button"
                          aria-label={`${bar.label}, ${bar.value}% gap, ${bar.revenueOpportunity} revenue opportunity`}
                          className={cn(
                            "mt-auto h-full w-full rounded-t-[var(--radius-sm)] bg-[#fa7b17] transition-colors",
                            isHovered ? "bg-[#e65100]" : "hover:bg-[#e65100]",
                          )}
                          onMouseEnter={() => setHoveredLabel(bar.label)}
                          onMouseLeave={() => setHoveredLabel(null)}
                          onFocus={() => setHoveredLabel(bar.label)}
                          onBlur={() => setHoveredLabel(null)}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-1 flex shrink-0 px-0.5">
              {data.map((bar) => (
                <div key={bar.label} className="min-w-0 flex-1">
                  <TruncatedText
                    text={bar.label}
                    className="text-center text-[var(--text-label-size)] leading-tight text-[var(--color-muted-foreground)]"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AmChartCard>
  );
}
