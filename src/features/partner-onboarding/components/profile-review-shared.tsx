"use client";

import Image from "next/image";
import { Check, ExternalLink } from "lucide-react";

import { InfoBanner } from "@/components/data-display/info-banner";
import { Button } from "@/components/ui/button";
import { StatusTag, markerToneClass } from "@/components/ui/status-tag";
import { TruncatedText } from "@/components/ui/truncated-text";
import { cn } from "@/lib/utils";
import { useOnboardingReviewStore } from "../store/onboarding-review-store";

export function ValidationAlert({
  taskId,
  title,
  message,
  onAddComment,
  onRejectRecommendation,
  variant = "default",
}: {
  taskId: string;
  title: string;
  message: string;
  onAddComment: () => void;
  onRejectRecommendation: () => void;
  variant?: "default" | "banner";
}) {
  const dismissed = useOnboardingReviewStore((s) => s.dismissedAlerts.includes(taskId));
  const dismissAlert = useOnboardingReviewStore((s) => s.dismissAlert);

  if (dismissed) return null;

  const commentActions = (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <Button variant="outline" size="sm" className="bg-white" onClick={onAddComment}>
        Add Comment
      </Button>
      {variant === "default" && (
        <Button
          variant="ghost"
          size="sm"
          className="h-auto px-0 text-[var(--color-error)] hover:bg-[var(--color-error-light)] hover:text-[var(--color-error)]"
          onClick={onRejectRecommendation}
        >
          Reject recommendation
        </Button>
      )}
    </div>
  );

  if (variant === "banner") {
    return (
      <InfoBanner
        variant="warning"
        className="mb-6"
        title={title}
        message={
          <>
            {message}
            {commentActions}
          </>
        }
        onDismiss={() => dismissAlert(taskId)}
      />
    );
  }

  return (
    <InfoBanner
      variant="info"
      className="mb-5"
      title={title}
      message={
        <>
          {message}
          {commentActions}
        </>
      }
      onDismiss={() => dismissAlert(taskId)}
    />
  );
}

/** AI review banner — warning when issues flagged, success when ready to approve. */
export function AiSubtaskReviewBanner({
  alertId,
  taskApproveId,
  partnerId,
  taskSubmitted,
  tmApproved,
  mode,
  warningTitle,
  warningMessage,
  successTitle,
  successMessage,
  recommendationFields,
  modalTitle,
  modalSubtitle,
  applyToastMessage,
  approveToastMessage,
}: {
  alertId: string;
  taskApproveId: string;
  partnerId: string;
  taskSubmitted: boolean;
  tmApproved: boolean;
  mode: "warning" | "success";
  warningTitle: string;
  warningMessage: string;
  successTitle: string;
  successMessage: string;
  recommendationFields: import("@/lib/mock-data/onboarding-evaluation").AiFieldSuggestion[];
  modalTitle: string;
  modalSubtitle: string;
  applyToastMessage: string;
  approveToastMessage: string;
}) {
  const dismissed = useOnboardingReviewStore((s) => s.dismissedAlerts.includes(alertId));
  const isSubtaskRejected = useOnboardingReviewStore((s) => s.isSubtaskRejected(partnerId, taskApproveId));
  const openRecommendationModal = useOnboardingReviewStore((s) => s.openRecommendationModal);
  const approveWithAcknowledgement = useOnboardingReviewStore((s) => s.approveWithAcknowledgement);

  if (!taskSubmitted || tmApproved || dismissed || isSubtaskRejected) return null;

  if (mode === "warning" && recommendationFields.length > 0) {
    return (
      <InfoBanner
        variant="warning"
        className="mb-6"
        title={warningTitle}
        message={
          <>
            {warningMessage}
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                className="border-[var(--color-primary)] bg-white text-[var(--color-primary)] hover:bg-white/90"
                onClick={() =>
                  openRecommendationModal({
                    alertId,
                    taskApproveId,
                    title: modalTitle,
                    subtitle: modalSubtitle,
                    fields: recommendationFields,
                    toastMessage: applyToastMessage,
                    approveOnApply: false,
                  })
                }
              >
                View recommendation
              </Button>
            </div>
          </>
        }
      />
    );
  }

  if (mode === "success") {
    return (
      <InfoBanner
        variant="success"
        className="mb-6"
        title={successTitle}
        message={
          <>
            {successMessage}
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                className="border-[var(--color-primary)] bg-white text-[var(--color-primary)] hover:bg-white/90"
                onClick={() => approveWithAcknowledgement(taskApproveId, alertId, approveToastMessage)}
              >
                Approve
              </Button>
            </div>
          </>
        }
      />
    );
  }

  return null;
}

