import { getOnboardingPartners } from "@/lib/mock-data/pipeline-partners";
import {
  getPotentialPartnerById,
  getPotentialPartnerBySellerId,
} from "@/lib/mock-data/potential-partners";
import type { OnboardingPartner, OnboardingTask } from "./types";
import {
  applyTaskPatches,
  buildFreshOnboarding,
  buildNewlyApprovedOnboarding,
  generateOnboardingFromSeed,
} from "./generator";
import { buildSellerOnboardingState } from "./progress";
import type { SellerOnboardingState } from "./types";

export {
  computeOnboardingOverallProgress,
  countOnboardingSubtaskProgress,
  countOnboardingSectionProgress,
  getOnboardingSectionProgressPercent,
  getSectionProgressPercent,
  countSectionCompletedSteps,
  isOnboardingSectionLocked,
  deriveSectionStatus,
  taskNeedsReview,
} from "./progress";
export { generateTaskRecommendation, attachRecommendationsToTasks } from "./recommendations";
export { hashPartnerId, seededRandom, seededInt } from "./seed";
export {
  ONBOARDING_SUBTASK_DEFINITIONS,
  generateOnboardingFromSeed,
  applyTaskPatches,
} from "./generator";
export { LOCKED_ONBOARDING_SECTION_IDS } from "./types";
export type {
  OnboardingTask,
  OnboardingSection,
  OnboardingPartner,
  SellerOnboardingState,
  OnboardingSectionState,
  OnboardingSubtaskState,
  AiSuggestedCta,
  AiSuggestedAction,
} from "./types";

const stateCache = new Map<string, SellerOnboardingState>();
const newlyApprovedPartnerIds = new Set<string>();

/** Mark partner as freshly approved — onboarding resets to assortment-only review. */
export function markPartnerNewlyApproved(partnerId: string): void {
  newlyApprovedPartnerIds.add(partnerId);
  stateCache.delete(partnerId);
}

export function isPartnerNewlyApproved(partnerId: string): boolean {
  return newlyApprovedPartnerIds.has(partnerId);
}

/** Curated demo profiles — override seeded generation for key review flows. */
const CURATED_PATCHES: Record<
  string,
  { patches: Record<string, Partial<OnboardingTask>>; meta?: Partial<Pick<OnboardingPartner, "startedAt" | "targetLaunchDate">> }
> = {
  "p-l-c2": { patches: { "08": { status: "in_progress", autoValidated: false } }, meta: { startedAt: "2026-07-01", targetLaunchDate: "2026-09-01" } },
  "p-f-c1": { patches: { "08": { status: "in_progress", autoValidated: false } }, meta: { startedAt: "2026-07-01", targetLaunchDate: "2026-09-01" } },
  "p-k-c2": { patches: { "08": { status: "in_progress", autoValidated: false } }, meta: { startedAt: "2026-07-01", targetLaunchDate: "2026-09-01" } },
  "p-k-o2": {
    patches: {
      "01": { status: "in_progress", issue: "Invalid Banner/Cover Image", issueSource: "Image quality analysis: low resolution, does not meet guidelines", autoValidated: true },
      "02": { status: "complete", autoValidated: true },
      "03": { status: "complete", autoValidated: true },
      "04": { status: "complete", autoValidated: false },
      "05": { status: "complete", autoValidated: false },
      "06": { status: "complete", autoValidated: false },
      "07": { status: "complete", autoValidated: true },
      "08": { status: "in_progress", autoValidated: false },
      "09": { status: "in_progress", autoValidated: true },
      "10": { status: "in_progress", autoValidated: false },
      "11": { status: "complete", autoValidated: false },
    },
    meta: { startedAt: "2026-04-01", targetLaunchDate: "2026-07-01" },
  },
  "p-f-o2": {
    patches: {
      "01": { status: "complete", autoValidated: true },
      "02": { status: "complete", autoValidated: true },
      "03": { status: "complete", autoValidated: true },
      "04": { status: "complete", autoValidated: false },
      "05": { status: "complete", autoValidated: false },
      "06": { status: "complete", autoValidated: false },
      "07": { status: "complete", autoValidated: true },
      "09": { status: "in_progress", autoValidated: true },
      "10": { status: "in_progress", autoValidated: false },
      "11": { status: "complete", autoValidated: false },
    },
    meta: { startedAt: "2026-05-15", targetLaunchDate: "2026-08-15" },
  },
  "p-l-o3": {
    patches: {
      "01": { status: "in_progress", issue: "Invalid Banner/Cover Image", issueSource: "Image quality analysis: low resolution", autoValidated: true },
      "02": { status: "complete", autoValidated: true },
      "03": { status: "complete", autoValidated: true },
      "04": { status: "complete", autoValidated: false },
    },
    meta: { startedAt: "2026-06-01", targetLaunchDate: "2026-09-01" },
  },
};

