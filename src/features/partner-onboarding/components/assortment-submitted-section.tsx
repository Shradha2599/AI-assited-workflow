"use client";

import Image from "next/image";
import { ChevronDown, ExternalLink, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TruncatedText } from "@/components/ui/truncated-text";
import {
  getAssortmentCurationContent,
  type AssortmentSkuRow,
} from "@/lib/mock-data/assortment-curation-content";
import { TablePagination } from "./profile-review-shared";

function TableToolbar() {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <div className="relative min-w-[200px] flex-1 max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
        <input
          readOnly
          placeholder="Search"
          className="h-9 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-muted)]/20 pl-9 pr-3 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]"
        />
      </div>
      <div className="ml-auto flex flex-wrap items-center justify-end gap-3">
        <button
          type="button"
          className="flex items-center gap-1 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white px-3 py-2 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]"
        >
          All partner item catego... <ChevronDown className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          className="flex items-center gap-1 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white px-3 py-2 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]"
        >
          All partner item types <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

export function AssortmentSubmittedTable({ rows }: { rows: AssortmentSkuRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[960px] border-collapse text-[var(--text-caption-size)]">
        <thead>
          <tr className="border-b border-[var(--color-border)] bg-[var(--color-card)] text-left text-[var(--text-label-size)] font-semibold text-[var(--color-muted-foreground)]">
            {[
              "Partner SKU",
              "Barcode",
              "Brand",
              "Product title",
              "Product description",
              "Partner item category",
              "Partner item subcategory",
              "Ship speed",
              "Retail price",
              "Primary image URL",
            ].map((col) => (
              <th key={col} className="px-3 py-2.5 font-semibold">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.partnerSku} className="border-b border-[var(--color-border)] last:border-0">
              <td className="px-3 py-2.5 tabular-nums">{row.partnerSku}</td>
              <td className="px-3 py-2.5 tabular-nums">{row.barcode}</td>
              <td className="px-3 py-2.5">{row.brand}</td>
              <td className="max-w-[160px] px-3 py-2.5">
                <TruncatedText text={row.productTitle ?? ""} />
              </td>
              <td className="max-w-[180px] px-3 py-2.5 text-[var(--color-muted-foreground)]">
                <TruncatedText text={row.productDescription ?? ""} />
              </td>
              <td className="px-3 py-2.5">{row.partnerItemCategory}</td>
              <td className="px-3 py-2.5">{row.partnerItemSubcategory}</td>
              <td className="px-3 py-2.5">{row.shipSpeed}</td>
              <td className="px-3 py-2.5 tabular-nums">{row.retailPrice}</td>
              <td className="max-w-[120px] px-3 py-2.5">
                <span className="inline-flex max-w-full items-center gap-0.5 text-[var(--color-primary)]">
                  <TruncatedText
                    text={`${row.primaryImageUrl.replace("https://", "").slice(0, 18)}...`}
                    tooltipText={row.primaryImageUrl}
                    inline
                    className="text-[var(--color-primary)]"
                  />
                  <ExternalLink className="h-3 w-3 shrink-0" />
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface AssortmentSubmittedSectionProps {
  partnerId: string;
}

export function AssortmentSubmittedSection({ partnerId }: AssortmentSubmittedSectionProps) {
  const content = getAssortmentCurationContent(partnerId);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[var(--text-body-size)] font-semibold">
          Assortment submitted through lead form ({content.submittedCount.toLocaleString()})
        </p>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Image src="/icons/download.svg" alt="" width={14} height={14} aria-hidden />
          Download as excel
        </Button>
      </div>
      <TableToolbar />
      <AssortmentSubmittedTable rows={content.submittedSkus} />
      <TablePagination showing={content.submittedSkus.length} total={content.submittedCount} />
    </div>
  );
}
