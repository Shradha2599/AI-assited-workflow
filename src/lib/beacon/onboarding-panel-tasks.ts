import type { RecommendedTask } from "@/components/ai/tasks-panel";
import {
  documentationSubtaskApproveId,
  isDocumentationTaskSubmitted,
} from "@/features/partner-onboarding/utils/documentation-task-progress";
import {
  isProfileTaskSubmitted,
  profileTaskApproveId,
} from "@/features/partner-onboarding/utils/profile-task-progress-core";
import {
  buildAssortmentRecommendationImpact,
  getAssortmentCurationContent,
} from "@/lib/mock-data/assortment-curation-content";
import { getOnboardingBySellerID } from "@/lib/mock-data/onboarding";
import {
  getDocumentationEvaluation,
  getProfileTaskEvaluations,
  type BrandDocumentRow,
  type DocumentUpload,
  type OnboardingTaskEvaluation,
} from "@/lib/mock-data/onboarding-evaluation";
import type { PotentialPartner } from "@/lib/mock-data/potential-partners";

/** Live review state mirrored from the onboarding review store. */
export interface OnboardingPanelState {
  approvedIds: string[];
  appliedFieldValues: Record<string, string>;
  /** Approve ids of documents where a valid re-upload was already requested. */
  documentRejectionIds?: string[];
}

export interface OnboardingPanel {
  tasks: RecommendedTask[];
  insights: RecommendedTask[];
}

const EMPTY_PANEL: OnboardingPanel = { tasks: [], insights: [] };

type DocSubtask = "general" | "brands";

interface DocTarget {
  approveId: string;
  label: string;
  validationStatus: string;
  reason: string;
  suggestedComment: string;
}

function isApproved(state: OnboardingPanelState, id: string): boolean {
  return state.approvedIds.includes(id);
}

// ─── Profile information ─────────────────────────────────────────────────────
// Only the first sub-task (Brand profile) is TM-reviewed. The panel mirrors the
// in-page AI banner: AI recommendation flow when a field fails validation,
// approve when everything looks good, and no card once it is approved.

function profileFieldInsights(
  evaluation: OnboardingTaskEvaluation,
  approved: boolean,
  descriptionApplied: boolean,
): RecommendedTask[] {
  return evaluation.fields
    .filter((field) => approved || field.status === "valid" || (descriptionApplied && field.id === "description"))
    .map((field) => ({
      id: `field-${field.id}`,
      title: field.label,
      description:
        descriptionApplied && field.id === "description"
          ? "Updated copy shared with partner via AI recommendation"
          : field.detail,
      actionLabel: "Approve",
      actionType: "approve_onboarding" as const,
      validationStatus: "valid" as const,
      source: field.source,
      checkedOn: field.checkedOn,
      sectionId: "profile",
      reviewTaskId: `${field.id}-${evaluation.taskId}`,
    }));
}

export function buildProfilePanel(
  partner: PotentialPartner,
  state: OnboardingPanelState,
  taskId?: string,
): OnboardingPanel {
  const onboarding = getOnboardingBySellerID(partner.sellerId);
  const profileSection = onboarding.sections.find((s) => s.id === "profile");
  const evaluations = getProfileTaskEvaluations(partner.sellerId);
  if (!profileSection || evaluations.length === 0) return EMPTY_PANEL;

  // Only the first profile sub-task is reviewed by the TM.
  const reviewTask = profileSection.tasks[0];
  const evaluation =
    (taskId ? evaluations.find((e) => e.taskId === taskId) : undefined) ??
    evaluations.find((e) => e.taskId === reviewTask?.id) ??
    evaluations[0];
  if (!evaluation) return EMPTY_PANEL;

  const approveId = profileTaskApproveId(evaluation.taskId);
  const approved = isApproved(state, approveId);
  const descriptionApplied = Boolean(state.appliedFieldValues[`${evaluation.taskId}:description`]);
  const insights = profileFieldInsights(evaluation, approved, descriptionApplied);

  // Approved → the recommended task disappears, validation insights stay.
  if (approved) return { tasks: [], insights };

  const submitted = reviewTask ? isProfileTaskSubmitted(reviewTask) : true;
  if (!submitted) return { tasks: [], insights };

  const aiSuggestions = evaluation.aiFieldSuggestions ?? [];
  const hasUnresolvedIssue =
    evaluation.validationStatus !== "valid" && aiSuggestions.length > 0 && !descriptionApplied;

  if (hasUnresolvedIssue) {
    return {
      tasks: [
        {
          id: `onb-task-${evaluation.taskId}`,
          title: "Brand description does not meet criteria",
          description:
            "AI flagged the brand description in Brand details. Every other field in this sub-task passed validation — review the suggested copy before the partner can proceed.",
          actionLabel: "Review AI suggestion →",
          actionType: "open_onboarding_recommendation",
          validationStatus: evaluation.validationStatus,
          source: evaluation.source,
          checkedOn: evaluation.checkedOn,
          sectionId: "profile",
          reviewTaskId: evaluation.taskId,
          partnerId: partner.id,
        },
      ],
      insights,
    };
  }

  return {
    tasks: [
      {
        id: `onb-task-${evaluation.taskId}-approve`,
        title: "Brand profile ready to approve",
        description: descriptionApplied
          ? "The AI brand description was shared with the partner and every other field meets Target Plus criteria. Approve this sub-task to continue."
          : "Brand display name, description, website, sourcing, and assets meet Target Plus criteria. Approve this sub-task to continue.",
        actionLabel: "Approve sub-task →",
        actionType: "approve_onboarding",
        validationStatus: "valid",
        source: evaluation.source,
        checkedOn: evaluation.checkedOn,
        sectionId: "profile",
        reviewTaskId: approveId,
        alertId: evaluation.taskId,
        approveToastMessage: "Brand profile sub-task marked as approved.",
        partnerId: partner.id,
      },
    ],
    insights,
  };
}

