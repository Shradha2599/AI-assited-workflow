import { LOCKED_ONBOARDING_SECTION_IDS } from "./types";
import {
  countProfileSectionCompletedSteps,
  getProfileSectionProgressPercent,
  PROFILE_TM_REVIEW_TASK_TITLE,
} from "@/features/partner-onboarding/utils/profile-task-progress";
import type {
  OnboardingSection,
  OnboardingSectionId,
  OnboardingSectionState,
  OnboardingTask,
  SellerOnboardingState,
} from "./types";

export function getOnboardingSectionProgressPercent(section: OnboardingSection): number {
  if (!section.totalSteps) return 0;
  return Math.round((section.completedSteps / section.totalSteps) * 100);
}

export function computeOnboardingOverallProgress(sections: OnboardingSection[]): number {
  const totalSteps = sections.reduce((sum, section) => sum + section.totalSteps, 0);
  if (totalSteps === 0) return 0;
  const completedSteps = sections.reduce((sum, section) => sum + section.completedSteps, 0);
  return Math.round((completedSteps / totalSteps) * 100);
}

export function countOnboardingSectionProgress(sections: OnboardingSection[]) {
  const total = sections.length;
  const remaining = sections.filter((section) => section.completedSteps < section.totalSteps).length;
  return { total, remaining };
}

export function isOnboardingSectionLocked(
  section: OnboardingSection,
  sections: OnboardingSection[],
): boolean {
  if (!LOCKED_ONBOARDING_SECTION_IDS.has(section.id)) return false;
  const prerequisites = sections.filter((s) => !LOCKED_ONBOARDING_SECTION_IDS.has(s.id));
  return !prerequisites.every((s) => s.completedSteps >= s.totalSteps);
}

/** Profile uses TM-approval overlay; other sections count `complete` tasks only. */
export function countSectionCompletedSteps(
  section: OnboardingSection,
  approvedIds: string[] = [],
): number {
  if (section.id === "profile") {
    return countProfileSectionCompletedSteps(section, approvedIds);
  }
  return section.tasks.filter((task) => task.status === "complete").length;
}

export function getSectionProgressPercent(
  section: OnboardingSection,
  approvedIds: string[] = [],
): number {
  if (section.id === "profile") {
    return getProfileSectionProgressPercent(section, approvedIds);
  }
  return getOnboardingSectionProgressPercent(section);
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
): OnboardingSectionState["status"] {
  if (isOnboardingSectionLocked(section, sections)) return "locked";
  if (section.id === "assortment") {
    const task = section.tasks[0];
    if (task?.status === "complete") return "complete";
    if (task?.status === "in_progress") return "under_review";
    return "pending";
  }
  if (section.completedSteps >= section.totalSteps && section.totalSteps > 0) return "complete";
  if (section.tasks.some((t) => t.status === "in_progress" || t.status === "blocked")) {
    return section.id === "documentation" || section.id === "profile" ? "in_progress" : "in_progress";
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
      status: deriveSectionStatus(withCounts, sections),
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
): SellerOnboardingState {
  const synced = syncSectionCompletedSteps(sections);
  return {
    partnerId,
    sellerName,
    assignedTo: meta.assignedTo,
    startedAt: meta.startedAt,
    targetLaunchDate: meta.targetLaunchDate,
    overallProgress: computeOnboardingOverallProgress(synced),
    sections: toSectionStates(synced),
  };
}

export function taskNeedsReview(task: OnboardingTask, sectionId: string): boolean {
  if (sectionId === "integrations" || sectionId === "item-listing" || sectionId === "stripe") {
    return false;
  }
  if (sectionId === "assortment") return task.status === "in_progress";
  if (task.title === PROFILE_TM_REVIEW_TASK_TITLE) {
    return task.status === "in_progress" || Boolean(task.issue);
  }
  if (sectionId === "documentation") return task.status === "in_progress";
  return false;
}
