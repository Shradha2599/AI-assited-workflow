"use client";

import { ChevronDown, Search, TrendingUp } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { DrawerPanel } from "@/components/ui/drawer-panel";
import { cn } from "@/lib/utils";

export interface FilterDraft {
  location: string;
  businessType: string;
  marketplace: string;
  category: string;
  minConfidence: number;
  minGmv: number;
  viralOnly: boolean;
}

interface LeadDiscoveryFiltersDrawerProps {
  open: boolean;
  onClose: () => void;
  filterDraft: FilterDraft;
  onChange: (draft: FilterDraft) => void;
  onDiscover: () => void;
  isDiscovering: boolean;
  hasActiveFilters: boolean;
  onClear: () => void;
  businessTypes: string[];
  marketplaces: string[];
  categories: string[];
}

function FilterSection({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-[var(--color-border)] last:border-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between py-3 text-left text-[var(--text-body-size)] font-semibold text-[var(--color-foreground)]"
      >
        {title}
        <ChevronDown className={cn("h-4 w-4 text-[var(--color-muted-foreground)] transition-transform", open && "rotate-180")} />
      </button>
      {open && <div className="space-y-3 pb-4">{children}</div>}
    </div>
  );
}

export function LeadDiscoveryFiltersDrawer({
  open,
  onClose,
  filterDraft,
  onChange,
  onDiscover,
  isDiscovering,
  hasActiveFilters,
  onClear,
  businessTypes,
  marketplaces,
  categories,
}: LeadDiscoveryFiltersDrawerProps) {
  const [sellerOpen, setSellerOpen] = useState(true);
  const [operationsOpen, setOperationsOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  if (!open) return null;

  function patch(partial: Partial<FilterDraft>) {
    onChange({ ...filterDraft, ...partial });
  }

  return (
    <DrawerPanel
      title="Filters"
      ariaLabel="Lead discovery filters"
      onClose={onClose}
      footer={
        <div className="space-y-2">
          <Button className="w-full gap-2" onClick={onDiscover} disabled={isDiscovering}>
            {isDiscovering ? (
              <>Discovering…</>
            ) : (
              <>
                <Search className="h-4 w-4" /> Discover Leads
              </>
            )}
          </Button>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onClear}
              className="w-full text-center text-[var(--text-caption-size)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
            >
              Clear all filters
            </button>
          )}
        </div>
      }
    >
      <div className="px-[var(--space-4)] py-[var(--space-4)]">
        <FilterSection title="Seller Business" open={sellerOpen} onToggle={() => setSellerOpen((v) => !v)}>
          <div>
            <label className="mb-1 block text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
              Seller Location
            </label>
            <select
              value={filterDraft.location}
              onChange={(e) => patch({ location: e.target.value })}
              className="h-9 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-[var(--text-caption-size)] focus:outline-none"
            >
              <option value="">Select Location</option>
              <option value="United States">United States</option>
              <option value="Canada">Canada</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
              Business Type
            </label>
            <select
              value={filterDraft.businessType}
              onChange={(e) => patch({ businessType: e.target.value })}
              className="h-9 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-[var(--text-caption-size)] focus:outline-none"
            >
              <option value="">Select Business Type</option>
              {businessTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
              <span>Minimum GMV Potential</span>
              <span className="font-medium text-[var(--color-foreground)]">
                {filterDraft.minGmv >= 1_000_000
                  ? `$${(filterDraft.minGmv / 1_000_000).toFixed(1)}M`
                  : filterDraft.minGmv >= 1_000
                    ? `$${(filterDraft.minGmv / 1_000).toFixed(0)}K`
                    : "$0"}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={5_000_000}
              step={100_000}
              value={filterDraft.minGmv}
              onChange={(e) => patch({ minGmv: Number(e.target.value) })}
              className="w-full accent-[var(--color-primary)]"
            />
          </div>
          <div>
            <label className="mb-1 block text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
              Seller Rating
            </label>
            <select
              value={filterDraft.minConfidence >= 8 ? "4.5" : filterDraft.minConfidence >= 7 ? "4.0" : ""}
              onChange={(e) => {
                const val = e.target.value;
                patch({ minConfidence: val === "4.5" ? 8 : val === "4.0" ? 7 : 0 });
              }}
              className="h-9 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-[var(--text-caption-size)] focus:outline-none"
            >
              <option value="">Select Rating</option>
              <option value="4.0">4.0+</option>
              <option value="4.5">4.5+</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
              Marketplace Experience
            </label>
            <select
              value={filterDraft.marketplace}
              onChange={(e) => patch({ marketplace: e.target.value })}
              className="h-9 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-[var(--text-caption-size)] focus:outline-none"
            >
              <option value="">Select Marketplaces</option>
              {marketplaces.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </FilterSection>

        <FilterSection title="Operations" open={operationsOpen} onToggle={() => setOperationsOpen((v) => !v)}>
          <div>
            <label className="mb-1 block text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
              Category
            </label>
            <select
              value={filterDraft.category}
              onChange={(e) => patch({ category: e.target.value })}
              className="h-9 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-[var(--text-caption-size)] focus:outline-none"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </FilterSection>

        <FilterSection title="Advanced Filters" open={advancedOpen} onToggle={() => setAdvancedOpen((v) => !v)}>
          <div>
            <label className="mb-1 block text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
              Minimum Confidence Score
            </label>
            <select
              value={filterDraft.minConfidence}
              onChange={(e) => patch({ minConfidence: Number(e.target.value) })}
              className="h-9 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-[var(--text-caption-size)] focus:outline-none"
            >
              <option value={0}>Any Score</option>
              <option value={7}>7.0+</option>
              <option value={8}>8.0+</option>
              <option value={9}>9.0+</option>
            </select>
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-[var(--text-caption-size)]">
            <input
              type="checkbox"
              checked={filterDraft.viralOnly}
              onChange={(e) => patch({ viralOnly: e.target.checked })}
              className="accent-[var(--color-primary)]"
            />
            <TrendingUp className="h-3.5 w-3.5 text-[var(--color-muted-foreground)]" />
            Viral / Trending sellers only
          </label>
        </FilterSection>
      </div>
    </DrawerPanel>
  );
}
