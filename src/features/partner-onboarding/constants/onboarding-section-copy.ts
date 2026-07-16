/** Hero subtitle shown on TM review pages for each onboarding section. */
export const ONBOARDING_SECTION_SUBTITLES: Record<string, string> = {
  profile: "Partner's business, contact, brand fulfilment and return details",
  assortment: "Review and Finalise the Assortment to be brought on Target",
  documentation: "Partner's business related information",
  integrations:
    "Partner's marketplace integration for order management, inventory & fulfilment operations",
  stripe: "Partner's payment setup",
};

export function getOnboardingSectionSubtitle(sectionId: string): string {
  return ONBOARDING_SECTION_SUBTITLES[sectionId] ?? "";
}
