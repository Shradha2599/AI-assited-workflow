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
      ein: "XX-4412091",
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
    assortmentFile: { name: "CheeryOak_Assortment.xlsx", size: "890 KB" },
    w9File: { name: "W9_CheeryOak.pdf", size: "1.0 MB" },
    linkedProfiles: [
      { platform: "Instagram", url: "https://instagram.com/cheeryoak" },
      { platform: "Facebook", url: "https://facebook.com/cheeryoak" },
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
      ein: "XX-9876543",
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
      ein: "XX-7733102",
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
      ein: "XX-9021144",
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

export function getLeadFormByPartnerId(partnerId: string): LeadFormData | undefined {
  return leadForms[partnerId];
}
