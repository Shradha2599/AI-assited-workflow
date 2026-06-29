export type BeaconWidgetType =
  | "recommendation"
  | "task"
  | "insight"
  | "opportunity";

export interface BeaconRecommendation {
  id: string;
  type: BeaconWidgetType;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  confidence?: number;
}

export interface BeaconMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface BeaconContext {
  pageId: string;
  pageTitle: string;
  summary?: string;
  recommendations: BeaconRecommendation[];
}
