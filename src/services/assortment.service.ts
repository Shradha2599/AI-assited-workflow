import type { AssortmentGap, AssortmentPlan } from "@/types";

export async function getAssortmentGaps(): Promise<AssortmentGap[]> {
  return [
    {
      id: "gap-1",
      category: "Electronics",
      competitor: "Competitor A",
      gapScore: 92,
      severity: "high",
      estimatedRevenue: 850000,
      productCount: 142,
    },
    {
      id: "gap-2",
      category: "Home & Garden",
      competitor: "Competitor B",
      gapScore: 78,
      severity: "high",
      estimatedRevenue: 620000,
      productCount: 98,
    },
    {
      id: "gap-3",
      category: "Sports & Outdoors",
      competitor: "Competitor C",
      gapScore: 54,
      severity: "medium",
      estimatedRevenue: 310000,
      productCount: 67,
    },
    {
      id: "gap-4",
      category: "Beauty",
      competitor: "Competitor A",
      gapScore: 41,
      severity: "low",
      estimatedRevenue: 180000,
      productCount: 45,
    },
  ];
}

export async function getAssortmentPlans(): Promise<AssortmentPlan[]> {
  return [
    {
      id: "plan-1",
      name: "Q3 Electronics Expansion",
      category: "Electronics",
      targetSellers: 25,
      status: "active",
      createdAt: "2026-06-01",
    },
    {
      id: "plan-2",
      name: "Home & Garden Growth",
      category: "Home & Garden",
      targetSellers: 18,
      status: "draft",
      createdAt: "2026-06-15",
    },
  ];
}

export async function getCalendarEvents() {
  return [
    {
      id: "evt-1",
      title: "Electronics seller kickoff",
      date: "2026-07-01",
      type: "onboarding" as const,
    },
    {
      id: "evt-2",
      title: "Document review — Batch 12",
      date: "2026-07-03",
      type: "review" as const,
    },
    {
      id: "evt-3",
      title: "Home & Garden launch",
      date: "2026-07-15",
      type: "launch" as const,
    },
  ];
}
