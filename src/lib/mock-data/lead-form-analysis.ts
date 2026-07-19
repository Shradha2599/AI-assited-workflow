import { getLeadFormByPartnerId } from "@/lib/mock-data/lead-forms";
import { getPotentialPartnerById } from "@/lib/mock-data/potential-partners";

export type ValidationStatus = "valid" | "invalid" | "partial" | "unverified";

export interface FieldValidation {
  label: string;
  submittedValue: string;
  status: ValidationStatus;
  source: string;
  detail: string;
}

export interface SectionValidation {
  id: string;
  title: string;
  status: ValidationStatus;
  fields: FieldValidation[];
  checkedOn: string;
}

export interface MarketplaceValidation {
  name: string;
  skus?: number;
  rating?: number;
  status: ValidationStatus;
  source: string;
  detail: string;
}

export interface LeadFormAnalysis {
  partnerId: string;
  recommendationTitle: string;
  summary: string;
  confidenceScore: number;
  recommendation: "accept" | "reject" | "future_interest";
  checkedOn: string;
  strengths: string[];
  risks: string[];
  sections: SectionValidation[];
  marketplaces: MarketplaceValidation[];
  businessInfo?: {
    partnerType: string;
    website: string;
    address: string;
    founded: string;
  };
  socialPlatforms?: { platform: string; posts: number; followers: number }[];
  legalRisks?: { label: string; status: ValidationStatus; detail: string }[];
  rating?: number;
}

function statusLabel(status: ValidationStatus): string {
  if (status === "valid") return "Valid";
  if (status === "invalid") return "Invalid";
  if (status === "partial") return "Partial";
  return "Unverified";
}

export { statusLabel };

