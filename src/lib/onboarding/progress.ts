import { LOCKED_ONBOARDING_SECTION_IDS } from "./types";
import {
  countProfileSectionCompletedSteps,
  isProfileTaskTmApproved,
  PROFILE_TM_REVIEW_TASK_TITLE,
} from "@/features/partner-onboarding/utils/profile-task-progress-core";
import {
  countDocumentationSectionCompletedSteps,
  documentationTaskNeedsReview,
  isDocumentationTaskTmApproved,
} from "@/features/partner-onboarding/utils/documentation-task-progress";
import type {
  OnboardingSection,
  OnboardingSectionId,
  OnboardingSectionState,
  OnboardingTask,
  SellerOnboardingState,
} from "./types";

/** Effective completed subtask count — Brand profile requires TM approval. */
export function countSectionCompletedSteps(
  section: OnboardingSection,
  approvedIds: string[] = [],
): number {
  if (section.id === "profile") {
    return countProfileSectionCompletedSteps(section, approvedIds);
  }
  if (section.id === "documentation") {
    return countDocumentationSectionCompletedSteps(section, approvedIds);
  }
  return section.tasks.filter((task) => task.status === "complete").length;
}

export function getSectionProgressPercent(
  section: OnboardingSection,
  approvedIds: string[] = [],
): number {
  if (!section.totalSteps) return 0;
  const completed = countSectionCompletedSteps(section, approvedIds);
  return Math.round((completed / section.totalSteps) * 100);
}

/** @deprecated Use getSectionProgressPercent(section, approvedIds) */
export function getOnboardingSectionProgressPercent(section: OnboardingSection): number {
  return getSectionProgressPercent(section, []);
}

export function computeOnboardingOverallProgress(
  sections: OnboardingSection[],
  approvedIds: string[] = [],
): number {
  const { total, completed } = countOnboardingSubtaskProgress(sections, approvedIds);
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

/** Progress across all 14 onboarding sub-tasks (not sections). */
export function countOnboardingSubtaskProgress(
  sections: OnboardingSection[],
  approvedIds: string[] = [],
) {
  const total = sections.reduce((sum, section) => sum + section.totalSteps, 0);
  const completed = sections.reduce(
    (sum, section) => sum + countSectionCompletedSteps(section, approvedIds),
    0,
  );
  return {
    total,
    completed,
    remaining: Math.max(0, total - completed),
  };
}

/** @deprecated Use countOnboardingSubtaskProgress — kept for import compatibility. */
export function countOnboardingSectionProgress(
  sections: OnboardingSection[],
  approvedIds: string[] = [],
) {
  return countOnboardingSubtaskProgress(sections, approvedIds);
}

export function isOnboardingSectionLocked(
  section: OnboardingSection,
  sections: OnboardingSection[],
  approvedIds: string[] = [],
): boolean {
  if (!LOCKED_ONBOARDING_SECTION_IDS.has(section.id)) return false;
  const prerequisites = sections.filter((s) => !LOCKED_ONBOARDING_SECTION_IDS.has(s.id));
  return !prerequisites.every(
    (s) => countSectionCompletedSteps(s, approvedIds) >= s.totalSteps,
  );
}

export function syncSectionCompletedSteps(sections: OnboardingSection[]): OnboardingSection[] {
  return sections.map((section) => ({
    ...section,
    completedSteps: section.tasks.filter((task) => task.status === "complete").length,
  }));
}

export function deriveSectionStatus(
  section: OnboardingSection,
  sections: OnboardingSection[],
  approvedIds: string[] = [],
): OnboardingSectionState["status"] {
  if (isOnboardingSectionLocked(section, sections, approvedIds)) return "locked";
  if (section.id === "assortment") {
    const task = section.tasks[0];
    if (task?.status === "complete") return "complete";
    if (task?.status === "in_progress") return "under_review";
    return "pending";
  }
  const completed = countSectionCompletedSteps(section, approvedIds);
  if (completed >= section.totalSteps && section.totalSteps > 0) return "complete";
  if (section.tasks.some((t) => t.status === "in_progress" || t.status === "blocked")) {
    return "in_progress";
  }
  return "pending";
}

export function toSectionStates(
  sections: OnboardingSection[],
  approvedIds: string[] = [],
): OnboardingSectionState[] {
  return sections.map((section) => {
    const completedSteps = countSectionCompletedSteps(section, approvedIds);
    const progressPercent = getSectionProgressPercent(section, approvedIds);
    const withCounts = { ...section, completedSteps };
    return {
      id: section.id as OnboardingSectionId,
      title: section.title,
      status: deriveSectionStatus(withCounts, sections, approvedIds),
      manualReview: ["profile", "assortment", "documentation"].includes(section.id),
      totalSteps: section.totalSteps,
      completedSteps,
      progressPercent,
      tasks: section.tasks.map((task) => ({
        id: task.id,
        suffix: task.id.split("-").pop() ?? task.id,
        sellerId: task.sellerId,
        section: section.id as OnboardingSectionId,
        title: task.title,
        status: task.status,
        manualReview:
          task.title === PROFILE_TM_REVIEW_TASK_TITLE ||
          section.id === "documentation" ||
          section.id === "assortment",
        autoValidated: task.autoValidated,
        issue: task.issue,
        issueSource: task.issueSource,
        agentRecommendation: task.agentRecommendation,
        suggestedCta: task.suggestedCta,
      })),
    };
  });
}

export function buildSellerOnboardingState(
  partnerId: string,
  sellerName: string,
  sections: OnboardingSection[],
  meta: Pick<SellerOnboardingState, "startedAt" | "targetLaunchDate" | "assignedTo">,
  approvedIds: string[] = [],
): SellerOnboardingState {
  const synced = syncSectionCompletedSteps(sections);
  return {
    partnerId,
    sellerName,
    assignedTo: meta.assignedTo,
    startedAt: meta.startedAt,
    targetLaunchDate: meta.targetLaunchDate,
    overallProgress: computeOnboardingOverallProgress(synced, approvedIds),
    sections: toSectionStates(synced, approvedIds),
  };
}

export function taskNeedsReview(
  task: OnboardingTask,
  sectionId: string,
  approvedIds: string[] = [],
): boolean {
  if (sectionId === "integrations" || sectionId === "item-listing" || sectionId === "stripe") {
    return false;
  }
  if (sectionId === "assortment") return task.status === "in_progress";
  if (task.title === PROFILE_TM_REVIEW_TASK_TITLE) {
    if (isProfileTaskTmApproved(task.id, approvedIds)) return false;
    return task.status === "in_progress" || task.status === "complete" || Boolean(task.issue);
  }
  if (sectionId === "documentation") {
    return documentationTaskNeedsReview(task, approvedIds);
  }
  return false;
}
