"use client";

import { useState } from "react";

import {
  AssortmentCalendar,
  PlanPageActions,
} from "@/components/data-display/assortment-calendar";
import { FiscalYearSelector } from "@/components/data-display/fiscal-year-selector";
import { PageHeader } from "@/components/layout/page-header";
import { CalendarCommentsDrawer } from "@/features/assortment-plan/components/calendar-comments-drawer";
import { FinalizeShareDrawer } from "@/features/assortment-plan/components/finalize-share-drawer";
import { NotifyChangesDrawer } from "@/features/assortment-plan/components/notify-changes-drawer";
import { usePlanStore } from "@/features/assortment-plan/store/plan-store";
import { formatFYShort } from "@/lib/mock-data/fy-plan-seeds";

export function AssortmentPlanView() {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const fiscalYear = usePlanStore((s) => s.fiscalYear);
  const finalizeOpen = usePlanStore((s) => s.finalizeDrawerOpen);
  const closeFinalizeDrawer = usePlanStore((s) => s.closeFinalizeDrawer);
  const notifyOpen = usePlanStore((s) => s.notifyChangesDrawerOpen);
  const closeNotifyDrawer = usePlanStore((s) => s.closeNotifyChangesDrawer);

  const fyShort = formatFYShort(fiscalYear);

  return (
    <>
      <PageHeader
        title={`Assortment Plan ${fyShort}`}
        breadcrumbs={[
          { label: "Acquisition & Onboarding", href: "/dashboard" },
          { label: "Assortment Plan" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <FiscalYearSelector />
            <PlanPageActions onOpenComments={() => setCommentsOpen(true)} />
          </div>
        }
      />

      <AssortmentCalendar />

      <CalendarCommentsDrawer open={commentsOpen} onClose={() => setCommentsOpen(false)} />
      <FinalizeShareDrawer open={finalizeOpen} onClose={closeFinalizeDrawer} />
      <NotifyChangesDrawer open={notifyOpen} onClose={closeNotifyDrawer} />
    </>
  );
}
