"use client";

import Image from "next/image";
import { useMemo } from "react";
import { Check, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusTag } from "@/components/ui/status-tag";
import {
  getAnalysisForSource,
  type AssortmentAnalysisSource,
  type AssortmentCurationContent,
  type AssortmentSkuRow,
} from "@/lib/mock-data/assortment-curation-content";
import { cn } from "@/lib/utils";
import { TablePagination } from "./profile-review-shared";
import { useAssortmentCurationStore } from "../store/assortment-curation-store";

function YesNoPill({ value }: { value: boolean }) {
  return value ? (
    <StatusTag className="inline-flex items-center gap-1 bg-[var(--color-success-light)] font-normal text-[var(--color-success)]">
      <Check className="h-3 w-3" /> Yes
    </StatusTag>
  ) : (
    <span className="text-[var(--color-muted-foreground)]">No</span>
  );
}

function BarcodeStatusPill({ status }: { status: AssortmentSkuRow["barcodeStatus"] }) {
  if (status === "Available") {
    return (
      <StatusTag className="inline-flex items-center gap-1 bg-[var(--color-success-light)] font-normal text-[var(--color-success)]">
        <Check className="h-3 w-3" /> Available
      </StatusTag>
    );
  }
  if (status === "Invalid") {
    return (
      <StatusTag className="bg-[var(--color-warning-light)] font-normal text-[var(--color-warning)]">
        Invalid
      </StatusTag>
    );
  }
  return (
    <StatusTag className="bg-[var(--color-muted)] font-normal text-[var(--color-muted-foreground)]">
      Not available
    </StatusTag>
  );
}

function MetricCard({
  label,
  value,
  iconSrc,
}: {
  label: string;
  value: string | number;
  iconSrc?: string;
}) {
  return (
    <Card className="rounded-[var(--radius-xl)] border-[var(--color-border)] p-4 shadow-none">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">{label}</p>
          <p className="mt-1 text-[24px] font-semibold tabular-nums text-[var(--color-foreground)]">{value}</p>
        </div>
        {iconSrc && (
          <Image src={iconSrc} alt="" width={20} height={20} className="shrink-0 opacity-60" aria-hidden />
        )}
      </div>
    </Card>
  );
}

function DonutChart({ total, home, apparel }: { total: number; home: number; apparel: number }) {
  const homePct = total > 0 ? (home / total) * 100 : 0;
  return (
    <div className="relative mx-auto h-[140px] w-[140px]">
      <div
        className="h-full w-full rounded-full"
        style={{
          background: `conic-gradient(#34a853 0% ${homePct}%, #9ca3af ${homePct}% 100%)`,
        }}
        aria-hidden
      />
      <div className="absolute inset-[18%] flex items-center justify-center rounded-full bg-white">
        <span className="text-[22px] font-semibold tabular-nums">{total.toLocaleString()}</span>
      </div>
    </div>
  );
}

function BarcodeHealthBar({
  available,
  invalid,
  unavailable,
}: {
  available: number;
  invalid: number;
  unavailable: number;
}) {
  const total = available + invalid + unavailable || 1;
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-2 w-16 overflow-hidden rounded-full">
        <div className="bg-[#34a853]" style={{ width: `${(available / total) * 100}%` }} />
        <div className="bg-[#fa7b17]" style={{ width: `${(invalid / total) * 100}%` }} />
        <div className="bg-[#ea4335]" style={{ width: `${(unavailable / total) * 100}%` }} />
      </div>
      <span className="tabular-nums text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">
        {available}, {invalid}, {unavailable}
      </span>
    </div>
  );
}

