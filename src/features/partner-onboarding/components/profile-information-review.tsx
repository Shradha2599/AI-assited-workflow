"use client";

import Image from "next/image";
import { useEffect, useMemo } from "react";
import { Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { StatusTag } from "@/components/ui/status-tag";
import type { OnboardingPartner } from "@/lib/mock-data/onboarding";
import { getOnboardingSectionProgressPercent } from "@/lib/mock-data/onboarding";
import { getProfileTaskEvaluations } from "@/lib/mock-data/onboarding-evaluation";
import type { PotentialPartner } from "@/lib/mock-data/potential-partners";
import { OnboardingCommentsDrawer } from "./onboarding-comments-drawer";
import { AgentFeedbackModal } from "./agent-feedback-modal";
import { OnboardingSectionReviewLayout } from "./onboarding-section-review-layout";
import {
  OnboardingSubtaskNav,
  PROFILE_SUBTASK_HINTS,
} from "./onboarding-subtask-nav";
import { useOnboardingReviewStore } from "../store/onboarding-review-store";

interface ProfileInformationReviewProps {
  partner: PotentialPartner;
  onboarding: OnboardingPartner;
  activeTaskId: string;
}

function ValidationAlert({
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

  if (variant === "banner") {
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
        <Button variant="outline" size="sm" className="shrink-0 bg-white" onClick={onAddComment}>
          Add Comment
        </Button>
        <button
          type="button"
          onClick={() => dismissAlert(taskId)}
          className="shrink-0 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
          aria-label="Dismiss alert"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="mb-5 flex items-start gap-3 rounded-[var(--radius-md)] border border-blue-200 bg-blue-50 px-4 py-3">
      <Image
        src="/icons/info-fill.svg"
        alt=""
        width={20}
        height={20}
        className="mt-0.5 shrink-0"
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <p className="text-[var(--text-caption-size)] font-semibold text-blue-900">{title}</p>
        <p className="text-[var(--text-caption-size)] text-blue-800">{message}</p>
        <div className="mt-2">
          <Button variant="ghost" size="sm" className="h-auto px-0 py-0" onClick={onAddComment}>
            Add Comment
          </Button>
          <span className="mx-1 text-[var(--color-border)]">·</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto px-0 py-0 text-[var(--color-error)] hover:bg-[var(--color-error-light)] hover:text-[var(--color-error)]"
            onClick={onRejectRecommendation}
          >
            Reject recommendation
          </Button>
        </div>
      </div>
      <button
        type="button"
        onClick={() => dismissAlert(taskId)}
        className="text-blue-400 hover:text-blue-600"
        aria-label="Dismiss alert"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function ReadOnlyBadge() {
  return (
    <StatusTag className="inline-flex items-center gap-1.5 bg-purple-100 font-normal text-purple-700">
      <Image src="/icons/visibility.svg" alt="" width={14} height={14} aria-hidden />
      Read Only
    </StatusTag>
  );
}

function UnderlinedField({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-[var(--color-border)] py-4">
      <p className="text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">{label}</p>
      <p className="mt-1 text-[var(--text-body-size)] font-medium leading-relaxed text-[var(--color-foreground)]">
        {value}
      </p>
    </div>
  );
}

function FileAttachment({
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
        <p className="mt-1 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
          {hint}
        </p>
      )}
      <div className="mt-3 flex max-w-[280px] items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white px-4 py-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[#f5f5f5]">
          <Image src="/icons/file-image.svg" alt="" width={24} height={24} aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[var(--text-caption-size)] font-semibold text-[var(--color-foreground)]">
            {name}
          </p>
          <p className="text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">{size}</p>
        </div>
        <button
          type="button"
          className="shrink-0 rounded-[var(--radius-sm)] p-1.5 text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]"
          aria-label={`Download ${name}`}
        >
          <Image src="/icons/download.svg" alt="" width={16} height={16} aria-hidden />
        </button>
      </div>
    </div>
  );
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
  activeEval,
  fields,
  onAddComment,
  onRejectRecommendation,
}: {
  partner: PotentialPartner;
  activeEval: NonNullable<ReturnType<typeof getProfileTaskEvaluations>[number]>;
  fields: NonNullable<ReturnType<typeof getProfileTaskEvaluations>[number]>["fields"];
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
      {activeEval.agentRecommendation && (
        <ValidationAlert
          taskId={activeEval.taskId}
          title={activeEval.agentRecommendation.title}
          message={activeEval.agentRecommendation.message}
          onAddComment={onAddComment}
          onRejectRecommendation={onRejectRecommendation}
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

  const profileSection = onboarding.sections.find((s) => s.id === "profile");
  const profileProgress = profileSection ? getOnboardingSectionProgressPercent(profileSection) : 0;
  const evaluations = getProfileTaskEvaluations(partner.sellerId);
  const activeEval = evaluations.find((e) => e.taskId === activeTaskId) ?? evaluations[0];
  const activeTask =
    profileSection?.tasks.find((t) => t.id === activeTaskId) ?? profileSection?.tasks[0];

  useEffect(() => {
    setContext(partner.id, "profile", activeEval?.taskId ?? activeTaskId);
  }, [partner.id, activeEval?.taskId, activeTaskId, setContext]);

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
  const isBrandProfile = activeTask.id === brandProfileTaskId && activeEval;
  const fields = activeEval?.fields ?? [];

  return (
    <>
      <OnboardingSectionReviewLayout
        partner={partner}
        onboarding={onboarding}
        breadcrumbExtra="Profile Information"
        sectionTitle="Profile information"
        sectionSubtitle="Provide your business related information."
        progress={profileProgress}
        headerIconSrc="/icons/marketplace.svg"
        sidebar={
          <OnboardingSubtaskNav
            items={navItems}
            activeId={activeEval?.taskId ?? activeTaskId}
          />
        }
      >
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-[20px] font-semibold text-[var(--color-foreground)]">
            {activeTask.title}
          </h3>
          <div className="flex items-center gap-2">
            <ReadOnlyBadge />
            {(activeEval?.autoValidated ?? activeTask.autoValidated) && (
              <StatusTag className="inline-flex items-center gap-1 bg-[var(--color-success-light)] font-normal text-[var(--color-success)]">
                <Check className="h-3 w-3" /> Auto Validated
              </StatusTag>
            )}
          </div>
        </div>

        {isBrandProfile ? (
          <BrandProfileContent
            partner={partner}
            activeEval={activeEval}
            fields={fields}
            onAddComment={() => openComments(activeEval.taskId)}
            onRejectRecommendation={() =>
              openFeedback({
                taskId: activeEval.taskId,
                title: activeEval.agentRecommendation!.title,
                agentMessage: activeEval.agentRecommendation!.message,
              })
            }
          />
        ) : activeEval ? (
          <div>
            {activeEval.agentRecommendation && (
              <ValidationAlert
                taskId={activeEval.taskId}
                title={activeEval.agentRecommendation.title}
                message={activeEval.agentRecommendation.message}
                onAddComment={() => openComments(activeEval.taskId)}
                onRejectRecommendation={() =>
                  openFeedback({
                    taskId: activeEval.taskId,
                    title: activeEval.agentRecommendation!.title,
                    agentMessage: activeEval.agentRecommendation!.message,
                  })
                }
              />
            )}
            {fields.length > 0 ? (
              fields.map((field) => (
                <UnderlinedField key={field.id} label={field.label} value={field.submittedValue} />
              ))
            ) : (
              <UnderlinedField label={activeEval.title} value={activeEval.summary} />
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Check className="mb-2 h-8 w-8 text-[var(--color-success)]" />
            <p className="text-[var(--text-body-size)] font-semibold">Section submitted</p>
            <p className="mt-1 max-w-sm text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
              This step is complete. Validation insights appear in the Tasks panel.
            </p>
          </div>
        )}
      </OnboardingSectionReviewLayout>

      <OnboardingCommentsDrawer partner={partner} />
      <AgentFeedbackModal />
    </>
  );
}
