"use client";

import Image from "next/image";
import { useMemo } from "react";
import { ChevronDown, ExternalLink, Plus, Search, Send, Sparkles } from "lucide-react";

import { InfoBanner } from "@/components/data-display/info-banner";
import { Button } from "@/components/ui/button";
import { StatusTag } from "@/components/ui/status-tag";
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

function RecommendationBadge({ action }: { action: AssortmentSkuRow["recommendationAction"] }) {
  if (action === "ai_add") {
    return (
      <StatusTag className="inline-flex items-center gap-1 bg-[var(--color-success-light)] font-normal text-[var(--color-success)]">
        <Sparkles className="h-3 w-3" /> AI add
      </StatusTag>
    );
  }
  if (action === "ai_remove") {
    return (
      <StatusTag className="inline-flex items-center gap-1 bg-[var(--color-error-light)] font-normal text-[var(--color-error)]">
        AI remove
      </StatusTag>
    );
  }
  return (
    <StatusTag className="bg-[var(--color-muted)] font-normal text-[var(--color-muted-foreground)]">
      Keep
    </StatusTag>
  );
}

function VersionStatusBadge({ status }: { status: AssortmentVersion["status"] }) {
  const labels: Record<AssortmentVersion["status"], string> = {
    draft: "Draft",
    shared: "Shared with seller",
    seller_review: "Seller reviewing",
    approved: "Seller approved",
  };
  const styles: Record<AssortmentVersion["status"], string> = {
    draft: "bg-[var(--color-muted)] text-[var(--color-muted-foreground)]",
    shared: "bg-[var(--color-primary-light)] text-[var(--color-primary)]",
    seller_review: "bg-amber-100 text-amber-900",
    approved: "bg-[var(--color-success-light)] text-[var(--color-success)]",
  };
  return (
    <StatusTag className={cn("font-normal", styles[status])}>{labels[status]}</StatusTag>
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
  );
}

