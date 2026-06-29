import { tool } from "ai";
import { z } from "zod";
import { getSellerById } from "@/lib/mock-data/sellers";
import { categories } from "@/lib/mock-data/assortment";

export const outreachTool = tool({
  description:
    "Draft outreach emails to sellers or generate onboarding communication. Use this when the user asks to draft, write, or generate an email to a seller or partner.",
  parameters: z.object({
    type: z.enum(["acquisition_outreach", "onboarding_kickoff", "document_reminder"]),
    sellerId: z.string().describe("The seller ID to draft the email for"),
    categoryFocus: z.string().optional().describe("Category to highlight in the email"),
  }),
  execute: async ({ type, sellerId, categoryFocus }) => {
    const seller = getSellerById(sellerId);
    if (!seller) {
      return { error: `Seller not found: ${sellerId}` };
    }

    const relevantCategory = categoryFocus
      ? categories.find((c) => c.name.toLowerCase().includes(categoryFocus.toLowerCase()))
      : categories.find((c) => seller.categories.includes(c.name));

    switch (type) {
      case "acquisition_outreach":
        return {
          to: `seller@${seller.website}`,
          subject: `Invitation to Join Target Plus — ${seller.category} Opportunity`,
          body: `Hi ${seller.legalBusinessName} Team,

I'm reaching out from Target Plus, Target's invite-only third-party marketplace, to explore a potential partnership opportunity.

Based on our analysis, ${seller.legalBusinessName} stands out as a strong fit for our ${seller.category} category — your ${seller.skus.toLocaleString()} SKU depth and ${seller.rating}/5 marketplace rating align well with our quality standards.

${relevantCategory ? `We currently have a ${relevantCategory.gapPercent}% assortment gap in ${relevantCategory.name}, representing a $${(relevantCategory.estimatedRevenue / 1000000).toFixed(1)}M revenue opportunity that your catalog could help address.` : ""}

We'd love to invite you to complete a short application to explore this further. The process takes approximately 20 minutes and our team will review within 5 business days.

Would you be open to a brief 20-minute intro call this week to discuss the opportunity?

Best regards,
Acquisition Team
Target Plus`,
          metadata: {
            sellerId: seller.id,
            sellerName: seller.legalBusinessName,
            category: seller.category,
            confidenceScore: seller.confidenceScore,
          },
        };

      case "onboarding_kickoff":
        return {
          to: `seller@${seller.website}`,
          subject: `Welcome to Target Plus — Your Onboarding Begins Today`,
          body: `Hi ${seller.legalBusinessName} Team,

Congratulations and welcome to Target Plus!

We're excited to begin your onboarding journey. Your application has been approved and you are now an official Target Plus partner.

Here's what happens next:

1. Complete your Profile Information in the partner portal
2. Upload your assortment file with the SKUs you plan to sell
3. Submit your W9 form and sign the partner contract
4. Set up your Channel Partner integration
5. Complete Stripe payment setup

Your target launch date is estimated at 90 days from today. Our onboarding team will check in weekly to keep things on track.

Please log into your partner portal to get started: [portal link]

If you have any questions, reply to this email or reach your onboarding analyst directly.

Welcome aboard,
Onboarding Team
Target Plus`,
          metadata: {
            sellerId: seller.id,
            sellerName: seller.legalBusinessName,
            type: "onboarding_kickoff",
          },
        };

      case "document_reminder":
        return {
          to: `seller@${seller.website}`,
          subject: `Action Required: Missing Documents — ${seller.legalBusinessName} Onboarding`,
          body: `Hi ${seller.legalBusinessName} Team,

This is a friendly reminder that your Target Plus onboarding has pending items that need attention to stay on track for your launch date.

Pending actions:
- Banner/Cover Image: Please upload a high-resolution image (minimum 1200x400px)
- W9 Form: Please upload a completed and signed W9 form
- Assortment File: Please upload your SKU list using the provided template

You can complete these in your partner portal. If you're having trouble, please reply to this email and we'll help.

Regards,
Onboarding Team
Target Plus`,
          metadata: {
            sellerId: seller.id,
            sellerName: seller.legalBusinessName,
            type: "document_reminder",
          },
        };

      default:
        return { error: "Unknown email type" };
    }
  },
});
