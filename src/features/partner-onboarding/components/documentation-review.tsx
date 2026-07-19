"use client";

import Image from "next/image";
import { useEffect, useMemo } from "react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { StatusTag } from "@/components/ui/status-tag";
import type { OnboardingPartner } from "@/lib/mock-data/onboarding";
import { getSectionProgressPercent } from "@/lib/mock-data/onboarding";
import {
  getDocumentationEvaluation,
  type BrandDocumentRow,
  type DocumentUpload,
} from "@/lib/mock-data/onboarding-evaluation";
import type { PotentialPartner } from "@/lib/mock-data/potential-partners";
import { OnboardingCommentsDrawer } from "./onboarding-comments-drawer";
import { AgentFeedbackModal } from "./agent-feedback-modal";
import { OnboardingSectionReviewLayout } from "./onboarding-section-review-layout";
import { OnboardingSubtaskNav } from "./onboarding-subtask-nav";
import { FileAttachmentRow, ReviewActionBar, ValidationAlert } from "./profile-review-shared";
import {
  documentationSubtaskApproveId,
  isDocumentationSubtaskTmApproved,
} from "../utils/documentation-task-progress";
import { getOnboardingSectionSubtitle } from "../constants/onboarding-section-copy";
import {
  isDocumentationTaskSubmitted,
} from "../utils/documentation-task-progress";
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

function GeneralDocumentFile({
  label,
  instruction,
  fileName,
  fileSize,
  approveId,
  approved,
  onApprove,
  onReject,
}: {
  label: string;
  instruction: string;
  fileName: string;
  fileSize: string;
  approveId: string;
  approved: boolean;
  onApprove: (id: string) => void;
  onReject: () => void;
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
        <FileAttachmentRow name={fileName} size={fileSize} />
      </div>

      {!approved && (
        <div className="mt-3 flex items-center gap-3">
          <Button size="sm" onClick={() => onApprove(approveId)}>
            Approve
          </Button>
          <Button size="sm" variant="outline" onClick={onReject}>
            Reject
          </Button>
        </div>
      )}

      {approved && (
        <div className="mt-3">
          <StatusTag className="inline-flex items-center gap-1 bg-[var(--color-success-light)] font-normal text-[var(--color-success)]">
            <Check className="h-3 w-3" /> Approved
          </StatusTag>
        </div>
      )}
    </div>
  );
}

function DocumentRecommendationBanner({
  doc,
  approveId,
  approved,
  onReject,
  onAddComment,
}: {
  doc: DocumentUpload;
  approveId: string;
  approved: boolean;
  onReject: () => void;
  onAddComment: () => void;
}) {
  if (approved || !doc.agentRecommendation) return null;

  return (
    <ValidationAlert
      taskId={approveId}
      title={doc.agentRecommendation.title}
      message={doc.agentRecommendation.message}
      onAddComment={onAddComment}
      onRejectRecommendation={onReject}
      variant="banner"
    />
  );
}

function BrandDocumentsAlert({
  alertId,
  title,
  message,
  onReject,
  onAddComment,
}: {
  alertId: string;
  title: string;
  message: string;
  onReject: () => void;
  onAddComment: () => void;
}) {
  return (
    <ValidationAlert
      taskId={alertId}
      title={title}
      message={message}
      onAddComment={onAddComment}
      onRejectRecommendation={onReject}
      variant="banner"
    />
  );
}

function TableDocumentChip({ name, size }: { name: string; size?: string }) {
  return <FileAttachmentRow name={name} size={size ?? ""} className="max-w-full" />;
}

