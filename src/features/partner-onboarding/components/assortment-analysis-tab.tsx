"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  CircleOff,
  Package,
  ScanBarcode,
  type LucideIcon,
} from "lucide-react";

import { KpiMetric } from "@/components/data-display/dashboard-kpi-card";
import { DonutChart } from "@/components/data-display/donut-chart";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusTag, markerToneClass } from "@/components/ui/status-tag";
import { TruncatedText } from "@/components/ui/truncated-text";
import {
  getAnalysisForSource,
  getAnalysisSourceOptions,
  type AnalysisSourceOption,
  type AssortmentAnalysisSource,
  type AssortmentCurationContent,
  type AssortmentSkuRow,
} from "@/lib/mock-data/assortment-curation-content";
import { cn } from "@/lib/utils";
import { TablePagination } from "./profile-review-shared";
import { useAssortmentCurationStore } from "../store/assortment-curation-store";

function ProtectedStatusMarker({ value }: { value: boolean }) {
  return value ? (
    <StatusTag className={cn("font-normal", markerToneClass.success)}>Yes</StatusTag>
  ) : (
    <StatusTag className={cn("font-normal", markerToneClass.neutral)}>No</StatusTag>
  );
}

function BarcodeStatusMarker({ status }: { status?: AssortmentSkuRow["barcodeStatus"] }) {
  if (status === "Available") {
    return (
      <StatusTag className={cn("font-normal", markerToneClass.success)}>Available</StatusTag>
    );
  }
  return (
    <StatusTag className={cn("font-normal", markerToneClass.neutral)}>Not available</StatusTag>
  );
}

function KpiMetricStrip({
  metrics,
}: {
  metrics: { label: string; value: string; icon?: LucideIcon }[];
}) {
  return (
    <Card className="min-w-0 overflow-hidden p-0 shadow-[var(--shadow-low)]">
      <div className="flex min-w-0 divide-x divide-[var(--color-border)]">
        {metrics.map((metric) => (
          <KpiMetric
            key={metric.label}
            label={metric.label}
            value={metric.value}
            icon={metric.icon}
            showChange={false}
          />
        ))}
      </div>
    </Card>
  );
}

function BrandSummaryMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col px-[var(--space-5)] py-[var(--space-4)]">
      <p className="text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">{label}</p>
      <p className="mt-1 text-[21px] font-bold leading-tight tracking-tight tabular-nums text-[var(--color-foreground)]">
        {value}
      </p>
    </div>
  );
}

