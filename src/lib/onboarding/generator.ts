import type { OnboardingPartner, OnboardingSection, OnboardingTask } from "./types";
import type { OnboardingSectionId } from "./types";
import type { OnboardingSubtaskDefinition } from "./types";
import { hashPartnerId, seededInt, seededRandom } from "./seed";
import { buildSellerOnboardingState, syncSectionCompletedSteps } from "./progress";
import { generateTaskRecommendation } from "./recommendations";

/** Canonical subtask definitions — 14 tasks across 6 sections. */
export const ONBOARDING_SUBTASK_DEFINITIONS: OnboardingSubtaskDefinition[] = [
  { suffix: "01", sectionId: "profile", title: "Brand profile", manualReview: true, autoValidated: true },
  { suffix: "02", sectionId: "profile", title: "Guest services and reverse logistics", manualReview: false, autoValidated: true },
  { suffix: "03", sectionId: "profile", title: "Business identity and address", manualReview: false, autoValidated: true },
  { suffix: "04", sectionId: "profile", title: "Marketplace users", manualReview: false, autoValidated: false },
  { suffix: "05", sectionId: "profile", title: "Fulfilment details", manualReview: false, autoValidated: false },
  { suffix: "06", sectionId: "profile", title: "Returns policy", manualReview: false, autoValidated: false },
  { suffix: "07", sectionId: "profile", title: "Privacy policy", manualReview: false, autoValidated: true },
  { suffix: "08", sectionId: "assortment", title: "Upload assortment file (SKUs)", manualReview: true, autoValidated: false },
  { suffix: "09", sectionId: "documentation", title: "W9 form uploaded", manualReview: true, autoValidated: true },
  { suffix: "10", sectionId: "documentation", title: "Contract signed", manualReview: true, autoValidated: false },
  { suffix: "11", sectionId: "integrations", title: "Channel partner integration", manualReview: false, autoValidated: false },
  { suffix: "12", sectionId: "item-listing", title: "Item data setup and mapping", manualReview: false, autoValidated: false },
  { suffix: "13", sectionId: "stripe", title: "Stripe account creation", manualReview: false, autoValidated: false },
  { suffix: "14", sectionId: "stripe", title: "Bank deposit verified", manualReview: false, autoValidated: false },
];

const SECTION_TITLES: Record<string, string> = {
  profile: "Profile Information",
  assortment: "Assortment curation",
  documentation: "Documentation",
  integrations: "Integrations",
  "item-listing": "Item listing",
  stripe: "Stripe setup",
};

const SECTION_STEP_COUNTS: Record<string, number> = {
  profile: 7,
  assortment: 1,
  documentation: 2,
  integrations: 1,
  "item-listing": 1,
  stripe: 2,
};

/** Discrete progress tiers — weighted toward mid-progress for realistic spread. */
type ProgressTier =
  | 0 // not started
  | 1 // early profile
  | 2 // mid profile
  | 3 // profile nearly done, brand in review
  | 4 // profile complete
  | 5 // assortment under review
  | 6 // documentation started
  | 7 // documentation partial
  | 8 // documentation complete
  | 9; // integration complete

function tierFromSeed(seed: number): ProgressTier {
  const r = seededRandom(seed, 0);
  if (r < 0.08) return 0;
  if (r < 0.18) return 1;
  if (r < 0.32) return 2;
  if (r < 0.45) return 3;
  if (r < 0.55) return 4;
  if (r < 0.68) return 5;
  if (r < 0.78) return 6;
  if (r < 0.88) return 7;
  if (r < 0.95) return 8;
  return 9;
}

function sellerFilledCountForTier(tier: ProgressTier, seed: number): number {
  switch (tier) {
    case 0:
      return 0;
    case 1:
      return seededInt(seed, 10, 1, 2);
    case 2:
      return seededInt(seed, 11, 3, 5);
    case 3:
      return 6;
    default:
      return 6;
  }
}