function docsForActiveTab(
  docs: NonNullable<ReturnType<typeof getDocumentationEvaluation>>,
  activeSubSection: "general" | "brands",
) {
  const usesW9ContractFlow = docs.general.some(
    (doc) => doc.id === "w9" || doc.id === "contract",
  );
  if (usesW9ContractFlow) {
    if (activeSubSection === "general") {
      return docs.general.filter((doc) => doc.id === "w9");
    }
    return docs.general.filter((doc) => doc.id === "contract");
  }
  if (activeSubSection === "general") return docs.general;
  return [];
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
                  <td className="py-4 pr-6 align-top font-medium text-[var(--color-foreground)]">
                    {brand.name}
                  </td>
                  <td className="py-4 pr-6 align-top text-[var(--color-muted-foreground)]">
                    {brand.brandRole}
                  </td>
                  <td className="py-4 pr-6 align-top">
                    <TableDocumentChip
                      name={brand.documentName}
                      size={brand.documentFileSize ?? "0.8 MB"}
                    />
                  </td>
                  <td className="py-4 align-top">
                    {!approved ? (
                      <div className="flex items-center gap-3">
                        <Button size="sm" onClick={() => onApprove(approveId)}>
                          Approve
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => onRejectBrand(brand)}>
                          Reject
                        </Button>
                      </div>
                    ) : (
                      <StatusTag className="inline-flex items-center gap-1 bg-[var(--color-success-light)] font-normal text-[var(--color-success)]">
                        <Check className="h-3 w-3" /> Approved
                      </StatusTag>
                    )}
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

