"use client";

import { usePathname } from "next/navigation";

import { Sidebar } from "@/components/layout/sidebar";
import { SidebarProvider, useSidebar } from "@/components/layout/sidebar-context";
import { Topbar } from "@/components/layout/topbar";
import { PageHeaderProvider, PageHeaderSlot } from "@/components/layout/page-header-context";
import { TasksPanel, type RecommendedTask } from "@/components/ai/tasks-panel";
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

function AppShellContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { showSubnav } = useSidebar();
  const tasks = getTasksForPath(pathname);
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
