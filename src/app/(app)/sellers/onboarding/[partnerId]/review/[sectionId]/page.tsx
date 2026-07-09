import { notFound } from "next/navigation";

import { DocumentationReview } from "@/features/partner-onboarding/components/documentation-review";
import { ProfileInformationReview } from "@/features/partner-onboarding/components/profile-information-review";
import { getOnboardingForPartner } from "@/lib/mock-data/onboarding";
import { getPotentialPartnerById, showsOnboardingChecklist } from "@/lib/mock-data/potential-partners";

interface SectionReviewPageProps {
  params: Promise<{ partnerId: string; sectionId: string }>;
  searchParams: Promise<{ task?: string; tab?: string }>;
}

export default async function SectionReviewPage({ params, searchParams }: SectionReviewPageProps) {
  const { partnerId, sectionId } = await params;
  const { task, tab } = await searchParams;

  const partner = getPotentialPartnerById(partnerId);
  if (!partner || !showsOnboardingChecklist(partner.status)) {
    notFound();
  }

  const onboarding = getOnboardingForPartner(partner);

  if (sectionId === "profile") {
    const profileSection = onboarding.sections.find((s) => s.id === "profile");
    const defaultTask =
      task ??
      profileSection?.tasks.find((t) => t.issue || t.status === "in_progress")?.id ??
      profileSection?.tasks.find((t) => t.status === "complete")?.id ??
      profileSection?.tasks[0]?.id ??
      "";

    return (
      <ProfileInformationReview
        partner={partner}
        onboarding={onboarding}
        activeTaskId={defaultTask}
      />
    );
  }

  if (sectionId === "documentation") {
    return (
      <DocumentationReview
        partner={partner}
        onboarding={onboarding}
        activeSubSection={tab === "brands" ? "brands" : "general"}
      />
    );
  }

  notFound();
}