function SourceFilter({
  sources,
  activeId,
  onChange,
}: {
  sources: AssortmentCurationContent["analysisSources"];
  activeId: string;
  onChange: (id: string) => void;
}) {
  const active = sources.find((s) => s.id === activeId) ?? sources[0];

  return (
    <div className="relative">
      <label htmlFor="analysis-source" className="sr-only">
        Assortment source
      </label>
      <select
        id="analysis-source"
        value={active?.id ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-10 min-w-[240px] appearance-none rounded-[var(--radius-md)] border border-[var(--color-border)]",
          "bg-white py-2 pl-3 pr-9 text-[var(--text-caption-size)] font-medium text-[var(--color-foreground)]",
        )}
      >
        {sources.map((source) => (
          <option key={source.id} value={source.id}>
            {source.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
    </div>
  );
}

function AnalysisContent({ source }: { source: AssortmentAnalysisSource }) {
  const { analysis, brands, itemTypes, skuDrillDown } = source;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
          <MetricCard label="Total SKUs" value={analysis.totalSkus.toLocaleString()} iconSrc="/icons/box-closed.svg" />
          <MetricCard label="WERCS-Flagged" value={analysis.wercsFlagged} iconSrc="/icons/checkmark-approved.svg" />
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 shrink-0">
          <Image src="/icons/download.svg" alt="" width={14} height={14} aria-hidden />
          Download
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-[var(--radius-xl)] border-[var(--color-border)] p-6 shadow-none">
          <h4 className="text-[var(--text-body-size)] font-semibold">SKUs by product type</h4>
          <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-around">
            <DonutChart total={analysis.totalSkus} home={analysis.homeSkus} apparel={analysis.apparelSkus} />
            <div className="space-y-2 text-[var(--text-caption-size)]">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#34a853]" />
                Home ({analysis.homeSkus.toLocaleString()})
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#9ca3af]" />
                Apparel ({analysis.apparelSkus.toLocaleString()})
              </div>
            </div>
          </div>
        </Card>

        <Card className="rounded-[var(--radius-xl)] border-[var(--color-border)] p-6 shadow-none">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h4 className="text-[var(--text-body-size)] font-semibold">Brand details</h4>
            <p className="text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
              Unique brands: {analysis.uniqueBrands} · Protected brands: {analysis.protectedBrands}
            </p>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-[var(--text-caption-size)]">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-left text-[var(--text-label-size)] font-semibold text-[var(--color-muted-foreground)]">
                  {["Brand", "SKUs", "Protected", "AGP"].map((col) => (
                    <th key={col} className="py-2 pr-4">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {brands.map((b) => (
                  <tr key={b.brand} className="border-b border-[var(--color-border)] last:border-0">
                    <td className="py-2.5 pr-4 font-medium">{b.brand}</td>
                    <td className="py-2.5 pr-4 tabular-nums">{b.skus.toLocaleString()}</td>
                    <td className="py-2.5 pr-4">
                      <YesNoPill value={b.protected} />
                    </td>
                    <td className="py-2.5 tabular-nums">{b.agp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <section>
        <h4 className="text-[var(--text-body-size)] font-semibold">Item type analysis</h4>
        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <MetricCard label="Total SKUs" value={analysis.totalSkus.toLocaleString()} />
          <MetricCard label="Barcodes available" value={analysis.barcodesAvailable.toLocaleString()} />
          <MetricCard label="Barcodes invalid" value={analysis.barcodesInvalid.toLocaleString()} />
          <MetricCard label="Barcodes unavailable" value={analysis.barcodesUnavailable.toLocaleString()} />
        </div>
        <div className="mt-4 overflow-x-auto rounded-[var(--radius-xl)] border border-[var(--color-border)]">
          <table className="w-full min-w-[640px] border-collapse text-[var(--text-caption-size)]">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-card)] text-left text-[var(--text-label-size)] font-semibold text-[var(--color-muted-foreground)]">
                {["Item type", "Total SKUs", "Coverage", "Barcode health"].map((col) => (
                  <th key={col} className="px-4 py-2.5">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {itemTypes.map((row) => (
                <tr key={row.itemType} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="px-4 py-2.5 font-medium">{row.itemType}</td>
                  <td className="px-4 py-2.5 tabular-nums">{row.totalSkus.toLocaleString()}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[var(--color-progress-track)]">
                        <div
                          className="h-full rounded-full bg-[var(--color-primary)]"
                          style={{ width: `${row.coveragePercent}%` }}
                        />
                      </div>
                      <span className="tabular-nums">{row.coveragePercent}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <BarcodeHealthBar
                      available={row.barcodeAvailable}
                      invalid={row.barcodeInvalid}
                      unavailable={row.barcodeUnavailable}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h4 className="text-[var(--text-body-size)] font-semibold">
            SKU drill down ({analysis.totalSkus.toLocaleString()})
          </h4>
        </div>
        <div className="overflow-x-auto rounded-[var(--radius-xl)] border border-[var(--color-border)]">
          <table className="w-full min-w-[1200px] border-collapse text-[var(--text-caption-size)]">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-card)] text-left text-[var(--text-label-size)] font-semibold text-[var(--color-muted-foreground)]">
                {[
                  "SKU",
                  "Product title",
                  "BU",
                  "Division",
                  "Department",
                  "Brand",
                  "Item type",
                  "Protected",
                  "Barcode status",
                  "WERCS status",
                  "WERCS action required",
                ].map((col) => (
                  <th key={col} className="px-3 py-2.5">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {skuDrillDown.map((row) => (
                <tr key={row.partnerSku} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="px-3 py-2.5 tabular-nums">{row.partnerSku}</td>
                  <td className="max-w-[140px] truncate px-3 py-2.5">{row.productTitle}</td>
                  <td className="px-3 py-2.5">{row.bu}</td>
                  <td className="px-3 py-2.5">{row.division}</td>
                  <td className="px-3 py-2.5">{row.department}</td>
                  <td className="px-3 py-2.5">{row.brand}</td>
                  <td className="px-3 py-2.5">{row.itemType}</td>
                  <td className="px-3 py-2.5">
                    <YesNoPill value={row.protectedBrand ?? false} />
                  </td>
                  <td className="px-3 py-2.5">
                    <BarcodeStatusPill status={row.barcodeStatus} />
                  </td>
                  <td className="max-w-[140px] truncate px-3 py-2.5 text-[var(--color-muted-foreground)]">
                    {row.wercsStatus}
                  </td>
                  <td className="max-w-[160px] truncate px-3 py-2.5 text-[var(--color-muted-foreground)]">
                    {row.wercsActionRequired}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <TablePagination showing={skuDrillDown.length} total={analysis.totalSkus} />
      </section>
    </div>
  );
}

interface AssortmentAnalysisTabProps {
  content: AssortmentCurationContent;
}

export function AssortmentAnalysisTab({ content }: AssortmentAnalysisTabProps) {
  const analysisSourceId = useAssortmentCurationStore((s) => s.analysisSourceId);
  const setAnalysisSource = useAssortmentCurationStore((s) => s.setAnalysisSource);

  const activeSource = useMemo(
    () => getAnalysisForSource(content, analysisSourceId ?? content.analysisSources[0]?.id ?? "seller-excel"),
    [content, analysisSourceId],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="text-[var(--text-body-size)] font-semibold">Assortment analysis</h4>
          <p className="mt-1 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
            Compare metrics across the seller submission and TM curated versions.
          </p>
        </div>
        <SourceFilter
          sources={content.analysisSources}
          activeId={activeSource.id}
          onChange={setAnalysisSource}
        />
      </div>
      <AnalysisContent source={activeSource} />
    </div>
  );
}