export const leadFormAnalyses: Record<string, LeadFormAnalysis> = {
  "pp-001": {
    partnerId: "pp-001",
    recommendationTitle: "Review Cheery Oak",
    summary:
      "New application with credible business identity and address match. Assortment depth is limited and marketplace footprint is still emerging.",
    confidenceScore: 8.6,
    recommendation: "accept",
    checkedOn: "Jan 14, 2026",
    strengths: [
      "Business registry and website domain match submitted legal name",
      "Contact email domain aligns with official website",
      "W9 document format validated",
    ],
    risks: [
      "Limited third-party marketplace history",
      "Assortment file contains fewer SKUs than category benchmark",
    ],
    sections: [
      {
        id: "business-identity",
        title: "Business Identity",
        status: "valid",
        checkedOn: "Jan 14, 2026",
        fields: [
          { label: "EIN", submittedValue: "XX-4412091", status: "valid", source: "IRS Business Registry", detail: "Tax ID format valid and active" },
          { label: "DUNS", submittedValue: "441209187", status: "valid", source: "D&B Database", detail: "DUNS record matches legal business name" },
          { label: "Business name", submittedValue: "Cheery Oak", status: "valid", source: "Secretary of State", detail: "Registered entity found in Oregon" },
          { label: "Website", submittedValue: "www.cheeryoak.com", status: "valid", source: "WHOIS + SSL Labs", detail: "Domain active and SSL secured" },
          { label: "Business type", submittedValue: "Brand", status: "valid", source: "Business Registry", detail: "Listed as retail brand operator" },
        ],
      },
      {
        id: "business-address",
        title: "Business Address",
        status: "valid",
        checkedOn: "Jan 14, 2026",
        fields: [
          { label: "Address line 1", submittedValue: "220 Oak Lane", status: "valid", source: "USPS Address Validation", detail: "Deliverable commercial address" },
          { label: "City / State / Zip", submittedValue: "Portland, OR 97201", status: "valid", source: "Business Registry", detail: "Matches registered headquarters" },
        ],
      },
      {
        id: "point-of-contact",
        title: "Point of Contact",
        status: "valid",
        checkedOn: "Jan 14, 2026",
        fields: [
          { label: "Name", submittedValue: "Emily Hart", status: "valid", source: "LinkedIn", detail: "Listed as founder on company profile" },
          { label: "Email", submittedValue: "emily@cheeryoak.com", status: "valid", source: "Domain MX Check", detail: "Email domain matches website" },
          { label: "Phone", submittedValue: "+1 (503) 555-0182", status: "partial", source: "Phone Registry", detail: "Area code matches Portland region" },
        ],
      },
      {
        id: "integration",
        title: "Integration Partner and Marketplace Details",
        status: "valid",
        checkedOn: "Jan 14, 2026",
        fields: [
          { label: "Channel partner", submittedValue: "None", status: "valid", source: "Application Review", detail: "No conflicting integration partner on file" },
          { label: "Referral source", submittedValue: "Target Plus Outreach", status: "valid", source: "CRM History", detail: "Matches outreach campaign record" },
        ],
      },
      {
        id: "assortment",
        title: "Assortment",
        status: "partial",
        checkedOn: "Jan 14, 2026",
        fields: [
          { label: "Assortment file", submittedValue: "CheeryOak_Assortment.xlsx", status: "partial", source: "Assortment Parser", detail: "File readable; 42 SKUs below category minimum threshold" },
        ],
      },
      {
        id: "w9",
        title: "W9 Form",
        status: "valid",
        checkedOn: "Jan 14, 2026",
        fields: [
          { label: "W9 document", submittedValue: "W9_CheeryOak.pdf", status: "valid", source: "AI OCR Validation", detail: "Legal name and EIN match submitted application" },
        ],
      },
      {
        id: "linked-profiles",
        title: "Linked Profiles",
        status: "valid",
        checkedOn: "Jan 14, 2026",
        fields: [
          { label: "Instagram", submittedValue: "instagram.com/cheeryoak", status: "valid", source: "Social Signals", detail: "Active account with 28K followers" },
          { label: "Facebook", submittedValue: "facebook.com/cheeryoak", status: "valid", source: "Social Signals", detail: "Business page verified" },
        ],
      },
      {
        id: "contract-terms",
        title: "Contract Terms",
        status: "valid",
        checkedOn: "Jan 14, 2026",
        fields: [
          { label: "Contract acceptance", submittedValue: "Accepted", status: "valid", source: "Application Audit Log", detail: "Terms accepted at submission" },
        ],
      },
    ],
    marketplaces: [
      { name: "Amazon", status: "partial", source: "Amazon Catalog API", detail: "Limited catalog footprint detected" },
    ],
  },
  "pp-005": {
    partnerId: "pp-005",
    recommendationTitle: "Approve Green Co",
    summary:
      "Strong category fit for Lighting with verified business identity, credible marketplace presence, and consistent contact details across public sources.",
    confidenceScore: 9.1,
    recommendation: "accept",
    checkedOn: "Jan 25, 2026",
    strengths: [
      "Multi-marketplace presence on Amazon and Walmart",
      "Business registry and website fully verified",
      "Assortment file aligns with planned item types",
    ],
    risks: ["Seasonal revenue concentration in Q4 lighting demand"],
    sections: [
      {
        id: "business-identity",
        title: "Business Identity",
        status: "valid",
        checkedOn: "Jan 25, 2026",
        fields: [
          { label: "EIN", submittedValue: "XX-9876543", status: "valid", source: "IRS Business Registry", detail: "Active tax ID on file" },
          { label: "DUNS", submittedValue: "987654321", status: "valid", source: "D&B Database", detail: "DUNS matches Green Co LLC" },
          { label: "Business name", submittedValue: "Green Co", status: "valid", source: "Secretary of State", detail: "Registered manufacturer in Texas" },
          { label: "Website", submittedValue: "www.greenco.com", status: "valid", source: "WHOIS + SSL Labs", detail: "Domain active and secured" },
          { label: "Business type", submittedValue: "Manufacturer", status: "valid", source: "Business Registry", detail: "Manufacturer classification confirmed" },
        ],
      },
      {
        id: "business-address",
        title: "Business Address",
        status: "valid",
        checkedOn: "Jan 25, 2026",
        fields: [
          { label: "Address line 1", submittedValue: "789 Green Street", status: "valid", source: "USPS Address Validation", detail: "Deliverable address confirmed" },
          { label: "City / State / Zip", submittedValue: "Austin, TX 78701", status: "valid", source: "Business Registry", detail: "Matches registered location" },
        ],
      },
      {
        id: "point-of-contact",
        title: "Point of Contact",
        status: "valid",
        checkedOn: "Jan 25, 2026",
        fields: [
          { label: "Name", submittedValue: "John Matthews", status: "valid", source: "LinkedIn", detail: "Operations lead listed on company page" },
          { label: "Email", submittedValue: "john@greenco.com", status: "valid", source: "Domain MX Check", detail: "Corporate email domain verified" },
          { label: "Phone", submittedValue: "+1 (313) 555-0142", status: "valid", source: "Phone Registry", detail: "Business line active" },
        ],
      },
      {
        id: "integration",
        title: "Integration Partner and Marketplace Details",
        status: "valid",
        checkedOn: "Jan 25, 2026",
        fields: [
          { label: "Channel partner", submittedValue: "None", status: "valid", source: "Application Review", detail: "Direct integration path available" },
          { label: "Referral source", submittedValue: "Target Plus Outreach", detail: "Matches acquisition campaign", status: "valid", source: "CRM History" },
        ],
      },
      {
        id: "assortment",
        title: "Assortment",
        status: "valid",
        checkedOn: "Jan 25, 2026",
        fields: [
          { label: "Assortment file", submittedValue: "GreenCo_Assortment.xlsx", status: "valid", source: "Assortment Parser", detail: "128 SKUs mapped to Lighting plan" },
        ],
      },
      {
        id: "w9",
        title: "W9 Form",
        status: "valid",
        checkedOn: "Jan 25, 2026",
        fields: [
          { label: "W9 document", submittedValue: "W9_GreenCo.pdf", status: "valid", source: "AI OCR Validation", detail: "All required fields present and signed" },
        ],
      },
      {
        id: "linked-profiles",
        title: "Linked Profiles",
        status: "valid",
        checkedOn: "Jan 25, 2026",
        fields: [
          { label: "Instagram", submittedValue: "instagram.com/greenco", status: "valid", source: "Social Signals", detail: "45K followers, active posting" },
          { label: "Facebook", submittedValue: "facebook.com/greenco", status: "valid", source: "Social Signals", detail: "Verified business page" },
        ],
      },
      {
        id: "contract-terms",
        title: "Contract Terms",
        status: "valid",
        checkedOn: "Jan 25, 2026",
        fields: [
          { label: "Contract acceptance", submittedValue: "Accepted", status: "valid", source: "Application Audit Log", detail: "Terms accepted at submission" },
        ],
      },
    ],
    marketplaces: [
      { name: "Amazon", skus: 1200, rating: 4.4, status: "valid", source: "Amazon Catalog API", detail: "Active seller with strong ratings" },
      { name: "Walmart", skus: 850, rating: 4.2, status: "valid", source: "Walmart Marketplace API", detail: "Verified marketplace presence" },
    ],
  },
  "pp-006": {
    partnerId: "pp-006",
    recommendationTitle: "Reject Thunder Brewing",
    summary:
      "Low marketplace ratings, operational risk indicators, and recurring customer experience concerns reduce confidence despite strong seasonal assortment depth.",
    confidenceScore: 7.4,
    recommendation: "reject",
    checkedOn: "Jan 9, 2026",
    strengths: [
      "Business identity and address verified against public records",
      "Strong seasonal catalog depth in submitted assortment file",
    ],
    risks: [
      "Amazon rating below Target Plus threshold",
      "Single-marketplace dependency",
      "Customer complaint trend flagged in review signals",
    ],
    sections: [
      {
        id: "business-identity",
        title: "Business Identity",
        status: "valid",
        checkedOn: "Jan 9, 2026",
        fields: [
          { label: "EIN", submittedValue: "XX-7733102", status: "valid", source: "IRS Business Registry", detail: "Active tax ID" },
          { label: "DUNS", submittedValue: "773310245", status: "valid", source: "D&B Database", detail: "DUNS matches legal entity" },
          { label: "Business name", submittedValue: "Thunder Brewing", status: "valid", source: "Secretary of State", detail: "Registered in Illinois" },
          { label: "Website", submittedValue: "www.thunderbrewing.com", status: "valid", source: "WHOIS + SSL Labs", detail: "Domain active" },
          { label: "Business type", submittedValue: "Brand", status: "valid", source: "Business Registry", detail: "Brand operator confirmed" },
        ],
      },
      {
        id: "business-address",
        title: "Business Address",
        status: "valid",
        checkedOn: "Jan 9, 2026",
        fields: [
          { label: "Address line 1", submittedValue: "88 Festival Row", status: "valid", source: "USPS Address Validation", detail: "Deliverable address" },
          { label: "City / State / Zip", submittedValue: "Chicago, IL 60601", status: "valid", source: "Business Registry", detail: "Registered headquarters match" },
        ],
      },
      {
        id: "point-of-contact",
        title: "Point of Contact",
        status: "valid",
        checkedOn: "Jan 9, 2026",
        fields: [
          { label: "Name", submittedValue: "Marcus Lee", status: "valid", source: "LinkedIn", detail: "Founder profile found" },
          { label: "Email", submittedValue: "marcus@thunderbrewing.com", status: "valid", source: "Domain MX Check", detail: "Email domain verified" },
          { label: "Phone", submittedValue: "+1 (312) 555-0166", status: "partial", source: "Phone Registry", detail: "Mobile number; business line not confirmed" },
        ],
      },
      {
        id: "integration",
        title: "Integration Partner and Marketplace Details",
        status: "valid",
        checkedOn: "Jan 9, 2026",
        fields: [
          { label: "Channel partner", submittedValue: "None", status: "valid", source: "Application Review", detail: "No channel conflict" },
          { label: "Referral source", submittedValue: "Target Plus Outreach", status: "valid", source: "CRM History", detail: "Outreach record confirmed" },
        ],
      },
      {
        id: "assortment",
        title: "Assortment",
        status: "valid",
        checkedOn: "Jan 9, 2026",
        fields: [
          { label: "Assortment file", submittedValue: "Thunder_Assortment.xlsx", status: "valid", source: "Assortment Parser", detail: "Seasonal catalog depth validated" },
        ],
      },
      {
        id: "w9",
        title: "W9 Form",
        status: "valid",
        checkedOn: "Jan 9, 2026",
        fields: [
          { label: "W9 document", submittedValue: "W9_Thunder.pdf", status: "valid", source: "AI OCR Validation", detail: "Document complete and signed" },
        ],
      },
      {
        id: "linked-profiles",
        title: "Linked Profiles",
        status: "partial",
        checkedOn: "Jan 9, 2026",
        fields: [
          { label: "Instagram", submittedValue: "instagram.com/thunderbrewing", status: "partial", source: "Social Signals", detail: "Account active but engagement below benchmark" },
        ],
      },
      {
        id: "contract-terms",
        title: "Contract Terms",
        status: "valid",
        checkedOn: "Jan 9, 2026",
        fields: [
          { label: "Contract acceptance", submittedValue: "Accepted", status: "valid", source: "Application Audit Log", detail: "Terms accepted at submission" },
        ],
      },
    ],
    marketplaces: [
      { name: "Amazon", skus: 540, rating: 4.1, status: "invalid", source: "Amazon Catalog API", detail: "Rating below 4.2 threshold; elevated return mentions" },
    ],
  },
  "pp-007": {
    partnerId: "pp-007",
    recommendationTitle: "Future Interest — Hometown Living",
    summary:
      "Credible business profile with verified identity, but current assortment timing and category priority do not align with active acquisition plans.",
    confidenceScore: 7.9,
    recommendation: "future_interest",
    checkedOn: "Jan 8, 2026",
    strengths: [
      "Verified business registry and website",
      "Clean W9 and contact validation",
    ],
    risks: [
      "Furniture category not in current assortment priority window",
      "Limited marketplace diversification",
    ],
    sections: [
      {
        id: "business-identity",
        title: "Business Identity",
        status: "valid",
        checkedOn: "Jan 8, 2026",
        fields: [
          { label: "EIN", submittedValue: "XX-9021144", status: "valid", source: "IRS Business Registry", detail: "Active tax ID" },
          { label: "DUNS", submittedValue: "902114488", status: "valid", source: "D&B Database", detail: "DUNS verified" },
          { label: "Business name", submittedValue: "Hometown Living", status: "valid", source: "Secretary of State", detail: "Registered in Wisconsin" },
          { label: "Website", submittedValue: "www.hometownliving.com", status: "valid", source: "WHOIS + SSL Labs", detail: "Domain active and secured" },
          { label: "Business type", submittedValue: "Manufacturer", status: "valid", source: "Business Registry", detail: "Manufacturer status confirmed" },
        ],
      },
      {
        id: "business-address",
        title: "Business Address",
        status: "valid",
        checkedOn: "Jan 8, 2026",
        fields: [
          { label: "Address line 1", submittedValue: "15 Main Street", status: "valid", source: "USPS Address Validation", detail: "Deliverable address" },
          { label: "City / State / Zip", submittedValue: "Madison, WI 53703", status: "valid", source: "Business Registry", detail: "Headquarters match" },
        ],
      },
      {
        id: "point-of-contact",
        title: "Point of Contact",
        status: "valid",
        checkedOn: "Jan 8, 2026",
        fields: [
          { label: "Name", submittedValue: "Laura Kim", status: "valid", source: "LinkedIn", detail: "Owner profile verified" },
          { label: "Email", submittedValue: "laura@hometownliving.com", status: "valid", source: "Domain MX Check", detail: "Corporate email verified" },
          { label: "Phone", submittedValue: "+1 (608) 555-0133", status: "valid", source: "Phone Registry", detail: "Business line active" },
        ],
      },
      {
        id: "integration",
        title: "Integration Partner and Marketplace Details",
        status: "valid",
        checkedOn: "Jan 8, 2026",
        fields: [
          { label: "Channel partner", submittedValue: "Shopify", status: "valid", source: "Shopify Partner API", detail: "Active Shopify storefront confirmed" },
          { label: "Referral source", submittedValue: "Industry Event", status: "valid", source: "CRM History", detail: "Event lead source logged" },
        ],
      },
      {
        id: "assortment",
        title: "Assortment",
        status: "partial",
        checkedOn: "Jan 8, 2026",
        fields: [
          { label: "Assortment file", submittedValue: "Hometown_Assortment.xlsx", status: "partial", source: "Assortment Parser", detail: "Valid file but category outside current plan" },
        ],
      },
      {
        id: "w9",
        title: "W9 Form",
        status: "valid",
        checkedOn: "Jan 8, 2026",
        fields: [
          { label: "W9 document", submittedValue: "W9_Hometown.pdf", status: "valid", source: "AI OCR Validation", detail: "Document validated" },
        ],
      },
      {
        id: "linked-profiles",
        title: "Linked Profiles",
        status: "valid",
        checkedOn: "Jan 8, 2026",
        fields: [
          { label: "Instagram", submittedValue: "instagram.com/hometownliving", status: "valid", source: "Social Signals", detail: "22K followers" },
          { label: "Pinterest", submittedValue: "pinterest.com/hometownliving", status: "valid", source: "Social Signals", detail: "Active catalog pins" },
        ],
      },
      {
        id: "contract-terms",
        title: "Contract Terms",
        status: "valid",
        checkedOn: "Jan 8, 2026",
        fields: [
          { label: "Contract acceptance", submittedValue: "Accepted", status: "valid", source: "Application Audit Log", detail: "Terms accepted at submission" },
        ],
      },
    ],
    marketplaces: [
      { name: "Amazon", skus: 180, rating: 4.0, status: "partial", source: "Amazon Catalog API", detail: "Limited catalog; acceptable but not compelling" },
    ],
  },
};

