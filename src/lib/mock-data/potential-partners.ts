import {
  getPartnerOnboardingPagePartners,
  type OnboardingTask,
  type PartnerStage,
  type PipelinePartner,
  type TaskStatus,
} from "@/lib/mock-data/pipeline-partners";

export type PartnerPipelineStatus =
  | "New"
  | "In Review"
  | "Approved"
  | "Rejected"
  | "Onboarding"
  | "Future Interest";

/** @deprecated Use tasks from pipeline instead */
export type ProgressStepState = "complete" | "current" | "pending" | "locked";

export interface PotentialPartner {
  id: string;
  sellerId: string;
  legalBusinessName: string;
  displayName: string;
  status: PartnerPipelineStatus;
  source: string;
  categories: string[];
  gmv: number;
  skus: number;
  confidenceScore: number;
  /** Six onboarding tasks — sourced from pipeline-partners */
  tasks?: OnboardingTask[];
  createdOn: string;
  lastActivity: string;
}

function mapStageToStatus(stage: PartnerStage): PartnerPipelineStatus {
  if (stage === "Onboarding") return "Onboarding";
  if (stage === "Contacted") return "In Review";
  return "New";
}

function enrichPipelineTasks(tasks: OnboardingTask[]): OnboardingTask[] {
  return tasks.map((task, index) => {
    let status: TaskStatus = task.status;

    if (status === "completed" && index <= 1) {
      status = "validated";
    }
    if (status === "locked" && index < tasks.length - 2) {
      status = "in_progress";
    }

    return status === task.status ? task : { ...task, status };
  });
}

function formatShortDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function partnerDates(index: number): { createdOn: string; lastActivity: string } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const created = new Date(today);
  // ~1 month old with slight row-to-row variation (27–33 days ago)
  created.setDate(created.getDate() - (27 + (index % 7)));

  const activity = new Date(today);
  // Recent activity within the last week (0–6 days ago)
  activity.setDate(activity.getDate() - (index % 7));

  return {
    createdOn: formatShortDate(created),
    lastActivity: `Activity on ${formatShortDate(activity)}`,
  };
}

function pipelinePartnerToPotential(partner: PipelinePartner, index: number): PotentialPartner {
  const gmvNumeric = Math.round(partner.gmvValue * 1_000_000);
  const { createdOn, lastActivity } = partnerDates(index);

  return {
    id: partner.id,
    sellerId: partner.id,
    legalBusinessName: partner.name,
    displayName: partner.name.split(" ")[0] ?? partner.name,
    status: mapStageToStatus(partner.stage),
    source: "Target Plus Outreach",
    categories: partner.categories,
    gmv: gmvNumeric,
    skus: Math.max(120, Math.round(gmvNumeric / 5000)),
    confidenceScore: partner.confidenceScore ?? 8,
    tasks: partner.tasks ? enrichPipelineTasks(partner.tasks) : undefined,
    createdOn,
    lastActivity,
  };
}

/** Demo status variety for the Partner Onboarding table */
const PARTNER_STATUS_OVERRIDES: Record<string, PartnerPipelineStatus> = {
  "p-l-n5": "Rejected",
  "p-l-n6": "Future Interest",
  "p-l-c2": "Approved",
  "p-f-n3": "Rejected",
  "p-f-n4": "Future Interest",
  "p-f-c1": "Approved",
  "p-k-n2": "Rejected",
  "p-k-n4": "Future Interest",
  "p-k-c2": "Approved",
};

/** All potential partners derived from the pipeline single source of truth */
export const potentialPartners: PotentialPartner[] =
  getPartnerOnboardingPagePartners().map((partner, index) => {
    const mapped = pipelinePartnerToPotential(partner, index);
    const override = PARTNER_STATUS_OVERRIDES[partner.id];
    return override ? { ...mapped, status: override } : mapped;
  });

export interface OnboardingKpi {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: "revenue" | "goal" | "gap" | "sellers";
}

export const onboardingKpis: OnboardingKpi[] = [
  { label: "Total Revenue Goal", value: "$50.8M", change: "4.5%", trend: "up", icon: "goal" },
  { label: "Total Revenue", value: "$44.8M", change: "4.5%", trend: "down", icon: "revenue" },
  { label: "Q3 Revenue Closed", value: "$12.5M", change: "4.5%", trend: "up", icon: "revenue" },
  { label: "Revenue at Risk", value: "$0.54M", change: "2.5%", trend: "down", icon: "gap" },
];

const LEAD_FORM_STATUSES: PartnerPipelineStatus[] = [
  "New",
  "In Review",
  "Approved",
  "Rejected",
  "Future Interest",
];

const CHECKLIST_STATUSES: PartnerPipelineStatus[] = ["Onboarding"];
const PROGRESS_STATUSES: PartnerPipelineStatus[] = ["Onboarding"];

export function showsLeadForm(status: PartnerPipelineStatus): boolean {
  return LEAD_FORM_STATUSES.includes(status);
}

export function showsOnboardingChecklist(status: PartnerPipelineStatus): boolean {
  return CHECKLIST_STATUSES.includes(status);
}

export function showsPartnerProgress(status: PartnerPipelineStatus): boolean {
  return PROGRESS_STATUSES.includes(status);
}

export function getPartnerProfilePath(partnerId: string): string {
  return `/sellers/onboarding/${partnerId}`;
}

export function getPotentialPartnerBySellerId(sellerId: string): PotentialPartner | undefined {
  return potentialPartners.find((p) => p.sellerId === sellerId);
}

export function getPotentialPartnerById(id: string): PotentialPartner | undefined {
  return potentialPartners.find((p) => p.id === id);
}
