"use client";

import { useMemo, useState } from "react";
import { ChevronDown, LayoutGrid, List, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { GapOpportunityBadge } from "@/components/data-display/gap-opportunity-badge";
import { ProductThumbnail } from "@/components/ui/product-thumbnail";
import { cn } from "@/lib/utils";

export interface MissingProduct {
  id: string;
  name: string;
  category: string;
  gapOpportunity: string;
  topCompetitor: string;
  estimatedRevenue: string;
  imageUrl?: string;
}

const ITEMS_PER_PAGE = 10;

interface MissingProductsTableProps {
  products: MissingProduct[];
  totalCount?: number;
  className?: string;
  onAddToPlan?: (productName: string) => void;
}

export function MissingProductsTable({
  products,
  totalCount,
  className,
  onAddToPlan,
}: MissingProductsTableProps) {
  const [page, setPage] = useState(1);
  const resolvedTotal = totalCount ?? products.length;
  const totalPages = Math.max(1, Math.ceil(resolvedTotal / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);

  const pageProducts = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return products.slice(start, start + ITEMS_PER_PAGE);
  }, [products, safePage]);

  const rangeStart = resolvedTotal === 0 ? 0 : (safePage - 1) * ITEMS_PER_PAGE + 1;
  const rangeEnd = Math.min(safePage * ITEMS_PER_PAGE, resolvedTotal);

  return (
    <Card className={cn(className)}>
      <CardHeader className="flex-row items-center justify-between space-y-0 px-6 pb-2 pt-[var(--space-4)]">
        <h3 className="text-[var(--text-section-size)] font-semibold">
          Top Missing Products: {resolvedTotal}
        </h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 py-1 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]"
          >
            Select Categories (7) ▾
          </button>
          <div className="flex rounded-[var(--radius-sm)] border border-[var(--color-border)]">
            <button type="button" className="px-2 py-1 text-[var(--color-muted-foreground)]" aria-label="List view">
              <List className="h-3.5 w-3.5" />
            </button>
            <button type="button" className="border-l border-[var(--color-border)] px-2 py-1 text-[var(--color-primary)]" aria-label="Grid view">
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto px-6">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr>
                {["Product", "Category", "Gap Opp...", "Top Competit...", "Estd. Revenue", "Action"].map(
                  (header) => (
                    <th
                      key={header}
                      scope="col"
                      className="border-b border-[var(--color-border)] py-2 text-[var(--text-label-size)] font-medium text-[var(--color-muted-foreground)]"
                    >
                      {header}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {pageProducts.map((product) => (
                <tr key={product.id} className="border-b border-[var(--color-border)] last:border-b-0">
                  <td className="py-2.5 pr-4">
                    <div className="flex items-center gap-2">
                      <ProductThumbnail size="sm" src={product.imageUrl} itemId={product.id} alt={product.name} />
                      <span className="max-w-[120px] truncate text-[var(--text-body-size)]">
                        {product.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 pr-4 text-[var(--text-body-size)]">{product.category}</td>
                  <td className="py-2.5 pr-4">
                    <GapOpportunityBadge value={product.gapOpportunity} />
                  </td>
                  <td className="py-2.5 pr-4 text-[var(--text-body-size)]">{product.topCompetitor}</td>
                  <td className="py-2.5 pr-4 text-[var(--text-body-size)]">{product.estimatedRevenue}</td>
                  <td className="py-2.5">
                    <Button variant="outline" size="sm" onClick={() => onAddToPlan?.(product.name)}>
                      <Plus className="h-3 w-3" />
                      Plan
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-border)] px-6 py-3 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
          <span>
            Showing {rangeStart}-{rangeEnd} of {resolvedTotal.toLocaleString()} items
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setPage(1)}
              className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 py-1 disabled:opacity-40"
              aria-label="First page"
            >
              «
            </button>
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 py-1 disabled:opacity-40"
              aria-label="Previous page"
            >
              ‹
            </button>
            <span className="flex items-center gap-1 px-1">
              Page
              <select
                value={safePage}
                onChange={(e) => setPage(Number(e.target.value))}
                className="mx-1 rounded border border-[var(--color-border)] bg-[var(--color-card)] px-1.5 py-0.5 text-[var(--color-foreground)]"
              >
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              of {totalPages}
            </span>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 py-1 disabled:opacity-40"
              aria-label="Next page"
            >
              ›
            </button>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setPage(totalPages)}
              className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 py-1 disabled:opacity-40"
              aria-label="Last page"
            >
              »
            </button>
            <span className="ml-2">Items per page</span>
            <button
              type="button"
              className="flex items-center gap-1 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 py-1"
            >
              {ITEMS_PER_PAGE} <ChevronDown className="h-3 w-3" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
