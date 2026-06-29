import { EmptyState } from "@/components/feedback/empty-state";
import { PageHeader } from "@/components/layout/page-header";

export default function SellerVerificationPage() {
  return (
    <>
      <PageHeader
        title="Seller Verification"
        description="AI-powered document verification and risk analysis pipeline."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Seller Verification" },
        ]}
      />
      <EmptyState
        title="Coming soon"
        description="The AI verification pipeline will include OCR, field extraction, business rule validation, and auditable approval workflows."
      />
    </>
  );
}