function tryCompleteDocumentationSubtask(
  itemApproveId: string,
  approvedIds: string[],
  approveItem: (id: string) => void,
  partnerId: string,
  activeSubSection: "general" | "brands",
  docs: NonNullable<ReturnType<typeof getDocumentationEvaluation>>,
  tabDocs: DocumentUpload[],
  usesW9ContractFlow: boolean,
) {
  approveItem(itemApproveId);
  const nextApproved = approvedIds.includes(itemApproveId)
    ? approvedIds
    : [...approvedIds, itemApproveId];
  const subtaskApproveId = documentationSubtaskApproveId(partnerId, activeSubSection);
  if (nextApproved.includes(subtaskApproveId)) return;

  const allItemsApproved =
    activeSubSection === "general"
      ? tabDocs.every((doc) => nextApproved.includes(`doc-${doc.id}`))
      : usesW9ContractFlow
        ? tabDocs.every((doc) => nextApproved.includes(`doc-${doc.id}`))
        : docs.brands.every((brand) => nextApproved.includes(`brand-${brand.id}`));

  if (allItemsApproved) {
    approveItem(subtaskApproveId);
  }
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
  const approvedIds = useOnboardingReviewStore((s) => s.approvedIds);

  const docSection = onboarding.sections.find((s) => s.id === "documentation");
  const docProgress = docSection ? getSectionProgressPercent(docSection, approvedIds) : 0;
  const docs = getDocumentationEvaluation(partner.sellerId);

  useEffect(() => {
    setContext(partner.id, "documentation");
  }, [partner.id, setContext]);

  const generalTask = docSection?.tasks[0];
  const brandsTask = docSection?.tasks[1];
  const activeTask = activeSubSection === "general" ? generalTask : brandsTask;
  const taskSubmitted = activeTask ? isDocumentationTaskSubmitted(activeTask) : false;
  const tabDocs = useMemo(
    () => (docs ? docsForActiveTab(docs, activeSubSection) : []),
    [docs, activeSubSection],
  );

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
  const recommendationDoc = tabDocs.find(
    (doc) => doc.agentRecommendation && !isApproved(`doc-${doc.id}`),
  );
  const usesW9ContractFlow = docs.general.some(
    (doc) => doc.id === "w9" || doc.id === "contract",
  );
  const subtaskApproveId = documentationSubtaskApproveId(partner.id, activeSubSection);
  const subtaskTmApproved = isDocumentationSubtaskTmApproved(partner.id, activeSubSection, approvedIds);
  const allSubtaskItemsApproved =
    activeSubSection === "general"
      ? tabDocs.every((doc) => isApproved(`doc-${doc.id}`))
      : usesW9ContractFlow
        ? tabDocs.every((doc) => isApproved(`doc-${doc.id}`))
        : docs.brands.every((brand) => isApproved(`brand-${brand.id}`));
  const subtaskItemCount =
    activeSubSection === "general"
      ? tabDocs.length
      : usesW9ContractFlow
        ? tabDocs.length
        : docs.brands.length;
  const showSubtaskReviewActions =
    subtaskItemCount > 0 && taskSubmitted && !subtaskTmApproved && allSubtaskItemsApproved;

  const approveDocumentationItem = (itemApproveId: string) => {
    tryCompleteDocumentationSubtask(
      itemApproveId,
      approvedIds,
      approveItem,
      partner.id,
      activeSubSection,
      docs,
      tabDocs,
      usesW9ContractFlow,
    );
  };

  return (
    <>
      <OnboardingSectionReviewLayout
        partner={partner}
        onboarding={onboarding}
        breadcrumbExtra="Documentation"
        sectionTitle="Documentation"
        sectionSubtitle={getOnboardingSectionSubtitle("documentation")}
        progress={docProgress}
        headerIconSrc="/icons/files.svg"
        sidebar={
          <OnboardingSubtaskNav
            items={navItems}
            activeId={activeSubSection}
            navVariant="documentation"
            approvedIds={approvedIds}
            partnerId={partner.id}
          />
        }
      >
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-[20px] font-semibold text-[var(--color-foreground)]">
            {activeSubSection === "general" ? "General documents" : "Brand documents"}
          </h3>
          <div className="flex items-center gap-2">
            {subtaskTmApproved ? (
              <StatusTag className="inline-flex items-center gap-1 bg-[var(--color-success-light)] font-normal text-[var(--color-success)]">
                <Check className="h-3 w-3" /> Approved
              </StatusTag>
            ) : taskSubmitted ? (
              <ReviewBadge />
            ) : null}
          </div>
        </div>

        {activeSubSection === "brands" && brandWithAlert?.agentRecommendation && docs.brands.length > 0 && (
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
            onAddComment={() => openComments(`brand-${brandWithAlert.id}`)}
          />
        )}

        {recommendationDoc && (
          <DocumentRecommendationBanner
            doc={recommendationDoc}
            approveId={`doc-${recommendationDoc.id}`}
            approved={isApproved(`doc-${recommendationDoc.id}`)}
            onReject={() => {
              if (recommendationDoc.agentRecommendation) {
                openFeedback({
                  taskId: `doc-${recommendationDoc.id}`,
                  title: recommendationDoc.agentRecommendation.title,
                  agentMessage: recommendationDoc.agentRecommendation.message,
                });
              } else {
                openComments(`doc-${recommendationDoc.id}`);
              }
            }}
            onAddComment={() => openComments(`doc-${recommendationDoc.id}`)}
          />
        )}

        {tabDocs.length > 0 ? (
          <div className="space-y-8">
            {tabDocs.map((doc) => {
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
                  onApprove={approveDocumentationItem}
                  onReject={() => {
                    if (doc.agentRecommendation) {
                      openFeedback({
                        taskId: approveId,
                        title: doc.agentRecommendation.title,
                        agentMessage: doc.agentRecommendation.message,
                      });
                    } else {
                      openComments(approveId);
                    }
                  }}
                />
              );
            })}
          </div>
        ) : docs.brands.length > 0 ? (
          <BrandDocumentsTable
            brands={docs.brands}
            onApprove={approveDocumentationItem}
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
        ) : null}

        {showSubtaskReviewActions && (
          <ReviewActionBar
            primary={{ label: "Approve", onClick: () => approveItem(subtaskApproveId) }}
            secondary={{
              label: "Reject",
              onClick: () => openComments(activeTask?.id ?? subtaskApproveId),
            }}
          />
        )}
      </OnboardingSectionReviewLayout>

      <OnboardingCommentsDrawer partner={partner} />
      <AgentFeedbackModal />
    </>
  );
}
