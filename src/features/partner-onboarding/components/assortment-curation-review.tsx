"use client";

import Image from "next/image";
import { useEffect } from "react";
import { Check, ChevronDown, Clock, ExternalLink, Search } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { StatusTag } from "@/components/ui/status-tag";
import type { OnboardingPartner } from "@/lib/mock-data/onboarding";
import { getOnboardingSectionProgressPercent } from "@/lib/mock-data/onboarding";
import {
  getAssortmentCurationContent,
  type AssortmentSkuRow,
} from "@/lib/mock-data/assortment-curation-content";
import type { PotentialPartner } from "@/lib/mock-data/potential-partners";
import { cn } from "@/lib/utils";
import { AssortmentAnalysisTab } from "./assortment-analysis-tab";
import { AssortmentRecommendedTab } from "./assortment-recommended-tab";
import { OnboardingCommentsDrawer } from "./onboarding-comments-drawer";
import { AgentFeedbackModal } from "./agent-feedback-modal";
import { OnboardingSectionReviewLayout } from "./onboarding-section-review-layout";
import { ReadOnlyBadge, TablePagination } from "./profile-review-shared";
import { getOnboardingSectionSubtitle } from "../constants/onboarding-section-copy";
import { useAssortmentCurationStore } from "../store/assortment-curation-store";
import { useOnboardingReviewStore } from "../store/onboarding-review-store";

type AssortmentTab = "submitted" | "recommended" | "analysis";

interface AssortmentCurationReviewProps {
  partner: PotentialPartner;
  onboarding: OnboardingPartner;
  activeTab: AssortmentTab;
}

const TABS: { id: AssortmentTab; label: string; countKey?: "submittedCount" | "recommendedCount" }[] = [
  { id: "submitted", label: "Assortment submitted through lead form", countKey: "submittedCount" },
  { id: "recommended", label: "Target recommended assortment", countKey: "recommendedCount" },
  { id: "analysis", label: "Assortment analysis" },
];

function ReviewBadge() {
  return (
    <StatusTag className="inline-flex items-center gap-1.5 bg-amber-100 font-normal text-amber-900">
      Review
    </StatusTag>
  );
}

function ApprovedBadge() {
  return (
    <StatusTag className="inline-flex items-center gap-1 bg-[var(--color-success-light)] font-normal text-[var(--color-success)]">
      <Check className="h-3 w-3" /> Approved
    </StatusTag>
  );
}

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
  );
}

