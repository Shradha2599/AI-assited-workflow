export type PartnerPipelineStatus =
  | "New"
  | "In Review"
  | "Approved"
  | "Rejected"
  | "Onboarding"
  | "Future Interest";

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
  progressSteps?: ProgressStepState[];
  createdOn: string;
  lastActivity: string;
}

export const potentialPartners: PotentialPartner[] = [
  {
    id: "pp-001",
    sellerId: "seller-016",
    legalBusinessName: "Cheery Oak",
    displayName: "Cheery",
    status: "New",
    source: "Target Plus Outreach",
    categories: ["Home & Decor", "Kitchen & Dining"],
    gmv: 980000,
    skus: 420,
    confidenceScore: 8.6,
    createdOn: "Jan 12, 2026",
    lastActivity: "Activity on Jan 14, 2026",
  },
  {
    id: "pp-002",
    sellerId: "seller-012",
    legalBusinessName: "Orange Inc",
    displayName: "Orange Inc",
    status: "Onboarding",
    source: "Target Plus Outreach",
    categories: ["Storage & Organization", "Kitchen & Dining"],
    gmv: 127450,
    skus: 256,
    confidenceScore: 9.3,
    progressSteps: ["complete", "complete", "current", "pending", "locked"],
    createdOn: "Jan 23, 2026",
    lastActivity: "Activity on Mar 16, 2026",
  },
  {
    id: "pp-003",
    sellerId: "seller-004",
    legalBusinessName: "Pinnacle Goods",
    displayName: "Pinnacle Goods",
    status: "Onboarding",
    source: "Target Plus Outreach",
    categories: ["Kitchen & Dining", "Storage & Organization"],
    gmv: 1500000,
    skus: 2050,
    confidenceScore: 9.2,
    createdOn: "Jan 11, 2026",
    lastActivity: "Activity on Mar 12, 2026",
  },
  {
    id: "pp-004",
    sellerId: "seller-017",
    legalBusinessName: "Dot & Dash",
    displayName: "Dot&Dash",
    status: "Approved",
    source: "Target Plus Outreach",
    categories: ["Party Supplies", "Holiday & Festive Decor"],
    gmv: 1100000,
    skus: 890,
    confidenceScore: 8.8,
    progressSteps: ["complete", "complete", "complete", "current", "pending"],
    createdOn: "Jan 10, 2026",
    lastActivity: "Activity on Feb 5, 2026",
  },
  {
    id: "pp-005",
    sellerId: "seller-001",
    legalBusinessName: "Green Co",
    displayName: "Green Co",
    status: "In Review",
    source: "Target Plus Outreach",
    categories: ["Lighting", "Outdoor Living & Garden"],
    gmv: 1500000,
    skus: 2050,
    confidenceScore: 9.1,
    createdOn: "Jan 25, 2026",
    lastActivity: "Activity on Jan 25, 2026",
  },
  {
    id: "pp-006",
    sellerId: "seller-003",
    legalBusinessName: "Thunder Brewing",
    displayName: "Thunder",
    status: "Rejected",
    source: "Target Plus Outreach",
    categories: ["Holiday & Festive Decor", "Party Supplies"],
    gmv: 1500000,
    skus: 2050,
    confidenceScore: 7.4,
    createdOn: "Jan 6, 2026",
    lastActivity: "Activity on Jan 9, 2026",
  },
  {
    id: "pp-007",
    sellerId: "seller-018",
    legalBusinessName: "Hometown Living",
    displayName: "Hometown",
    status: "Future Interest",
    source: "Target Plus Outreach",
    categories: ["Furniture", "Home & Decor"],
    gmv: 760000,
    skus: 310,
    confidenceScore: 7.9,
    createdOn: "Jan 4, 2026",
    lastActivity: "Activity on Jan 8, 2026",
  },
];

export interface OnboardingKpi {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
}

export const onboardingKpis: OnboardingKpi[] = [
  { label: "Total Revenue Goal", value: "$50.8M", change: "4.5%", trend: "up" },
  { label: "Total Revenue", value: "$44.8M", change: "4.5%", trend: "down" },
  { label: "Q3 Revenue Closed", value: "$12.5M", change: "4.5%", trend: "up" },
  { label: "Revenue at Risk", value: "$0.54M", change: "2.5%", trend: "down" },
];

const LEAD_FORM_STATUSES: PartnerPipelineStatus[] = [
  "New",
  "In Review",
  "Rejected",
  "Future Interest",
];

const CHECKLIST_STATUSES: PartnerPipelineStatus[] = ["Onboarding", "Approved"];

export function showsLeadForm(status: PartnerPipelineStatus): boolean {
  return LEAD_FORM_STATUSES.includes(status);
}

export function showsOnboardingChecklist(status: PartnerPipelineStatus): boolean {
  return CHECKLIST_STATUSES.includes(status);
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
