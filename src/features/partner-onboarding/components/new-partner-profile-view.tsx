"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { LeadFormView } from "@/features/partner-onboarding/components/lead-form-view";
import { OnboardingCommentsDrawer } from "@/features/partner-onboarding/components/onboarding-comments-drawer";
import { PartnerProfileHeader } from "@/features/partner-onboarding/components/partner-profile-header";
import { AssortmentAnalysisTab } from "@/features/partner-onboarding/components/assortment-analysis-tab";
import { Card } from "@/components/ui/card";
import { getAssortmentCurationContent } from "@/lib/mock-data/assortment-curation-content";
import type { LeadFormData } from "@/lib/mock-data/lead-forms";
import type { PotentialPartner } from "@/lib/mock-data/potential-partners";
import { useAssortmentCurationStore } from "../store/assortment-curation-store";
import { PillTabs } from "./profile-review-shared";

type NewPartnerProfileTab = "lead-form" | "assortment";

interface NewPartnerProfileViewProps {
  partner: PotentialPartner;
  form: LeadFormData;
}

export function NewPartnerProfileView({ partner, form }: NewPartnerProfileViewProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const initForPartner = useAssortmentCurationStore((s) => s.initForPartner);
  const storeContent = useAssortmentCurationStore((s) => s.content);
  const content = storeContent ?? getAssortmentCurationContent(partner.id);

  useEffect(() => {
    initForPartner(partner.id);
  }, [partner.id, initForPartner]);

  const activeTab: NewPartnerProfileTab =
    searchParams.get("tab") === "assortment" ? "assortment" : "lead-form";

  const setActiveTab = (tab: NewPartnerProfileTab) => {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "lead-form") {
      params.delete("tab");
    } else {
      params.set("tab", tab);
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  };

  return (
    <div className="space-y-[var(--space-4)]">
      <PartnerProfileHeader partner={partner} />

      <PillTabs
        tabs={[
          { id: "lead-form", label: "Lead form" },
          { id: "assortment", label: "Assortment" },
        ]}
        active={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === "lead-form" ? (
        <LeadFormView partner={partner} form={form} />
      ) : (
        <Card className="border-[var(--color-border)] p-6 shadow-[var(--shadow-low)]">
          <AssortmentAnalysisTab content={content} />
        </Card>
      )}
      <OnboardingCommentsDrawer partner={partner} />
    </div>
  );
}
