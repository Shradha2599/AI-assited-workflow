"use client";

import { LayoutGrid, List, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ImagePlaceholder } from "@/components/ui/image-placeholder";
import { cn } from "@/lib/utils";

export interface MissingProduct {
  id: string;
  name: string;
  category: string;
  gapOpportunity: string;
  topCompetitor: string;
  estimatedRevenue: string;
}

interface MissingProductsTableProps {
  products: MissingProduct[];
  totalCount?: number;
  className?: string;
  onAddToPlan?: (productName: string) => void;
}

export function MissingProductsTable({
  products,
  totalCount = 10,
  className,
  onAddToPlan,
}: MissingProductsTableProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="text-[var(--text-section-size)] font-semibold">
          Top Missing Products: {totalCount}
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
      <CardContent className="overflow-x-auto p-0">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead>
            <tr className="border-y border-[var(--color-border)] bg-[var(--color-muted)]/50">
              {["Product", "Category", "Gap Opp...", "Top Competit...", "Estd. Revenue", "Action"].map(
                (header) => (
                  <th
                    key={header}
                    scope="col"
                    className="px-4 py-2 text-[var(--text-label-size)] font-medium text-[var(--color-muted-foreground)]"
                  >
                    {header}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-[var(--color-border)] last:border-b-0">
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <ImagePlaceholder size="sm" rounded="sm" label={product.name} />
                    <span className="max-w-[120px] truncate text-[var(--text-body-size)]">
                      {product.name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-2.5 text-[var(--text-body-size)]">{product.category}</td>
                <td className="px-4 py-2.5 text-[var(--text-body-size)] font-medium text-[var(--color-error)]">
                  {product.gapOpportunity}
                </td>
                <td className="px-4 py-2.5 text-[var(--text-body-size)]">{product.topCompetitor}</td>
                <td className="px-4 py-2.5 text-[var(--text-body-size)]">{product.estimatedRevenue}</td>
                <td className="px-4 py-2.5">
                  <Button variant="outline" size="sm" onClick={() => onAddToPlan?.(product.name)}>
                    <Plus className="h-3 w-3" />
                    Plan
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="border-t border-[var(--color-border)] px-4 py-2">
          <button
            type="button"
            className="text-[var(--text-caption-size)] font-medium text-[var(--color-primary)] hover:underline"
          >
            View All Products →
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
