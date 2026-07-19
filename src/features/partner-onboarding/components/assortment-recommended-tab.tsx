"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  MinusCircle,
  Package,
  Plus,
  Search,
  Send,
  Sparkles,
  X,
} from "lucide-react";

import { KpiMetricStrip } from "@/components/data-display/dashboard-kpi-card";
import { InfoBanner } from "@/components/data-display/info-banner";
import { Button } from "@/components/ui/button";
import { StatusTag, markerToneClass } from "@/components/ui/status-tag";
import { TruncatedText } from "@/components/ui/truncated-text";
import {
  getVersionSkus,
  type AssortmentCurationContent,
  type AssortmentSkuRow,
  type AssortmentVersion,
} from "@/lib/mock-data/assortment-curation-content";
import { cn } from "@/lib/utils";
import { TablePagination } from "./profile-review-shared";
import { useAssortmentCurationStore } from "../store/assortment-curation-store";
import { useToastStore } from "@/stores/toast-store";

function AiGenFillIcon({ className }: { className?: string }) {
  return (
    <span
      className={cn("inline-block h-3 w-3 shrink-0 bg-current", className)}
      style={{
        WebkitMaskImage: "url(/icons/ai-gen-fill.svg)",
        WebkitMaskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        WebkitMaskSize: "contain",
        maskImage: "url(/icons/ai-gen-fill.svg)",
        maskRepeat: "no-repeat",
        maskPosition: "center",
        maskSize: "contain",
      }}
      aria-hidden
    />
  );
}

function RecommendationMarker({ action }: { action: AssortmentSkuRow["recommendationAction"] }) {
  if (action === "ai_add") {
    return (
      <StatusTag className={cn("inline-flex items-center gap-1 font-normal", markerToneClass.success)}>
        <AiGenFillIcon />
        Add
      </StatusTag>
    );
  }
  if (action === "ai_remove") {
    return (
      <StatusTag className={cn("inline-flex items-center gap-1 font-normal", markerToneClass.error)}>
        <AiGenFillIcon />
        Remove
      </StatusTag>
    );
  }
  return (
    <StatusTag className={cn("inline-flex items-center gap-1 font-normal", markerToneClass.neutral)}>
      <Check className="h-3 w-3 shrink-0" aria-hidden />
      Keep
    </StatusTag>
  );
}

function getRowSource(row: AssortmentSkuRow): string {
  if (row.recommendationAction === "ai_add") {
    return row.marketplaceSource ?? row.source ?? "—";
  }
  return row.source ?? "Seller provided";
}

function VersionStatusBadge({ status }: { status: AssortmentVersion["status"] }) {
  const labels: Record<AssortmentVersion["status"], string> = {
    draft: "Draft",
    shared: "Shared with seller",
    seller_review: "Seller reviewing",
    approved: "Seller approved",
  };
  const styles: Record<AssortmentVersion["status"], string> = {
    draft: markerToneClass.muted,
    shared: markerToneClass.info,
    seller_review: markerToneClass.review,
    approved: markerToneClass.success,
  };
  return (
    <StatusTag className={cn("font-normal", styles[status])}>{labels[status]}</StatusTag>
  );
}

