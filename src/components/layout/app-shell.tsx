"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";

import { Sidebar } from "@/components/layout/sidebar";
import { SidebarProvider, useSidebar } from "@/components/layout/sidebar-context";
import { Topbar } from "@/components/layout/topbar";
import { PageHeaderProvider, PageHeaderSlot } from "@/components/layout/page-header-context";
import { TasksPanel, type RecommendedTask } from "@/components/ai/tasks-panel";
import { usePlanStore } from "@/features/assortment-plan/store/plan-store";
import {
  dashboardTasks,
  gapAnalysisTasks,
  partnerLeadFormTasks,
  partnerOnboardingTasks,
  planTasks,
  sellerProfileTasks,
} from "@/services/analytics.service";
import { defaultRecommendedTasks } from "@/services/beacon.service";
import type { BeaconPage } from "@/lib/agents/system-prompt";
import { GlobalGapDrawer } from "@/features/assortment-gap/components/global-gap-drawer";
import { OutreachEmailDrawer } from "@/features/outreach/components/outreach-email-drawer";
import { ToastContainer } from "@/components/ui/toast-container";
import { getOutreachTaskForOnboardingPage } from "@/lib/mock-data/outreach-mail";
import {
  getLeadFormAnalysis,
  getLeadFormTasksFromAnalysis,
} from "@/lib/mock-data/lead-form-analysis";
import {
  getFieldInsightsForPanel,
  getOnboardingInsightsForPanel,
  getOnboardingTasksForPanel,
  getProfileTaskEvaluations,
} from "@/lib/mock-data/onboarding-evaluation";
import { getSellerById } from "@/lib/mock-data/sellers";
import {
  getPotentialPartnerById,
  showsLeadForm,
  showsOnboardingChecklist,
} from "@/lib/mock-data/potential-partners";

function isPartnerProfilePath(pathname: string): boolean {
  return /^\/sellers\/onboarding\/[^/]+$/.test(pathname);
}

function isOnboardingReviewPath(pathname: string): boolean {
  return /^\/sellers\/onboarding\/[^/]+\/review\//.test(pathname);
}

function isSellerProfilePath(pathname: string): boolean {
  return /^\/sellers\/discovery\/[^/]+$/.test(pathname);
}

function extractPartnerId(pathname: string): string | undefined {
  const match = pathname.match(/^\/sellers\/onboarding\/([^/]+)/);
  return match?.[1];
}

function getOnboardingPanelData(partnerId: string, pathname: string) {
  const partner = getPotentialPartnerById(partnerId);
  if (!partner || !showsOnboardingChecklist(partner.status)) return null;

  const tasks = getOnboardingTasksForPanel(partner.sellerId).map((t) => ({
    ...t,
    partnerId,
  }));

  let insights = getOnboardingInsightsForPanel(partner.sellerId).map((t) => ({
    ...t,
    partnerId,
  }));

  if (pathname.includes("/review/profile")) {
    const brandTask =
      getProfileTaskEvaluations(partner.sellerId).find((e) => e.validationStatus === "invalid") ??
      getProfileTaskEvaluations(partner.sellerId)[0];
    if (brandTask) {
      const fieldInsights = getFieldInsightsForPanel(partner.sellerId, brandTask.taskId).map((f) => ({
        ...f,
        partnerId,
      }));
      insights = [...fieldInsights, ...insights];
    }
  }

  return { tasks, insights, showInsightsTab: true };
}

