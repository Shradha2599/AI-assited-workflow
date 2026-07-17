import type { AgentRecommendation } from "@/lib/mock-data/onboarding-evaluation";

export interface OnboardingTask {
  id: string;
  sellerId: string;
  section: string;
  title: string;
  status: "complete" | "in_progress" | "pending" | "blocked";
  issue?: string;
  issueSource?: string;
  autoValidated: boolean;
  agentRecommendation?: AgentRecommendation;
  suggestedCta?: AiSuggestedCta;
}

export interface OnboardingSection {
  id: string;
  title: string;
  totalSteps: number;
  completedSteps: number;
  tasks: OnboardingTask[];
}

export interface OnboardingPartner {
  sellerId: string;
  sellerName: string;
  assignedTo: string;
  overallProgress: number;
  sections: OnboardingSection[];
  startedAt: string;
  targetLaunchDate: string;
}

export const LOCKED_ONBOARDING_SECTION_IDS = new Set(["item-listing", "stripe"]);

/** The six explicit onboarding sections in pipeline order. */
export const ONBOARDING_SECTION_IDS = [
  "profile",
  "assortment",
  "documentation",
  "integrations",
  "item-listing",
  "stripe",
] as const;

export type OnboardingSectionId = (typeof ONBOARDING_SECTION_IDS)[number];

export type OnboardingTaskStatus = "pending" | "in_progress" | "complete" | "blocked";

/** Section-level lifecycle — `under_review` is used for assortment after form submission. */
export type OnboardingSectionStatus =
  | "locked"
  | "pending"
  | "in_progress"
  | "under_review"
  | "complete";

export type AiSuggestedAction =
  | "review"
  | "approve"
  | "request_edits"
  | "open_details"
  | "mark_complete";

export interface AiSuggestedCta {
  label: string;
  action: AiSuggestedAction;
  /** Route or anchor the CTA should navigate to. */
  target?: string;
}

export interface OnboardingSubtaskDefinition {
  suffix: string;
  sectionId: OnboardingSectionId;
  title: string;
  /** Subtask 1 (Brand profile) and documentation tasks require TM review. */
  manualReview: boolean;
  autoValidated: boolean;
}

export interface OnboardingSubtaskState {
  id: string;
  suffix: string;
  sellerId: string;
  section: OnboardingSectionId;
  title: string;
  status: OnboardingTaskStatus;
  manualReview: boolean;
  autoValidated: boolean;
  issue?: string;
  issueSource?: string;
  agentRecommendation?: AgentRecommendation;
  suggestedCta?: AiSuggestedCta;
}

export interface OnboardingSectionState {
  id: OnboardingSectionId;
  title: string;
  status: OnboardingSectionStatus;
  manualReview: boolean;
  totalSteps: number;
  completedSteps: number;
  progressPercent: number;
  tasks: OnboardingSubtaskState[];
}

/** Single source of truth for a seller's onboarding checklist. */
export interface SellerOnboardingState {
  partnerId: string;
  sellerName: string;
  assignedTo: string;
  overallProgress: number;
  sections: OnboardingSectionState[];
  startedAt: string;
  targetLaunchDate: string;
}
