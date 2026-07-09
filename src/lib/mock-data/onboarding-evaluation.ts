import type { ValidationStatus } from "@/lib/mock-data/lead-form-analysis";

export interface OnboardingFieldValidation {
  id: string;
  label: string;
  submittedValue: string;
  status: ValidationStatus;
  source: string;
  detail: string;
  checkedOn: string;
}

export interface AgentRecommendation {
  title: string;
  message: string;
  suggestedComment: string;
}

export interface OnboardingTaskEvaluation {
  taskId: string;
  sellerId: string;
  sectionId: string;
  title: string;
  reviewable: boolean;
  autoValidated: boolean;
  validationStatus: ValidationStatus;
  summary: string;
  source: string;
  checkedOn: string;
  agentRecommendation?: AgentRecommendation;
  fields: OnboardingFieldValidation[];
}

export interface BrandDocumentRow {
  id: string;
  name: string;
  brandRole: string;
  documentName: string;
  validationStatus: ValidationStatus;
  summary: string;
  source: string;
  checkedOn: string;
  agentRecommendation?: AgentRecommendation;
}

export interface DocumentUpload {
  id: string;
  label: string;
  instruction: string;
  fileName: string;
  fileSize: string;
  validationStatus: ValidationStatus;
  summary: string;
  source: string;
  checkedOn: string;
}

export interface OnboardingSectionEvaluation {
  sectionId: string;
  sellerId: string;
  title: string;
  subtitle: string;
  progress: number;
}

const CHECKED = "May 6, 2026";

function brandProfileEvaluation(
  sellerId: string,
  taskId: string,
  displayName: string,
  website: string,
  description: string,
): OnboardingTaskEvaluation {
  return {
    taskId,
    sellerId,
    sectionId: "profile",
    title: "Banner/ Cover Image",
    reviewable: true,
    autoValidated: true,
    validationStatus: "invalid",
    summary: "Low resolution, does not meet guidelines.",
    source: "Image quality analysis",
    checkedOn: CHECKED,
    agentRecommendation: {
      title: "Invalid Banner/ Cover Image",
      message: "Low resolution, does not meet guidelines.",
      suggestedComment:
        "The uploaded cover image does not align with marketplace display guidelines. Please replace it with a higher-quality asset.",
    },
    fields: [
      {
        id: "banner",
        label: "Banner/ Cover Image",
        submittedValue: "Cover.png (640×360)",
        status: "invalid",
        source: "Image quality analysis",
        detail: "Resolution below 1200×675 minimum; compression artifacts detected",
        checkedOn: CHECKED,
      },
      {
        id: "display-name",
        label: "Brand display name",
        submittedValue: displayName,
        status: "valid",
        source: website,
        detail: "Matches official website and social handles",
        checkedOn: CHECKED,
      },
      {
        id: "description",
        label: "Brand description",
        submittedValue: description,
        status: "valid",
        source: website,
        detail: "Matches official website and social handles",
        checkedOn: CHECKED,
      },
      {
        id: "website",
        label: "Website URL",
        submittedValue: website,
        status: "valid",
        source: "WHOIS + SSL Labs",
        detail: "Domain is active and SSL secured",
        checkedOn: CHECKED,
      },
      {
        id: "sourcing",
        label: "Product sourcing information",
        submittedValue: "Certified suppliers, non-GMO materials",
        status: "valid",
        source: "AI Keyword + Policy check",
        detail: "Mentions certified suppliers and non-GMO",
        checkedOn: CHECKED,
      },
    ],
  };
}

