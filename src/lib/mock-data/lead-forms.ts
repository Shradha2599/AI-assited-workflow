import {
  getPotentialPartnerById,
  showsLeadForm,
  type PotentialPartner,
} from "@/lib/mock-data/potential-partners";

export interface LeadFormData {
  partnerId: string;
  businessIdentity: {
    ein: string;
    duns: string;
    businessName: string;
    website: string;
    businessType: string;
  };
  businessAddress: {
    line1: string;
    city: string;
    state: string;
    zip: string;
  };
  pointOfContact: {
    name: string;
    email: string;
    phone: string;
  };
  integration: {
    channelPartner: string;
    referralSource: string;
  };
  assortmentFile: { name: string; size: string };
  w9File: { name: string; size: string };
  linkedProfiles: { platform: string; url: string }[];
  contractAccepted: boolean;
  insight: {
    title: string;
    score: number;
    summary: string;
    checkedOn: string;
    recommendation: "reject" | "approve" | "future_interest";
  };
}

export const leadForms: Record<string, LeadFormData> = {
  "pp-001": {
    partnerId: "pp-001",
    businessIdentity: {
      ein: "84-3928104",
      duns: "441209187",
      businessName: "Cheery Oak",
      website: "www.cheeryoak.com",
      businessType: "Brand",
    },
    businessAddress: {
      line1: "220 Oak Lane",
      city: "Portland",
      state: "OR",
      zip: "97201",
    },
    pointOfContact: {
      name: "Emily Hart",
      email: "emily@cheeryoak.com",
      phone: "+1 (503) 555-0182",
    },
    integration: {
      channelPartner: "None",
      referralSource: "Target Plus Outreach",
    },
    assortmentFile: { name: "Assortment.xlsx", size: "1.2 MB" },
    w9File: { name: "W9 form.pdf", size: "1.1 MB" },
    linkedProfiles: [
      { platform: "Instagram", url: "https://instagram.com/cheeryoak" },
      { platform: "LinkedIn", url: "https://linkedin.com/company/cheeryoak" },
      { platform: "TikTok", url: "https://tiktok.com/@cheeryoak" },
    ],
    contractAccepted: true,
    insight: {
      title: "Review Cheery Oak",
      score: 8.6,
      summary:
        "New application submitted. Strong home decor alignment but limited marketplace footprint to date.",
      checkedOn: "Jan 14, 2026",
      recommendation: "approve",
    },
  },
  "pp-005": {
    partnerId: "pp-005",
    businessIdentity: {
      ein: "27-4189653",
      duns: "987654321",
      businessName: "Green Co",
      website: "www.greenco.com",
      businessType: "Manufacturer",
    },
    businessAddress: {
      line1: "789 Green Street",
      city: "Austin",
      state: "TX",
      zip: "78701",
    },
    pointOfContact: {
      name: "John Matthews",
      email: "john@greenco.com",
      phone: "+1 (313) 555-0142",
    },
    integration: {
      channelPartner: "None",
      referralSource: "Target Plus Outreach",
    },
    assortmentFile: { name: "GreenCo_Assortment.xlsx", size: "1.8 MB" },
    w9File: { name: "W9_GreenCo.pdf", size: "1.0 MB" },
    linkedProfiles: [
      { platform: "Instagram", url: "https://instagram.com/greenco" },
      { platform: "Facebook", url: "https://facebook.com/greenco" },
    ],
    contractAccepted: true,
    insight: {
      title: "Review Green Co",
      score: 9.1,
      summary:
        "Strong category fit for Lighting with sustainable product positioning and verified marketplace data.",
      checkedOn: "Jan 25, 2026",
      recommendation: "approve",
    },
  },
  "pp-006": {
    partnerId: "pp-006",
    businessIdentity: {
      ein: "36-7724108",
      duns: "773310245",
      businessName: "Thunder Brewing",
      website: "www.thunderbrewing.com",
      businessType: "Brand",
    },
    businessAddress: {
      line1: "88 Festival Row",
      city: "Chicago",
      state: "IL",
      zip: "60601",
    },
    pointOfContact: {
      name: "Marcus Lee",
      email: "marcus@thunderbrewing.com",
      phone: "+1 (312) 555-0166",
    },
    integration: {
      channelPartner: "None",
      referralSource: "Target Plus Outreach",
    },
    assortmentFile: { name: "Thunder_Assortment.xlsx", size: "1.4 MB" },
    w9File: { name: "W9_Thunder.pdf", size: "1.1 MB" },
    linkedProfiles: [{ platform: "Instagram", url: "https://instagram.com/thunderbrewing" }],
    contractAccepted: true,
    insight: {
      title: "Reject Thunder Brewing",
      score: 7.4,
      summary:
        "Seasonal assortment depth is strong, but fulfillment readiness and documentation gaps exceed risk tolerance.",
      checkedOn: "Jan 9, 2026",
      recommendation: "reject",
    },
  },
  "pp-007": {
    partnerId: "pp-007",
    businessIdentity: {
      ein: "41-9052186",
      duns: "902114488",
      businessName: "Hometown Living",
      website: "www.hometownliving.com",
      businessType: "Manufacturer",
    },
    businessAddress: {
      line1: "15 Main Street",
      city: "Madison",
      state: "WI",
      zip: "53703",
    },
    pointOfContact: {
      name: "Laura Kim",
      email: "laura@hometownliving.com",
      phone: "+1 (608) 555-0133",
    },
    integration: {
      channelPartner: "Shopify",
      referralSource: "Industry Event",
    },
    assortmentFile: { name: "Hometown_Assortment.xlsx", size: "760 KB" },
    w9File: { name: "W9_Hometown.pdf", size: "980 KB" },
    linkedProfiles: [
      { platform: "Instagram", url: "https://instagram.com/hometownliving" },
      { platform: "Pinterest", url: "https://pinterest.com/hometownliving" },
    ],
    contractAccepted: true,
    insight: {
      title: "Future Interest — Hometown Living",
      score: 7.9,
      summary:
        "Promising furniture assortment, but current timing does not align with active category priorities.",
      checkedOn: "Jan 8, 2026",
      recommendation: "future_interest",
    },
  },
};

