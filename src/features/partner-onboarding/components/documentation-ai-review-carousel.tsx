"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { InfoBanner } from "@/components/data-display/info-banner";
import { Button } from "@/components/ui/button";
import { useToastStore } from "@/stores/toast-store";
import { useOnboardingReviewStore } from "../store/onboarding-review-store";

export type DocumentationReviewTarget = {
  approveId: string;
  label: string;
  validationStatus: string;
  rejectionReason: string;
  suggestedComment: string;
};

type ReviewCard =
  | {
      kind: "approve_all";
      approveIds: string[];
      title: string;
      message: string;
    }
  | {
      kind: "approve_valid";
      approveId: string;
      label: string;
      title: string;
      message: string;
    }
  | {
      kind: "reject_invalid";
      approveId: string;
      label: string;
      title: string;
      message: string;
      rejectionReason: string;
      suggestedComment: string;
    };

function buildReviewCards(
  targets: DocumentationReviewTarget[],
  isApproved: (id: string) => boolean,
  documentRejections: Record<string, unknown>,
): ReviewCard[] {
  const pending = targets.filter(
    (t) => !isApproved(t.approveId) && !documentRejections[t.approveId],
  );
  if (pending.length === 0) return [];

  const validPending = pending.filter((t) => t.validationStatus === "valid");
  const invalidPending = pending.filter(
    (t) => t.validationStatus === "invalid" || t.validationStatus === "partial" || t.validationStatus === "unverified",
  );

  if (invalidPending.length > 0 && validPending.length > 0) {
    const cards: ReviewCard[] = [
      {
        kind: "approve_all",
        approveIds: validPending.map((t) => t.approveId),
        title:
          validPending.length === 1
            ? `${validPending[0]!.label} is valid`
            : `${validPending.length} documents are valid`,
        message:
          validPending.length === 1
            ? `AI validated ${validPending[0]!.label}. Approve this document, then review the next item that needs correction.`
            : `AI validated ${validPending.length} documents in this sub-task. Approve all valid uploads, then continue to documents that need correction.`,
      },
    ];
    invalidPending.forEach((t) => {
      cards.push({
        kind: "reject_invalid",
        approveId: t.approveId,
        label: t.label,
        title: `${t.label} does not meet requirements`,
        message: "AI could not validate this upload. Request a corrected document from the partner.",
        rejectionReason: t.rejectionReason,
        suggestedComment: t.suggestedComment,
      });
    });
    return cards;
  }

  if (invalidPending.length === 0 && validPending.length === pending.length) {
    if (validPending.length === targets.length || validPending.length > 1) {
      return [
        {
          kind: "approve_all",
          approveIds: validPending.map((t) => t.approveId),
          title:
            validPending.length === targets.length
              ? "All documents are valid"
              : `${validPending.length} documents are valid`,
          message:
            validPending.length === targets.length
              ? "AI validated every document in this sub-task. Approve all to complete your review."
              : `AI validated ${validPending.length} remaining document(s). Approve all to continue your review.`,
        },
      ];
    }
    return validPending.map((t) => ({
      kind: "approve_valid",
      approveId: t.approveId,
      label: t.label,
      title: `Approve ${t.label}`,
      message: `${t.label} meets document requirements. Approve this upload to continue.`,
    }));
  }

  const cards: ReviewCard[] = [];

  validPending.forEach((t) => {
    cards.push({
      kind: "approve_valid",
      approveId: t.approveId,
      label: t.label,
      title: `Approve ${t.label}`,
      message: `${t.label} meets document requirements. Approve this upload before addressing other items.`,
    });
  });

  invalidPending.forEach((t) => {
    cards.push({
      kind: "reject_invalid",
      approveId: t.approveId,
      label: t.label,
      title: `${t.label} does not meet requirements`,
      message: "AI could not validate this upload. Request a corrected document from the partner.",
      rejectionReason: t.rejectionReason,
      suggestedComment: t.suggestedComment,
    });
  });

  return cards;
}

interface DocumentationAiReviewCarouselProps {
  targets: DocumentationReviewTarget[];
  taskSubmitted: boolean;
  subtaskTmApproved: boolean;
  onApproveDocument: (approveId: string) => void;
  onApproveAll: (approveIds: string[]) => void;
  subtaskLabel: string;
}

