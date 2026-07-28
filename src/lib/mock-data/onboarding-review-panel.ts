import {
  getProfileTaskEvaluations,
  getReviewableEvaluations,
  type OnboardingTaskEvaluation,
} from "@/lib/mock-data/onboarding-evaluation";

export interface OnboardingPanelItem {
  id: string;
  title: string;
  description: string;
  actionLabel: string;
  actionType:
    | "open_onboarding_comment"
    | "approve_onboarding"
    | "open_onboarding_recommendation";
  validationStatus?: "valid" | "invalid" | "partial" | "unverified";
  source?: string;
  checkedOn?: string;
  sectionId?: string;
  reviewTaskId?: string;
}

export interface OnboardingReviewPanelState {
  approvedIds: string[];
  appliedFieldValues: Record<string, string>;
}

function profileTaskApproveId(taskId: string): string {
  return `profile-${taskId}`;
}

function mapTaskItem(item: {
  id: string;
  title: string;
  description: string;
  actionLabel: string;
  actionType: OnboardingPanelItem["actionType"];
  validationStatus?: OnboardingPanelItem["validationStatus"];
  source?: string;
  checkedOn?: string;
  sectionId?: string;
  reviewTaskId?: string;
}): OnboardingPanelItem {
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

function mapInsightItem(item: {
  id: string;
  title: string;
  description: string;
  actionLabel: string;
  actionType: OnboardingPanelItem["actionType"];
  validationStatus?: OnboardingPanelItem["validationStatus"];
  source?: string;
  checkedOn?: string;
  sectionId?: string;
  reviewTaskId?: string;
}): OnboardingPanelItem {
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

function isAiRecommendationApplied(
  taskId: string,
  evaluation: OnboardingTaskEvaluation,
  state?: OnboardingReviewPanelState,
): boolean {
  if (!state) return false;
  const suggestions = evaluation.aiFieldSuggestions ?? [];
  if (suggestions.length === 0) return false;
  return suggestions.every(
    (field) => Boolean(state.appliedFieldValues[`${taskId}:${field.fieldId}`]),
  );
}

function isProfileTaskApproved(taskId: string, state?: OnboardingReviewPanelState): boolean {
  return Boolean(state?.approvedIds.includes(profileTaskApproveId(taskId)));
}

function effectiveProfileEvaluation(
  evaluation: OnboardingTaskEvaluation,
  state?: OnboardingReviewPanelState,
): OnboardingTaskEvaluation {
  if (isProfileTaskApproved(evaluation.taskId, state)) {
    return {
      ...evaluation,
      validationStatus: "valid",
      summary: "Brand profile approved by Target Plus.",
      fields: evaluation.fields.map((field) => ({ ...field, status: "valid" as const })),
    };
  }

  if (isAiRecommendationApplied(evaluation.taskId, evaluation, state)) {
    return {
      ...evaluation,
      validationStatus: "partial",
      summary:
        "AI recommendation was shared with the partner. Approve this sub-task when the updated copy looks good.",
      fields: evaluation.fields.map((field) =>
        field.id === "description"
          ? {
              ...field,
              status: "valid" as const,
              detail: "Updated copy shared with partner via AI recommendation",
            }
          : field,
      ),
    };
  }

  return evaluation;
}

function buildProfileRecommendedTask(
  evaluation: OnboardingTaskEvaluation,
  state?: OnboardingReviewPanelState,
): OnboardingPanelItem | null {
  const taskId = evaluation.taskId;
  const approveId = profileTaskApproveId(taskId);

  if (isProfileTaskApproved(taskId, state)) {
    return null;
  }

  if (isAiRecommendationApplied(taskId, evaluation, state)) {
    return {
      id: `onb-task-${taskId}-approve`,
      title: evaluation.title,
      description: `${evaluation.summary} Source: ${evaluation.source}. Checked on ${evaluation.checkedOn}.`,
      actionLabel: "Approve sub-task →",
      actionType: "approve_onboarding",
      validationStatus: "partial",
      source: evaluation.source,
      checkedOn: evaluation.checkedOn,
      sectionId: "profile",
      reviewTaskId: approveId,
    };
  }

  if (evaluation.validationStatus === "invalid" || evaluation.validationStatus === "partial") {
    const hasAi = (evaluation.aiFieldSuggestions?.length ?? 0) > 0;
    return {
      id: `onb-task-${taskId}`,
      title: evaluation.title,
      description: `${evaluation.summary} Source: ${evaluation.source}. Checked on ${evaluation.checkedOn}.`,
      actionLabel: hasAi ? "Review AI suggestion →" : "Add Comment →",
      actionType: hasAi ? "open_onboarding_recommendation" : "open_onboarding_comment",
      validationStatus: evaluation.validationStatus,
      source: evaluation.source,
      checkedOn: evaluation.checkedOn,
      sectionId: "profile",
      reviewTaskId: hasAi ? taskId : taskId,
    };
  }

  return null;
}

function fieldInsightsForEvaluation(evaluation: OnboardingTaskEvaluation) {
  return evaluation.fields
    .filter((field) => field.status === "valid")
    .map((f) => ({
      id: `field-${f.id}`,
      title: f.label,
      description: f.detail,
      actionLabel: "Approve",
      actionType: "approve_onboarding" as const,
      validationStatus: f.status as "valid",
      source: f.source,
      checkedOn: f.checkedOn,
      sectionId: "profile",
      reviewTaskId: `${f.id}-${evaluation.taskId}`,
    }));
}

export function getOnboardingReviewPanelItems(
  sellerId: string,
  sectionId: "profile" | "documentation",
  options?: { docTab?: "general" | "brands"; taskId?: string },
  reviewState?: OnboardingReviewPanelState,
): { tasks: OnboardingPanelItem[]; insights: OnboardingPanelItem[] } {
  const all = getReviewableEvaluations(sellerId);

  if (sectionId === "profile") {
    const profileItems = all.filter((e) => e.sectionId === "profile");
    const activeTaskId =
      options?.taskId ??
      profileItems.find((e) => e.validationStatus === "invalid" || e.validationStatus === "partial")
        ?.taskId ??
      profileItems.find((e) => e.reviewable)?.taskId;

    const activeEvalRaw =
      profileItems.find((e) => e.taskId === activeTaskId) ??
      getProfileTaskEvaluations(sellerId).find((e) => e.taskId === activeTaskId);

    if (!activeEvalRaw) {
      return { tasks: [], insights: [] };
    }

    const activeEval = effectiveProfileEvaluation(activeEvalRaw, reviewState);
    const recommended = buildProfileRecommendedTask(activeEvalRaw, reviewState);

    const tasks = recommended ? [recommended] : [];

    const insights = fieldInsightsForEvaluation(activeEval);

    return { tasks, insights };
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