function taskStatusForTier(
  suffix: string,
  tier: ProgressTier,
  seed: number,
): OnboardingTask["status"] {
  const sellerFilled = sellerFilledCountForTier(tier, seed);
  const sellerTaskSuffixes = ["02", "03", "04", "05", "06", "07"];

  if (suffix === "01") {
    if (tier === 0) return "pending";
    if (tier <= 3) {
      return seededRandom(seed, 20) > 0.35 ? "in_progress" : "pending";
    }
    return "complete";
  }

  if (sellerTaskSuffixes.includes(suffix)) {
    const idx = sellerTaskSuffixes.indexOf(suffix);
    if (idx < sellerFilled) return "complete";
    if (tier === 0) return "pending";
    if (idx === sellerFilled && tier <= 3) return "pending";
    return "pending";
  }

  if (suffix === "08") {
    if (tier < 4) return "pending";
    if (tier === 4) return seededRandom(seed, 30) > 0.5 ? "in_progress" : "pending";
    if (tier === 5) return "in_progress";
    if (tier >= 6) return "complete";
    return "pending";
  }

  if (suffix === "09") {
    if (tier < 6) return "pending";
    return "in_progress";
  }

  if (suffix === "10") {
    if (tier < 7) return "pending";
    return "in_progress";
  }

  if (suffix === "11") {
    if (tier < 9) return "pending";
    return "complete";
  }

  // Item listing + Stripe — locked until prerequisites complete; stay pending
  return "pending";
}

function buildTask(
  partnerId: string,
  def: OnboardingSubtaskDefinition,
  tier: ProgressTier,
  seed: number,
  partnerName: string,
): OnboardingTask {
  let status = taskStatusForTier(def.suffix, tier, seed);
  let issue: string | undefined;
  let issueSource: string | undefined;

  // Brand profile in review often has a banner issue (deterministic per partner)
  if (def.suffix === "01" && status === "in_progress" && seededRandom(seed, 40) > 0.25) {
    issue = "Invalid Banner/Cover Image";
    issueSource = "Image quality analysis: low resolution, does not meet guidelines";
  }

  // Integration completes on submission — never left in_progress once tier reached
  if (def.suffix === "11" && tier >= 9) {
    status = "complete";
  }

  const task: OnboardingTask = {
    id: `t-${partnerId}-${def.suffix}`,
    sellerId: partnerId,
    section: def.sectionId,
    title: def.title,
    status,
    autoValidated: def.autoValidated,
    ...(issue ? { issue, issueSource } : {}),
  };

  const rec = generateTaskRecommendation(partnerId, partnerName, def.sectionId, task);
  if (rec) {
    return {
      ...task,
      agentRecommendation: rec.agentRecommendation,
      suggestedCta: rec.suggestedCta,
    } as OnboardingTask;
  }

  return task;
}

function groupIntoSections(partnerId: string, tasks: OnboardingTask[]): OnboardingSection[] {
  const sectionOrder = [
    "profile",
    "assortment",
    "documentation",
    "integrations",
    "item-listing",
    "stripe",
  ];

  return sectionOrder.map((sectionId) => {
    const sectionTasks = tasks.filter((t) => t.section === sectionId);
    return {
      id: sectionId,
      title: SECTION_TITLES[sectionId] ?? sectionId,
      totalSteps: SECTION_STEP_COUNTS[sectionId] ?? sectionTasks.length,
      completedSteps: 0,
      tasks: sectionTasks,
    };
  });
}

const START_DATES = ["2026-01-10", "2026-02-05", "2026-03-10", "2026-04-01", "2026-05-15", "2026-06-01"];
const LAUNCH_DATES = ["2026-05-30", "2026-06-01", "2026-06-15", "2026-07-01", "2026-08-15", "2026-09-01"];

