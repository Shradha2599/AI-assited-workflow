import { getPotentialPartnerById } from "@/lib/mock-data/potential-partners";

export type OutreachMailType =
  | "document_reminder"
  | "acquisition_outreach"
  | "onboarding_kickoff"
  | "onboarding_completion";

export interface EmailDraft {
  to: string;
  subject: string;
  body: string;
  fromName: string;
  fromEmail: string;
}

export interface OutreachPartnerContext {
  partnerId: string;
  sellerId: string;
  legalBusinessName: string;
  displayName: string;
  contactName: string;
  contactEmail: string;
  summary: string;
  missingItems: string[];
  progressPercent: number;
}

export const outreachReminderPartners: OutreachPartnerContext[] = [
  {
    partnerId: "pp-006",
    sellerId: "seller-003",
    legalBusinessName: "Thunder Brewing",
    displayName: "Thunder",
    contactName: "Jane",
    contactEmail: "jane@thunderbrewing.com",
    summary: "The documentation task has 2 documents missing",
    missingItems: ["Utility Bill", "Address Proof"],
    progressPercent: 85,
  },
  {
    partnerId: "pp-003",
    sellerId: "seller-004",
    legalBusinessName: "Pinnacle Goods",
    displayName: "Pinnacle Goods",
    contactName: "Sarah",
    contactEmail: "sarah@pinnaclegoods.com",
    summary: "The documentation task has 1 document missing",
    missingItems: ["DUNS Certificate"],
    progressPercent: 88,
  },
];

function missingDocsList(items: string[]): string {
  return items.map((item) => `• ${item}`).join("\n");
}

export function getOutreachPartnerContext(partnerId: string): OutreachPartnerContext | undefined {
  const fromReminder = outreachReminderPartners.find((p) => p.partnerId === partnerId);
  if (fromReminder) return fromReminder;

  const partner = getPotentialPartnerById(partnerId);
  if (!partner) return undefined;

  const domain = partner.legalBusinessName.toLowerCase().replace(/[^a-z0-9]/g, "");
  return {
    partnerId: partner.id,
    sellerId: partner.sellerId,
    legalBusinessName: partner.legalBusinessName,
    displayName: partner.displayName,
    contactName: partner.displayName.split(" ")[0],
    contactEmail: `contact@${domain}.com`,
    summary: "Partner onboarding in progress",
    missingItems: [],
    progressPercent: 65,
  };
}

export function generateOutreachDraft(
  mailType: OutreachMailType,
  context: OutreachPartnerContext,
): EmailDraft {
  const fromName = "Shaun Doe";
  const fromEmail = "shaun.doe@target.com";

  switch (mailType) {
    case "document_reminder":
    case "onboarding_completion":
      return {
        fromName,
        fromEmail,
        to: context.contactEmail,
        subject: "Action Required: Pending Documents for Target Plus Onboarding",
        body: `Hi ${context.contactName},

We hope you're doing well. We noticed that ${context.legalBusinessName} is nearing completion of the Target Plus onboarding process. To continue moving toward launch readiness, a few required documents are still pending review.

Missing documents:
${missingDocsList(context.missingItems)}

Once these documents are uploaded, our onboarding team will be able to continue the review process and keep your launch timeline on track. You can upload them directly in your partner portal under the Documentation section.

If you have any questions or need assistance, please reply to this email — we're here to help.

Best regards,
${fromName}
Onboarding Team
Target Plus`,
      };

    case "onboarding_kickoff":
      return {
        fromName,
        fromEmail,
        to: context.contactEmail,
        subject: `Welcome to Target Plus — ${context.legalBusinessName} Onboarding Begins`,
        body: `Hi ${context.contactName},

Congratulations and welcome to Target Plus!

We're excited to begin your onboarding journey with ${context.legalBusinessName}. Your application has been approved and you are now an official Target Plus partner.

Here's what happens next:
1. Complete your Profile Information in the partner portal
2. Upload your assortment file with the SKUs you plan to sell
3. Submit your W9 form and sign the partner contract
4. Set up your Channel Partner integration
5. Complete Stripe payment setup

Please log into your partner portal to get started. Our onboarding team will check in weekly to keep things on track.

If you have any questions, reply to this email or reach your onboarding analyst directly.

Welcome aboard,
${fromName}
Onboarding Team
Target Plus`,
      };

    case "acquisition_outreach":
      return {
        fromName,
        fromEmail,
        to: context.contactEmail,
        subject: `Invitation to Join Target Plus — ${context.legalBusinessName}`,
        body: `Hi ${context.contactName},

I'm reaching out from Target Plus, Target's invite-only third-party marketplace, to explore a potential partnership opportunity with ${context.legalBusinessName}.

Based on our analysis, your brand stands out as a strong fit for our curated marketplace — your assortment depth and marketplace track record align well with our quality standards.

We'd love to invite you to complete a short application to explore this further. The process takes approximately 20 minutes and our team will review within 5 business days.

Would you be open to a brief intro call this week to discuss the opportunity?

Best regards,
${fromName}
Acquisition Team
Target Plus`,
      };
  }
}

export function getOutreachTaskForOnboardingPage() {
  return {
    id: "po-outreach-reminder",
    title: "Onboarding Completion Reminder",
    description:
      "2 partners are near onboarding completion but have missing documentation. Thunder Brewing and Pinnacle Goods need follow-up.",
    actionLabel: "Send Reminder Mail →",
    actionType: "open_outreach" as const,
    mailType: "document_reminder" as const,
  };
}

export function getSellerOutreachContext(sellerId: string, sellerName: string, website: string) {
  const contactName = sellerName.split(" ")[0];
  const domain = website.replace(/^https?:\/\/(www\.)?/, "").split("/")[0];
  return {
    partnerId: "",
    sellerId,
    legalBusinessName: sellerName,
    displayName: sellerName,
    contactName,
    contactEmail: `contact@${domain}`,
    summary: "Acquisition outreach opportunity",
    missingItems: [],
    progressPercent: 0,
  };
}
