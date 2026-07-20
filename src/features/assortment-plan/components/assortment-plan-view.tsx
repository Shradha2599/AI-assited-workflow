"use client";

import { useState } from "react";

import {
  AssortmentCalendar,
  PlanPageActions,
} from "@/components/data-display/assortment-calendar";
import { PageHeader } from "@/components/layout/page-header";
import { CalendarCommentsDrawer } from "@/features/assortment-plan/components/calendar-comments-drawer";
import { FinalizeShareDrawer } from "@/features/assortment-plan/components/finalize-share-drawer";
import { usePlanStore } from "@/features/assortment-plan/store/plan-store";

export function AssortmentPlanView() {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const finalizeOpen = usePlanStore((s) => s.finalizeDrawerOpen);
  const closeFinalizeDrawer = usePlanStore((s) => s.closeFinalizeDrawer);

  return (
    <>
      <PageHeader
        title="Assortment Plan FY 2025-26"
        breadcrumbs={[
          { label: "Acquisition & Onboarding", href: "/dashboard" },
          { label: "Assortment Plan" },
        ]}
        actions={<PlanPageActions onOpenComments={() => setCommentsOpen(true)} />}
      />

      <AssortmentCalendar />

      <CalendarCommentsDrawer open={commentsOpen} onClose={() => setCommentsOpen(false)} />
      <FinalizeShareDrawer open={finalizeOpen} onClose={closeFinalizeDrawer} />
    </>
  );
}
