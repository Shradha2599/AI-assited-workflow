import { tool } from "ai";
import { z } from "zod";
import {
  getAllOnboardingProfiles,
  getBlockedOnboardingTasks,
  getOnboardingBySellerID,
} from "@/lib/mock-data/onboarding";

export const onboardingTool = tool({
  description:
    "Check onboarding status, blockers, and progress for sellers currently in onboarding. Use this when the user asks about onboarding progress, what's blocking a seller, pending tasks, or overall onboarding pipeline health.",
  parameters: z.object({
    query: z.enum(["partner_status", "blockers", "pipeline_overview", "next_steps"]),
    sellerId: z.string().optional().describe("Filter by seller ID (required for partner_status and next_steps)"),
  }),
  execute: async ({ query, sellerId }) => {
    switch (query) {
      case "partner_status": {
        if (!sellerId) return { error: "sellerId is required for partner_status" };
        const partner = getOnboardingBySellerID(sellerId);

        return {
          sellerName: partner.sellerName,
          assignedTo: partner.assignedTo,
          overallProgress: partner.overallProgress,
          startedAt: partner.startedAt,
          targetLaunchDate: partner.targetLaunchDate,
          sections: partner.sections.map((s) => ({
            title: s.title,
            progress: `${s.completedSteps}/${s.totalSteps} steps`,
            percentComplete: Math.round((s.completedSteps / s.totalSteps) * 100),
            blockers: s.tasks
              .filter((t) => t.issue || t.status === "blocked")
              .map((t) => ({ task: t.title, issue: t.issue })),
          })),
        };
      }

      case "blockers": {
        const blocked = getBlockedOnboardingTasks();
        if (sellerId) {
          const partner = getOnboardingBySellerID(sellerId);
          const partnerBlocked = partner.sections
            .flatMap((s) => s.tasks)
            .filter((t) => t.issue || t.status === "blocked");
          return {
            sellerName: partner.sellerName,
            blockerCount: partnerBlocked.length,
            blockers: partnerBlocked.map((t) => ({
              section: t.section,
              task: t.title,
              issue: t.issue,
              source: t.issueSource,
            })),
          };
        }
        return {
          totalBlockers: blocked.length,
          blockers: blocked.map((t) => ({
            sellerId: t.sellerId,
            section: t.section,
            task: t.title,
            issue: t.issue,
          })),
        };
      }

      case "pipeline_overview": {
        const profiles = getAllOnboardingProfiles();
        return {
          totalInOnboarding: profiles.length,
          partners: profiles.map((p) => ({
            name: p.sellerName,
            progress: p.overallProgress,
            targetLaunchDate: p.targetLaunchDate,
            sectionsComplete: p.sections.filter((s) => s.completedSteps === s.totalSteps).length,
            totalSections: p.sections.length,
            hasBlockers: p.sections.some((s) => s.tasks.some((t) => t.issue || t.status === "blocked")),
          })),
        };
      }

      case "next_steps": {
        if (!sellerId) return { error: "sellerId is required for next_steps" };
        const partner = getOnboardingBySellerID(sellerId);

        const pendingTasks = partner.sections.flatMap((s) =>
          s.tasks
            .filter((t) => t.status === "pending" || t.status === "in_progress" || t.status === "blocked")
            .map((t) => ({ section: s.title, task: t.title, status: t.status, issue: t.issue }))
        );

        return {
          sellerName: partner.sellerName,
          overallProgress: partner.overallProgress,
          targetLaunchDate: partner.targetLaunchDate,
          nextSteps: pendingTasks.slice(0, 5),
          immediateAction: pendingTasks[0]
            ? `${pendingTasks[0].issue ? "Fix blocker: " + pendingTasks[0].issue : "Complete: " + pendingTasks[0].task} in ${pendingTasks[0].section}`
            : "All immediate tasks complete — review overall progress",
        };
      }

      default:
        return { error: "Unknown query type" };
    }
  },
});
