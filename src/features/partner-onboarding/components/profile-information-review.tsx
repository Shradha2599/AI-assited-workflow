"use client";

import { useEffect, useMemo } from "react";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { StatusTag } from "@/components/ui/status-tag";
import type { OnboardingPartner } from "@/lib/mock-data/onboarding";
import { getProfileTaskEvaluations } from "@/lib/mock-data/onboarding-evaluation";
import type { PotentialPartner } from "@/lib/mock-data/potential-partners";
import { getSectionProgressPercent } from "@/lib/mock-data/onboarding";
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
  AutoValidatedBadge,
  CompleteBadge,
  FileAttachment,
  ReadOnlyBadge,
  UnderlinedField,
  ValidationAlert,
} from "./profile-review-shared";
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

function BrandProfileContent({
  partner,
  fields,
  taskId,
  agentRecommendation,
  secondaryCta,
  onAddComment,
  onRejectRecommendation,
}: {
  partner: PotentialPartner;
  fields: { id: string; submittedValue: string }[];
  taskId: string;
  agentRecommendation?: { title: string; message: string };
  secondaryCta?: { label: string; onClick: () => void };
  onAddComment: () => void;
  onRejectRecommendation: () => void;
}) {
  const bannerValue = getFieldValue(fields, "banner", "Cover.png");
  const bannerName = bannerValue.includes("(") ? bannerValue.split(" (")[0] : bannerValue;
  const bannerSize = bannerValue.includes("(")
    ? bannerValue.match(/\(([^)]+)\)/)?.[1] ?? "640×360"
    : "640×360";

  return (
    <>
      {agentRecommendation && (
        <ValidationAlert
          taskId={taskId}
          title={agentRecommendation.title}
          message={agentRecommendation.message}
          onAddComment={onAddComment}
          onRejectRecommendation={onRejectRecommendation}
          secondaryCta={secondaryCta}
          variant="banner"
        />
      )}

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

      <section className="mt-8 border-t border-[var(--color-border)] pt-8">
        <h4 className="text-[var(--text-body-size)] font-semibold text-[var(--color-foreground)]">
          Brand assets
        </h4>
        <div className="mt-4 space-y-6">
          <FileAttachment label="Logo" hint="Please provide logo" name="Logo.png" size="1.2 MB" />
          <FileAttachment
            label="Banner/ Cover Image"
            hint="Please provide cover image"
            name={bannerName}
            size={bannerSize}
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
  const openFeedback = useOnboardingReviewStore((s) => s.openFeedback);
  const approveItem = useOnboardingReviewStore((s) => s.approveItem);
  const approvedIds = useOnboardingReviewStore((s) => s.approvedIds);

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

  const handleAddComment = () => {
    openComments(activeEval?.taskId ?? activeTaskId);
  };

  const handleRejectRecommendation = () => {
    const rec = activeEval?.agentRecommendation ?? activeTask.agentRecommendation;
    if (rec) {
      openFeedback({
        taskId: activeEval?.taskId ?? activeTaskId,
        title: rec.title,
        agentMessage: rec.message,
      });
    }
  };

  const agentRec = activeEval?.agentRecommendation ?? activeTask.agentRecommendation;
  const secondaryCta = activeTask.suggestedCta
    ? {
        label: activeTask.suggestedCta.label,
        onClick: () => {
          if (activeTask.suggestedCta?.action === "approve") {
            approveItem(profileTaskApproveId(activeTaskId));
          } else {
            handleAddComment();
          }
        },
      }
    : undefined;

  const taskApproveId = profileTaskApproveId(activeTaskId);
  const tmApproved = approvedIds.includes(taskApproveId);
  const taskSubmitted = isProfileTaskSubmitted(activeTask);

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
            <ReadOnlyBadge />
            {isBrandProfile ? (
              <>
                {(activeEval?.autoValidated ?? activeTask.autoValidated) && !tmApproved && (
                  <AutoValidatedBadge />
                )}
                {tmApproved && (
                  <StatusTag className="inline-flex items-center gap-1 bg-[var(--color-success-light)] font-normal text-[var(--color-success)]">
                    <Check className="h-3 w-3" /> Approved
                  </StatusTag>
                )}
                {taskSubmitted && !tmApproved && (
                  <>
                    <Button size="sm" variant="outline" onClick={() => approveItem(taskApproveId)}>
                      Approve
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-[var(--color-primary)] hover:bg-transparent"
                      onClick={() => openComments(activeTaskId)}
                    >
                      Reject
                    </Button>
                  </>
                )}
              </>
            ) : (
              <CompleteBadge />
            )}
          </div>
        </div>

        {isBrandProfile ? (
          <BrandProfileContent
            partner={partner}
            fields={fields}
            taskId={activeTaskId}
            agentRecommendation={agentRec}
            secondaryCta={secondaryCta}
            onAddComment={handleAddComment}
            onRejectRecommendation={handleRejectRecommendation}
          />
        ) : (
          <ProfileSubTaskContentView partner={partner} taskTitle={activeTask.title} />
        )}
      </OnboardingSectionReviewLayout>

      <OnboardingCommentsDrawer partner={partner} />
      <AgentFeedbackModal />
    </>
  );
}
