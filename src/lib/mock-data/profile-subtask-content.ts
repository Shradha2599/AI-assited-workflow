import type { PotentialPartner } from "@/lib/mock-data/potential-partners";

export type ProfileSubTaskTitle =
  | "Brand profile"
  | "Business identity and address"
  | "Marketplace users"
  | "Fulfilment details"
  | "Returns policy"
  | "Privacy policy"
  | "Guest services and reverse logistics";

export interface MarketplaceUserRow {
  name: string;
  email: string;
  phone: string;
  role?: string;
}

export interface BusinessIdentityContent {
  legalBusinessName: string;
  businessStructure: string;
  taxId: string;
  diversityInformation: string;
  otherMarketplacePresence: string;
  addressLine1: string;
  city: string;
  state: string;
  postalCode: string;
  countryCode: string;
}

export interface FulfilmentContent {
  primaryContact: string;
  warehouseContactName: string;
  warehouseContactEmail: string;
  warehouseContactPhone: string;
  warehouseAddressLine1: string;
  warehouseCity: string;
  warehouseState: string;
  warehousePostalCode: string;
  warehouseCountryCode: string;
  daysOfOperation: string;
  openingTime: string;
  closingTime: string;
  siteCutoffTime: string;
  closedDates: string[];
  orderCapacityPerDay: string;
  buildingLeadTime: string;
  rollover: string;
  maximumRollover: string;
  carriers: string[];
}

export interface ReturnsContent {
  policyType: string;
  addressLine1: string;
  city: string;
  state: string;
  postalCode: string;
  countryCode: string;
}

export interface PrivacyPolicyContent {
  accepted: boolean;
  paragraphs: string[];
}

export interface GuestServicesContent {
  guestServiceEmail: string;
  guestServicePhone: string;
  reverseLogisticsEmail: string;
  reverseLogisticsPhone: string;
}

function slugFromName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

const ADDRESS_BY_SELLER: Record<string, string> = {
  "seller-004": "200 Clarendon St, Boston, MA 02116",
  "p-k-o2": "200 Clarendon St, Boston, MA 02116",
  "p-f-o2": "4500 Main St, Kansas City, MO 64111",
  "p-l-o3": "880 Sunset Blvd, Los Angeles, CA 90028",
  "p-l-o6": "1200 Market St, San Francisco, CA 94102",
  "p-k-o4": "845 N Michigan Ave, Chicago, IL 60611",
  "p-f-o6": "500 Boylston St, Boston, MA 02116",
  "seller-012": "16350 Ventura Blvd Ste D #503, Encino, CA 91436",
};

function parseAddress(full: string) {
  const parts = full.split(", ");
  const line1 = parts[0] ?? full;
  const city = parts[1] ?? "Boston";
  const stateZip = parts[2] ?? "MA 02116";
  const [state = "MA", postalCode = "02116"] = stateZip.split(" ");
  return { line1, city, state, postalCode, countryCode: "US" };
}

function buildBusinessIdentity(partner: PotentialPartner): BusinessIdentityContent {
  const full = ADDRESS_BY_SELLER[partner.sellerId] ?? "200 Clarendon St, Boston, MA 02116";
  const addr = parseAddress(full);
  return {
    legalBusinessName: partner.legalBusinessName,
    businessStructure: "Limited Liability Company (LLC)",
    taxId: "XX-XXXXXXX",
    diversityInformation: "Not applicable",
    otherMarketplacePresence: "Amazon, Walmart",
    ...addr,
    addressLine1: addr.line1,
  };
}

function buildMarketplaceUsers(partner: PotentialPartner): {
  admins: MarketplaceUserRow[];
  users: MarketplaceUserRow[];
} {
  const slug = slugFromName(partner.displayName || partner.legalBusinessName);
  return {
    admins: [
      {
        name: "Admin 1",
        email: `Admin1@${slug}.com`,
        phone: "456-789-0123",
      },
    ],
    users: [
      {
        name: "User 1",
        email: `User1@${slug}.com`,
        phone: "456-789-0123",
        role: "Operations",
      },
      {
        name: "User 2",
        email: `User2@${slug}.com`,
        phone: "456-789-0123",
        role: "Finance",
      },
      {
        name: "User 3",
        email: `User3@${slug}.com`,
        phone: "456-789-0123",
        role: "Logistics",
      },
    ],
  };
}