function BrandDetailsCard({
  uniqueBrands,
  protectedBrands,
  brands,
}: {
  uniqueBrands: number;
  protectedBrands: number;
  brands: AssortmentAnalysisSource["brands"];
}) {
  return (
    <Card className="flex h-full min-h-0 flex-col overflow-hidden p-0 shadow-[var(--shadow-low)]">
      <div className="shrink-0 px-[var(--space-6)] pb-2 pt-[var(--space-6)]">
        <h3 className="text-[var(--text-section-size)] font-semibold">Brand details</h3>
      </div>

      <div className="flex shrink-0 divide-x divide-[var(--color-border)] border-y border-[var(--color-border)]">
        <BrandSummaryMetric label="Unique brands" value={uniqueBrands} />
        <BrandSummaryMetric label="Protected brands" value={protectedBrands} />
      </div>

      <div className="min-h-0 flex-1 overflow-x-auto">
        <table className="w-full border-collapse text-[var(--text-caption-size)]">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-left text-[var(--text-label-size)] font-semibold text-[var(--color-muted-foreground)]">
              {["Brand", "SKUs", "Protected", "AGP"].map((col) => (
                <th key={col} className="px-[var(--space-6)] py-3">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {brands.map((brand) => (
              <tr key={brand.brand} className="border-b border-[var(--color-border)] last:border-0">
                <td className="px-[var(--space-6)] py-4 font-medium text-[var(--color-foreground)]">
                  {brand.brand}
                </td>
                <td className="px-[var(--space-6)] py-4 tabular-nums">{brand.skus.toLocaleString()}</td>
                <td className="px-[var(--space-6)] py-4">
                  <ProtectedStatusMarker value={brand.protected} />
                </td>
                <td className="px-[var(--space-6)] py-4 tabular-nums">{brand.agp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="shrink-0 border-t border-[var(--color-border)] px-[var(--space-6)] py-3">
        <TablePagination
          showing={brands.length}
          total={brands.length}
          itemLabel="brands"
          className="mt-0"
        />
      </div>
    </Card>
  );
}

function ItemTypeAnalysisCard({
  analysis,
  itemTypes,
}: {
  analysis: AssortmentAnalysisSource["analysis"];
  itemTypes: AssortmentAnalysisSource["itemTypes"];
}) {
  const kpiMetrics = [
    { label: "Total SKUs", value: analysis.totalSkus.toLocaleString(), icon: Package },
    {
      label: "Barcodes available",
      value: analysis.barcodesAvailable.toLocaleString(),
      icon: ScanBarcode,
      iconClassName: "text-[var(--color-success)]",
    },
    {
      label: "Barcodes invalid",
      value: analysis.barcodesInvalid.toLocaleString(),
      icon: AlertTriangle,
      iconClassName: "text-[var(--color-warning)]",
    },
    {
      label: "Barcodes unavailable",
      value: analysis.barcodesUnavailable.toLocaleString(),
      icon: CircleOff,
      iconClassName: "text-[var(--color-muted-foreground)]",
    },
  ];

  return (
    <Card className="overflow-hidden p-0 shadow-[var(--shadow-low)]">
      <div className="shrink-0 px-[var(--space-6)] pb-2 pt-[var(--space-6)]">
        <h3 className="text-[var(--text-section-size)] font-semibold">Item type analysis</h3>
      </div>

      <div className="flex shrink-0 divide-x divide-[var(--color-border)] border-y border-[var(--color-border)]">
        {kpiMetrics.map((metric) => (
          <KpiMetric
            key={metric.label}
            label={metric.label}
            value={metric.value}
            icon={metric.icon}
            iconClassName={metric.iconClassName}
            showChange={false}
          />
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-fixed border-collapse text-[var(--text-caption-size)]">
          <colgroup>
            <col className="w-[24%]" />
            <col className="w-[14%]" />
            <col className="w-[28%]" />
            <col className="w-[34%]" />
          </colgroup>
          <thead>
            <tr className="border-b border-[var(--color-border)] text-left text-[var(--text-label-size)] font-semibold text-[var(--color-muted-foreground)]">
              {["Item type", "Total SKUs", "Coverage", "Barcode health"].map((col) => (
                <th key={col} className="px-[var(--space-6)] py-3">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {itemTypes.map((row) => (
              <tr key={row.itemType} className="border-b border-[var(--color-border)] last:border-0">
                <td className="px-[var(--space-6)] py-4 font-medium text-[var(--color-foreground)]">
                  {row.itemType}
                </td>
                <td className="px-[var(--space-6)] py-4 tabular-nums">{row.totalSkus.toLocaleString()}</td>
                <td className="min-w-0 px-[var(--space-6)] py-4">
                  <CoverageBar percent={row.coveragePercent} />
                </td>
                <td className="min-w-0 px-[var(--space-6)] py-4">
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

      <div className="shrink-0 border-t border-[var(--color-border)] px-[var(--space-6)] py-3">
        <TablePagination showing={itemTypes.length} total={itemTypes.length} className="mt-0" />
      </div>
    </Card>
  );
}

function CoverageBar({ percent }: { percent: number }) {
  return (
    <div className="relative w-full min-w-0 pt-5">
      <span className="absolute right-0 top-0 tabular-nums text-[var(--text-caption-size)] text-[var(--color-foreground)]">
        {percent}%
      </span>
      <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-progress-track)]">
        <div
          className="h-full rounded-full bg-[var(--color-primary)]"
          style={{ width: `${percent}%` }}
        />
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
  const segments = [
    { key: "available", value: available, color: "#34a853" },
    { key: "invalid", value: invalid, color: "#c77600" },
    { key: "unavailable", value: unavailable, color: "#9ca3af" },
  ];

  return (
    <div className="w-full min-w-0">
      <div className="mb-1.5 flex items-center justify-end gap-3">
        {segments.map((segment) => (
          <span
            key={segment.key}
            className="inline-flex items-center gap-1 tabular-nums text-[var(--text-caption-size)] text-[var(--color-foreground)]"
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: segment.color }}
              aria-hidden
            />
            {segment.value}
          </span>
        ))}
      </div>
      <div className="flex h-2 w-full overflow-hidden rounded-full">
        {segments.map((segment) => (
          <div
            key={`bar-${segment.key}`}
            style={{
              width: `${(segment.value / total) * 100}%`,
              backgroundColor: segment.color,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function SkuDrillDownCard({
  totalSkus,
  rows,
  barcodeFilter,
  onBarcodeFilterChange,
  itemTypeFilter,
  onItemTypeFilterChange,
  itemTypeOptions,
}: {
  totalSkus: number;
  rows: AssortmentSkuRow[];
  barcodeFilter: string;
  onBarcodeFilterChange: (value: string) => void;
  itemTypeFilter: string;
  onItemTypeFilterChange: (value: string) => void;
  itemTypeOptions: string[];
}) {
  const columns = [
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
  ];

  return (
    <Card className="overflow-hidden p-0 shadow-[var(--shadow-low)]">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 px-[var(--space-6)] pb-2 pt-[var(--space-6)]">
        <h3 className="text-[var(--text-section-size)] font-semibold">
          SKU drill down ({totalSkus.toLocaleString()})
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          <FilterDropdown
            label="Barcode filter"
            options={["All barcodes", "Available", "Not available"]}
            value={barcodeFilter}
            onChange={onBarcodeFilterChange}
          />
          <FilterDropdown
            label="Item type filter"
            options={itemTypeOptions}
            value={itemTypeFilter}
            onChange={onItemTypeFilterChange}
          />
        </div>
      </div>

      <div className="overflow-x-auto border-t border-[var(--color-border)]">
        <table
          className="w-full border-collapse text-[var(--text-caption-size)]"
          style={{ minWidth: 1200 }}
        >
          <thead>
            <tr className="border-b border-[var(--color-border)] text-left text-[var(--text-label-size)] font-semibold text-[var(--color-muted-foreground)]">
              {columns.map((col) => (
                <th key={col} className="px-[var(--space-6)] py-3">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.partnerSku} className="border-b border-[var(--color-border)] last:border-0">
                <td className="px-[var(--space-6)] py-4 tabular-nums">{row.partnerSku}</td>
                <td className="max-w-[160px] px-[var(--space-6)] py-4">
                  <TruncatedText text={row.productTitle ?? ""} />
                </td>
                <td className="max-w-[140px] px-[var(--space-6)] py-4">
                  <TruncatedText text={row.bu ?? ""} />
                </td>
                <td className="px-[var(--space-6)] py-4">{row.division}</td>
                <td className="px-[var(--space-6)] py-4">{row.department}</td>
                <td className="px-[var(--space-6)] py-4">{row.brand}</td>
                <td className="px-[var(--space-6)] py-4">{row.itemType}</td>
                <td className="px-[var(--space-6)] py-4">
                  <ProtectedStatusMarker value={row.protectedBrand ?? false} />
                </td>
                <td className="min-w-0 px-[var(--space-6)] py-4">
                  <BarcodeStatusMarker status={row.barcodeStatus} />
                </td>
                <td className="max-w-[160px] px-[var(--space-6)] py-4 text-[var(--color-muted-foreground)]">
                  <TruncatedText text={row.wercsStatus ?? ""} />
                </td>
                <td className="max-w-[180px] px-[var(--space-6)] py-4 text-[var(--color-muted-foreground)]">
                  <TruncatedText text={row.wercsActionRequired ?? "—"} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="shrink-0 border-t border-[var(--color-border)] px-[var(--space-6)] py-3">
        <TablePagination showing={rows.length} total={totalSkus} className="mt-0" />
      </div>
    </Card>
  );
}

function FilterDropdown({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <label className="sr-only">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-9 min-w-[140px] appearance-none rounded-[var(--radius-md)] border border-[var(--color-border)]",
          "bg-white py-2 pl-3 pr-8 text-[var(--text-caption-size)] text-[var(--color-foreground)]",
        )}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
    </div>
  );
}

function AnalysisContent({ source }: { source: AssortmentAnalysisSource }) {
  const { analysis, brands, itemTypes, skuDrillDown } = source;
  const [barcodeFilter, setBarcodeFilter] = useState("All barcodes");
  const [itemTypeFilter, setItemTypeFilter] = useState("All item type");

  const filteredSkus = useMemo(() => {
    return skuDrillDown.filter((row) => {
      const barcodeMatch =
        barcodeFilter === "All barcodes" ||
        (barcodeFilter === "Available" && row.barcodeStatus === "Available") ||
        (barcodeFilter === "Not available" && row.barcodeStatus !== "Available");
      const itemTypeMatch =
        itemTypeFilter === "All item type" || row.itemType === itemTypeFilter;
      return barcodeMatch && itemTypeMatch;
    });
  }, [skuDrillDown, barcodeFilter, itemTypeFilter]);

  const itemTypeOptions = useMemo(
    () => ["All item type", ...Array.from(new Set(skuDrillDown.map((r) => r.itemType).filter(Boolean)))],
    [skuDrillDown],
  );

  const productTypeSegments = useMemo(() => {
    const total = analysis.totalSkus;
    const homePct = total > 0 ? Math.round((analysis.homeSkus / total) * 100) : 0;
    const apparelPct = total > 0 ? 100 - homePct : 0;
    return [
      {
        label: "Home",
        value: homePct,
        color: "#34a853",
        revenue: `${analysis.homeSkus.toLocaleString()} SKUs`,
      },
      {
        label: "Apparel",
        value: apparelPct,
        color: "#9ca3af",
        revenue: `${analysis.apparelSkus.toLocaleString()} SKUs`,
      },
    ];
  }, [analysis]);

  return (
    <div className="space-y-8">
      <KpiMetricStrip
        metrics={[
          { label: "Total SKUs", value: analysis.totalSkus.toLocaleString(), icon: Package },
          { label: "WERCS Flagged", value: String(analysis.wercsFlagged), icon: AlertTriangle },
        ]}
      />

      <div className="grid items-stretch gap-4 lg:grid-cols-2">
        <DonutChart
          title="SKUs by product type"
          total={analysis.totalSkus.toLocaleString()}
          segments={productTypeSegments}
          filterLabel="Product types (2)"
          lockedLabels={["Home", "Apparel"]}
          showAddCompetitor={false}
          className="h-full"
        />

        <BrandDetailsCard
          uniqueBrands={analysis.uniqueBrands}
          protectedBrands={analysis.protectedBrands}
          brands={brands}
        />
      </div>

      <ItemTypeAnalysisCard analysis={analysis} itemTypes={itemTypes} />

      <SkuDrillDownCard
        totalSkus={analysis.totalSkus}
        rows={filteredSkus}
        barcodeFilter={barcodeFilter}
        onBarcodeFilterChange={setBarcodeFilter}
        itemTypeFilter={itemTypeFilter}
        onItemTypeFilterChange={setItemTypeFilter}
        itemTypeOptions={itemTypeOptions as string[]}
      />
    </div>
  );
}

interface AssortmentAnalysisTabProps {
  content: AssortmentCurationContent;
}

function AnalysisSourcePicker({
  options,
  activeSourceId,
  onSelect,
}: {
  options: AnalysisSourceOption[];
  activeSourceId: string | null;
  onSelect: (sourceId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const active =
    options.find((option) => option.id === activeSourceId) ?? options[0];

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white px-3 py-2 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
      >
        {active?.label ?? "Lead form"}
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-56 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card)] shadow-[var(--shadow-medium)]">
          <ul className="max-h-48 overflow-y-auto py-1">
            {options.map((option) => (
              <li
                key={option.id}
                className={cn(
                  "flex cursor-pointer items-center justify-between gap-2 px-3 py-2 text-[var(--text-caption-size)] hover:bg-[var(--color-muted)]",
                  option.id === activeSourceId &&
                    "bg-[var(--color-primary)]/8 font-medium text-[var(--color-primary)]",
                )}
                onClick={() => {
                  onSelect(option.id);
                  setOpen(false);
                }}
              >
                <TruncatedText text={option.label} className="min-w-0 flex-1" />
                {option.id === activeSourceId && (
                  <Check className="h-3 w-3 shrink-0 text-[var(--color-primary)]" />
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function AssortmentAnalysisTab({ content: fallbackContent }: AssortmentAnalysisTabProps) {
  const storeContent = useAssortmentCurationStore((s) => s.content);
  const analysisSourceId = useAssortmentCurationStore((s) => s.analysisSourceId);
  const setAnalysisSource = useAssortmentCurationStore((s) => s.setAnalysisSource);

  const content = storeContent ?? fallbackContent;
  const sourceOptions = useMemo(() => getAnalysisSourceOptions(content), [content]);
  const showSourceFilter = content.versions.length > 1;

  const activeSource = useMemo(
    () =>
      getAnalysisForSource(
        content,
        analysisSourceId ?? sourceOptions[0]?.id ?? content.analysisSources[0]?.id ?? "seller-excel",
      ),
    [content, analysisSourceId, sourceOptions],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h4 className="text-[var(--text-body-size)] font-semibold">Assortment analysis</h4>
        <div className="flex flex-wrap items-center gap-3">
          {showSourceFilter && (
            <AnalysisSourcePicker
              options={sourceOptions}
              activeSourceId={analysisSourceId ?? sourceOptions[0]?.id ?? null}
              onSelect={setAnalysisSource}
            />
          )}
          <Button variant="outline" size="sm" className="gap-1.5">
            <Image src="/icons/download.svg" alt="" width={14} height={14} aria-hidden />
            Download
          </Button>
        </div>
      </div>
      <AnalysisContent source={activeSource} />
    </div>
  );
}
