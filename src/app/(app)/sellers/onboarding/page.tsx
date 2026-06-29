import { EmptyState } from "@/components/feedback/empty-state";
import { PageHeader } from "@/components/layout/page-header";

export default function SellerOnboardingPage() {
  return (
    <>
      <PageHeader
        title="Seller Onboarding"
        description="Manage seller onboarding workflows and progress tracking."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Seller Onboarding" },
        ]}
      />
      <EmptyState
        title="Coming soon"
        description="Seller onboarding will be available after Figma designs are finalized."
      />
    </>
  );
}
