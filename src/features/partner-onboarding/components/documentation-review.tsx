"use client";

import Image from "next/image";
import { useEffect, useMemo } from "react";
import { Check, ChevronLeft, ChevronRight, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { StatusTag } from "@/components/ui/status-tag";
import type { OnboardingPartner } from "@/lib/mock-data/onboarding";
import { getOnboardingSectionProgressPercent } from "@/lib/mock-data/onboarding";
import {
  getDocumentationEvaluation,
  type BrandDocumentRow,
} from "@/lib/mock-data/onboarding-evaluation";
import type { PotentialPartner } from "@/lib/mock-data/potential-partners";
import { OnboardingCommentsDrawer } from "./onboarding-comments-drawer";
import { AgentFeedbackModal } from "./agent-feedback-modal";
import { OnboardingSectionReviewLayout } from "./onboarding-section-review-layout";
import { OnboardingSubtaskNav } from "./onboarding-subtask-nav";
import { useOnboardingReviewStore } from "../store/onboarding-review-store";

interface DocumentationReviewProps {
  partner: PotentialPartner;
  onboarding: OnboardingPartner;
  activeSubSection: "general" | "brands";
}

const DOC_SUBTASK_HINTS = {
  general: "Provide general business documents.",
  brands: "Provide brand related documents.",
} as const;

function ReviewBadge() {
  return (
    <StatusTag className="inline-flex items-center gap-1.5 bg-amber-100 font-normal text-amber-900">
      <Image src="/icons/review-document.svg" alt="" width={14} height={14} aria-hidden />
      Review
    </StatusTag>
  );
}

function AutoValidatedBadge() {
  return (
    <StatusTag className="inline-flex items-center gap-1 bg-[var(--color-success-light)] font-normal text-[var(--color-success)]">
      <Check className="h-3 w-3" /> Auto Validated
    </StatusTag>
  );
}

function BrandDocumentsAlert({
  alertId,
  title,
  message,
  onReject,
}: {
  alertId: string;
  title: string;
  message: string;
  onReject: () => void;
}) {
  const dismissed = useOnboardingReviewStore((s) => s.dismissedAlerts.includes(alertId));
  const dismissAlert = useOnboardingReviewStore((s) => s.dismissAlert);

  if (dismissed) return null;

  return (
    <div className="mb-6 flex items-center gap-3 border-l-4 border-[#2758B9] bg-[#E8F1FC] py-3 pl-4 pr-3">
      <Image
        src="/icons/info-fill.svg"
        alt=""
        width={20}
        height={20}
        className="shrink-0"
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <p className="text-[var(--text-caption-size)] font-semibold text-[var(--color-foreground)]">
          {title}
        </p>
        <p className="text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
          {message}
        </p>
      </div>
      <Button variant="outline" size="sm" className="shrink-0 bg-white" onClick={onReject}>
        Reject
      </Button>
      <button
        type="button"
        onClick={() => dismissAlert(alertId)}
        className="shrink-0 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
        aria-label="Dismiss alert"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function TableDocumentChip({ name }: { name: string }) {
  return (
    <div className="inline-flex max-w-full items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white px-3 py-2">
      <Image src="/icons/file-doc.svg" alt="" width={16} height={16} className="shrink-0" aria-hidden />
      <span className="truncate text-[var(--text-caption-size)] font-medium text-[var(--color-foreground)]">
        {name}
      </span>
      <button
        type="button"
        className="shrink-0 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
        aria-label={`Download ${name}`}
      >
        <Image src="/icons/download.svg" alt="" width={16} height={16} aria-hidden />
      </button>
    </div>
  );
}

function GeneralDocumentFile({
  label,
  instruction,
  fileName,
  fileSize,
  approveId,
  approved,
  onApprove,
}: {
  label: string;
  instruction: string;
  fileName: string;
  fileSize: string;
  approveId: string;
  approved: boolean;
  onApprove: (id: string) => void;
}) {
  return (
    <div>
      <p className="text-[var(--text-body-size)] font-semibold text-[var(--color-foreground)]">
        {label}
        <span className="text-[var(--color-error)]">*</span>
      </p>
      <p className="mt-0.5 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
        {instruction}
      </p>
      <div className="mt-3">
        <TableDocumentChip name={fileName} />
        <p className="mt-1 text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">
          {fileSize}
        </p>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onApprove(approveId)}
          disabled={approved}
        >
          {approved ? "Approved" : "Approve"}
        </Button>
        <Button variant="ghost" size="sm" className="h-auto px-0 text-[var(--color-primary)]">
          Reject
        </Button>
      </div>
    </div>
  );
}

function BrandDocumentsTable({
  brands,
  onApprove,
  onRejectBrand,
  isApproved,
}: {
  brands: BrandDocumentRow[];
  onApprove: (id: string) => void;
  onRejectBrand: (brand: BrandDocumentRow) => void;
  isApproved: (id: string) => boolean;
}) {
  const brandCount = brands.length;

  return (
    <div>
      <p className="mb-4 text-[var(--text-caption-size)] font-semibold text-[var(--color-foreground)]">
        {brandCount} Brands added
      </p>

      <div className="overflow-x-auto border-y border-[var(--color-border)]">
        <table className="w-full text-[var(--text-caption-size)]">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              {["Name", "Brand role", "Document", "Actions"].map((col) => (
                <th
                  key={col}
                  className="px-0 py-3 pr-6 text-left text-[var(--text-label-size)] font-semibold text-[var(--color-muted-foreground)] last:pr-0"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {brands.map((brand) => {
              const approveId = `brand-${brand.id}`;
              const approved = isApproved(approveId);

              return (
                <tr key={brand.id} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="py-4 pr-6 font-medium text-[var(--color-foreground)]">
                    {brand.name}
                  </td>
                  <td className="py-4 pr-6 text-[var(--color-muted-foreground)]">
                    {brand.brandRole}
                  </td>
                  <td className="py-4 pr-6">
                    <TableDocumentChip name={brand.documentName} />
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onApprove(approveId)}
                        disabled={approved}
                      >
                        {approved ? "Approved" : "Approve"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto px-0 text-[var(--color-primary)] hover:bg-transparent"
                        onClick={() => onRejectBrand(brand)}
                      >
                        Reject
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
        <span>
          Showing 1–{brandCount} of {brandCount} items
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled
            className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--color-border)] opacity-40"
            aria-label="First page"
          >
            <Image src="/icons/chevron-left-double.svg" alt="" width={16} height={16} aria-hidden />
          </button>
          <button
            type="button"
            disabled
            className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--color-border)] opacity-40"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="px-1 tabular-nums">Page 1 of 1</span>
          <button
            type="button"
            disabled
            className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--color-border)] opacity-40"
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            disabled
            className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--color-border)] opacity-40"
            aria-label="Last page"
          >
            <Image src="/icons/chevron-right-double.svg" alt="" width={16} height={16} aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}

export function DocumentationReview({
  partner,
  onboarding,
  activeSubSection,
}: DocumentationReviewProps) {
  const setContext = useOnboardingReviewStore((s) => s.setContext);
  const openComments = useOnboardingReviewStore((s) => s.openComments);
  const openFeedback = useOnboardingReviewStore((s) => s.openFeedback);
  const approveItem = useOnboardingReviewStore((s) => s.approveItem);
  const isApproved = useOnboardingReviewStore((s) => s.isApproved);

  const docSection = onboarding.sections.find((s) => s.id === "documentation");
  const docProgress = docSection ? getOnboardingSectionProgressPercent(docSection) : 0;
  const docs = getDocumentationEvaluation(partner.sellerId);

  useEffect(() => {
    setContext(partner.id, "documentation");
  }, [partner.id, setContext]);

  const generalTask = docSection?.tasks[0];
  const brandsTask = docSection?.tasks[1];

  const navItems = useMemo(() => {
    if (!generalTask || !brandsTask) return [];
    return [
      {
        id: "general",
        title: "General documents",
        hint: DOC_SUBTASK_HINTS.general,
        href: `/sellers/onboarding/${partner.id}/review/documentation?tab=general`,
        task: generalTask,
      },
      {
        id: "brands",
        title: "Brand documents",
        hint: DOC_SUBTASK_HINTS.brands,
        href: `/sellers/onboarding/${partner.id}/review/documentation?tab=brands`,
        task: brandsTask,
      },
    ];
  }, [partner.id, generalTask, brandsTask]);

  if (!docs || !docSection || navItems.length === 0) {
    return (
      <div className="space-y-[var(--space-4)]">
        <p className="text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
          No documentation submitted yet for review.
        </p>
      </div>
    );
  }

  const brandWithAlert = docs.brands.find((b) => b.agentRecommendation);
  const brandAlertId = brandWithAlert ? `brand-alert-${brandWithAlert.id}` : "";

  return (
    <>
      <OnboardingSectionReviewLayout
        partner={partner}
        onboarding={onboarding}
        breadcrumbExtra="Documentation"
        sectionTitle="Documentation"
        sectionSubtitle="Provide your business related information."
        progress={docProgress}
        headerIconSrc="/icons/files.svg"
        sidebar={
          <OnboardingSubtaskNav
            items={navItems}
            activeId={activeSubSection}
            navVariant="documentation"
          />
        }
      >
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-[20px] font-semibold text-[var(--color-foreground)]">
            {activeSubSection === "general" ? "General documents" : "Brand documents"}
          </h3>
          <div className="flex items-center gap-2">
            <ReviewBadge />
            <AutoValidatedBadge />
          </div>
        </div>

        {activeSubSection === "brands" && brandWithAlert?.agentRecommendation && (
          <BrandDocumentsAlert
            alertId={brandAlertId}
            title={brandWithAlert.agentRecommendation.title}
            message={brandWithAlert.agentRecommendation.message}
            onReject={() =>
              openFeedback({
                taskId: `brand-${brandWithAlert.id}`,
                title: brandWithAlert.agentRecommendation!.title,
                agentMessage: brandWithAlert.agentRecommendation!.message,
              })
            }
          />
        )}

        {activeSubSection === "general" ? (
          <div className="space-y-8">
            {docs.general.map((doc) => {
              const approveId = `doc-${doc.id}`;
              return (
                <GeneralDocumentFile
                  key={doc.id}
                  label={doc.label}
                  instruction={doc.instruction}
                  fileName={doc.fileName}
                  fileSize={doc.fileSize}
                  approveId={approveId}
                  approved={isApproved(approveId)}
                  onApprove={approveItem}
                />
              );
            })}
          </div>
        ) : (
          <BrandDocumentsTable
            brands={docs.brands}
            onApprove={approveItem}
            onRejectBrand={(brand) => {
              if (brand.agentRecommendation) {
                openFeedback({
                  taskId: `brand-${brand.id}`,
                  title: brand.agentRecommendation.title,
                  agentMessage: brand.agentRecommendation.message,
                });
              } else {
                openComments(`brand-${brand.id}`);
              }
            }}
            isApproved={isApproved}
          />
        )}
      </OnboardingSectionReviewLayout>

      <OnboardingCommentsDrawer partner={partner} />
      <AgentFeedbackModal />
    </>
  );
}