function getTasksForPath(pathname: string): RecommendedTask[] {
  const partnerId = extractPartnerId(pathname);

  if (isOnboardingReviewPath(pathname) && partnerId) {
    const onboardingPanel = getOnboardingPanelData(partnerId, pathname);
    if (onboardingPanel) return onboardingPanel.tasks;
  }

  if (isPartnerProfilePath(pathname)) {
    const id = pathname.split("/").pop();
    const partner = id ? getPotentialPartnerById(id) : undefined;
    if (partner && showsOnboardingChecklist(partner.status) && id) {
      const evalTasks = getOnboardingTasksForPanel(partner.sellerId).map((t) => ({
        ...t,
        partnerId: id,
      }));
      return [
        {
          id: "pod-outreach-kickoff",
          title: "Onboarding Mail Ready",
          description: `Send ${partner.legalBusinessName} the onboarding kickoff mail and next steps.`,
          actionLabel: "Send Mail →",
          actionType: "open_outreach" as const,
          mailType: "onboarding_kickoff" as const,
          partnerId: partner.id,
        },
        ...evalTasks,
      ];
    }
    if (partner && showsLeadForm(partner.status) && id) {
      const analysis = getLeadFormAnalysis(id);
      if (analysis) return getLeadFormTasksFromAnalysis(analysis);
    }
    return partnerLeadFormTasks;
  }

  if (isSellerProfilePath(pathname)) {
    const sellerId = pathname.split("/").pop();
    const seller = sellerId ? getSellerById(sellerId) : undefined;
    if (seller) {
      return [
        {
          id: "sp-outreach",
          title: "Introduction Mail Ready",
          description: "The Outreach Agent has drafted a personalized acquisition email for this seller.",
          actionLabel: "Send Mail →",
          actionType: "open_outreach" as const,
          mailType: "acquisition_outreach" as const,
          sellerId: seller.id,
          sellerName: seller.legalBusinessName,
          sellerWebsite: seller.website,
        },
        ...sellerProfileTasks.filter((t) => t.id !== "sp-1"),
      ];
    }
    return sellerProfileTasks;
  }

  if (pathname === "/sellers/onboarding") return [getOutreachTaskForOnboardingPage()];
  if (pathname.startsWith("/sellers/onboarding")) return partnerOnboardingTasks.filter((t) => t.id !== "po-1");
  if (pathname.startsWith("/assortment/plan")) return planTasks;
  if (pathname.startsWith("/assortment/gap")) return gapAnalysisTasks;
  if (pathname.startsWith("/dashboard")) return dashboardTasks;
  return defaultRecommendedTasks;
}

function getInsightsForPath(pathname: string): RecommendedTask[] {
  const partnerId = extractPartnerId(pathname);
  if (!partnerId || !isOnboardingReviewPath(pathname)) return [];
  const onboardingPanel = getOnboardingPanelData(partnerId, pathname);
  return onboardingPanel?.insights ?? [];
}

function shouldShowInsightsTab(pathname: string): boolean {
  const partnerId = extractPartnerId(pathname);
  if (!partnerId) return false;
  const partner = getPotentialPartnerById(partnerId);
  return Boolean(partner && showsOnboardingChecklist(partner.status));
}

function getPageForPath(pathname: string): BeaconPage {
  if (pathname.startsWith("/assortment/plan")) return "assortment-plan";
  if (pathname.startsWith("/assortment/gap")) return "assortment-gap";
  if (pathname.startsWith("/dashboard")) return "dashboard";
  if (pathname.startsWith("/sellers/onboarding")) return "partner-onboarding";
  if (isPartnerProfilePath(pathname)) return "partner-onboarding";
  if (isOnboardingReviewPath(pathname)) return "partner-onboarding";
  if (isSellerProfilePath(pathname)) return "seller-profile";
  if (pathname.startsWith("/sellers/discovery")) return "lead-discovery";
  if (pathname.startsWith("/sellers")) return "seller-profile";
  return "unknown";
}