function completeProfileDocIntegrationPatches(): Record<string, Partial<OnboardingTask>> {
  return {
    "01": { status: "complete", autoValidated: true },
    "02": { status: "complete", autoValidated: true },
    "03": { status: "complete", autoValidated: true },
    "04": { status: "complete", autoValidated: false },
    "05": { status: "complete", autoValidated: false },
    "06": { status: "complete", autoValidated: false },
    "07": { status: "complete", autoValidated: true },
    "09": { status: "in_progress", autoValidated: true },
    "10": { status: "in_progress", autoValidated: false },
    "11": { status: "complete", autoValidated: false },
  };
}

for (const id of ["p-l-o6", "p-k-o4", "p-f-o6"]) {
  CURATED_PATCHES[id] = {
    patches: completeProfileDocIntegrationPatches(),
    meta: id === "p-l-o6" ? { startedAt: "2026-03-10", targetLaunchDate: "2026-06-15" }
      : id === "p-k-o4" ? { startedAt: "2026-02-20", targetLaunchDate: "2026-06-01" }
      : { startedAt: "2026-01-15", targetLaunchDate: "2026-05-30" },
  };
}

function resolvePartnerName(partnerId: string): string {
  const fromPotential = getPotentialPartnerById(partnerId) ?? getPotentialPartnerBySellerId(partnerId);
  return fromPotential?.legalBusinessName ?? "Partner";
}

function resolveOnboardingPartner(partnerId: string, partnerName: string): OnboardingPartner {
  if (newlyApprovedPartnerIds.has(partnerId)) {
    return buildNewlyApprovedOnboarding(partnerId, partnerName);
  }
  const curated = CURATED_PATCHES[partnerId];
  if (curated) {
    const base = buildFreshOnboarding(partnerId, partnerName);
    return applyTaskPatches(base, curated.patches, curated.meta);
  }
  return generateOnboardingFromSeed(partnerId, partnerName);
}

/** Primary API — returns full seller onboarding state (cached per partner). */
export function getSellerOnboardingState(
  partnerId: string,
  partnerName?: string,
): SellerOnboardingState {
  const cached = stateCache.get(partnerId);
  if (cached) return cached;

  const name = partnerName ?? resolvePartnerName(partnerId);
  const partner = resolveOnboardingPartner(partnerId, name);
  const state = buildSellerOnboardingState(partnerId, name, partner.sections, {
    assignedTo: partner.assignedTo,
    startedAt: partner.startedAt,
    targetLaunchDate: partner.targetLaunchDate,
  });

  stateCache.set(partnerId, state);
  return state;
}

/** Backward-compatible shape used by existing UI components. */
export function getOnboardingPartnerRecord(partnerId: string, partnerName?: string): OnboardingPartner {
  const state = getSellerOnboardingState(partnerId, partnerName);
  return {
    sellerId: state.partnerId,
    sellerName: state.sellerName,
    assignedTo: state.assignedTo,
    overallProgress: state.overallProgress,
    startedAt: state.startedAt,
    targetLaunchDate: state.targetLaunchDate,
    sections: state.sections.map((s) => ({
      id: s.id,
      title: s.title,
      totalSteps: s.totalSteps,
      completedSteps: s.completedSteps,
      tasks: s.tasks.map((t) => ({
        id: t.id,
        sellerId: t.sellerId,
        section: t.section,
        title: t.title,
        status: t.status,
        autoValidated: t.autoValidated,
        issue: t.issue,
        issueSource: t.issueSource,
        agentRecommendation: t.agentRecommendation,
        suggestedCta: t.suggestedCta,
      })),
    })),
  };
}

export function getOnboardingForPartner(partner: {
  id: string;
  sellerId: string;
  legalBusinessName: string;
}): OnboardingPartner {
  return getOnboardingPartnerRecord(partner.sellerId, partner.legalBusinessName);
}

export function getOnboardingBySellerID(sellerId: string): OnboardingPartner {
  return getOnboardingPartnerRecord(sellerId, resolvePartnerName(sellerId));
}

export function getAllOnboardingProfiles(): OnboardingPartner[] {
  return getOnboardingPartners().map((p) => getOnboardingPartnerRecord(p.id, p.name));
}

export function getBlockedOnboardingTasks(): OnboardingTask[] {
  return getAllOnboardingProfiles()
    .flatMap((p) => p.sections.flatMap((s) => s.tasks))
    .filter((t) => t.status === "blocked" || t.issue);
}

/** Clear cache — useful if mock seed data changes in tests. */
export function clearOnboardingStateCache(): void {
  stateCache.clear();
  newlyApprovedPartnerIds.clear();
}
