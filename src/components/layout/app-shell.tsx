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
import { useDiscoveryStore } from "@/features/lead-discovery/store/discovery-store";
import { resolveBeaconContext } from "@/lib/beacon/beacon-context";
import { usePartnerReviewStore } from "@/features/partner-onboarding/store/partner-review-store";
import { useOnboardingReviewStore } from "@/features/partner-onboarding/store/onboarding-review-store";
import { useOutreachStore } from "@/features/outreach/store/outreach-store";

function AppShellContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { showSubnav } = useSidebar();
  const statusOverrides = usePartnerReviewStore((s) => s.statusOverrides);
  const activeTaskId = useOnboardingReviewStore((s) => s.activeTaskId);
  const approvedIds = useOnboardingReviewStore((s) => s.approvedIds);
  const appliedFieldValues = useOnboardingReviewStore((s) => s.appliedFieldValues);
  const documentRejections = useOnboardingReviewStore((s) => s.documentRejections);
  const planItems = usePlanStore((s) => s.planItems);
  const scheduledItems = usePlanStore((s) => s.scheduledItems);
  const planRevenues = usePlanStore((s) => s.planRevenues);
  const revenueGoal = usePlanStore((s) => s.revenueGoal);
  const dismissedBeaconPlanTaskIds = usePlanStore((s) => s.dismissedBeaconPlanTaskIds);
  const fiscalYear = usePlanStore((s) => s.fiscalYear);
  const acquisitionOutreachShareItems = usePlanStore((s) => s.acquisitionOutreachShareItems);
  const calendarVersions = usePlanStore((s) => s.calendarVersions);
  const activeVersionId = usePlanStore((s) => s.activeVersionId);
  const discoverySnap = useDiscoveryStore((s) => s.getSnapshot(fiscalYear));
  const documentReminderSentPartnerIds = useOutreachStore(
    (s) => s.documentReminderSentPartnerIds,
  );

  const calendarVersionName =
    calendarVersions.find((v) => v.id === activeVersionId)?.name ?? "Version 1";

  const beaconContext = useMemo(
    () =>
      resolveBeaconContext({
        pathname,
        searchParams,
        statusOverrides,
        activeTaskId,
        planItems,
        scheduledItems,
        planRevenues,
        revenueGoal,
        dismissedBeaconPlanTaskIds,
        onboardingReview: {
          approvedIds,
          appliedFieldValues,
          documentRejectionIds: Object.keys(documentRejections),
        },
        fiscalYear,
        discoveryShortlisted: discoverySnap.shortlistedIds.length,
        discoveryContacted: discoverySnap.contactedIds.length,
        discoveryDiscovered: discoverySnap.discoveredIds.length,
        acquisitionOutreachShareItems,
        calendarVersionName,
        documentReminderSentPartnerIds,
      }),
    [
      pathname,
      searchParams,
      statusOverrides,
      activeTaskId,
      approvedIds,
      appliedFieldValues,
      documentRejections,
      planItems,
      scheduledItems,
      planRevenues,
      revenueGoal,
      dismissedBeaconPlanTaskIds,
      fiscalYear,
      discoverySnap.shortlistedIds.length,
      discoverySnap.contactedIds.length,
      discoverySnap.discoveredIds.length,
      acquisitionOutreachShareItems,
      calendarVersionName,
      documentReminderSentPartnerIds,
    ],
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
                  openingMessage={beaconContext.openingMessage}
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
