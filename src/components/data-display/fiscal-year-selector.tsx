"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
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
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen((value) => !value)}
        className="gap-1.5 font-normal"
      >
        {active.shortLabel}
        <ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} />
      </Button>
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
