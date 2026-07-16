import { getOnboardingPartners } from "@/lib/mock-data/pipeline-partners";
import {
  getPotentialPartnerById,
  getPotentialPartnerBySellerId,
} from "@/lib/mock-data/potential-partners";

export interface OnboardingTask {
  id: string;
  sellerId: string;
  section: string;
  title: string;
  status: "complete" | "in_progress" | "pending" | "blocked";
  issue?: string;
  issueSource?: string;
  autoValidated: boolean;
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

export interface OnboardingSection {
  id: string;
  title: string;
  totalSteps: number;
  completedSteps: number;
  tasks: OnboardingTask[];
}

export const LOCKED_ONBOARDING_SECTION_IDS = new Set(["item-listing", "stripe"]);

export const ASSORTMENT_REVIEW_ICON_SRC = "/icons/clipboard.svg";

export function isAssortmentSectionInReview(section: OnboardingSection): boolean {
  if (section.id !== "assortment") return false;
  return section.tasks.some((task) => task.status === "in_progress");
}

export function getAssortmentTaskIconSrc(task: OnboardingTask): string {
  if (task.status === "complete") return "/icons/progress-check-success.svg";
  return ASSORTMENT_REVIEW_ICON_SRC;
}

export function isOnboardingSectionLocked(
  section: OnboardingSection,
  sections: OnboardingSection[],
): boolean {
  if (!LOCKED_ONBOARDING_SECTION_IDS.has(section.id)) return false;
  const prerequisites = sections.filter((s) => !LOCKED_ONBOARDING_SECTION_IDS.has(s.id));
  return !prerequisites.every((s) => s.completedSteps >= s.totalSteps);
}

export function getOnboardingSectionProgressPercent(section: OnboardingSection): number {
  if (!section.totalSteps) return 0;
  return Math.round((section.completedSteps / section.totalSteps) * 100);
}

export function getOnboardingSectionStatusIconSrc(
  section: OnboardingSection,
  sections: OnboardingSection[],
): string {
  const locked = isOnboardingSectionLocked(section, sections);
  if (locked) return "/icons/lock-fill.svg";
  if (isAssortmentSectionInReview(section)) {
    return ASSORTMENT_REVIEW_ICON_SRC;
  }
  if (section.completedSteps >= section.totalSteps && section.totalSteps > 0) {
    return "/icons/progress-check.svg";
  }
  if (section.tasks.some((t) => t.status === "in_progress" || t.status === "blocked")) {
    return "/icons/time-clock.svg";
  }
  return "/icons/progress.svg";
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

export const onboardingPartners: OnboardingPartner[] = [
  {
    sellerId: "seller-004",
    sellerName: "Pinnacle Goods",
    assignedTo: "Shaun Doe",
    overallProgress: 65,
    startedAt: "2026-04-01",
    targetLaunchDate: "2026-07-01",
    sections: [
      {
        id: "profile",
        title: "Profile Information",
        totalSteps: 7,
        completedSteps: 6,
        tasks: [
          { id: "t-001", sellerId: "seller-004", section: "profile", title: "Brand profile", status: "in_progress", issue: "Invalid Banner/Cover Image", issueSource: "Image quality analysis: low resolution, does not meet guidelines", autoValidated: true },
          { id: "t-002", sellerId: "seller-004", section: "profile", title: "Guest services and reverse logistics", status: "complete", autoValidated: true },
          { id: "t-003", sellerId: "seller-004", section: "profile", title: "Business identity and address", status: "complete", autoValidated: true },
          { id: "t-004", sellerId: "seller-004", section: "profile", title: "Marketplace users", status: "complete", autoValidated: false },
          { id: "t-005", sellerId: "seller-004", section: "profile", title: "Fulfilment details", status: "complete", autoValidated: false },
          { id: "t-006", sellerId: "seller-004", section: "profile", title: "Returns policy", status: "complete", autoValidated: false },
          { id: "t-007", sellerId: "seller-004", section: "profile", title: "Privacy policy", status: "complete", autoValidated: true },
        ],
      },
      {
        id: "assortment",
        title: "Assortment Curation",
        totalSteps: 1,
        completedSteps: 0,
        tasks: [
          { id: "t-008", sellerId: "seller-004", section: "assortment", title: "Upload assortment file (SKUs)", status: "pending", autoValidated: false },
        ],
      },
      {
        id: "documentation",
        title: "Documentation",
        totalSteps: 2,
        completedSteps: 1,
        tasks: [
          { id: "t-009", sellerId: "seller-004", section: "documentation", title: "W9 form uploaded", status: "complete", autoValidated: true },
          { id: "t-010", sellerId: "seller-004", section: "documentation", title: "Contract signed", status: "pending", autoValidated: false },
        ],
      },
      {
        id: "integrations",
        title: "Integrations",
        totalSteps: 1,
        completedSteps: 0,
        tasks: [
          { id: "t-011", sellerId: "seller-004", section: "integrations", title: "Channel partner integration", status: "pending", autoValidated: false },
        ],
      },
      {
        id: "item-listing",
        title: "Item listing",
        totalSteps: 1,
        completedSteps: 0,
        tasks: [
          { id: "t-012", sellerId: "seller-004", section: "item-listing", title: "Item data setup and mapping", status: "pending", autoValidated: false },
        ],
      },
      {
        id: "stripe",
        title: "Stripe setup",
        totalSteps: 2,
        completedSteps: 0,
        tasks: [
          { id: "t-013", sellerId: "seller-004", section: "stripe", title: "Stripe account creation", status: "pending", autoValidated: false },
          { id: "t-014", sellerId: "seller-004", section: "stripe", title: "Bank deposit verified", status: "pending", autoValidated: false },
        ],
      },
    ],
  },
  {
    sellerId: "seller-012",
    sellerName: "Orange Inc",
    assignedTo: "Shaun Doe",
    overallProgress: 20,
    startedAt: "2026-05-15",
    targetLaunchDate: "2026-08-15",
    sections: [
      {
        id: "profile",
        title: "Profile Information",
        totalSteps: 7,
        completedSteps: 6,
        tasks: [
          { id: "t-101", sellerId: "seller-012", section: "profile", title: "Brand profile", status: "in_progress", issue: "Invalid Banner/Cover Image", issueSource: "Image quality analysis: low resolution", autoValidated: true },
          { id: "t-102", sellerId: "seller-012", section: "profile", title: "Guest services and reverse logistics", status: "complete", autoValidated: true },
          { id: "t-103", sellerId: "seller-012", section: "profile", title: "Business identity and address", status: "complete", autoValidated: true },
          { id: "t-104", sellerId: "seller-012", section: "profile", title: "Marketplace users", status: "complete", autoValidated: false },
          { id: "t-105", sellerId: "seller-012", section: "profile", title: "Fulfilment details", status: "complete", autoValidated: false },
          { id: "t-106", sellerId: "seller-012", section: "profile", title: "Returns policy", status: "complete", autoValidated: false },
          { id: "t-107", sellerId: "seller-012", section: "profile", title: "Privacy policy", status: "pending", autoValidated: true },
        ],
      },
      {
        id: "assortment",
        title: "Assortment Curation",
        totalSteps: 1,
        completedSteps: 0,
        tasks: [
          { id: "t-108", sellerId: "seller-012", section: "assortment", title: "Upload assortment file (SKUs)", status: "pending", autoValidated: false },
        ],
      },
      {
        id: "documentation",
        title: "Documentation",
        totalSteps: 2,
        completedSteps: 2,
        tasks: [
          { id: "t-109", sellerId: "seller-012", section: "documentation", title: "W9 form uploaded", status: "complete", autoValidated: true },
          { id: "t-110", sellerId: "seller-012", section: "documentation", title: "Contract signed", status: "complete", autoValidated: true },
        ],
      },
      {
        id: "integrations",
        title: "Integrations",
        totalSteps: 1,
        completedSteps: 0,
        tasks: [
          { id: "t-111", sellerId: "seller-012", section: "integrations", title: "Channel partner integration", status: "pending", autoValidated: false },
        ],
      },
      {
        id: "item-listing",
        title: "Item listing",
        totalSteps: 1,
        completedSteps: 0,
        tasks: [
          { id: "t-112", sellerId: "seller-012", section: "item-listing", title: "Item data setup and mapping", status: "pending", autoValidated: false },
        ],
      },
      {
        id: "stripe",
        title: "Stripe setup",
        totalSteps: 2,
        completedSteps: 0,
        tasks: [
          { id: "t-113", sellerId: "seller-012", section: "stripe", title: "Stripe account creation", status: "pending", autoValidated: false },
          { id: "t-114", sellerId: "seller-012", section: "stripe", title: "Bank deposit verified", status: "pending", autoValidated: false },
        ],
      },
    ],
  },
  {
    sellerId: "seller-017",
    sellerName: "Dot & Dash",
    assignedTo: "Shaun Doe",
    overallProgress: 0,
    startedAt: "2026-02-05",
    targetLaunchDate: "2026-05-15",
    sections: [
      {
        id: "profile",
        title: "Profile Information",
        totalSteps: 7,
        completedSteps: 0,
        tasks: [
          { id: "t-201", sellerId: "seller-017", section: "profile", title: "Brand profile", status: "pending", autoValidated: false },
          { id: "t-202", sellerId: "seller-017", section: "profile", title: "Guest services and reverse logistics", status: "pending", autoValidated: false },
          { id: "t-203", sellerId: "seller-017", section: "profile", title: "Business identity and address", status: "pending", autoValidated: false },
          { id: "t-204", sellerId: "seller-017", section: "profile", title: "Marketplace users", status: "pending", autoValidated: false },
          { id: "t-205", sellerId: "seller-017", section: "profile", title: "Fulfilment details", status: "pending", autoValidated: false },
          { id: "t-206", sellerId: "seller-017", section: "profile", title: "Returns policy", status: "pending", autoValidated: false },
          { id: "t-207", sellerId: "seller-017", section: "profile", title: "Privacy policy", status: "pending", autoValidated: false },
        ],
      },
      {
        id: "assortment",
        title: "Assortment Curation",
        totalSteps: 1,
        completedSteps: 0,
        tasks: [
          { id: "t-208", sellerId: "seller-017", section: "assortment", title: "Upload assortment file (SKUs)", status: "pending", autoValidated: false },
        ],
      },
      {
        id: "documentation",
        title: "Documentation",
        totalSteps: 2,
        completedSteps: 0,
        tasks: [
          { id: "t-209", sellerId: "seller-017", section: "documentation", title: "W9 form uploaded", status: "pending", autoValidated: true },
          { id: "t-210", sellerId: "seller-017", section: "documentation", title: "Contract signed", status: "pending", autoValidated: false },
        ],
      },
      {
        id: "integrations",
        title: "Integrations",
        totalSteps: 1,
        completedSteps: 0,
        tasks: [
          { id: "t-211", sellerId: "seller-017", section: "integrations", title: "Channel partner integration", status: "pending", autoValidated: false },
        ],
      },
      {
        id: "item-listing",
        title: "Item listing",
        totalSteps: 1,
        completedSteps: 0,
        tasks: [
          { id: "t-212", sellerId: "seller-017", section: "item-listing", title: "Item data setup and mapping", status: "pending", autoValidated: false },
        ],
      },
      {
        id: "stripe",
        title: "Stripe setup",
        totalSteps: 2,
        completedSteps: 0,
        tasks: [
          { id: "t-213", sellerId: "seller-017", section: "stripe", title: "Stripe account creation", status: "pending", autoValidated: false },
          { id: "t-214", sellerId: "seller-017", section: "stripe", title: "Bank deposit verified", status: "pending", autoValidated: false },
        ],
      },
    ],
  },
];

function resolveSellerNameForOnboarding(sellerId: string): string {
  const fromPotential =
    getPotentialPartnerById(sellerId) ?? getPotentialPartnerBySellerId(sellerId);
  if (fromPotential) return fromPotential.legalBusinessName;

  const fromLegacy = onboardingPartners.find((p) => p.sellerId === sellerId);
  if (fromLegacy) return fromLegacy.sellerName;

  return "Partner";
}

function buildFreshOnboardingForPartner(
  sellerId: string,
  sellerName: string,
): OnboardingPartner {
  const task = (
    section: string,
    suffix: string,
    title: string,
    autoValidated = false,
  ): OnboardingTask => ({
    id: `t-${sellerId}-${suffix}`,
    sellerId,
    section,
    title,
    status: section === "assortment" ? "in_progress" : "pending",
    autoValidated,
  });

  const sections: OnboardingSection[] = [
    {
      id: "profile",
      title: "Profile Information",
      totalSteps: 7,
      completedSteps: 0,
      tasks: [
        task("profile", "01", "Brand profile"),
        task("profile", "02", "Guest services and reverse logistics"),
        task("profile", "03", "Business identity and address"),
        task("profile", "04", "Marketplace users"),
        task("profile", "05", "Fulfilment details"),
        task("profile", "06", "Returns policy"),
        task("profile", "07", "Privacy policy"),
      ],
    },
    {
      id: "assortment",
      title: "Assortment curation",
      totalSteps: 1,
      completedSteps: 0,
      tasks: [task("assortment", "08", "Upload assortment file (SKUs)")],
    },
    {
      id: "documentation",
      title: "Documentation",
      totalSteps: 2,
      completedSteps: 0,
      tasks: [
        task("documentation", "09", "W9 form uploaded", true),
        task("documentation", "10", "Contract signed"),
      ],
    },
    {
      id: "integrations",
      title: "Integrations",
      totalSteps: 1,
      completedSteps: 0,
      tasks: [task("integrations", "11", "Channel partner integration")],
    },
    {
      id: "item-listing",
      title: "Item listing",
      totalSteps: 1,
      completedSteps: 0,
      tasks: [task("item-listing", "12", "Item data setup and mapping")],
    },
    {
      id: "stripe",
      title: "Stripe setup",
      totalSteps: 2,
      completedSteps: 0,
      tasks: [
        task("stripe", "13", "Stripe account creation"),
        task("stripe", "14", "Bank deposit verified"),
      ],
    },
  ];

  return {
    sellerId,
    sellerName,
    assignedTo: "Shaun Doe",
    overallProgress: computeOnboardingOverallProgress(sections),
    startedAt: new Date().toISOString().slice(0, 10),
    targetLaunchDate: "2026-07-01",
    sections,
  };
}

function applyTaskUpdates(
  base: OnboardingPartner,
  updates: Record<string, Partial<OnboardingTask>>,
  meta?: Partial<Pick<OnboardingPartner, "startedAt" | "targetLaunchDate">>,
): OnboardingPartner {
  const prefix = `t-${base.sellerId}-`;
  const sections = base.sections.map((section) => {
    const tasks = section.tasks.map((task) => {
      const suffix = task.id.startsWith(prefix) ? task.id.slice(prefix.length) : "";
      const patch = updates[suffix];
      return patch ? { ...task, ...patch } : task;
    });
    return {
      ...section,
      tasks,
      completedSteps: tasks.filter((t) => t.status === "complete").length,
    };
  });

  return {
    ...base,
    ...meta,
    sections,
    overallProgress: computeOnboardingOverallProgress(sections),
  };
}

/** Profile (7) + documentation (2) + integrations (1) steps marked complete */
const COMPLETE_PROFILE_AND_DOCUMENTATION_UPDATES: Record<string, Partial<OnboardingTask>> = {
  "01": { status: "complete", autoValidated: true },
  "02": { status: "complete", autoValidated: true },
  "03": { status: "complete", autoValidated: true },
  "04": { status: "complete", autoValidated: false },
  "05": { status: "complete", autoValidated: false },
  "06": { status: "complete", autoValidated: false },
  "07": { status: "complete", autoValidated: true },
  "09": { status: "complete", autoValidated: true },
  "10": { status: "complete", autoValidated: false },
  "11": { status: "complete", autoValidated: false },
};

function completeProfileAndDocumentationPartner(
  sellerId: string,
  sellerName: string,
  meta?: Partial<Pick<OnboardingPartner, "startedAt" | "targetLaunchDate">>,
): OnboardingPartner {
  return applyTaskUpdates(
    buildFreshOnboardingForPartner(sellerId, sellerName),
    COMPLETE_PROFILE_AND_DOCUMENTATION_UPDATES,
    meta,
  );
}

/** Approved but not yet started onboarding — section 2 in review, last two sections locked */
function buildApprovedPreOnboardingProfile(
  sellerId: string,
  sellerName: string,
): OnboardingPartner {
  return applyTaskUpdates(
    buildFreshOnboardingForPartner(sellerId, sellerName),
    {
      "08": { status: "in_progress", autoValidated: false },
    },
    { startedAt: "2026-07-01", targetLaunchDate: "2026-09-01" },
  );
}

/** Demo partners with partial checklist progress for profile & documentation review flows */
const partialOnboardingProfiles: Record<string, OnboardingPartner> = {
  // Approved partners — checklist not started; assortment (2nd section) in review
  "p-l-c2": buildApprovedPreOnboardingProfile("p-l-c2", "FluxLight Co."),
  "p-f-c1": buildApprovedPreOnboardingProfile("p-f-c1", "MapleCraft Co."),
  "p-k-c2": buildApprovedPreOnboardingProfile("p-k-c2", "TableCraft Brands"),
  // Pinnacle Goods — profile nearly complete (banner issue) + W9 uploaded
  "p-k-o2": applyTaskUpdates(
    buildFreshOnboardingForPartner("p-k-o2", "Pinnacle Goods"),
    {
      "01": {
        status: "in_progress",
        issue: "Invalid Banner/Cover Image",
        issueSource: "Image quality analysis: low resolution, does not meet guidelines",
        autoValidated: true,
      },
      "02": { status: "complete", autoValidated: true },
      "03": { status: "complete", autoValidated: true },
      "04": { status: "complete", autoValidated: false },
      "05": { status: "complete", autoValidated: false },
      "06": { status: "complete", autoValidated: false },
      "07": { status: "complete", autoValidated: true },
      "09": { status: "complete", autoValidated: true },
      "11": { status: "complete", autoValidated: false },
      "08": { status: "in_progress", autoValidated: false },
    },
    { startedAt: "2026-04-01", targetLaunchDate: "2026-07-01" },
  ),
  // Oasis & Co — profile complete, documentation in review with brand issue
  "p-f-o2": applyTaskUpdates(
    buildFreshOnboardingForPartner("p-f-o2", "Oasis & Co"),
    {
      "01": { status: "complete", autoValidated: true },
      "02": { status: "complete", autoValidated: true },
      "03": { status: "complete", autoValidated: true },
      "04": { status: "complete", autoValidated: false },
      "05": { status: "complete", autoValidated: false },
      "06": { status: "complete", autoValidated: false },
      "07": { status: "complete", autoValidated: true },
      "09": { status: "complete", autoValidated: true },
      "11": { status: "complete", autoValidated: false },
    },
    { startedAt: "2026-05-15", targetLaunchDate: "2026-08-15" },
  ),
  // SunSet Decor — early profile progress only
  "p-l-o3": applyTaskUpdates(
    buildFreshOnboardingForPartner("p-l-o3", "SunSet Decor"),
    {
      "01": {
        status: "in_progress",
        issue: "Invalid Banner/Cover Image",
        issueSource: "Image quality analysis: low resolution",
        autoValidated: true,
      },
      "02": { status: "complete", autoValidated: true },
      "03": { status: "complete", autoValidated: true },
      "04": { status: "complete", autoValidated: false },
    },
    { startedAt: "2026-06-01", targetLaunchDate: "2026-09-01" },
  ),
  // Zenith Lights — profile & documentation complete
  "p-l-o6": completeProfileAndDocumentationPartner(
    "p-l-o6",
    "Zenith Lights",
    { startedAt: "2026-03-10", targetLaunchDate: "2026-06-15" },
  ),
  // Casa de Cocina — profile & documentation complete
  "p-k-o4": completeProfileAndDocumentationPartner(
    "p-k-o4",
    "Casa de Cocina",
    { startedAt: "2026-02-20", targetLaunchDate: "2026-06-01" },
  ),
  // TimberLine Brands — profile & documentation complete
  "p-f-o6": completeProfileAndDocumentationPartner(
    "p-f-o6",
    "TimberLine Brands",
    { startedAt: "2026-01-15", targetLaunchDate: "2026-05-30" },
  ),
};

function resolveOnboardingProfile(sellerId: string, sellerName: string): OnboardingPartner {
  return partialOnboardingProfiles[sellerId] ?? buildFreshOnboardingForPartner(sellerId, sellerName);
}

export function getOnboardingBySellerID(sellerId: string): OnboardingPartner {
  return resolveOnboardingProfile(sellerId, resolveSellerNameForOnboarding(sellerId));
}

export function getOnboardingForPartner(partner: {
  id: string;
  sellerId: string;
  legalBusinessName: string;
}): OnboardingPartner {
  return resolveOnboardingProfile(partner.sellerId, partner.legalBusinessName);
}

export function getAllOnboardingProfiles(): OnboardingPartner[] {
  return getOnboardingPartners().map((partner) =>
    resolveOnboardingProfile(partner.id, partner.name),
  );
}

export function getBlockedOnboardingTasks(): OnboardingTask[] {
  return getAllOnboardingProfiles()
    .flatMap((p) => p.sections.flatMap((s) => s.tasks))
    .filter((t) => t.status === "blocked" || t.issue);
}
