export type AssortmentGapSeverity = "high" | "medium" | "low";

export interface AssortmentGap {
  id: string;
  category: string;
  competitor: string;
  gapScore: number;
  severity: AssortmentGapSeverity;
  estimatedRevenue: number;
  productCount: number;
}

export interface AssortmentPlan {
  id: string;
  name: string;
  category: string;
  targetSellers: number;
  status: "draft" | "active" | "completed";
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: "onboarding" | "review" | "launch";
  sellerId?: string;
}