function SubmittedTable({ rows }: { rows: AssortmentSkuRow[] }) {
  return (
    <div className="overflow-x-auto rounded-[var(--radius-xl)] border border-[var(--color-border)]">
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
              <td className="max-w-[160px] truncate px-3 py-2.5">{row.productTitle}</td>
              <td className="max-w-[180px] truncate px-3 py-2.5 text-[var(--color-muted-foreground)]">
                {row.productDescription}
              </td>
              <td className="px-3 py-2.5">{row.partnerItemCategory}</td>
              <td className="px-3 py-2.5">{row.partnerItemSubcategory}</td>
              <td className="px-3 py-2.5">{row.shipSpeed}</td>
              <td className="px-3 py-2.5 tabular-nums">{row.retailPrice}</td>
              <td className="max-w-[120px] truncate px-3 py-2.5">
                <span className="inline-flex items-center gap-0.5 text-[var(--color-primary)]">
                  {row.primaryImageUrl.replace("https://", "").slice(0, 18)}...
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

export function AssortmentCurationReview({
  partner,
  onboarding,
  activeTab,
}: AssortmentCurationReviewProps) {
  const setContext = useOnboardingReviewStore((s) => s.setContext);
  const openComments = useOnboardingReviewStore((s) => s.openComments);
  const approveItem = useOnboardingReviewStore((s) => s.approveItem);
  const isApproved = useOnboardingReviewStore((s) => s.isApproved);
  const initForPartner = useAssortmentCurationStore((s) => s.initForPartner);
  const storeContent = useAssortmentCurationStore((s) => s.content);
  const activeVersionId = useAssortmentCurationStore((s) => s.activeVersionId);

  const assortmentSection = onboarding.sections.find((s) => s.id === "assortment");
  const assortmentTask = assortmentSection?.tasks[0];
  const progress = assortmentSection ? getOnboardingSectionProgressPercent(assortmentSection) : 0;
  const content = storeContent ?? getAssortmentCurationContent(partner.id);
  const activeVersion = content.versions.find((v) => v.id === activeVersionId) ?? content.versions[0];
  const recommendedCount = activeVersion?.recommendedCount ?? content.submittedCount;
  const approveId = `assortment-${partner.id}`;
  const approved = isApproved(approveId);

  useEffect(() => {
    initForPartner(partner.id);
  }, [partner.id, initForPartner]);

  useEffect(() => {
    if (assortmentTask) {
      setContext(partner.id, "assortment", assortmentTask.id);
    } else {
      setContext(partner.id, "assortment");
    }
  }, [partner.id, assortmentTask, setContext]);

  if (!assortmentSection || !assortmentTask) return null;

  const tabHref = (tab: AssortmentTab) =>
    `/sellers/onboarding/${partner.id}/review/assortment?tab=${tab}`;

  const tabCounts: Record<string, number> = {
    submittedCount: content.submittedCount,
    recommendedCount,
  };

  return (
    <>
      <OnboardingSectionReviewLayout
        partner={partner}
        onboarding={onboarding}
        breadcrumbExtra="Assortment curation"
        sectionTitle="Assortment curation"
        sectionSubtitle={getOnboardingSectionSubtitle("assortment")}
        progress={progress}
        headerIconSrc="/icons/chart-bar-stacked.svg"
      >
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-[20px] font-semibold text-[var(--color-foreground)]">Assortment curation</h3>
          <div className="flex items-center gap-2">
            <ReadOnlyBadge />
            {approved ? <ApprovedBadge /> : <ReviewBadge />}
          </div>
        </div>

        <div className="mb-6 flex items-center gap-2">
          <div className="flex min-w-0 flex-1 flex-nowrap overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-card)] p-0.5">
            {TABS.map((tab) => {
              const count = tab.countKey != null ? tabCounts[tab.countKey] : undefined;
              const label =
                count != null ? `${tab.label} (${count.toLocaleString()})` : tab.label;
              const isActive = activeTab === tab.id;
              return (
                <Link
                  key={tab.id}
                  href={tabHref(tab.id)}
                  title={label}
                  className={cn(
                    "min-w-0 flex-1 truncate rounded-[var(--radius-sm)] px-3 py-2 text-center text-[var(--text-caption-size)] font-medium whitespace-nowrap transition-colors",
                    isActive
                      ? "bg-[var(--color-foreground)] text-white"
                      : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]",
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </div>
          <button
            type="button"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] text-[var(--color-muted-foreground)]"
            aria-label="View history"
          >
            <Clock className="h-4 w-4" />
          </button>
        </div>

        {activeTab === "submitted" && (
          <>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-[var(--text-body-size)] font-semibold">
                Assortment submitted through lead form ({content.submittedCount.toLocaleString()})
              </p>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Image src="/icons/excel.svg" alt="" width={14} height={14} aria-hidden />
                Download as excel
              </Button>
            </div>
            <TableToolbar />
            <SubmittedTable rows={content.submittedSkus} />
            <TablePagination showing={content.submittedSkus.length} total={content.submittedCount} />
          </>
        )}

        {activeTab === "recommended" && <AssortmentRecommendedTab content={content} />}

        {activeTab === "analysis" && <AssortmentAnalysisTab content={content} />}

        <div className="mt-8 flex items-center gap-3 border-t border-[var(--color-border)] pt-8">
          <Button
            size="sm"
            variant="outline"
            onClick={() => approveItem(approveId)}
            disabled={approved}
          >
            {approved ? "Approved" : "Approve"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto px-0 text-[var(--color-primary)] hover:bg-transparent"
            onClick={() => openComments(assortmentTask.id)}
            disabled={approved}
          >
            Reject
          </Button>
        </div>
      </OnboardingSectionReviewLayout>

      <OnboardingCommentsDrawer partner={partner} />
      <AgentFeedbackModal />
    </>
  );
}
