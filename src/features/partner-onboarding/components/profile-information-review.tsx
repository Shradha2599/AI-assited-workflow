"use client";

import { useEffect } from "react";
import {
  AlertTriangle,
  Check,
  FileImage,
  Info,
  X,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { StatusTag } from "@/components/ui/status-tag";
import { cn } from "@/lib/utils";
import type { OnboardingPartner } from "@/lib/mock-data/onboarding";
import {
  getFieldInsightsForTask,
  getProfileTaskEvaluations,
  getSectionEvaluation,
} from "@/lib/mock-data/onboarding-evaluation";
import { statusLabel } from "@/lib/mock-data/lead-form-analysis";
import type { PotentialPartner } from "@/lib/mock-data/potential-partners";
import { OnboardingCommentsDrawer } from "./onboarding-comments-drawer";
import { AgentFeedbackModal } from "./agent-feedback-modal";
import { OnboardingProfileHeader } from "./onboarding-profile-header";
import { useOnboardingReviewStore } from "../store/onboarding-review-store";

interface ProfileInformationReviewProps {
  partner: PotentialPartner;
  onboarding: OnboardingPartner;
  activeTaskId: string;
}

function SubTaskNav({
  partnerId,
  sectionId,
  tasks,
  activeTaskId,
}: {
  partnerId: string;
  sectionId: string;
  tasks: OnboardingPartner["sections"][0]["tasks"];
  activeTaskId: string;
}) {
  return (
    <nav className="w-52 shrink-0 border-r border-[var(--color-border)] py-2">
      {tasks.map((task) => {
        const hasIssue = task.issue || task.status === "in_progress";
        const isComplete = task.status === "complete";
        const isActive = task.id === activeTaskId;

        return (
          <Link
            key={task.id}
            href={`/sellers/onboarding/${partnerId}/review/${sectionId}?task=${task.id}`}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-[var(--text-caption-size)] transition-colors",
              isActive
                ? "border-l-2 border-[var(--color-primary)] bg-[var(--color-primary-light)] font-medium text-[var(--color-primary)]"
                : "border-l-2 border-transparent text-[var(--color-foreground)] hover:bg-[var(--color-muted)]",
            )}
          >
            {hasIssue ? (
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-[var(--color-warning)]" />
            ) : isComplete ? (
              <Check className="h-3.5 w-3.5 shrink-0 text-[var(--color-success)]" />
            ) : (
              <span className="h-3.5 w-3.5 shrink-0 rounded-full border border-[var(--color-border)]" />
            )}
            {task.title}
          </Link>
        );
      })}
    </nav>
  );
}