export function getLeadFormAnalysis(partnerId: string): LeadFormAnalysis | undefined {
  if (leadFormAnalyses[partnerId]) return leadFormAnalyses[partnerId];
  return buildDefaultLeadFormAnalysis(partnerId);
}

function buildDefaultLeadFormAnalysis(partnerId: string): LeadFormAnalysis | undefined {
  const partner = getPotentialPartnerById(partnerId);
  const form = getLeadFormByPartnerId(partnerId);
  if (!partner || !form) return undefined;

  const recommendation =
    partner.confidenceScore >= 8.5
      ? "accept"
      : partner.confidenceScore >= 7
        ? "future_interest"
        : "reject";

  const recommendationTitle =
    recommendation === "accept"
      ? `Approve ${partner.legalBusinessName}`
      : recommendation === "reject"
        ? `Reject ${partner.legalBusinessName}`
        : `Future Interest — ${partner.legalBusinessName}`;

  return {
    partnerId,
    recommendationTitle,
    summary: `${partner.legalBusinessName} shows a ${partner.confidenceScore.toFixed(1)}/10 confidence score with validated business identity, marketplace presence, and lead form data.`,
    confidenceScore: partner.confidenceScore,
    recommendation,
    checkedOn: partner.createdOn.replace("Jan ", "Jan ").replace(", 2026", ", 2026"),
    strengths: [
      "Business registry and submitted identity fields align",
      "Marketplace footprint supports category expansion",
      "Lead form documentation passes automated validation",
    ],
    risks:
      recommendation === "reject"
        ? ["Operational readiness gaps identified", "Assortment depth below category benchmark"]
        : recommendation === "future_interest"
          ? ["Timing does not align with active category priorities"]
          : ["Limited third-party review volume on newer SKUs"],
    sections: form
      ? [
          {
            id: "business-identity",
            title: "Business Identity",
            status: "valid",
            checkedOn: partner.createdOn,
            fields: [
              { label: "EIN", submittedValue: form.businessIdentity.ein, status: "valid", source: "IRS Business Registry", detail: "Tax ID format valid and active" },
              { label: "DUNS", submittedValue: form.businessIdentity.duns, status: "valid", source: "D&B Database", detail: "DUNS record matches legal business name" },
            ],
          },
        ]
      : [],
    marketplaces: [
      { name: "Amazon", skus: partner.skus, rating: 4.1, status: "valid", source: "Amazon Catalog API", detail: "Active seller account with consistent ratings" },
      { name: "Walmart", skus: Math.round(partner.skus * 0.6), rating: 3.9, status: "partial", source: "Walmart Marketplace API", detail: "Catalog present with moderate review volume" },
    ],
    businessInfo: {
      partnerType: form.businessIdentity.businessType,
      website: form.businessIdentity.website,
      address: `${form.businessAddress.line1}, ${form.businessAddress.city}, ${form.businessAddress.state} ${form.businessAddress.zip}`,
      founded: "2010",
    },
    socialPlatforms: form.linkedProfiles.map((profile, index) => ({
      platform: profile.platform,
      posts: 120 + index * 45,
      followers: 2400 + index * 1800,
    })),
    legalRisks: [
      { label: "Legal Issues", status: "valid", detail: "No evidence of active lawsuits or regulatory actions found." },
      { label: "Negative Press/PR", status: "valid", detail: "No negative news coverage identified in the last 24 months." },
      { label: "Customer Feedback", status: "valid", detail: "Customer service rankings are stable across marketplaces." },
    ],
    rating: 3.8 + (partner.confidenceScore % 10) * 0.05,
  };
}

