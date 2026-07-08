"use client";

import { useState } from "react";

import {
  AssortmentCalendar,
  PlanPageActions,
} from "@/components/data-display/assortment-calendar";
import { PageHeader } from "@/components/layout/page-header";
import { CalendarCommentsDrawer } from "@/features/assortment-plan/components/calendar-comments-drawer";

export function AssortmentPlanView() {
  const [commentsOpen, setCommentsOpen] = useState(false);

  return (
    <>
      <PageHeader
        title="Assortment Plan FY 2025-26"
        breadcrumbs={[
          { label: "Acquisition & Onboarding", href: "/dashboard" },
          { label: "Assortment Gap Analysis", href: "/assortment/gap" },
          { label: "Assortment Plan" },
        ]}
        actions={<PlanPageActions onOpenComments={() => setCommentsOpen(true)} />}
      />

      <AssortmentCalendar />

      <CalendarCommentsDrawer open={commentsOpen} onClose={() => setCommentsOpen(false)} />
    </>
  );
}