export function DocumentationAiReviewCarousel({
  targets,
  taskSubmitted,
  subtaskTmApproved,
  onApproveDocument,
  onApproveAll,
  subtaskLabel,
}: DocumentationAiReviewCarouselProps) {
  const approvedIds = useOnboardingReviewStore((s) => s.approvedIds);
  const documentRejections = useOnboardingReviewStore((s) => s.documentRejections);
  const requestValidDocument = useOnboardingReviewStore((s) => s.requestValidDocument);
  const [cardIndex, setCardIndex] = useState(0);

  const cards = useMemo(
    () =>
      buildReviewCards(
        targets,
        (id) => approvedIds.includes(id),
        documentRejections,
      ),
    [targets, approvedIds, documentRejections],
  );

  useEffect(() => {
    setCardIndex(0);
  }, [subtaskLabel]);

  if (!taskSubmitted || subtaskTmApproved || cards.length === 0) return null;

  const safeIndex = Math.min(cardIndex, cards.length - 1);
  const card = cards[safeIndex];
  const showPager = cards.length > 1;

  function goNext() {
    setCardIndex((i) => Math.min(i + 1, cards.length - 1));
  }

  function goPrev() {
    setCardIndex((i) => Math.max(i - 1, 0));
  }

  function handleApproveAll(approveIds: string[]) {
    onApproveAll(approveIds);
    setCardIndex(0);
    useToastStore.getState().showToast({
      title: "Documents approved",
      description: `All documents in ${subtaskLabel.toLowerCase()} were approved.`,
    });
  }

  function handleApproveOne(approveId: string) {
    onApproveDocument(approveId);
    setCardIndex(0);
    useToastStore.getState().showToast({
      title: "Document approved",
      description: "This document was marked as approved.",
    });
  }

  function handleRequestValid(
    approveId: string,
    label: string,
    reason: string,
    suggestedComment: string,
  ) {
    requestValidDocument(approveId, label, reason, suggestedComment);
    setCardIndex(0);
  }

  const variant = card.kind === "reject_invalid" ? "warning" : "success";

  const secondaryCtaClass =
    "border-[var(--color-primary)] bg-white text-[var(--color-primary)] hover:bg-white/90";

  return (
    <div className="mb-6">
      <InfoBanner
        variant={variant}
        className="mb-0"
        title={
          <span className="flex w-full items-start justify-between gap-3">
            <span>{card.title}</span>
            {showPager ? (
              <span className="flex shrink-0 items-center gap-1 text-[var(--text-label-size)] font-normal text-[var(--color-muted-foreground)]">
                <button
                  type="button"
                  onClick={goPrev}
                  disabled={safeIndex === 0}
                  className="rounded p-0.5 hover:bg-black/5 disabled:opacity-30"
                  aria-label="Previous recommendation"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="tabular-nums">
                  {safeIndex + 1}/{cards.length}
                </span>
                <button
                  type="button"
                  onClick={goNext}
                  disabled={safeIndex >= cards.length - 1}
                  className="rounded p-0.5 hover:bg-black/5 disabled:opacity-30"
                  aria-label="Next recommendation"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </span>
            ) : null}
          </span>
        }
        message={
          <>
            {card.kind === "reject_invalid" ? (
              <p className="mb-2 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
                {card.rejectionReason}
              </p>
            ) : null}
            <p>{card.message}</p>
            <div className="mt-3">
              {card.kind === "approve_all" ? (
                <Button
                  variant="outline"
                  size="sm"
                  className={secondaryCtaClass}
                  onClick={() => handleApproveAll(card.approveIds)}
                >
                  Approve all
                </Button>
              ) : card.kind === "approve_valid" ? (
                <Button
                  variant="outline"
                  size="sm"
                  className={secondaryCtaClass}
                  onClick={() => handleApproveOne(card.approveId)}
                >
                  Approve document
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className={secondaryCtaClass}
                  onClick={() =>
                    handleRequestValid(
                      card.approveId,
                      card.label,
                      card.rejectionReason,
                      card.suggestedComment,
                    )
                  }
                >
                  Request valid document
                </Button>
              )}
            </div>
          </>
        }
      />
    </div>
  );
}