function AssortmentVersionPicker({
  versions,
  activeVersionId,
  onSelect,
  onCreate,
}: {
  versions: AssortmentVersion[];
  activeVersionId: string | null;
  onSelect: (versionId: string) => void;
  onCreate: (name: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const active = versions.find((v) => v.id === activeVersionId) ?? versions[0];

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  function handleCreate() {
    const name = newName.trim() || `Version ${versions.length + 1}`;
    onCreate(name);
    setNewName("");
    setOpen(false);
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2.5 py-1 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
      >
        {active?.name ?? "Version 1"}
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-56 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card)] shadow-[var(--shadow-medium)]">
          <ul className="max-h-48 overflow-y-auto py-1">
            {versions.map((version) => (
              <li
                key={version.id}
                className={cn(
                  "flex cursor-pointer items-center justify-between gap-2 px-3 py-2 text-[var(--text-caption-size)] hover:bg-[var(--color-muted)]",
                  version.id === activeVersionId &&
                    "bg-[var(--color-primary)]/8 font-medium text-[var(--color-primary)]",
                )}
                onClick={() => {
                  onSelect(version.id);
                  setOpen(false);
                }}
              >
                <TruncatedText text={version.name} className="min-w-0 flex-1" />
                {version.id === activeVersionId && (
                  <Check className="h-3 w-3 shrink-0 text-[var(--color-primary)]" />
                )}
              </li>
            ))}
          </ul>

          <div className="h-px bg-[var(--color-border)]" />

          <div className="p-2">
            <p className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-muted-foreground)]">
              New version
            </p>
            <div className="flex items-center gap-1.5">
              <input
                ref={inputRef}
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreate();
                  if (e.key === "Escape") setOpen(false);
                }}
                placeholder={`Version ${versions.length + 1}`}
                className="h-7 min-w-0 flex-1 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-[var(--text-caption-size)] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:border-[var(--color-primary)] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCreate}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-primary)] text-white transition-colors hover:bg-[var(--color-primary-hover)]"
                aria-label="Create version"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TableToolbar() {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <div className="relative min-w-[200px] flex-1 max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
        <input
          readOnly
          placeholder="Search SKUs"
          className="h-9 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-muted)]/20 pl-9 pr-3 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]"
        />
      </div>
      <div className="ml-auto flex flex-wrap items-center justify-end gap-3">
        <button
          type="button"
          className="flex items-center gap-1 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white px-3 py-2 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]"
        >
          All categories <ChevronDown className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          className="flex items-center gap-1 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white px-3 py-2 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]"
        >
          All recommendation types <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function VersionSkuTable({
  rows,
  onRemoveRow,
}: {
  rows: AssortmentSkuRow[];
  onRemoveRow: (partnerSku: string) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1200px] border-collapse text-[var(--text-caption-size)]">
        <thead>
          <tr className="border-b border-[var(--color-border)] bg-[var(--color-card)] text-left text-[var(--text-label-size)] font-semibold text-[var(--color-muted-foreground)]">
            {[
              "Partner SKU",
              "AI recommendation",
              "Source",
              "Brand",
              "Product title",
              "Category",
              "Retail price",
              "AI insight",
              "",
            ].map((col) => (
              <th key={col || "actions"} className="px-3 py-2.5 font-semibold">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const isAdd = row.recommendationAction === "ai_add";
            const isRemove = row.recommendationAction === "ai_remove";
            return (
              <tr
                key={`${row.partnerSku}-${row.recommendationAction}`}
                className={cn(
                  "border-b border-[var(--color-border)] last:border-0",
                  isAdd && "bg-[var(--color-success-light)]/30",
                  isRemove && "bg-[var(--color-error-light)]/30",
                )}
              >
                <td className="px-3 py-2.5 tabular-nums font-medium">{row.partnerSku}</td>
                <td className="px-3 py-2.5">
                  <RecommendationMarker action={row.recommendationAction} />
                </td>
                <td className="px-3 py-2.5">{getRowSource(row)}</td>
                <td className="px-3 py-2.5">{row.brand}</td>
                <td className="max-w-[180px] px-3 py-2.5">
                  <TruncatedText text={row.productTitle ?? ""} />
                </td>
                <td className="px-3 py-2.5">{row.partnerItemCategory}</td>
                <td className="px-3 py-2.5 tabular-nums">{row.retailPrice}</td>
                <td className="max-w-[220px] px-3 py-2.5 text-[var(--color-muted-foreground)]">
                  <TruncatedText text={row.aiReason ?? row.removeReason ?? "—"} />
                </td>
                <td className="px-3 py-2.5">
                  <button
                    type="button"
                    onClick={() => onRemoveRow(row.partnerSku)}
                    className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--color-border)] text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]"
                    aria-label={`Remove ${row.partnerSku}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

interface AssortmentRecommendedTabProps {
  content: AssortmentCurationContent;
}

export function AssortmentRecommendedTab({ content: fallbackContent }: AssortmentRecommendedTabProps) {
  const storeContent = useAssortmentCurationStore((s) => s.content);
  const activeVersionId = useAssortmentCurationStore((s) => s.activeVersionId);
  const setActiveVersion = useAssortmentCurationStore((s) => s.setActiveVersion);
  const createVersion = useAssortmentCurationStore((s) => s.createVersion);
  const shareVersion = useAssortmentCurationStore((s) => s.shareVersion);
  const removeSkuFromVersion = useAssortmentCurationStore((s) => s.removeSkuFromVersion);
  const addToast = useToastStore((s) => s.showToast);

  const content = storeContent ?? fallbackContent;
  const activeVersion = content.versions.find((v) => v.id === activeVersionId) ?? content.versions[0];
  const versionRows = useMemo(
    () => (activeVersion ? getVersionSkus(content, activeVersion.id) : []),
    [content, activeVersion],
  );

  const addCount = versionRows.filter((r) => r.recommendationAction === "ai_add").length;
  const removeCount = versionRows.filter((r) => r.recommendationAction === "ai_remove").length;

  const handleCreateVersion = (name: string) => {
    const created = createVersion(name);
    if (created) {
      addToast({
        title: `${created.name} created`,
        description: "AI recommendations applied. Refine SKUs and share when ready.",
      });
    }
  };

  const handleShare = () => {
    if (!activeVersion) return;
    shareVersion(activeVersion.id);
    addToast({
      title: "Assortment shared with seller",
      description: `${activeVersion.name} sent for seller review and approval.`,
    });
  };

  const handleRemoveRow = (partnerSku: string) => {
    if (!activeVersion) return;
    removeSkuFromVersion(activeVersion.id, partnerSku);
  };

  return (
    <div className="space-y-6">
      <InfoBanner
        className="border-[var(--color-primary)]/20 bg-[var(--color-primary-light)]/30"
        title="AI marketplace search complete"
        message={content.marketplaceSearch.summary}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <AssortmentVersionPicker
          versions={content.versions}
          activeVersionId={activeVersion?.id ?? null}
          onSelect={setActiveVersion}
          onCreate={handleCreateVersion}
        />
        <div className="flex flex-wrap items-center gap-2">
          {activeVersion && <VersionStatusBadge status={activeVersion.status} />}
          <Button
            size="sm"
            className="gap-1.5"
            onClick={handleShare}
            disabled={activeVersion?.status === "shared" || activeVersion?.status === "approved"}
          >
            <Send className="h-3.5 w-3.5" />
            Share with seller
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Image src="/icons/download.svg" alt="" width={14} height={14} aria-hidden />
            Download
          </Button>
        </div>
      </div>

      <KpiMetricStrip
        metrics={[
          {
            label: "In this version",
            value: versionRows.length.toLocaleString(),
            icon: Package,
          },
          {
            label: "AI recommends adding",
            value: addCount.toLocaleString(),
            icon: Sparkles,
            iconClassName: "text-[var(--color-success)]",
          },
          {
            label: "AI recommends removing",
            value: removeCount.toLocaleString(),
            icon: MinusCircle,
            iconClassName: "text-[var(--color-error)]",
          },
        ]}
      />

      <section>
        <TableToolbar />
        <VersionSkuTable rows={versionRows} onRemoveRow={handleRemoveRow} />
        <TablePagination showing={versionRows.length} total={versionRows.length} />
      </section>
    </div>
  );
}
