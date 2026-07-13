"use client";

import { Suspense, useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { Sidebar } from "@/components/layout/sidebar";
import { SidebarProvider, useSidebar } from "@/components/layout/sidebar-context";
import { Topbar } from "@/components/layout/topbar";
import { PageHeaderProvider, PageHeaderSlot } from "@/components/layout/page-header-context";
import { TasksPanel } from "@/components/ai/tasks-panel";
import { usePlanStore } from "@/features/assortment-plan/store/plan-store";
import { GlobalGapDrawer } from "@/features/assortment-gap/components/global-gap-drawer";
import { OutreachEmailDrawer } from "@/features/outreach/components/outreach-email-drawer";
import { ToastContainer } from "@/components/ui/toast-container";
import { resolveBeaconContext } from "@/lib/beacon/beacon-context";
import { usePartnerReviewStore } from "@/features/partner-onboarding/store/partner-review-store";
import { useOnboardingReviewStore } from "@/features/partner-onboarding/store/onboarding-review-store";

function AppShellContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { showSubnav } = useSidebar();
  const statusOverrides = usePartnerReviewStore((s) => s.statusOverrides);
  const activeTaskId = useOnboardingReviewStore((s) => s.activeTaskId);
  const planItems = usePlanStore((s) => s.planItems);
  const scheduledItems = usePlanStore((s) => s.scheduledItems);

  const beaconContext = useMemo(
    () =>
      resolveBeaconContext({
        pathname,
        searchParams,
        statusOverrides,
        activeTaskId,
        planItems,
        scheduledItems,
      }),
    [pathname, searchParams, statusOverrides, activeTaskId, planItems, scheduledItems],
  );

  const showInsightsTab = false;
  const mainOffset = showSubnav
    ? "calc(var(--sidebar-width) + var(--sidebar-subnav-width))"
    : "var(--sidebar-width)";

  return (
    <div className="h-screen overflow-hidden bg-[var(--color-background)]">
      <Sidebar />
      <div
        className="grid h-screen overflow-hidden"
        style={{
          marginLeft: mainOffset,
          gridTemplateColumns: "minmax(0, 1fr) var(--tasks-panel-width)",
          gridTemplateRows: "var(--topbar-height) auto minmax(0, 1fr)",
        }}
      >
        <div className="col-span-2 row-start-1">
          <Topbar />
        </div>

        <div className="col-start-1 row-start-2 min-w-0">
          <PageHeaderSlot />
        </div>

        <main
          id="main-content"
          className="col-start-1 row-start-3 min-h-0 min-w-0 overflow-x-hidden overflow-y-auto p-[var(--space-4)]"
        >
          {children}
        </main>

        <div
          className="col-start-2 row-span-2 row-start-2 flex min-h-0 flex-col overflow-hidden p-[var(--space-4)] pl-0 pt-[var(--space-4)]"
          style={{ height: "calc(100vh - var(--topbar-height))" }}
        >
          <TasksPanel
            tasks={beaconContext.tasks}
            insights={beaconContext.insights}
            showInsightsTab={showInsightsTab}
            page={beaconContext.page}
            starterPrompts={beaconContext.starters}
            contextSummary={beaconContext.contextSummary}
            pathname={pathname}
          />
        </div>
      </div>
      <OutreachEmailDrawer />
      <GlobalGapDrawer />
      <ToastContainer />
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <PageHeaderProvider>
        <Suspense fallback={null}>
          <AppShellContent>{children}</AppShellContent>
        </Suspense>
      </PageHeaderProvider>
    </SidebarProvider>
  );
}