/** Generates context-aware tasks for the assortment plan page based on live store state */
function usePlanTasks(isOnPlanPage: boolean): RecommendedTask[] | null {
  const planItems     = usePlanStore((s) => s.planItems);
  const scheduledItems = usePlanStore((s) => s.scheduledItems);

  return useMemo<RecommendedTask[] | null>(() => {
    if (!isOnPlanPage) return null;

    const scheduledLabels = new Set(scheduledItems.map((s) => s.label));
    const unscheduled = planItems.filter((p) => !scheduledLabels.has(p));
    const categories  = [...new Set(scheduledItems.map((s) => s.row))];

    // No items added to plan yet
    if (planItems.length === 0) {
      return [
        {
          id: "apt-no-items",
          title: "Start with Gap Analysis",
          description: "No item types in your plan yet. Go to Assortment Gap Analysis to identify and add item types.",
          actionLabel: "Analyse Gaps →",
          actionHref: "/assortment/gap",
        },
        {
          id: "apt-beacon-hint",
          title: "Ask Beacon to build your plan",
          description: "Beacon can analyse the assortment gap and recommend item types that meet your revenue goal.",
          actionLabel: "Chat with Beacon →",
          actionHref: "/assortment/gap",
        },
      ];
    }

    // Items in plan but none on calendar
    if (scheduledItems.length === 0) {
      return [
        {
          id: "apt-drag",
          title: `${planItems.length} item type${planItems.length > 1 ? "s" : ""} ready to schedule`,
          description: "Drag items from the Assortment Plan strip above onto the calendar. Each item will auto-land in its correct category row.",
          actionLabel: "Generate Calendar →",
        },
        {
          id: "apt-generate",
          title: "Let Beacon auto-schedule",
          description: "Beacon can use market demand signals to automatically schedule all items across the right quarters.",
          actionLabel: "Generate Calendar →",
        },
      ];
    }

    // Partial — some items on calendar, some not yet
    if (unscheduled.length > 0) {
      return [
        {
          id: "apt-partial",
          title: `${scheduledItems.length} of ${planItems.length} items placed`,
          description: `Still to schedule: ${unscheduled.slice(0, 3).join(", ")}${unscheduled.length > 3 ? ` +${unscheduled.length - 3} more` : ""}.`,
          actionLabel: "Continue planning",
        },
        {
          id: "apt-resize",
          title: "Adjust launch windows",
          description: "Click any item on the calendar to select it, then drag the blue handles to refine its month range.",
          actionLabel: "Optimise timing",
        },
      ];
    }

    // All items on calendar — ready to finalise
    return [
      {
        id: "apt-done",
        title: `✓ All ${planItems.length} item types scheduled`,
        description: `Spanning ${categories.length} categor${categories.length > 1 ? "ies" : "y"}: ${categories.slice(0, 3).join(", ")}${categories.length > 3 ? "…" : ""}. Your plan is ready to share.`,
        actionLabel: "Finalize & Share →",
        actionType: "open_finalize_drawer",
      },
      {
        id: "apt-versions",
        title: "Save a new version",
        description: "Create a Version 2 to experiment with a different schedule while keeping your current plan safe.",
        actionLabel: "Create version",
      },
    ];
  }, [isOnPlanPage, planItems, scheduledItems]);
}

function AppShellContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { showSubnav } = useSidebar();
  const isOnPlanPage = pathname.startsWith("/assortment/plan") || pathname.startsWith("/assortment/finalize");
  const dynamicPlanTasks = usePlanTasks(isOnPlanPage);
  const staticTasks = getTasksForPath(pathname);
  const tasks = dynamicPlanTasks ?? staticTasks;
  const insights = getInsightsForPath(pathname);
  const showInsightsTab = shouldShowInsightsTab(pathname);
  const page = getPageForPath(pathname);

  const mainOffset = showSubnav
    ? "calc(var(--sidebar-width) + var(--sidebar-subnav-width))"
    : "var(--sidebar-width)";

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Sidebar />
      <div
        className="grid min-h-screen"
        style={{
          marginLeft: mainOffset,
          gridTemplateColumns: "minmax(0, 1fr) var(--tasks-panel-width)",
          gridTemplateRows: "var(--topbar-height) auto 1fr",
        }}
      >
        <div className="col-span-2">
          <Topbar />
        </div>

        <PageHeaderSlot />

        <main id="main-content" className="min-w-0 overflow-x-hidden overflow-y-auto p-[var(--space-4)]">
          {children}
        </main>

        <div className="min-h-0 min-w-0 overflow-hidden p-[var(--space-4)] pl-0">
          <TasksPanel
            tasks={tasks}
            insights={insights}
            showInsightsTab={showInsightsTab}
            page={page}
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
        <AppShellContent>{children}</AppShellContent>
      </PageHeaderProvider>
    </SidebarProvider>
  );
}