function VersionSkuTable({ rows }: { rows: AssortmentSkuRow[] }) {
  return (
    <div className="overflow-x-auto rounded-[var(--radius-xl)] border border-[var(--color-border)]">
      <table className="w-full min-w-[1200px] border-collapse text-[var(--text-caption-size)]">
        <thead>
          <tr className="border-b border-[var(--color-border)] bg-[var(--color-card)] text-left text-[var(--text-label-size)] font-semibold text-[var(--color-muted-foreground)]">
            {[
              "Recommendation",
              "Partner SKU",
              "Source",
              "Brand",
              "Product title",
              "Category",
              "Retail price",
              "AI insight",
            ].map((col) => (
              <th key={col} className="px-3 py-2.5 font-semibold">
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
                key={`${row.partnerSku}-${row.source}`}
                className={cn(
                  "border-b border-[var(--color-border)] last:border-0",
                  isAdd && "bg-[var(--color-success-light)]/40",
                  isRemove && "bg-[var(--color-error-light)]/50 line-through decoration-[var(--color-error)]/60",
                )}
              >
                <td className="px-3 py-2.5">
                  <RecommendationBadge action={row.recommendationAction} />
                </td>
                <td className="px-3 py-2.5 tabular-nums font-medium">{row.partnerSku}</td>
                <td className="px-3 py-2.5">{row.source ?? row.marketplaceSource ?? "—"}</td>
                <td className="px-3 py-2.5">{row.brand}</td>
                <td className="max-w-[180px] truncate px-3 py-2.5">{row.productTitle}</td>
                <td className="px-3 py-2.5">{row.partnerItemCategory}</td>
                <td className="px-3 py-2.5 tabular-nums">{row.retailPrice}</td>
                <td className="max-w-[220px] truncate px-3 py-2.5 text-[var(--color-muted-foreground)]">
                  {row.aiReason ?? row.removeReason ?? "—"}
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

export function AssortmentRecommendedTab({ content }: AssortmentRecommendedTabProps) {
  const activeVersionId = useAssortmentCurationStore((s) => s.activeVersionId);
  const setActiveVersion = useAssortmentCurationStore((s) => s.setActiveVersion);
  const createVersion = useAssortmentCurationStore((s) => s.createVersion);
  const shareVersion = useAssortmentCurationStore((s) => s.shareVersion);
  const addToast = useToastStore((s) => s.showToast);

  const activeVersion = content.versions.find((v) => v.id === activeVersionId) ?? content.versions[0];
  const versionRows = useMemo(
    () => (activeVersion ? getVersionSkus(content, activeVersion.id) : []),
    [content, activeVersion],
  );

  const addCount = versionRows.filter((r) => r.recommendationAction === "ai_add").length;
  const removeCount = content.aiRecommendations.remove.length;

  const handleCreateVersion = () => {
    const created = createVersion();
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

  return (
    <div className="space-y-6">
      <InfoBanner
        className="border-[var(--color-primary)]/20 bg-[var(--color-primary-light)]/30"
        title="AI marketplace search complete"
        message={
          <>
            <p className="mb-2">{content.marketplaceSearch.summary}</p>
            <p className="text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">
              Query: <span className="font-mono">{content.marketplaceSearch.query}</span>
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {content.marketplaceSearch.sources.map((source) => (
                <span
                  key={source}
                  className="rounded-full border border-[var(--color-border)] bg-white px-2 py-0.5 text-[var(--text-label-size)]"
                >
                  {source}
                </span>
              ))}
            </div>
          </>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {content.versions.map((version) => {
            const isActive = version.id === activeVersion?.id;
            return (
              <button
                key={version.id}
                type="button"
                onClick={() => setActiveVersion(version.id)}
                className={cn(
                  "rounded-[var(--radius-md)] border px-3 py-1.5 text-[var(--text-caption-size)] font-medium transition-colors",
                  isActive
                    ? "border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)]"
                    : "border-[var(--color-border)] bg-white text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]",
                )}
              >
                {version.name}
              </button>
            );
          })}
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleCreateVersion}>
            <Plus className="h-3.5 w-3.5" />
            New version
          </Button>
        </div>
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

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card)] p-4">
          <p className="text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">In this version</p>
          <p className="mt-1 text-[22px] font-semibold tabular-nums">
            {activeVersion?.recommendedCount.toLocaleString() ?? 0}
          </p>
        </div>
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-success)]/30 bg-[var(--color-success-light)]/30 p-4">
          <p className="text-[var(--text-label-size)] text-[var(--color-success)]">AI recommends adding</p>
          <p className="mt-1 text-[22px] font-semibold tabular-nums text-[var(--color-success)]">{addCount}</p>
        </div>
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-error)]/30 bg-[var(--color-error-light)]/30 p-4">
          <p className="text-[var(--text-label-size)] text-[var(--color-error)]">AI recommends removing</p>
          <p className="mt-1 text-[22px] font-semibold tabular-nums text-[var(--color-error)]">{removeCount}</p>
        </div>
      </div>

      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h4 className="text-[var(--text-body-size)] font-semibold">
            {activeVersion?.label ?? "Recommended assortment"}
          </h4>
          <p className="text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
            Created {activeVersion ? new Date(activeVersion.createdAt).toLocaleDateString() : "—"} by{" "}
            {activeVersion?.createdBy}
          </p>
        </div>
        <TableToolbar />
        <VersionSkuTable rows={versionRows} />
        <TablePagination showing={versionRows.length} total={activeVersion?.recommendedCount ?? 0} />
      </section>

      {removeCount > 0 && (
        <section className="rounded-[var(--radius-xl)] border border-[var(--color-error)]/30 bg-[var(--color-error-light)]/20 p-5">
          <h4 className="text-[var(--text-body-size)] font-semibold text-[var(--color-error)]">
            Items flagged for removal from seller submission
          </h4>
          <ul className="mt-3 space-y-2">
            {content.aiRecommendations.remove.map((item) => {
              const sku = content.submittedSkus.find((s) => s.partnerSku === item.partnerSku);
              return (
                <li
                  key={item.partnerSku}
                  className="flex flex-wrap items-start justify-between gap-2 rounded-[var(--radius-md)] bg-white/80 px-3 py-2 text-[var(--text-caption-size)]"
                >
                  <span className="font-medium">
                    {item.partnerSku}
                    {sku ? ` — ${sku.productTitle}` : ""}
                  </span>
                  <span className="text-[var(--color-muted-foreground)]">{item.reason}</span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {addCount > 0 && (
        <section className="rounded-[var(--radius-xl)] border border-[var(--color-success)]/30 bg-[var(--color-success-light)]/20 p-5">
          <h4 className="flex items-center gap-2 text-[var(--text-body-size)] font-semibold text-[var(--color-success)]">
            <Sparkles className="h-4 w-4" />
            SKUs discovered via marketplace search
          </h4>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {content.aiRecommendations.add.map((sku) => (
              <div
                key={sku.partnerSku}
                className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white px-3 py-2"
              >
                <p className="text-[var(--text-caption-size)] font-semibold">{sku.productTitle}</p>
                <p className="mt-0.5 text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">
                  {sku.marketplaceSource} · {sku.retailPrice}
                </p>
                <p className="mt-1 text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">
                  {sku.aiReason}
                </p>
                <a
                  href={sku.primaryImageUrl}
                  className="mt-1 inline-flex items-center gap-0.5 text-[var(--text-label-size)] text-[var(--color-primary)]"
                  target="_blank"
                  rel="noreferrer"
                >
                  View listing <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
