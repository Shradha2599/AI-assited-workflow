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
          { id: "t-002", sellerId: "seller-004", section: "profile", title: "Brand display name", status: "complete", autoValidated: true },
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
        title: "Item Listing",
        totalSteps: 1,
        completedSteps: 0,
        tasks: [
          { id: "t-012", sellerId: "seller-004", section: "item-listing", title: "Item data setup and mapping", status: "pending", autoValidated: false },
        ],
      },
      {
        id: "stripe",
        title: "Stripe Setup",
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
          { id: "t-102", sellerId: "seller-012", section: "profile", title: "Brand display name", status: "complete", autoValidated: true },
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
        completedSteps: 0,
        tasks: [
          { id: "t-109", sellerId: "seller-012", section: "documentation", title: "W9 form uploaded", status: "pending", autoValidated: true },
          { id: "t-110", sellerId: "seller-012", section: "documentation", title: "Contract signed", status: "pending", autoValidated: false },
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
        title: "Item Listing",
        totalSteps: 1,
        completedSteps: 0,
        tasks: [
          { id: "t-112", sellerId: "seller-012", section: "item-listing", title: "Item data setup and mapping", status: "pending", autoValidated: false },
        ],
      },
      {
        id: "stripe",
        title: "Stripe Setup",
        totalSteps: 2,
        completedSteps: 0,
        tasks: [
          { id: "t-113", sellerId: "seller-012", section: "stripe", title: "Stripe account creation", status: "pending", autoValidated: false },
          { id: "t-114", sellerId: "seller-012", section: "stripe", title: "Bank deposit verified", status: "pending", autoValidated: false },
        ],
      },
    ],
  },
];

export function getOnboardingBySellerID(sellerId: string): OnboardingPartner | undefined {
  return onboardingPartners.find((p) => p.sellerId === sellerId);
}

export function getBlockedOnboardingTasks(): OnboardingTask[] {
  return onboardingPartners
    .flatMap((p) => p.sections.flatMap((s) => s.tasks))
    .filter((t) => t.status === "blocked" || t.issue);
}
