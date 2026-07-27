"use client";

import { useEffect, useMemo } from "react";
import { Check } from "lucide-react";

import { StatusTag, markerToneClass } from "@/components/ui/status-tag";
import type { OnboardingPartner } from "@/lib/mock-data/onboarding";
import { getProfileTaskEvaluations } from "@/lib/mock-data/onboarding-evaluation";
import type { PotentialPartner } from "@/lib/mock-data/potential-partners";
import { getSectionProgressPercent } from "@/lib/mock-data/onboarding";
import { cn } from "@/lib/utils";
import {
  isProfileTaskSubmitted,
  profileTaskApproveId,
} from "@/features/partner-onboarding/utils/profile-task-progress";
import { OnboardingCommentsDrawer } from "./onboarding-comments-drawer";
import { AgentFeedbackModal } from "./agent-feedback-modal";
import { OnboardingSectionReviewLayout } from "./onboarding-section-review-layout";
import {
  OnboardingSubtaskNav,
  PROFILE_SUBTASK_HINTS,
} from "./onboarding-subtask-nav";
import {
  CompleteBadge,
  AiSubtaskReviewBanner,
  AiSubtaskReviewHeaderActions,
  FileAttachment,
  ReadOnlyBadge,
  SectionDivider,
  SubtaskReviewBadge,
  UnderlinedField,
} from "./profile-review-shared";
import { AiRecommendationModal } from "./ai-recommendation-modal";
import { getOnboardingSectionSubtitle } from "../constants/onboarding-section-copy";
import { ProfileSubTaskContentView } from "./profile-subtask-views";
import { useOnboardingReviewStore } from "../store/onboarding-review-store";

interface ProfileInformationReviewProps {
  partner: PotentialPartner;
  onboarding: OnboardingPartner;
  activeTaskId: string;
}

function getFieldValue(
  fields: { id: string; submittedValue: string }[],
  id: string,
  fallback: string,
): string {
  return fields.find((f) => f.id === id)?.submittedValue ?? fallback;
}

const LOGO_FILE_SIZE = "1.2 MB";
const COVER_FILE_SIZE = "1.4 MB";

function parseAssetFileName(value: string): string {
  return value.replace(/\s*\([^)]*\)\s*$/, "").trim() || value;
}

function BrandProfileContent({
  partner,
  fields,
  taskId,
  taskApproveId,
  taskSubmitted,
  tmApproved,
  aiFieldSuggestions,
  validationStatus,
}: {
  partner: PotentialPartner;
  fields: { id: string; submittedValue: string }[];
  taskId: string;
  taskApproveId: string;
  taskSubmitted: boolean;
  tmApproved: boolean;
  aiFieldSuggestions?: import("@/lib/mock-data/onboarding-evaluation").AiFieldSuggestion[];
  validationStatus: string;
}) {
  const bannerName = parseAssetFileName(getFieldValue(fields, "banner", "Cover.png"));
  const hasDescriptionIssue =
    validationStatus === "invalid" && (aiFieldSuggestions?.length ?? 0) > 0;
  const allGood = validationStatus === "valid" && taskSubmitted;

  return (
    <>
      <AiSubtaskReviewBanner
        alertId={taskId}
        taskApproveId={taskApproveId}
        taskSubmitted={taskSubmitted}
        tmApproved={tmApproved}
        mode={hasDescriptionIssue ? "warning" : allGood ? "success" : "warning"}
        warningTitle="Brand description does not meet criteria"
        warningMessage="AI flagged the brand description in Brand details. Other fields in this sub-task passed validation. Review the suggested copy before the partner can proceed."
        successTitle="Brand profile ready to approve"
        successMessage="Brand display name, description, website, sourcing, and assets meet Target Plus criteria. Approve this sub-task when review is complete."
        recommendationFields={aiFieldSuggestions ?? []}
        modalTitle="Brand description recommendation"
        modalSubtitle="Suggested copy for fields that did not meet marketplace criteria."
        applyToastMessage="AI brand description recommendation was shared with the partner."
        approveToastMessage="Brand profile sub-task marked as approved."
      />


      <section>
        <h4 className="text-[var(--text-body-size)] font-semibold text-[var(--color-foreground)]">
          Brand details
        </h4>
        <UnderlinedField
          label="Brand display name"
          value={getFieldValue(fields, "display-name", partner.legalBusinessName)}
        />
        <UnderlinedField
          label="Brand description"
          value={getFieldValue(
            fields,
            "description",
            "Pinnacle Goods is a lifestyle retailer offering curated home, kitchen, and wellness products designed for modern living.",
          )}
        />
        <UnderlinedField
          label="Website URL"
          value={getFieldValue(
            fields,
            "website",
            `www.${partner.legalBusinessName.toLowerCase().replace(/\s+/g, "")}.com`,
          )}
        />
        <UnderlinedField
          label="Product sourcing information"
          value={getFieldValue(fields, "sourcing", "Product sourcing information appears here")}
        />
      </section>

      <SectionDivider />

      <section>
        <h4 className="text-[var(--text-body-size)] font-semibold text-[var(--color-foreground)]">
          Brand assets
        </h4>
        <div className="mt-4 space-y-6">
          <FileAttachment label="Logo" name="Logo.png" size={LOGO_FILE_SIZE} />
          <FileAttachment
            label="Banner/ Cover Image"
            name={bannerName}
            size={COVER_FILE_SIZE}
          />
        </div>
      </section>
    </>
  );
}