/** Build onboarding checklist from a deterministic seed — same partner always gets same state. */
export function generateOnboardingFromSeed(partnerId: string, partnerName: string): OnboardingPartner {
  const seed = hashPartnerId(partnerId);
  const tier = tierFromSeed(seed);
  const dateIdx = seededInt(seed, 50, 0, START_DATES.length - 1);

  const tasks = ONBOARDING_SUBTASK_DEFINITIONS.map((def) =>
    buildTask(partnerId, def, tier, seed, partnerName),
  );

  const sections = syncSectionCompletedSteps(groupIntoSections(partnerId, tasks));

  const state = buildSellerOnboardingState(partnerId, partnerName, sections, {
    assignedTo: "Shaun Doe",
    startedAt: START_DATES[dateIdx],
    targetLaunchDate: LAUNCH_DATES[dateIdx],
  });

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
      })) as OnboardingTask[],
    })),
  };
}

/** Apply partial task patches (used by curated demo profiles). */
export function applyTaskPatches(
  base: OnboardingPartner,
  patches: Record<string, Partial<OnboardingTask>>,
  meta?: Partial<Pick<OnboardingPartner, "startedAt" | "targetLaunchDate">>,
): OnboardingPartner {
  const prefix = `t-${base.sellerId}-`;
  const sections = base.sections.map((section) => {
    const tasks = section.tasks.map((task) => {
      const suffix = task.id.startsWith(prefix) ? task.id.slice(prefix.length) : "";
      const patch = patches[suffix];
      const merged = patch ? { ...task, ...patch } : task;
      const rec = generateTaskRecommendation(
        base.sellerId,
        base.sellerName,
        section.id as OnboardingSectionId,
        merged,
      );
      if (rec) {
        return {
          ...merged,
          agentRecommendation: rec.agentRecommendation,
          suggestedCta: rec.suggestedCta,
        } as OnboardingTask;
      }
      return merged;
    });
    return { ...section, tasks };
  });

  const synced = syncSectionCompletedSteps(sections);
  const state = buildSellerOnboardingState(base.sellerId, base.sellerName, synced, {
    assignedTo: base.assignedTo,
    startedAt: meta?.startedAt ?? base.startedAt,
    targetLaunchDate: meta?.targetLaunchDate ?? base.targetLaunchDate,
  });

  return {
    sellerId: state.partnerId,
    sellerName: state.sellerName,
    assignedTo: state.assignedTo,
    overallProgress: state.overallProgress,
    startedAt: state.startedAt,
    targetLaunchDate: state.targetLaunchDate,
    sections: synced,
  };
}

export function buildFreshOnboarding(partnerId: string, partnerName: string): OnboardingPartner {
  return generateOnboardingFromSeed(partnerId, partnerName);
}

function defaultTargetLaunchDate(fromIsoDate: string): string {
  const date = new Date(fromIsoDate);
  date.setMonth(date.getMonth() + 3);
  return date.toISOString().slice(0, 10);
}

/** Initial onboarding after lead approval — seller submitted assortment via lead form only. */
export function buildNewlyApprovedOnboarding(
  partnerId: string,
  partnerName: string,
): OnboardingPartner {
  const tasks = ONBOARDING_SUBTASK_DEFINITIONS.map((def) => {
    const status: OnboardingTask["status"] = def.suffix === "08" ? "in_progress" : "pending";
    const task: OnboardingTask = {
      id: `t-${partnerId}-${def.suffix}`,
      sellerId: partnerId,
      section: def.sectionId,
      title: def.title,
      status,
      autoValidated: def.autoValidated,
    };

    const rec = generateTaskRecommendation(
      partnerId,
      partnerName,
      def.sectionId as OnboardingSectionId,
      task,
    );
    if (rec) {
      return {
        ...task,
        agentRecommendation: rec.agentRecommendation,
        suggestedCta: rec.suggestedCta,
      } as OnboardingTask;
    }
    return task;
  });

  const sections = syncSectionCompletedSteps(groupIntoSections(partnerId, tasks));
  const startedAt = new Date().toISOString().slice(0, 10);
  const state = buildSellerOnboardingState(partnerId, partnerName, sections, {
    assignedTo: "Shaun Doe",
    startedAt,
    targetLaunchDate: defaultTargetLaunchDate(startedAt),
  });

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
      })) as OnboardingTask[],
    })),
  };
}