function buildFulfilment(partner: PotentialPartner): FulfilmentContent {
  const slug = slugFromName(partner.displayName || partner.legalBusinessName);
  const full = ADDRESS_BY_SELLER[partner.sellerId] ?? "200 Clarendon St, Boston, MA 02116";
  const addr = parseAddress(full);
  return {
    primaryContact: "Admin 1",
    warehouseContactName: "Warehouse Manager",
    warehouseContactEmail: `warehouse@${slug}.com`,
    warehouseContactPhone: "456-789-0123",
    warehouseAddressLine1: addr.line1,
    warehouseCity: addr.city,
    warehouseState: addr.state,
    warehousePostalCode: addr.postalCode,
    warehouseCountryCode: addr.countryCode,
    daysOfOperation: "Monday – Friday",
    openingTime: "8:00 AM",
    closingTime: "6:00 PM",
    siteCutoffTime: "4:00 PM",
    closedDates: [
      "22 Dec 2025",
      "03 Feb 2026",
      "18 Aug 2025",
      "29 Nov 2025",
      "11 Apr 2026",
      "07 Oct 2025",
      "14 June 2026",
      "25 Mar 2026",
      "01 Sept 2025",
      "19 July 2025",
      "30 Jan 2026",
    ],
    orderCapacityPerDay: "500 orders",
    buildingLeadTime: "24 Hours",
    rollover: "Enabled",
    maximumRollover: "2 days",
    carriers: ["FedX", "UPS"],
  };
}

function buildReturns(partner: PotentialPartner): ReturnsContent {
  const full = ADDRESS_BY_SELLER[partner.sellerId] ?? "200 Clarendon St, Boston, MA 02116";
  const addr = parseAddress(full);
  return {
    policyType: "Standard 30-day return policy",
    addressLine1: addr.line1,
    city: addr.city,
    state: addr.state,
    postalCode: addr.postalCode,
    countryCode: addr.countryCode,
  };
}

function buildPrivacy(partner: PotentialPartner): PrivacyPolicyContent {
  return {
    accepted: true,
    paragraphs: [
      `${partner.legalBusinessName} ("we," "our," or "us") is committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services through the Target+ Marketplace.`,
      `We may collect personal information that you voluntarily provide when registering on the marketplace, expressing interest in obtaining information about us or our products and services, or otherwise contacting us. We use this information to operate the marketplace, process transactions, and improve our services.`,
    ],
  };
}

function buildGuestServices(partner: PotentialPartner): GuestServicesContent {
  const slug = slugFromName(partner.displayName || partner.legalBusinessName);
  return {
    guestServiceEmail: `guestservice@${slug}.com`,
    guestServicePhone: "8900128734",
    reverseLogisticsEmail: `reverselogistics@${slug}.com`,
    reverseLogisticsPhone: "8900128734",
  };
}

export function getProfileSubTaskContent(
  partner: PotentialPartner,
  taskTitle: string,
):
  | { type: "business-identity"; data: BusinessIdentityContent }
  | { type: "marketplace-users"; data: ReturnType<typeof buildMarketplaceUsers> }
  | { type: "fulfilment"; data: FulfilmentContent }
  | { type: "returns"; data: ReturnsContent }
  | { type: "privacy"; data: PrivacyPolicyContent }
  | { type: "guest-services"; data: GuestServicesContent }
  | null {
  switch (taskTitle as ProfileSubTaskTitle) {
    case "Business identity and address":
      return { type: "business-identity", data: buildBusinessIdentity(partner) };
    case "Marketplace users":
      return { type: "marketplace-users", data: buildMarketplaceUsers(partner) };
    case "Fulfilment details":
      return { type: "fulfilment", data: buildFulfilment(partner) };
    case "Returns policy":
      return { type: "returns", data: buildReturns(partner) };
    case "Privacy policy":
      return { type: "privacy", data: buildPrivacy(partner) };
    case "Guest services and reverse logistics":
      return { type: "guest-services", data: buildGuestServices(partner) };
    default:
      return null;
  }
}
