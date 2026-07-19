"use client";

import { useEffect } from "react";
import { Check } from "lucide-react";
import Link from "next/link";

import { StatusTag, markerToneClass } from "@/components/ui/status-tag";
import type { OnboardingPartner } from "@/lib/mock-data/onboarding";
import { getSectionProgressPercent } from "@/lib/mock-data/onboarding";
import { getAssortmentCurationContent } from "@/lib/mock-data/assortment-curation-content";
import type { PotentialPartner } from "@/lib/mock-data/potential-partners";
import { cn } from "@/lib/utils";
import { TruncatedText } from "@/components/ui/truncated-text";
import { AssortmentSubmittedSection } from "./assortment-submitted-section";
import { AssortmentAnalysisTab } from "./assortment-analysis-tab";
import { AssortmentRecommendedTab } from "./assortment-recommended-tab";
import { OnboardingCommentsDrawer } from "./onboarding-comments-drawer";
import { AgentFeedbackModal } from "./agent-feedback-modal";
import { OnboardingSectionReviewLayout } from "./onboarding-section-review-layout";
import { ReadOnlyBadge, ReviewActionBar, ValidationAlert } from "./profile-review-shared";
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
    <StatusTag className={cn("inline-flex items-center gap-1.5 font-normal", markerToneClass.review)}>
      Review
    </StatusTag>
  );
}

function ApprovedBadge() {
  return (
    <StatusTag className={cn("inline-flex items-center gap-1 font-normal", markerToneClass.success)}>
      <Check className="h-3 w-3" /> Approved
    </StatusTag>
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
  const approvedIds = useOnboardingReviewStore((s) => s.approvedIds);
  const initForPartner = useAssortmentCurationStore((s) => s.initForPartner);
  const storeContent = useAssortmentCurationStore((s) => s.content);
  const activeVersionId = useAssortmentCurationStore((s) => s.activeVersionId);

  const assortmentSection = onboarding.sections.find((s) => s.id === "assortment");
  const assortmentTask = assortmentSection?.tasks[0];
  const progress = assortmentSection
    ? getSectionProgressPercent(assortmentSection, approvedIds)
    : 0;
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

        {assortmentTask.status === "in_progress" && assortmentTask.agentRecommendation && !approved && (
          <ValidationAlert
            taskId={assortmentTask.id}
            title={assortmentTask.agentRecommendation.title}
            message={assortmentTask.agentRecommendation.message}
            onAddComment={() => openComments(assortmentTask.id)}
            onRejectRecommendation={() => openComments(assortmentTask.id)}
            variant="banner"
          />
        )}

        <div className="mb-6">
          <div className="flex min-w-0 overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-card)] p-0.5">
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
                    "min-w-0 flex-1 rounded-[var(--radius-sm)] px-3 py-2 text-center text-[var(--text-caption-size)] font-medium whitespace-nowrap transition-colors",
                    isActive
                      ? "bg-[var(--color-foreground)] text-white"
                      : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]",
                  )}
                >
                  <TruncatedText text={label} className="text-center" />
                </Link>
              );
            })}
          </div>
        </div>

        {activeTab === "submitted" && <AssortmentSubmittedSection partnerId={partner.id} />}

        {activeTab === "recommended" && <AssortmentRecommendedTab content={content} />}

        {activeTab === "analysis" && <AssortmentAnalysisTab content={content} />}

        <ReviewActionBar
          primary={{
            label: approved ? "Approved" : "Approve",
            onClick: () => approveItem(approveId),
            disabled: approved,
          }}
          secondary={{
            label: "Reject",
            onClick: () => openComments(assortmentTask.id),
            disabled: approved,
          }}
        />
      </OnboardingSectionReviewLayout>

      <OnboardingCommentsDrawer partner={partner} />
      <AgentFeedbackModal />
    </>
  );
}