const profileEvaluations: Record<string, OnboardingTaskEvaluation[]> = {
  "seller-012": [
    brandProfileEvaluation(
      "seller-012",
      "t-101",
      "Orange Inc",
      "www.orangeinc.com",
      "Premium home and kitchen essentials…",
    ),
    {
      taskId: "t-103",
      sellerId: "seller-012",
      sectionId: "profile",
      title: "Address Proof",
      reviewable: true,
      autoValidated: true,
      validationStatus: "valid",
      summary: "Business address matches the address in application.",
      source: "D&B + Application",
      checkedOn: CHECKED,
      fields: [
        {
          id: "address",
          label: "Business address",
          submittedValue: "16350 Ventura Blvd Ste D #503, Encino, CA 91436",
          status: "valid",
          source: "D&B + Application",
          detail: "Address matches registered business location",
          checkedOn: CHECKED,
        },
      ],
    },
  ],
  "seller-004": [
    brandProfileEvaluation(
      "seller-004",
      "t-001",
      "Pinnacle Goods",
      "www.pinnaclegoods.com",
      "Kitchen and dining essentials for modern homes",
    ),
  ],
  "p-k-o2": [
    brandProfileEvaluation(
      "p-k-o2",
      "t-p-k-o2-01",
      "Pinnacle Goods",
      "www.pinnaclegoods.com",
      "Kitchen and dining essentials for modern homes",
    ),
    {
      taskId: "t-p-k-o2-03",
      sellerId: "p-k-o2",
      sectionId: "profile",
      title: "Address Proof",
      reviewable: true,
      autoValidated: true,
      validationStatus: "valid",
      summary: "Business address matches the address in application.",
      source: "D&B + Application",
      checkedOn: CHECKED,
      fields: [
        {
          id: "address",
          label: "Business address",
          submittedValue: "200 Clarendon St, Boston, MA 02116",
          status: "valid",
          source: "D&B + Application",
          detail: "Address matches registered business location",
          checkedOn: CHECKED,
        },
      ],
    },
  ],
  "p-f-o2": [
    brandProfileEvaluation(
      "p-f-o2",
      "t-p-f-o2-01",
      "Oasis & Co",
      "www.oasisandco.com",
      "Modern furniture and home essentials for every room",
    ),
    {
      taskId: "t-p-f-o2-03",
      sellerId: "p-f-o2",
      sectionId: "profile",
      title: "Address Proof",
      reviewable: true,
      autoValidated: true,
      validationStatus: "valid",
      summary: "Business address matches the address in application.",
      source: "D&B + Application",
      checkedOn: CHECKED,
      fields: [
        {
          id: "address",
          label: "Business address",
          submittedValue: "4500 Main St, Kansas City, MO 64111",
          status: "valid",
          source: "D&B + Application",
          detail: "Address matches registered business location",
          checkedOn: CHECKED,
        },
      ],
    },
  ],
  "p-l-o3": [
    brandProfileEvaluation(
      "p-l-o3",
      "t-p-l-o3-01",
      "SunSet Decor",
      "www.sunsetdecor.com",
      "Contemporary lighting and decor for modern spaces",
    ),
  ],
};