// ─── Documentation ───────────────────────────────────────────────────────────
// Documents are AI-validated first. Validated uploads surface an approve card;
// uploads AI could not validate surface the request-a-valid-document flow —
// the same sequence the in-page review carousel uses.

function docToTarget(doc: DocumentUpload): DocTarget {
  return {
    approveId: `doc-${doc.id}`,
    label: doc.label,
    validationStatus: doc.validationStatus,
    reason: doc.agentRecommendation?.message ?? doc.summary,
    suggestedComment:
      doc.agentRecommendation?.suggestedComment ??
      `Please upload an updated ${doc.label.toLowerCase()} that meets Target requirements.`,
  };
}

function brandToTarget(brand: BrandDocumentRow): DocTarget {
  return {
    approveId: `brand-${brand.id}`,
    label: brand.name,
    validationStatus: brand.validationStatus,
    reason: brand.agentRecommendation?.message ?? brand.summary,
    suggestedComment:
      brand.agentRecommendation?.suggestedComment ??
      `Please provide an updated authorization document for ${brand.name}.`,
  };
}

/** Mirrors docsForActiveTab in documentation-review. */
function targetsForSubtask(
  docs: NonNullable<ReturnType<typeof getDocumentationEvaluation>>,
  subtask: DocSubtask,
): DocTarget[] {
  const usesW9ContractFlow = docs.general.some((d) => d.id === "w9" || d.id === "contract");
  if (usesW9ContractFlow) {
    const key = subtask === "general" ? "w9" : "contract";
    return docs.general.filter((d) => d.id === key).map(docToTarget);
  }
  if (subtask === "general") return docs.general.map(docToTarget);
  return docs.brands.map(brandToTarget);
}

function documentationSubtaskCards(
  partner: PotentialPartner,
  state: OnboardingPanelState,
  subtask: DocSubtask,
  targets: DocTarget[],
): RecommendedTask[] {
  if (targets.length === 0) return [];
  if (isApproved(state, documentationSubtaskApproveId(partner.id, subtask))) return [];

  const requested = new Set(state.documentRejectionIds ?? []);
  const pending = targets.filter((t) => !isApproved(state, t.approveId) && !requested.has(t.approveId));
  if (pending.length === 0) return [];

  const validated = pending.filter((t) => t.validationStatus === "valid");
  const unvalidated = pending.filter((t) => t.validationStatus !== "valid");
  const subtaskLabel = subtask === "general" ? "General documents" : "Brand documents";
  const cards: RecommendedTask[] = [];

  if (validated.length > 0) {
    const single = validated.length === 1;
    cards.push({
      id: `onb-doc-approve-${subtask}-${partner.id}`,
      title: single
        ? `${validated[0]!.label} is validated`
        : `${validated.length} documents validated in ${subtaskLabel.toLowerCase()}`,
      description: single
        ? `AI validated ${validated[0]!.label} against Target requirements. Approve this document to move the sub-task forward.`
        : `AI validated ${validated.length} uploads in ${subtaskLabel.toLowerCase()}. Approve them to move the sub-task forward.`,
      actionLabel: single ? "Approve document →" : "Approve documents →",
      actionType: "approve_documents",
      approveIds: validated.map((t) => t.approveId),
      docSubtask: subtask,
      validationStatus: "valid",
      sectionId: "documentation",
      partnerId: partner.id,
      approveToastMessage: `All validated documents in ${subtaskLabel.toLowerCase()} were approved.`,
    });
  }

  for (const target of unvalidated) {
    cards.push({
      id: `onb-doc-reject-${target.approveId}`,
      title: `${target.label} does not meet requirements`,
      description: `${target.reason} Request a corrected document from the partner.`,
      actionLabel: "Request valid document →",
      actionType: "request_valid_document",
      approveIds: [target.approveId],
      documentLabel: target.label,
      rejectionReason: target.reason,
      suggestedComment: target.suggestedComment,
      validationStatus: target.validationStatus as RecommendedTask["validationStatus"],
      sectionId: "documentation",
      partnerId: partner.id,
    });
  }

  return cards;
}