function ValidationAlert({
  taskId,
  title,
  message,
  onAddComment,
  onRejectRecommendation,
}: {
  taskId: string;
  title: string;
  message: string;
  onAddComment: () => void;
  onRejectRecommendation: () => void;
}) {
  const dismissed = useOnboardingReviewStore((s) => s.dismissedAlerts.includes(taskId));
  const dismissAlert = useOnboardingReviewStore((s) => s.dismissAlert);

  if (dismissed) return null;

  return (
    <div className="mb-4 flex items-start gap-3 rounded-[var(--radius-md)] border border-blue-200 bg-blue-50 px-4 py-3">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
      <div className="min-w-0 flex-1">
        <p className="text-[var(--text-caption-size)] font-semibold text-blue-900">{title}</p>
        <p className="text-[var(--text-caption-size)] text-blue-800">{message}</p>
        <div className="mt-2 flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-auto px-0 py-0"
            onClick={onAddComment}
          >
            Add Comment
          </Button>
          <span className="text-[var(--color-border)]">·</span>
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

export function ProfileInformationReview({
  partner,
  onboarding,
  activeTaskId,
}: ProfileInformationReviewProps) {
  const setContext = useOnboardingReviewStore((s) => s.setContext);
  const openComments = useOnboardingReviewStore((s) => s.openComments);
  const openFeedback = useOnboardingReviewStore((s) => s.openFeedback);

  const profileSection = onboarding.sections.find((s) => s.id === "profile");
  const sectionMeta = getSectionEvaluation(partner.sellerId, "profile");
  const evaluations = getProfileTaskEvaluations(partner.sellerId);
  const activeEval = evaluations.find((e) => e.taskId === activeTaskId) ?? evaluations[0];
  const fieldInsights = activeEval ? getFieldInsightsForTask(partner.sellerId, activeEval.taskId) : [];

  useEffect(() => {
    setContext(partner.id, "profile", activeEval?.taskId ?? activeTaskId);
  }, [partner.id, activeEval?.taskId, activeTaskId, setContext]);

  if (!profileSection || !sectionMeta) return null;

  const brandProfileTaskId = profileSection.tasks.find((t) => t.title === "Brand profile")?.id;
  const isBrandProfile = activeEval?.taskId === brandProfileTaskId;

  return (
    <div className="space-y-[var(--space-4)]">
      <OnboardingProfileHeader partner={partner} launchDate={onboarding.targetLaunchDate} />

      <nav aria-label="Breadcrumb" className="-mt-2">
        <ol className="flex flex-wrap items-center gap-1 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
          <li>
            <Link href={`/sellers/onboarding/${partner.id}`} className="hover:text-[var(--color-foreground)]">
              {partner.legalBusinessName}
            </Link>
          </li>
          <li>/</li>
          <li className="font-medium text-[var(--color-foreground)]">Profile Information</li>
        </ol>
      </nav>

      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card)]">
        <div className="bg-gradient-to-r from-[#c5221f] to-[#8b1a18] px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[var(--text-body-size)] font-semibold">{sectionMeta.title}</p>
              <p className="text-[var(--text-caption-size)] text-white/80">{sectionMeta.subtitle}</p>
            </div>
            <span className="text-[var(--text-body-size)] font-semibold tabular-nums">
              {sectionMeta.progress}%
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/30">
            <div
              className="h-full rounded-full bg-white transition-all"
              style={{ width: `${sectionMeta.progress}%` }}
            />
          </div>
        </div>

        <div className="flex min-h-[480px]">
          <SubTaskNav
            partnerId={partner.id}
            sectionId="profile"
            tasks={profileSection.tasks}
            activeTaskId={activeEval?.taskId ?? activeTaskId}
          />

          <div className="min-w-0 flex-1 p-6">
            {isBrandProfile && activeEval ? (
              <>
                <div className="mb-4 flex items-center gap-2">
                  <StatusTag className="bg-purple-100 text-purple-700">
                    Read Only
                  </StatusTag>
                  {activeEval.autoValidated && (
                    <StatusTag className="inline-flex items-center gap-1 bg-[var(--color-success-light)] text-[var(--color-success)]">
                      <Check className="h-3 w-3" /> Auto Validated
                    </StatusTag>
                  )}
                </div>

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

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">
                      Brand display name
                    </p>
                    <p className="mt-0.5 text-[var(--text-caption-size)] font-medium">
                      {partner.legalBusinessName}
                    </p>
                  </div>
                  <div>
                    <p className="text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">
                      Website URL
                    </p>
                    <p className="mt-0.5 text-[var(--text-caption-size)] font-medium">
                      www.{partner.legalBusinessName.toLowerCase().replace(/\s+/g, "")}.com
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">
                      Brand description
                    </p>
                    <p className="mt-0.5 text-[var(--text-caption-size)]">
                      Premium home and kitchen essentials crafted for modern living.
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">
                      Product sourcing information
                    </p>
                    <p className="mt-0.5 text-[var(--text-caption-size)]">
                      Certified suppliers, non-GMO materials
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <p className="mb-2 text-[var(--text-caption-size)] font-semibold">Brand assets</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-3">
                      <p className="mb-2 text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">
                        Logo
                      </p>
                      <div className="flex items-center gap-2">
                        <FileImage className="h-4 w-4 text-green-600" />
                        <span className="text-[var(--text-caption-size)]">Logo.png (1.2 MB)</span>
                      </div>
                    </div>
                    <div
                      className={cn(
                        "rounded-[var(--radius-md)] border p-3",
                        activeEval.validationStatus === "invalid"
                          ? "border-[var(--color-error-light)] bg-[var(--color-error-light)]/30"
                          : "border-[var(--color-border)]",
                      )}
                    >
                      <p className="mb-2 text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">
                        Banner/ Cover Image
                      </p>
                      <div className="flex items-center gap-2">
                        <FileImage className="h-4 w-4 text-red-600" />
                        <span className="text-[var(--text-caption-size)]">Cover.png (640×360)</span>
                        {activeEval.validationStatus === "invalid" && (
                          <StatusTag className="bg-[var(--color-error-light)] text-[var(--color-error)]">
                            {statusLabel("invalid")}
                          </StatusTag>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {fieldInsights.length > 0 && (
                  <div className="mt-6 border-t border-[var(--color-border)] pt-4">
                    <p className="mb-2 text-[var(--text-label-size)] font-medium text-[var(--color-muted-foreground)]">
                      Validated fields (see Insights panel)
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {fieldInsights.map((f) => (
                        <span
                          key={f.id}
                          className="inline-flex items-center gap-1 rounded-full bg-[var(--color-success-light)] px-2 py-0.5 text-[var(--text-label-size)] text-[var(--color-success)]"
                        >
                          <Check className="h-3 w-3" /> {f.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex h-full flex-col items-center justify-center py-12 text-center">
                <Check className="mb-2 h-8 w-8 text-[var(--color-success)]" />
                <p className="text-[var(--text-body-size)] font-semibold">Section submitted</p>
                <p className="mt-1 max-w-sm text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
                  Evaluation results for this step appear in the Tasks and Insights panel on the right.
                </p>
                {activeEval && (
                  <div className="mt-4 rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 py-3 text-left">
                    <p className="text-[var(--text-caption-size)] font-medium">{activeEval.title}</p>
                    <p className="mt-0.5 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
                      {activeEval.summary}
                    </p>
                    <p className="mt-1 text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">
                      Source: {activeEval.source} · Checked on {activeEval.checkedOn}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <OnboardingCommentsDrawer partner={partner} />
      <AgentFeedbackModal />
    </div>
  );
}
