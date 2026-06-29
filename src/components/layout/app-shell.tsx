"use client";

import { usePathname } from "next/navigation";

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { TasksPanel, type RecommendedTask } from "@/components/ai/tasks-panel";
import {
  dashboardTasks,
  gapAnalysisTasks,
  planTasks,
} from "@/services/analytics.service";
import { defaultRecommendedTasks } from "@/services/beacon.service";
import type { BeaconPage } from "@/lib/agents/system-prompt";

function getTasksForPath(pathname: string): RecommendedTask[] {
  if (pathname.startsWith("/assortment/plan")) return planTasks;
  if (pathname.startsWith("/assortment/gap")) return gapAnalysisTasks;
  if (pathname.startsWith("/dashboard") || pathname === "/") return dashboardTasks;
  return defaultRecommendedTasks;
}

function getPageForPath(pathname: string): BeaconPage {
  if (pathname.startsWith("/assortment/plan")) return "assortment-plan";
  if (pathname.startsWith("/assortment/gap")) return "assortment-gap";
  if (pathname.startsWith("/dashboard") || pathname === "/") return "dashboard";
  if (pathname.startsWith("/sellers/onboarding")) return "partner-onboarding";
  if (pathname.startsWith("/sellers")) return "seller-profile";
  return "unknown";
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const tasks = getTasksForPath(pathname);
  const page = getPageForPath(pathname);

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Sidebar activeModule="ao" />
      <div className="ml-[var(--sidebar-width)] mr-[var(--tasks-panel-width)]">
        <Topbar />
        <main id="main-content" className="p-[var(--space-4)]">
          {children}
        </main>
      </div>
      <TasksPanel tasks={tasks} page={page} />
    </div>
  );
}
