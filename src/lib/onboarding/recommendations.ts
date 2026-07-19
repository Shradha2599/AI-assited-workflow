import type { AgentRecommendation } from "@/lib/mock-data/onboarding-evaluation";
import type { OnboardingTask } from "./types";
import { PROFILE_TM_REVIEW_TASK_TITLE } from "@/features/partner-onboarding/utils/profile-task-progress-core";
import { hashPartnerId, seededInt } from "./seed";
import type { AiSuggestedAction, AiSuggestedCta, OnboardingSectionId } from "./types";
import { taskNeedsReview } from "./progress";

const RECOMMENDATION_TEMPLATES: Record<
  string,
  { title: string; message: string; comment: string; cta: AiSuggestedAction; ctaLabel: string }
> = {
  "profile-brand": {
    title: "Banner / Cover Image — review required",
    message:
      "Cover image resolution is below marketplace guidelines. Brand display name, description, website, and sourcing were checked against submitted assets. Add a comment so the seller can upload a corrected cover image.",
    comment:
      "Please replace the cover image with a higher-resolution asset (minimum 1200×675) aligned with your brand guidelines.",
    cta: "request_edits",
    ctaLabel: "Add Comment",
  },
  "profile-brand-clean": {
    title: "Brand profile ready for review",
    message:
      "Brand display name, description, website, logo, and cover image align with submitted assets. Approve if everything looks correct, or add a comment for the seller to update any brand field.",
    comment:
      "Please review your brand display name, description, and imagery to ensure they match current marketplace guidelines.",
    cta: "review",
    ctaLabel: "Add Comment",
  },
  "assortment": {
    title: "Assortment application submitted",
    message: "Seller submitted their assortment via the application form. SKUs need TM review.",
    comment: "Review submitted SKUs against category guidelines and recommended assortment.",
    cta: "open_details",
    ctaLabel: "Open details",
  },
  "documentation-w9": {
    title: "W9 form submitted",
    message: "Tax document uploaded — verify legal name and EIN against business registration.",
    comment: "W9 fields match business identity. Approve or request corrected document.",
    cta: "approve",
    ctaLabel: "Approve",
  },
  "documentation-contract": {
    title: "Contract pending review",
    message: "Signed contract uploaded — confirm authorized signatory and effective date.",
    comment: "Review contract signature block and counterparty details before approval.",
    cta: "review",
    ctaLabel: "Review task",
  },
  "documentation-brand": {
    title: "Brand authorization documents",
    message:
      "Brand relationship docs submitted — verify distributor authorization. Add a comment so the seller can rectify any missing details.",
    comment: "Confirm brand authorization letter covers listed SKUs and territories.",
    cta: "review",
    ctaLabel: "Add Comment",
  },
};

function templateKey(sectionId: OnboardingSectionId, task: OnboardingTask): string {
  if (sectionId === "profile" && task.title === PROFILE_TM_REVIEW_TASK_TITLE) {
    return task.issue ? "profile-brand" : "profile-brand-clean";
  }
  if (sectionId === "assortment") return "assortment";
  if (sectionId === "documentation") {
    if (task.title.toLowerCase().includes("w9")) return "documentation-w9";
    if (task.title.toLowerCase().includes("contract")) return "documentation-contract";
    return "documentation-brand";
  }
  return `${sectionId}-default`;
}

function buildSuggestedCta(
  action: AiSuggestedAction,
  label: string,
  partnerId: string,
  sectionId: OnboardingSectionId,
): AiSuggestedCta {
  return {
    label,
    action,
    target: `/sellers/onboarding/${partnerId}/review/${sectionId}`,
  };
}

/** Deterministic AI recommendation for a reviewable subtask — stable per partner + task. */
export function generateTaskRecommendation(
  partnerId: string,
  partnerName: string,
  sectionId: OnboardingSectionId,
  task: OnboardingTask,
): { agentRecommendation: AgentRecommendation; suggestedCta: AiSuggestedCta } | undefined {
  if (!taskNeedsReview(task, sectionId)) return undefined;

  const seed = hashPartnerId(`${partnerId}:${task.id}`);
  const key = templateKey(sectionId, task);
  const template = RECOMMENDATION_TEMPLATES[key];
  if (!template) return undefined;

  const variant = seededInt(seed, 3, 0, 2);
  const namePrefix = partnerName.split(" ")[0] ?? partnerName;

  const agentRecommendation: AgentRecommendation = {
    title: template.title,
    message:
      variant === 0
        ? template.message
        : `${namePrefix}: ${template.message}`,
    suggestedComment: template.comment,
  };

  return {
    agentRecommendation,
    suggestedCta: buildSuggestedCta(template.cta, template.ctaLabel, partnerId, sectionId),
  };
}

export function attachRecommendationsToTasks(
  partnerId: string,
  partnerName: string,
  sections: { id: string; tasks: OnboardingTask[] }[],
): OnboardingTask[] {
  return sections.flatMap((section) =>
    section.tasks.map((task) => {
      const rec = generateTaskRecommendation(
        partnerId,
        partnerName,
        section.id as OnboardingSectionId,
        task,
      );
      if (!rec) return task;
      return {
        ...task,
        agentRecommendation: rec.agentRecommendation,
        suggestedCta: rec.suggestedCta,
      } as OnboardingTask & { suggestedCta?: AiSuggestedCta };
    }),
  );
}
