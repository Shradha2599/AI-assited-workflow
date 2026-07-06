import { PartnerOnboardingView } from "@/features/partner-onboarding/components/partner-onboarding-view";
import { getPipelineData } from "@/services/analytics.service";

export default async function PartnerOnboardingPage() {
  const pipeline = await getPipelineData();
  return <PartnerOnboardingView pipeline={pipeline} />;
}
