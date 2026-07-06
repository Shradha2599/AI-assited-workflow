"use client";

import {
  AssortmentCalendar,
  PlanPageActions,
} from "@/components/data-display/assortment-calendar";
import { PageHeader } from "@/components/layout/page-header";

export function AssortmentPlanView() {
  return (
    <>
      <PageHeader
        title="Assortment Plan FY 2025-26"
        breadcrumbs={[
          { label: "Acquisition & Onboarding", href: "/dashboard" },
          { label: "Assortment Gap Analysis", href: "/assortment/gap" },
          { label: "Assortment Plan" },
        ]}
        actions={<PlanPageActions />}
      />

      <AssortmentCalendar />
    </>
  );
}
