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
        className="flex h-screen flex-col overflow-hidden"
        style={{ marginLeft: mainOffset }}
      >
        <Topbar />

        {/* Scroll: full-width page header, then main + sticky beacon below */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <PageHeaderSlot />

          <div
            className="grid min-h-0"
            style={{
              gridTemplateColumns: "minmax(0, 1fr) var(--tasks-panel-width)",
            }}
          >
            <main
              id="main-content"
              className="min-w-0 overflow-x-hidden p-[var(--space-4)]"
            >
              {children}
            </main>

            <div className="min-h-0 py-[var(--space-6)] pr-[var(--space-4)]">
              <div
                className="sticky top-[var(--space-6)] flex flex-col"
                style={{
                  height: "calc(100vh - var(--topbar-height) - 48px)",
                }}
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
          </div>
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