/** Approve / Reject aligned with sub-task title when AI review is active. */
export function AiSubtaskReviewHeaderActions({
  partnerId,
  subtaskName,
  alertId,
  taskApproveId,
  taskSubmitted,
  tmApproved,
  mode,
  recommendationFields,
  approveToastMessage,
}: {
  partnerId: string;
  subtaskName: string;
  alertId: string;
  taskApproveId: string;
  taskSubmitted: boolean;
  tmApproved: boolean;
  mode: "warning" | "success";
  recommendationFields: import("@/lib/mock-data/onboarding-evaluation").AiFieldSuggestion[];
  approveToastMessage: string;
}) {
  const dismissed = useOnboardingReviewStore((s) => s.dismissedAlerts.includes(alertId));
  const isSubtaskRejected = useOnboardingReviewStore((s) => s.isSubtaskRejected(partnerId, taskApproveId));
  const openSubtaskReject = useOnboardingReviewStore((s) => s.openSubtaskReject);
  const approveWithAcknowledgement = useOnboardingReviewStore((s) => s.approveWithAcknowledgement);

  const inReview = taskSubmitted && !tmApproved && !isSubtaskRejected;
  const showAiReview =
    inReview &&
    !dismissed &&
    (mode === "success" || (mode === "warning" && recommendationFields.length > 0));

  if (!inReview) return null;

  return (
    <>
      {showAiReview ? (
        <Button
          size="sm"
          disabled={mode !== "success"}
          onClick={() => approveWithAcknowledgement(taskApproveId, alertId, approveToastMessage)}
        >
          Approve
        </Button>
      ) : null}
      <Button
        size="sm"
        variant="outline"
        onClick={() => openSubtaskReject({ partnerId, subtaskName, alertId, taskApproveId })}
      >
        Reject
      </Button>
    </>
  );
}

export function ReviewActionBar({
  primary,
  secondary,
}: {
  primary?: { label: string; onClick: () => void; disabled?: boolean };
  secondary?: { label: string; onClick: () => void; disabled?: boolean };
}) {
  if (!primary && !secondary) return null;

  return (
    <div className="mt-8 flex items-center gap-3 border-t border-[var(--color-border)] pt-8">
      {primary && (
        <Button size="sm" onClick={primary.onClick} disabled={primary.disabled}>
          {primary.label}
        </Button>
      )}
      {secondary && (
        <Button size="sm" variant="outline" onClick={secondary.onClick} disabled={secondary.disabled}>
          {secondary.label}
        </Button>
      )}
    </div>
  );
}

export function SubtaskReviewBadge() {
  return (
    <StatusTag className={cn("inline-flex items-center gap-1.5 font-normal", markerToneClass.review)}>
      <Image src="/icons/review-document.svg" alt="" width={14} height={14} aria-hidden />
      Review
    </StatusTag>
  );
}

export function SubtaskRejectedBadge() {
  return (
    <StatusTag className={cn("inline-flex items-center gap-1.5 font-normal", markerToneClass.rejected)}>
      <Image src="/icons/close.svg" alt="" width={14} height={14} aria-hidden />
      Rejected
    </StatusTag>
  );
}

export function SubtaskRejectionReasonBanner({ reason }: { reason: string }) {
  return (
    <InfoBanner variant="warning" className="mb-6" title="Rejection reason" message={reason} />
  );
}

export function DocumentRejectionReasonBanner({
  documentLabel,
  reason,
}: {
  documentLabel: string;
  reason: string;
}) {
  return (
    <InfoBanner
      variant="warning"
      className="mb-4"
      title={`${documentLabel} — valid document requested`}
      message={reason}
    />
  );
}

export function ReadOnlyBadge() {
  return (
    <StatusTag className={cn("inline-flex items-center gap-1.5 font-normal", markerToneClass.readonly)}>
      <Image src="/icons/visibility.svg" alt="" width={14} height={14} aria-hidden />
      Read Only
    </StatusTag>
  );
}

export function CompleteBadge() {
  return (
    <StatusTag className={cn("inline-flex items-center gap-1 font-normal", markerToneClass.success)}>
      <Check className="h-3 w-3" /> Complete
    </StatusTag>
  );
}

export function UnderlinedField({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-[#333333] pt-4">
      <p className="text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">{label}</p>
      <p className="mt-1 pb-[var(--space-2)] text-[var(--text-body-size)] font-medium leading-normal text-[var(--color-foreground)]">
        {value}
      </p>
    </div>
  );
}

export function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-[var(--text-body-size)] font-semibold text-[var(--color-foreground)]">{children}</h4>
  );
}

export function SectionDivider() {
  return <div className="my-8 border-t border-[var(--color-border)]" aria-hidden />;
}

