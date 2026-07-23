"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { usePlanStore } from "@/features/assortment-plan/store/plan-store";
import {
  FISCAL_YEAR_OPTIONS,
  type FiscalYearId,
} from "@/lib/mock-data/fy-plan-seeds";
import { cn } from "@/lib/utils";

export function FiscalYearSelector() {
  const fiscalYear = usePlanStore((s) => s.fiscalYear);
  const setFiscalYear = usePlanStore((s) => s.setFiscalYear);
  const [open, setOpen] = useState(false);

  const active = FISCAL_YEAR_OPTIONS.find((opt) => opt.id === fiscalYear) ?? FISCAL_YEAR_OPTIONS[0];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2.5 py-1 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
      >
        {active.label}
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
          <ul className="absolute right-0 top-full z-50 mt-1 min-w-[160px] rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card)] py-1 shadow-[var(--shadow-medium)]">
            {FISCAL_YEAR_OPTIONS.map((opt) => (
              <li key={opt.id}>
                <button
                  type="button"
                  onClick={() => {
                    setFiscalYear(opt.id as FiscalYearId);
                    setOpen(false);
                  }}
                  className={cn(
                    "w-full px-3 py-2 text-left text-[var(--text-caption-size)] hover:bg-[var(--color-muted)]",
                    opt.id === fiscalYear &&
                      "bg-[var(--color-primary)]/8 font-medium text-[var(--color-primary)]",
                  )}
                >
                  {opt.label}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