/** All document approve ids belonging to a documentation sub-task. */
export function documentationSubtaskApproveIds(
  sellerId: string,
  subtask: DocSubtask,
): string[] {
  const docs = getDocumentationEvaluation(sellerId);
  if (!docs) return [];
  return targetsForSubtask(docs, subtask).map((t) => t.approveId);
}

export function buildDocumentationPanel(
  partner: PotentialPartner,
  state: OnboardingPanelState,
  subtask?: DocSubtask,
): OnboardingPanel {
  const docs = getDocumentationEvaluation(partner.sellerId);
  if (!docs) return EMPTY_PANEL;

  const onboarding = getOnboardingBySellerID(partner.sellerId);
  const docSection = onboarding.sections.find((s) => s.id === "documentation");
  const submittedFor = (tab: DocSubtask): boolean => {
    const task = tab === "general" ? docSection?.tasks[0] : docSection?.tasks[1];
    return task ? isDocumentationTaskSubmitted(task) : false;
  };

  const subtasks: DocSubtask[] = subtask ? [subtask] : ["general", "brands"];
  const tasks = subtasks
    .filter(submittedFor)
    .flatMap((tab) => documentationSubtaskCards(partner, state, tab, targetsForSubtask(docs, tab)));

  const insights = subtasks
    .flatMap((tab) => targetsForSubtask(docs, tab))
    .filter((t) => t.validationStatus === "valid")
    .map((t) => ({
      id: `onb-doc-insight-${t.approveId}`,
      title: t.label,
      description: t.reason,
      actionLabel: "Approve",
      actionType: "approve_onboarding" as const,
      validationStatus: "valid" as const,
      sectionId: "documentation",
      reviewTaskId: t.approveId,
      partnerId: partner.id,
    }));

  return { tasks, insights };
}

// ─── Assortment curation ─────────────────────────────────────────────────────
// One card for the SKUs AI wants added (revenue impact) and one for the SKUs
// AI wants removed (they miss Target criteria).

export function buildAssortmentPanel(
  partner: PotentialPartner,
  state: OnboardingPanelState,
): OnboardingPanel {
  if (isApproved(state, `assortment-${partner.id}`)) return EMPTY_PANEL;

  const content = getAssortmentCurationContent(partner.id);
  const impact = buildAssortmentRecommendationImpact(content);
  const href = `/sellers/onboarding/${partner.id}/review/assortment?tab=recommended`;
  const tasks: RecommendedTask[] = [];

  if (impact.addCount > 0) {
    tasks.push({
      id: `onb-assortment-add-${partner.id}`,
      title: `AI recommends adding ${impact.addCount} SKUs`,
      description: `High-demand marketplace matches worth an estimated ${impact.estimatedRevenue} in incremental annual revenue, growing this assortment by ${impact.growthPercent}%.`,
      actionLabel: "Review SKUs to add →",
      actionHref: href,
      validationStatus: "valid",
      sectionId: "assortment",
      partnerId: partner.id,
    });
  }

  if (impact.removeCount > 0) {
    tasks.push({
      id: `onb-assortment-remove-${partner.id}`,
      title: `AI recommends removing ${impact.removeCount} SKUs`,
      description:
        "These SKUs do not meet Target criteria on barcode validity, WERCS compliance, and category fit.",
      actionLabel: "Review SKUs to remove →",
      actionHref: href,
      validationStatus: "invalid",
      sectionId: "assortment",
      partnerId: partner.id,
    });
  }

  return { tasks, insights: [] };
}

// ─── Partner checklist page ──────────────────────────────────────────────────

/** Every onboarding sub-task currently waiting on the TM, in checklist order. */
export function buildOnboardingPartnerPanel(
  partner: PotentialPartner,
  state: OnboardingPanelState,
): OnboardingPanel {
  const profile = buildProfilePanel(partner, state);
  const documentation = buildDocumentationPanel(partner, state);
  const assortment = buildAssortmentPanel(partner, state);

  return {
    tasks: [...profile.tasks, ...documentation.tasks, ...assortment.tasks].slice(0, 6),
    insights: [...profile.insights, ...documentation.insights],
  };
}