function hashSeed(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (Math.imul(31, hash) + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function buildEin(partnerId: string): string {
  const seed = hashSeed(partnerId);
  const prefix = 10 + (seed % 89);
  const suffix = String(1000000 + (seed % 8999999)).padStart(7, "0");
  return `${prefix}-${suffix}`;
}

function buildDuns(partnerId: string): string {
  const seed = hashSeed(`${partnerId}-duns`);
  return String(100000000 + (seed % 899999999));
}

function buildPhone(partnerId: string): string {
  const seed = hashSeed(`${partnerId}-phone`);
  const area = 200 + (seed % 799);
  const mid = 200 + ((seed >> 4) % 799);
  const last = 1000 + ((seed >> 8) % 8999);
  return `+1 (${area}) ${mid}-${last}`;
}

const CONTACT_NAMES = [
  "Alex Rodman",
  "Emily Hart",
  "John Matthews",
  "Laura Kim",
  "Marcus Lee",
  "Sarah Chen",
  "David Park",
  "Rachel Torres",
];

const STREETS = [
  "21 Baker Street",
  "220 Oak Lane",
  "789 Green Street",
  "88 Festival Row",
  "15 Main Street",
  "1640 Riverside Drive",
  "450 Commerce Blvd",
];

const CITIES = [
  { city: "Boston", state: "MA", zip: "02108" },
  { city: "Portland", state: "OR", zip: "97201" },
  { city: "Austin", state: "TX", zip: "78701" },
  { city: "Chicago", state: "IL", zip: "60601" },
  { city: "Madison", state: "WI", zip: "53703" },
  { city: "Minneapolis", state: "MN", zip: "55401" },
  { city: "Denver", state: "CO", zip: "80202" },
];

const REFERRAL_SOURCES = [
  "1P Referral/DCP",
  "Target Plus Outreach",
  "Industry Event",
  "Partner Referral",
  "Trade Show",
];

function buildDefaultLeadForm(partner: PotentialPartner): LeadFormData {
  const seed = hashSeed(partner.id);
  const slug = partner.displayName.toLowerCase().replace(/[^a-z0-9]/g, "") || "partner";
  const location = CITIES[seed % CITIES.length];
  const contactName = CONTACT_NAMES[seed % CONTACT_NAMES.length];

  return {
    partnerId: partner.id,
    businessIdentity: {
      ein: buildEin(partner.id),
      duns: buildDuns(partner.id),
      businessName: partner.legalBusinessName,
      website: `www.${slug}.com`,
      businessType: seed % 2 === 0 ? "Manufacturer" : "Brand",
    },
    businessAddress: {
      line1: STREETS[seed % STREETS.length],
      city: location.city,
      state: location.state,
      zip: location.zip,
    },
    pointOfContact: {
      name: contactName,
      email: `${contactName.split(" ")[0].toLowerCase()}@${slug}.com`,
      phone: buildPhone(partner.id),
    },
    integration: {
      channelPartner: seed % 3 === 0 ? "Shopify" : "None",
      referralSource: REFERRAL_SOURCES[seed % REFERRAL_SOURCES.length],
    },
    assortmentFile: { name: "Assortment.xlsx", size: "1.2 MB" },
    w9File: { name: "W9 form.pdf", size: "1.1 MB" },
    linkedProfiles: [
      { platform: "Instagram", url: `https://instagram.com/${slug || "partner"}` },
      { platform: "LinkedIn", url: `https://linkedin.com/company/${slug || "partner"}` },
      { platform: "TikTok", url: `https://tiktok.com/@${slug || "partner"}` },
    ],
    contractAccepted: partner.status !== "New",
    insight: {
      title: "Lead form review",
      score: partner.confidenceScore,
      summary: `${partner.legalBusinessName} is under review for Target Plus onboarding.`,
      checkedOn: partner.createdOn,
      recommendation:
        partner.status === "Rejected"
          ? "reject"
          : partner.status === "Future Interest"
            ? "future_interest"
            : "approve",
    },
  };
}

export function getLeadFormByPartnerId(partnerId: string): LeadFormData | undefined {
  if (leadForms[partnerId]) return leadForms[partnerId];
  const partner = getPotentialPartnerById(partnerId);
  if (partner && showsLeadForm(partner.status)) {
    return buildDefaultLeadForm(partner);
  }
  return undefined;
}