const RECOMMENDATION_TASK_HINT: Record<LeadFormAnalysis["recommendation"], string> = {
  accept: "Beacon recommends accepting this lead and moving the partner into onboarding.",
  reject: "Beacon recommends rejecting this lead based on validation and risk signals.",
  future_interest: "Beacon recommends marking this partner as future interest for later review.",
};

const LEAD_DECISION_ACTION: Record<
  LeadFormAnalysis["recommendation"],
  { label: string; decision: "accept" | "reject" | "future_interest" }
> = {
  accept: { label: "Approve Lead →", decision: "accept" },
  reject: { label: "Reject Lead →", decision: "reject" },
  future_interest: { label: "Mark Future Interest →", decision: "future_interest" },
};

export function getLeadFormTasksFromAnalysis(analysis: LeadFormAnalysis) {
  const decisionAction = LEAD_DECISION_ACTION[analysis.recommendation];
  return [
    {
      id: `insight-${analysis.partnerId}`,
      title: analysis.recommendationTitle,
      description: `${RECOMMENDATION_TASK_HINT[analysis.recommendation]} ${analysis.summary} Checked on ${analysis.checkedOn}.`,
      actionLabel: "View Analysis →",
      actionType: "open_analysis" as const,
      secondaryActionLabel: decisionAction.label,
      leadDecision: decisionAction.decision,
      partnerId: analysis.partnerId,
      score: analysis.confidenceScore,
    },
  ];
}
