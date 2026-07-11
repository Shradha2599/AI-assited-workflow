import {
  getFieldInsightsForPanel,
  getOnboardingInsightsForPanel,
  getOnboardingTasksForPanel,
  getProfileTaskEvaluations,
  getReviewableEvaluations,
} from "@/lib/mock-data/onboarding-evaluation";

export interface OnboardingPanelItem {
  id: string;
  title: string;
  description: string;
  actionLabel: string;
  actionType: "open_onboarding_comment" | "approve_onboarding";
  validationStatus?: "valid" | "invalid" | "partial" | "unverified";
  source?: string;
  checkedOn?: string;
  sectionId?: string;
  reviewTaskId?: string;
}

function mapTaskItem(item: ReturnType<typeof getOnboardingTasksForPanel>[number]): OnboardingPanelItem {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    actionLabel: item.actionLabel,
    actionType: item.actionType,
    validationStatus: item.validationStatus,
    source: item.source,
    checkedOn: item.checkedOn,
    sectionId: item.sectionId,
    reviewTaskId: item.reviewTaskId,
  };
}

function mapInsightItem(item: ReturnType<typeof getOnboardingInsightsForPanel>[number]): OnboardingPanelItem {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    actionLabel: item.actionLabel,
    actionType: item.actionType,
    validationStatus: item.validationStatus,
    source: item.source,
    checkedOn: item.checkedOn,
    sectionId: item.sectionId,
    reviewTaskId: item.reviewTaskId,
  };
}

export function getOnboardingReviewPanelItems(
  sellerId: string,
  sectionId: "profile" | "documentation",
  options?: { docTab?: "general" | "brands"; taskId?: string },
): { tasks: OnboardingPanelItem[]; insights: OnboardingPanelItem[] } {
  const all = getReviewableEvaluations(sellerId);

  if (sectionId === "profile") {
    const profileItems = all.filter((e) => e.sectionId === "profile");
    const invalid = profileItems.filter(
      (e) => e.validationStatus === "invalid" || e.validationStatus === "partial",
    );
    const activeTaskId =
      options?.taskId ??
      invalid[0]?.taskId ??
      profileItems.find((e) => e.reviewable)?.taskId;

    const recommendedEval = profileItems.find((e) => e.taskId === activeTaskId) ?? invalid[0];
    const tasks = recommendedEval
      ? getOnboardingTasksForPanel(sellerId)
          .filter((t) => t.reviewTaskId === recommendedEval.taskId)
          .map(mapTaskItem)
      : getOnboardingTasksForPanel(sellerId)
          .filter((t) => t.sectionId === "profile")
          .slice(0, 1)
          .map(mapTaskItem);

    const fieldInsights = activeTaskId
      ? getFieldInsightsForPanel(sellerId, activeTaskId).map(mapInsightItem)
      : [];

    const otherValid = getOnboardingInsightsForPanel(sellerId)
      .filter((t) => t.sectionId === "profile")
      .map(mapInsightItem);

    return {
      tasks,
      insights: [...fieldInsights, ...otherValid],
    };
  }

  const docTab = options?.docTab ?? "general";
  const prefix = docTab === "brands" ? "brand-" : "doc-";
  const docItems = all.filter(
    (e) => e.sectionId === "documentation" && e.taskId.startsWith(prefix),
  );
  const invalid = docItems.filter(
    (e) => e.validationStatus === "invalid" || e.validationStatus === "partial",
  );
  const valid = docItems.filter((e) => e.validationStatus === "valid");

  const tasks = (invalid.length > 0 ? invalid : docItems.slice(0, 1))
    .map((e) =>
      mapTaskItem({
        id: `onb-task-${e.taskId}`,
        title: e.title,
        description: `${e.summary} Source: ${e.source}. Checked on ${e.checkedOn}.`,
        actionLabel: e.validationStatus === "invalid" ? "Add Comment →" : "Review →",
        actionType: "open_onboarding_comment" as const,
        validationStatus: e.validationStatus,
        source: e.source,
        checkedOn: e.checkedOn,
        sectionId: e.sectionId,
        reviewTaskId: e.taskId,
      }),
    )
    .slice(0, 1);

  const insights = valid.map((e) =>
    mapInsightItem({
      id: `onb-insight-${e.taskId}`,
      title: e.title,
      description: e.summary,
      actionLabel: "Approve",
      actionType: "approve_onboarding" as const,
      validationStatus: e.validationStatus as "valid",
      source: e.source,
      checkedOn: e.checkedOn,
      sectionId: e.sectionId,
      reviewTaskId: e.taskId,
    }),
  );

  return { tasks, insights };
}