export function ProfileInformationReview({
  partner,
  onboarding,
  activeTaskId,
}: ProfileInformationReviewProps) {
  const setContext = useOnboardingReviewStore((s) => s.setContext);
  const openComments = useOnboardingReviewStore((s) => s.openComments);
  const approvedIds = useOnboardingReviewStore((s) => s.approvedIds);
  const dismissedAlerts = useOnboardingReviewStore((s) => s.dismissedAlerts);

  const profileSection = onboarding.sections.find((s) => s.id === "profile");
  const profileProgress = profileSection
    ? getSectionProgressPercent(profileSection, approvedIds)
    : 0;
  const evaluations = getProfileTaskEvaluations(partner.sellerId);
  const activeEval = evaluations.find((e) => e.taskId === activeTaskId);
  const activeTask =
    profileSection?.tasks.find((t) => t.id === activeTaskId) ?? profileSection?.tasks[0];

  useEffect(() => {
    setContext(partner.id, "profile", activeTaskId);
  }, [partner.id, activeTaskId, setContext]);

  const navItems = useMemo(() => {
    if (!profileSection) return [];
    return profileSection.tasks.map((task) => ({
      id: task.id,
      title: task.title,
      hint: PROFILE_SUBTASK_HINTS[task.title] ?? "Complete this profile step.",
      href: `/sellers/onboarding/${partner.id}/review/profile?task=${task.id}`,
      task,
    }));
  }, [profileSection, partner.id]);

  if (!profileSection || !activeTask) return null;

  const brandProfileTaskId = profileSection.tasks.find((t) => t.title === "Brand profile")?.id;
  const isBrandProfile = activeTask.id === brandProfileTaskId;
  const fields = activeEval?.fields ?? [];

  const taskApproveId = profileTaskApproveId(activeTaskId);
  const tmApproved = approvedIds.includes(taskApproveId);
  const taskSubmitted = isProfileTaskSubmitted(activeTask);

  const activeEvaluation = isBrandProfile ? activeEval : undefined;
  const brandAiMode: "warning" | "success" =
    activeEvaluation?.validationStatus === "invalid" &&
    (activeEvaluation?.aiFieldSuggestions?.length ?? 0) > 0
      ? "warning"
      : activeEvaluation?.validationStatus === "valid" && taskSubmitted
        ? "success"
        : "warning";
  const brandShowAiReview =
    isBrandProfile &&
    taskSubmitted &&
    !tmApproved &&
    !dismissedAlerts.includes(activeTaskId) &&
    (brandAiMode === "success" ||
      (brandAiMode === "warning" && (activeEvaluation?.aiFieldSuggestions?.length ?? 0) > 0));

  return (
    <>
      <OnboardingSectionReviewLayout
        partner={partner}
        onboarding={onboarding}
        breadcrumbExtra="Profile Information"
        sectionTitle="Profile information"
        sectionSubtitle={getOnboardingSectionSubtitle("profile")}
        progress={profileProgress}
        headerIconSrc="/icons/marketplace.svg"
        sidebar={
          <OnboardingSubtaskNav
            items={navItems}
            activeId={activeTaskId}
            approvedIds={approvedIds}
          />
        }
      >
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-[20px] font-semibold text-[var(--color-foreground)]">
            {activeTask.title}
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            {isBrandProfile ? (
              tmApproved ? (
                <StatusTag className={cn("inline-flex items-center gap-1 font-normal", markerToneClass.success)}>
                  <Check className="h-3 w-3" /> Approved
                </StatusTag>
              ) : (
                <>
                  {taskSubmitted ? <SubtaskReviewBadge /> : null}
                  <AiSubtaskReviewHeaderActions
                    alertId={activeTaskId}
                    taskApproveId={taskApproveId}
                    taskSubmitted={taskSubmitted}
                    tmApproved={tmApproved}
                    mode={brandAiMode}
                    recommendationFields={activeEvaluation?.aiFieldSuggestions ?? []}
                    approveToastMessage="Brand profile sub-task marked as approved."
                    onReject={() => openComments(activeEval?.taskId ?? activeTaskId)}
                  />
                  {!brandShowAiReview && !taskSubmitted ? <ReadOnlyBadge /> : null}
                </>
              )
            ) : (
              <>
                <ReadOnlyBadge />
                <CompleteBadge />
              </>
            )}
          </div>
        </div>

        {isBrandProfile ? (
          <BrandProfileContent
            partner={partner}
            fields={fields}
            taskId={activeTaskId}
            taskApproveId={taskApproveId}
            taskSubmitted={taskSubmitted}
            tmApproved={tmApproved}
            aiFieldSuggestions={activeEvaluation?.aiFieldSuggestions}
            validationStatus={activeEvaluation?.validationStatus ?? "partial"}
          />
        ) : (
          <ProfileSubTaskContentView partner={partner} taskTitle={activeTask.title} />
        )}
      </OnboardingSectionReviewLayout>

      <OnboardingCommentsDrawer partner={partner} />
      <AgentFeedbackModal />
      <AiRecommendationModal />
    </>
  );
}