const documentationEvaluations: Record<string, { general: DocumentUpload[]; brands: BrandDocumentRow[] }> = {
  "seller-012": {
    general: [
      {
        id: "address-proof",
        label: "Address proof",
        instruction: "Upload a valid proof of business address.",
        fileName: "Address proof.pdf",
        fileSize: "1.3 MB",
        validationStatus: "valid",
        summary: "Business address matches the address in application.",
        source: "D&B + Application",
        checkedOn: CHECKED,
      },
      {
        id: "duns-cert",
        label: "DUNS certificate",
        instruction: "Upload a DUNS registration certificate.",
        fileName: "DUNS certificate.pdf",
        fileSize: "1.1 MB",
        validationStatus: "valid",
        summary: "DUNS number is active and matches with the business.",
        source: "D&B",
        checkedOn: CHECKED,
      },
    ],
    brands: [
      {
        id: "brand-1",
        name: "Brand 1",
        brandRole: "Original manufacturer",
        documentName: "Brand 1.pdf",
        validationStatus: "valid",
        summary: "Authorization Letter is valid and matches the brand owner information.",
        source: "Brand 1.pdf + Application",
        checkedOn: CHECKED,
      },
      {
        id: "brand-2",
        name: "Brand 2",
        brandRole: "Original manufacturer",
        documentName: "Brand 2.pdf",
        validationStatus: "valid",
        summary: "Authorization Letter is valid and matches the brand owner information.",
        source: "Brand 2.pdf + Application",
        checkedOn: CHECKED,
      },
      {
        id: "brand-3",
        name: "Brand 3",
        brandRole: "Original manufacturer",
        documentName: "Brand 3.pdf",
        validationStatus: "invalid",
        summary: "Authorization period for Brand 3 is missing.",
        source: "Brand 3.pdf + Application",
        checkedOn: CHECKED,
        agentRecommendation: {
          title: "Brand 3 Information Missing",
          message: "The authorization period is missing for Brand 3.",
          suggestedComment:
            "Please update Brand 3 authorization letter to include a valid authorization period.",
        },
      },
      {
        id: "brand-4",
        name: "Brand 4",
        brandRole: "Reseller",
        documentName: "Brand 4.pdf",
        validationStatus: "valid",
        summary: "Authorization Letter is valid and matches the brand owner information.",
        source: "Brand 4.pdf + Application",
        checkedOn: CHECKED,
      },
      {
        id: "brand-5",
        name: "Brand 5",
        brandRole: "Reseller",
        documentName: "Brand 5.pdf",
        validationStatus: "valid",
        summary: "Authorization Letter is valid and matches the brand owner information.",
        source: "Brand 5.pdf + Application",
        checkedOn: CHECKED,
      },
    ],
  },
  "p-k-o2": {
    general: [
      {
        id: "w9",
        label: "W9 form",
        instruction: "Upload a completed W9 tax form.",
        fileName: "Pinnacle Goods W9.pdf",
        fileSize: "0.9 MB",
        validationStatus: "valid",
        summary: "W9 form is complete and matches the legal business name.",
        source: "IRS W9 validation",
        checkedOn: CHECKED,
      },
    ],
    brands: [],
  },
  "p-f-o2": {
    general: [
      {
        id: "address-proof",
        label: "Address proof",
        instruction: "Upload a valid proof of business address.",
        fileName: "Address proof.pdf",
        fileSize: "1.3 MB",
        validationStatus: "valid",
        summary: "Business address matches the address in application.",
        source: "D&B + Application",
        checkedOn: CHECKED,
      },
      {
        id: "duns-cert",
        label: "DUNS certificate",
        instruction: "Upload a DUNS registration certificate.",
        fileName: "DUNS certificate.pdf",
        fileSize: "1.1 MB",
        validationStatus: "valid",
        summary: "DUNS number is active and matches with the business.",
        source: "D&B",
        checkedOn: CHECKED,
      },
    ],
    brands: [
      {
        id: "brand-1",
        name: "Oasis Living",
        brandRole: "Original manufacturer",
        documentName: "Oasis Living.pdf",
        validationStatus: "valid",
        summary: "Authorization Letter is valid and matches the brand owner information.",
        source: "Oasis Living.pdf + Application",
        checkedOn: CHECKED,
      },
      {
        id: "brand-2",
        name: "Oasis Outdoor",
        brandRole: "Original manufacturer",
        documentName: "Oasis Outdoor.pdf",
        validationStatus: "valid",
        summary: "Authorization Letter is valid and matches the brand owner information.",
        source: "Oasis Outdoor.pdf + Application",
        checkedOn: CHECKED,
      },
      {
        id: "brand-3",
        name: "Oasis Home",
        brandRole: "Original manufacturer",
        documentName: "Oasis Home.pdf",
        validationStatus: "invalid",
        summary: "Authorization period for Oasis Home is missing.",
        source: "Oasis Home.pdf + Application",
        checkedOn: CHECKED,
        agentRecommendation: {
          title: "Oasis Home Information Missing",
          message: "The authorization period is missing for Oasis Home.",
          suggestedComment:
            "Please update Oasis Home authorization letter to include a valid authorization period.",
        },
      },
      {
        id: "brand-4",
        name: "Oasis Rugs",
        brandRole: "Reseller",
        documentName: "Oasis Rugs.pdf",
        validationStatus: "valid",
        summary: "Authorization Letter is valid and matches the brand owner information.",
        source: "Oasis Rugs.pdf + Application",
        checkedOn: CHECKED,
      },
    ],
  },
};