export function FileAttachmentRow({
  name,
  size,
  onView,
  onDownload,
  className,
}: {
  name: string;
  size: string;
  onView?: () => void;
  onDownload?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex max-w-[320px] items-center gap-3 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[#f5f5f5] px-4 py-3",
        className,
      )}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[#e8f0fe]">
        <Image src="/icons/file-doc.svg" alt="" width={24} height={24} aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <TruncatedText
          text={name}
          className="text-[var(--text-caption-size)] font-semibold text-[var(--color-foreground)]"
        />
        {size ? (
          <p className="text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">{size}</p>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-0.5">
        <button
          type="button"
          onClick={onView}
          className="rounded-[var(--radius-sm)] p-1.5 text-[var(--color-foreground)] hover:bg-[var(--color-muted)]"
          aria-label={`View ${name}`}
        >
          <Image src="/icons/visibility.svg" alt="" width={16} height={16} aria-hidden />
        </button>
        <button
          type="button"
          onClick={onDownload}
          className="rounded-[var(--radius-sm)] p-1.5 text-[var(--color-foreground)] hover:bg-[var(--color-muted)]"
          aria-label={`Download ${name}`}
        >
          <Image src="/icons/download.svg" alt="" width={16} height={16} aria-hidden />
        </button>
      </div>
    </div>
  );
}

export function FileAttachment({
  label,
  hint,
  name,
  size,
}: {
  label: string;
  hint?: string;
  name: string;
  size: string;
}) {
  return (
    <div>
      <p className="text-[var(--text-caption-size)] font-semibold text-[var(--color-foreground)]">
        {label}
        <span className="text-[var(--color-error)]">*</span>
      </p>
      {hint && (
        <p className="mt-1 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">{hint}</p>
      )}
      <div className="mt-3">
        <FileAttachmentRow name={name} size={size} />
      </div>
    </div>
  );
}

export function TablePagination({
  showing,
  total,
  pageSize = 10,
  itemLabel = "items",
  className,
}: {
  showing: number;
  total: number;
  pageSize?: number;
  itemLabel?: string;
  className?: string;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]",
        className ?? "mt-4",
      )}
    >
      <span>
        Showing 1–{showing} of {total.toLocaleString()} {itemLabel}
      </span>
      <div className="flex items-center gap-2">
        <PaginationBtn disabled aria-label="First page">
          <Image src="/icons/chevron-left-double.svg" alt="" width={16} height={16} aria-hidden />
        </PaginationBtn>
        <PaginationBtn disabled aria-label="Previous page">
          ‹
        </PaginationBtn>
        <span className="px-1 tabular-nums">Page 1 of {totalPages}</span>
        <PaginationBtn disabled aria-label="Next page">
          ›
        </PaginationBtn>
        <PaginationBtn disabled aria-label="Last page">
          <Image src="/icons/chevron-right-double.svg" alt="" width={16} height={16} aria-hidden />
        </PaginationBtn>
      </div>
    </div>
  );
}

function PaginationBtn({
  children,
  disabled,
  "aria-label": ariaLabel,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  "aria-label": string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={ariaLabel}
      className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--color-border)] text-[var(--color-foreground)] disabled:opacity-40"
    >
      {children}
    </button>
  );
}

export function PillTabs<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: T; label: string }[];
  active: T;
  onChange: (id: T) => void;
}) {
  return (
    <div className="inline-flex rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-card)] p-0.5">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            "rounded-[var(--radius-sm)] px-4 py-1.5 text-[var(--text-caption-size)] font-medium transition-colors",
            active === tab.id
              ? "bg-[var(--color-foreground)] text-white"
              : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function CheckedTermsRow() {
  return (
    <div className="mt-8 flex items-center justify-center gap-2 border-t border-[var(--color-border)] pt-8">
      <span className="flex h-4 w-4 items-center justify-center rounded border border-[var(--color-border)] bg-[var(--color-muted)]">
        <Check className="h-3 w-3 text-[var(--color-success)]" strokeWidth={3} />
      </span>
      <span className="text-[var(--text-caption-size)] text-[var(--color-foreground)]">
        I accept —{" "}
        <span className="inline-flex items-center gap-0.5 text-[var(--color-primary)]">
          Terms of service
          <ExternalLink className="h-3 w-3" />
        </span>
      </span>
    </div>
  );
}

export function DateChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[var(--color-border)] bg-[var(--color-muted)]/30 px-3 py-1 text-[var(--text-caption-size)] text-[var(--color-foreground)]">
      {label}
    </span>
  );
}

export function CarrierReadOnlyList({ carriers }: { carriers: string[] }) {
  return (
    <div className="mt-4 space-y-3">
      {carriers.map((carrier) => (
        <div key={carrier} className="flex items-center gap-2">
          <span className="flex h-4 w-4 items-center justify-center rounded border border-[var(--color-primary)] bg-[var(--color-primary-light)]">
            <Check className="h-3 w-3 text-[var(--color-primary)]" strokeWidth={3} />
          </span>
          <span className="text-[var(--text-body-size)] font-medium text-[var(--color-foreground)]">{carrier}</span>
        </div>
      ))}
    </div>
  );
}