export const sectionEvaluations: Record<string, OnboardingSectionEvaluation> = {
  "seller-012-profile": {
    sectionId: "profile",
    sellerId: "seller-012",
    title: "Profile information",
    subtitle: "Provide your business related information",
    progress: 70,
  },
  "seller-012-documentation": {
    sectionId: "documentation",
    sellerId: "seller-012",
    title: "Documentation",
    subtitle: "Provide your business related information",
    progress: 50,
  },
  "seller-004-profile": {
    sectionId: "profile",
    sellerId: "seller-004",
    title: "Profile information",
    subtitle: "Provide your business related information",
    progress: 86,
  },
  "p-k-o2-profile": {
    sectionId: "profile",
    sellerId: "p-k-o2",
    title: "Profile information",
    subtitle: "Provide your business related information",
    progress: 86,
  },
  "p-k-o2-documentation": {
    sectionId: "documentation",
    sellerId: "p-k-o2",
    title: "Documentation",
    subtitle: "Provide your business related information",
    progress: 50,
  },
  "p-f-o2-profile": {
    sectionId: "profile",
    sellerId: "p-f-o2",
    title: "Profile information",
    subtitle: "Provide your business related information",
    progress: 100,
  },
  "p-f-o2-documentation": {
    sectionId: "documentation",
    sellerId: "p-f-o2",
    title: "Documentation",
    subtitle: "Provide your business related information",
    progress: 50,
  },
  "p-l-o3-profile": {
    sectionId: "profile",
    sellerId: "p-l-o3",
    title: "Profile information",
    subtitle: "Provide your business related information",
    progress: 43,
  },
};

export function getProfileTaskEvaluations(sellerId: string): OnboardingTaskEvaluation[] {
  return profileEvaluations[sellerId] ?? [];
}

export function getDocumentationEvaluation(sellerId: string) {
  return documentationEvaluations[sellerId];
}

export function getSectionEvaluation(sellerId: string, sectionId: string): OnboardingSectionEvaluation | undefined {
  return sectionEvaluations[`${sellerId}-${sectionId}`];
}

export function getReviewableEvaluations(sellerId: string): OnboardingTaskEvaluation[] {
  const profile = getProfileTaskEvaluations(sellerId).filter((e) => e.reviewable);
  const docs = getDocumentationEvaluation(sellerId);
  const docTasks: OnboardingTaskEvaluation[] = [];

  if (docs) {
    for (const doc of docs.general) {
      docTasks.push({
        taskId: `doc-${doc.id}`,
        sellerId,
        sectionId: "documentation",
        title: doc.label,
        reviewable: true,
        autoValidated: true,
        validationStatus: doc.validationStatus,
        summary: doc.summary,
        source: doc.source,
        checkedOn: doc.checkedOn,
        fields: [],
      });
    }
    for (const brand of docs.brands) {
      docTasks.push({
        taskId: `brand-${brand.id}`,
        sellerId,
        sectionId: "documentation",
        title: brand.name,
        reviewable: true,
        autoValidated: true,
        validationStatus: brand.validationStatus,
        summary: brand.summary,
        source: brand.source,
        checkedOn: brand.checkedOn,
        agentRecommendation: brand.agentRecommendation,
        fields: [],
      });
    }
  }

  return [...profile, ...docTasks];
}

export function getOnboardingTasksForPanel(sellerId: string) {
  return getReviewableEvaluations(sellerId)
    .filter((e) => e.validationStatus === "invalid" || e.validationStatus === "partial")
    .map((e) => ({
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
    }));
}

export function getOnboardingInsightsForPanel(sellerId: string) {
  return getReviewableEvaluations(sellerId)
    .filter((e) => e.validationStatus === "valid")
    .map((e) => ({
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
    }));
}

export function getFieldInsightsForTask(sellerId: string, taskId: string): OnboardingFieldValidation[] {
  const task = getProfileTaskEvaluations(sellerId).find((t) => t.taskId === taskId);
  return task?.fields.filter((f) => f.status === "valid") ?? [];
}

export function getFieldInsightsForPanel(sellerId: string, taskId: string) {
  const fields = getFieldInsightsForTask(sellerId, taskId);
  return fields.map((f) => ({
    id: `field-${f.id}`,
    title: f.label,
    description: f.detail,
    actionLabel: "Approve",
    actionType: "approve_onboarding" as const,
    validationStatus: f.status as "valid",
    source: f.source,
    checkedOn: f.checkedOn,
    sectionId: "profile",
    reviewTaskId: `${f.id}-${taskId}`,
  }));
}

export function getTaskEvaluation(sellerId: string, taskId: string): OnboardingTaskEvaluation | undefined {
  const direct = getReviewableEvaluations(sellerId).find((e) => e.taskId === taskId);
  return direct;
}
