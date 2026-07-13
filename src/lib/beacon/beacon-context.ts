import type { RecommendedTask } from "@/components/ai/tasks-panel";
import type { BeaconPage } from "@/lib/agents/system-prompt";
import {
  getLeadFormAnalysis,
  getLeadFormTasksFromAnalysis,
} from "@/lib/mock-data/lead-form-analysis";
import {
  getOnboardingReviewPanelItems,
} from "@/lib/mock-data/onboarding-review-panel";
import { getOnboardingTasksForPanel, getDocumentationEvaluation } from "@/lib/mock-data/onboarding-evaluation";
import {
  getOutreachTaskForOnboardingPage,
  outreachReminderPartners,
} from "@/lib/mock-data/outreach-mail";
import {
  getPotentialPartnerById,
  potentialPartners,
  showsLeadForm,
  showsOnboardingChecklist,
  type PartnerPipelineStatus,
} from "@/lib/mock-data/potential-partners";
import { getSellerById, sellers } from "@/lib/mock-data/sellers";
import { getStageSummary } from "@/lib/mock-data/pipeline-partners";

/** Sync gap bar rows — mirrors analytics.service getGapBarData */
const GAP_CATEGORIES = [
  { label: "Kitchen & Dining", value: 28, revenueOpportunity: "$5.6M" },
  { label: "Lighting", value: 22, revenueOpportunity: "$4.2M" },
  { label: "Furniture", value: 20, revenueOpportunity: "$3.8M" },
  { label: "Holiday & Festive Decor", value: 18, revenueOpportunity: "$3.1M" },
  { label: "Storage & Organization", value: 12, revenueOpportunity: "$2.4M" },
  { label: "Outdoor Living & Garden", value: 10, revenueOpportunity: "$1.9M" },
] as const;

const MISSING_PRODUCTS = [
  { name: "Ceramic Table Lamp", revenue: "$1.4M", category: "Lighting" },
  { name: "Glass Beverage Dispenser", revenue: "$1.2M", category: "Kitchen & Dining" },
  { name: "Storage Basket Set", revenue: "$980K", category: "Storage & Organization" },
] as const;

export interface BeaconContextInput {
  pathname: string;
  searchParams: URLSearchParams;
  statusOverrides: Record<string, PartnerPipelineStatus>;
  activeTaskId: string | null;
  planItems: string[];
  scheduledItems: { label: string; row: string }[];
}

export interface BeaconContextResult {
  page: BeaconPage;
  tasks: RecommendedTask[];
  insights: RecommendedTask[];
  starters: string[];
  contextSummary: string;
}

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

export function getPageForPath(pathname: string): BeaconPage {
  if (pathname.startsWith("/assortment/plan") || pathname.startsWith("/assortment/finalize")) {
    return "assortment-plan";
  }
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

interface OnboardingBlocker {
  partnerId: string;
  partnerName: string;
  taskTitle: string;
  description: string;
  sectionId: string;
  reviewTaskId: string;
}

function collectOnboardingBlockers(limit = 6): OnboardingBlocker[] {
  const blockers: OnboardingBlocker[] = [];

  for (const partner of potentialPartners) {
    if (!showsOnboardingChecklist(partner.status)) continue;
    const panelTasks = getOnboardingTasksForPanel(partner.sellerId);
    for (const task of panelTasks) {
      blockers.push({
        partnerId: partner.id,
        partnerName: partner.legalBusinessName,
        taskTitle: task.title,
        description: task.description,
        sectionId: task.sectionId ?? "profile",
        reviewTaskId: task.reviewTaskId ?? task.id,
      });
    }
  }

  return blockers.slice(0, limit);
}

function buildDashboardTasks(): RecommendedTask[] {
  const tasks: RecommendedTask[] = [];
  const topGap = [...GAP_CATEGORIES].sort((a, b) => b.value - a.value)[0];
  const topProduct = MISSING_PRODUCTS[0];
  const blockers = collectOnboardingBlockers(3);
  const highMatchSellers = sellers.filter(
    (s) => s.confidenceScore >= 8.5 && (s.status === "discovered" || s.status === "shortlisted"),
  );
  const stageTotals = getStageSummary();

  tasks.push({
    id: "dash-gap-top",
    title: `${topGap.label} leads assortment gap at ${topGap.value}% vs competitors`,
    description: `${topGap.revenueOpportunity} revenue opportunity — highest priority category this quarter.`,
    actionLabel: "Explore Opportunity →",
    actionHref: "/assortment/gap",
  });

  tasks.push({
    id: "dash-product-gap",
    title: `Add ${topProduct.name} to close ${topProduct.category} gap`,
    description: `${topProduct.revenue} estimated revenue · top missing item in gap analysis.`,
    actionLabel: "View in Gap Analysis →",
    actionHref: "/assortment/gap",
  });

  if (blockers.length > 0) {
    const first = blockers[0];
    const reviewHref = `/sellers/onboarding/${first.partnerId}/review/${first.sectionId}${
      first.reviewTaskId ? `?task=${first.reviewTaskId}` : ""
    }`;
    tasks.push({
      id: `dash-onb-${first.partnerId}`,
      title: `${first.taskTitle} — ${first.partnerName}`,
      description: first.description,
      actionLabel: "Review →",
      actionHref: reviewHref,
      partnerId: first.partnerId,
      sectionId: first.sectionId,
      reviewTaskId: first.reviewTaskId,
      validationStatus: "invalid",
    });
  }

  if (blockers.length > 1) {
    tasks.push({
      id: "dash-onb-list",
      title: `${blockers.length} onboarding validation issues need review`,
      description: `Partners in onboarding: ${stageTotals.Onboarding ?? 0}. Review flagged documents and profile fields.`,
      actionLabel: "Open Onboarding →",
      actionHref: "/sellers/onboarding",
    });
  }

  if (highMatchSellers.length > 0) {
    const top = highMatchSellers.sort((a, b) => b.confidenceScore - a.confidenceScore)[0];
    tasks.push({
      id: `dash-lead-${top.id}`,
      title: `${highMatchSellers.length} high-confidence sellers ready for outreach`,
      description: `${top.legalBusinessName} scores ${top.confidenceScore.toFixed(1)}/10 in ${top.category}.`,
      actionLabel: "View Seller →",
      actionHref: `/sellers/discovery/${top.id}`,
      sellerId: top.id,
      sellerName: top.legalBusinessName,
      score: top.confidenceScore,
    });
  }

  return tasks.slice(0, 5);
}

function buildGapAnalysisTasks(): RecommendedTask[] {
  const topGap = [...GAP_CATEGORIES].sort((a, b) => b.value - a.value)[0];
  const topProduct = MISSING_PRODUCTS[0];
  const secondProduct = MISSING_PRODUCTS[1];

  return [
    {
      id: "gap-category-priority",
      title: `Close ${topGap.label} gap (${topGap.value}% lag)`,
      description: `${topGap.revenueOpportunity} opportunity · competitors lead assortment depth.`,
      actionLabel: "Add to Plan →",
      actionHref: "/assortment/plan",
    },
    {
      id: "gap-product-1",
      title: `Add ${topProduct.name} to assortment plan`,
      description: `${topProduct.revenue} estimated revenue in ${topProduct.category}.`,
      actionLabel: "Explore Item →",
    },
    {
      id: "gap-product-2",
      title: `${secondProduct.name} trending across Amazon & Walmart`,
      description: `${secondProduct.revenue} opportunity · viral search volume, low Target coverage.`,
      actionLabel: "Add to Plan →",
      actionHref: "/assortment/plan",
    },
  ];
}

function buildLeadDiscoveryTasks(): RecommendedTask[] {
  const highMatch = sellers.filter((s) => s.confidenceScore >= 8.5);
  const notShortlisted = sellers.filter((s) => s.status === "discovered" && s.confidenceScore >= 8);
  const top = [...highMatch].sort((a, b) => b.confidenceScore - a.confidenceScore)[0];

  const tasks: RecommendedTask[] = [];

  if (top) {
    tasks.push({
      id: `ld-top-${top.id}`,
      title: `Shortlist ${top.legalBusinessName} (${top.confidenceScore.toFixed(1)}/10)`,
      description: `Strong ${top.category} fit · ${top.marketplaces.join(" & ")} presence · $${(top.gmv / 1_000_000).toFixed(1)}M GMV.`,
      actionLabel: "View Profile →",
      actionHref: `/sellers/discovery/${top.id}`,
      sellerId: top.id,
      sellerName: top.legalBusinessName,
      score: top.confidenceScore,
    });
  }

  if (notShortlisted.length > 0) {
    tasks.push({
      id: "ld-shortlist-batch",
      title: `${notShortlisted.length} discovered sellers match your plan criteria`,
      description: "Confidence scores above 8.0 with assortment overlap in Lighting and Kitchen.",
      actionLabel: "Review Matches →",
      actionHref: "/sellers/discovery",
    });
  }

  const lightingSellers = sellers.filter(
    (s) => s.categories.includes("Lighting") && s.confidenceScore >= 9,
  );
  if (lightingSellers.length > 0) {
    tasks.push({
      id: "ld-lighting",
      title: `${lightingSellers.length} Lighting sellers score above 9.0`,
      description: "Aligns with Smart Lighting gap priority on the dashboard.",
      actionLabel: "Find Sellers →",
      actionHref: "/sellers/discovery",
    });
  }

  return tasks.slice(0, 4);
}

function buildOnboardingListTasks(): RecommendedTask[] {
  const blockers = collectOnboardingBlockers(4);
  const tasks: RecommendedTask[] = [getOutreachTaskForOnboardingPage()];

  for (const blocker of blockers.slice(0, 3)) {
    const reviewHref = `/sellers/onboarding/${blocker.partnerId}/review/${blocker.sectionId}${
      blocker.reviewTaskId ? `?task=${blocker.reviewTaskId}` : ""
    }`;
    tasks.push({
      id: `onb-${blocker.partnerId}-${blocker.reviewTaskId}`,
      title: `${blocker.taskTitle} — ${blocker.partnerName}`,
      description: blocker.description,
      actionLabel: "Review →",
      actionHref: reviewHref,
      partnerId: blocker.partnerId,
      sectionId: blocker.sectionId,
      reviewTaskId: blocker.reviewTaskId,
      validationStatus: "invalid",
    });
  }

  return tasks.slice(0, 5);
}

function buildPartnerProfileTasks(
  pathname: string,
  statusOverrides: Record<string, PartnerPipelineStatus>,
): RecommendedTask[] {
  const id = pathname.split("/").pop();
  const partner = id ? getPotentialPartnerById(id) : undefined;
  const effectiveStatus = partner && id ? (statusOverrides[id] ?? partner.status) : undefined;

  if (partner && effectiveStatus && showsOnboardingChecklist(effectiveStatus) && id) {
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

  if (partner && effectiveStatus && showsLeadForm(effectiveStatus) && id) {
    const analysis = getLeadFormAnalysis(id);
    if (analysis) return getLeadFormTasksFromAnalysis(analysis);
  }

  return buildOnboardingListTasks().slice(1);
}

function buildSellerProfileTasks(pathname: string): RecommendedTask[] {
  const sellerId = pathname.split("/").pop();
  const seller = sellerId ? getSellerById(sellerId) : undefined;

  if (!seller) return buildLeadDiscoveryTasks().slice(0, 2);

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
    {
      id: "sp-fit",
      title: `Strong ${seller.category} category fit detected`,
      description: `Confidence ${seller.confidenceScore.toFixed(1)}/10 · aligns with assortment plan priorities.`,
      actionLabel: "View Matches →",
      score: seller.confidenceScore,
    },
  ];
}

function buildPlanTasks(input: BeaconContextInput): RecommendedTask[] {
  const { planItems, scheduledItems } = input;
  const scheduledLabels = new Set(scheduledItems.map((s) => s.label));
  const unscheduled = planItems.filter((p) => !scheduledLabels.has(p));
  const categories = [...new Set(scheduledItems.map((s) => s.row))];

  if (planItems.length === 0) {
    return [
      {
        id: "apt-no-items",
        title: "Start with Gap Analysis",
        description: "No item types in your plan yet. Identify high-opportunity gaps first.",
        actionLabel: "Analyse Gaps →",
        actionHref: "/assortment/gap",
      },
      {
        id: "apt-beacon-hint",
        title: "Ask Beacon to build your plan",
        description: "Beacon can recommend item types that meet your revenue goal from gap data.",
        actionLabel: "Chat with Beacon →",
      },
    ];
  }

  if (scheduledItems.length === 0) {
    return [
      {
        id: "apt-drag",
        title: `${planItems.length} item type${planItems.length > 1 ? "s" : ""} ready to schedule`,
        description: "Drag items onto the calendar or let Beacon auto-schedule by demand seasonality.",
        actionLabel: "Generate Calendar →",
      },
    ];
  }

  if (unscheduled.length > 0) {
    return [
      {
        id: "apt-partial",
        title: `${scheduledItems.length} of ${planItems.length} items placed on calendar`,
        description: `Still to schedule: ${unscheduled.slice(0, 3).join(", ")}${unscheduled.length > 3 ? ` +${unscheduled.length - 3} more` : ""}.`,
        actionLabel: "Continue planning →",
      },
    ];
  }

  return [
    {
      id: "apt-done",
      title: `All ${planItems.length} item types scheduled`,
      description: `Spanning ${categories.length} categor${categories.length > 1 ? "ies" : "y"}. Ready to finalize and share.`,
      actionLabel: "Finalize & Share →",
      actionType: "open_finalize_drawer",
    },
  ];
}

function getOnboardingReviewPanelTasks(
  partnerId: string,
  pathname: string,
  searchParams: URLSearchParams,
  activeTaskId: string | null,
): { tasks: RecommendedTask[]; insights: RecommendedTask[] } {
  const partner = getPotentialPartnerById(partnerId);
  if (!partner || !showsOnboardingChecklist(partner.status)) {
    return { tasks: [], insights: [] };
  }

  if (pathname.includes("/review/profile")) {
    const taskId = searchParams.get("task") ?? activeTaskId ?? undefined;
    const panel = getOnboardingReviewPanelItems(partner.sellerId, "profile", { taskId });
    return {
      tasks: panel.tasks.map((t) => ({ ...t, partnerId })),
      insights: panel.insights.map((t) => ({ ...t, partnerId })),
    };
  }

  if (pathname.includes("/review/documentation")) {
    const docTab = searchParams.get("tab") === "brands" ? "brands" : "general";
    const panel = getOnboardingReviewPanelItems(partner.sellerId, "documentation", { docTab });
    return {
      tasks: panel.tasks.map((t) => ({ ...t, partnerId })),
      insights: panel.insights.map((t) => ({ ...t, partnerId })),
    };
  }

  return { tasks: [], insights: [] };
}

function buildConversationStarters(
  page: BeaconPage,
  _tasks: RecommendedTask[],
  insights: RecommendedTask[],
  input: BeaconContextInput,
): string[] {
  const partnerId = extractPartnerId(input.pathname);
  const partner = partnerId ? getPotentialPartnerById(partnerId) : undefined;
  const blockers = collectOnboardingBlockers(4);
  const topGap = [...GAP_CATEGORIES].sort((a, b) => b.value - a.value)[0];

  if (page === "dashboard") {
    const highMatch = sellers.filter((s) => s.confidenceScore >= 8.5).length;
    return [
      `Where should I focus first — the ${topGap.label} gap (${topGap.revenueOpportunity}) or onboarding blockers?`,
      blockers[0]
        ? `What's blocking ${blockers[0].partnerName} and how do I unblock them?`
        : "Which onboarding partners are closest to launch?",
      highMatch > 0
        ? `I have ${highMatch} high-confidence sellers — who should I reach out to first?`
        : "Which categories need new seller coverage in the pipeline?",
      "What moves us closest to the $2.5B revenue goal this quarter?",
    ];
  }

  if (page === "assortment-gap") {
    const product = MISSING_PRODUCTS[0];
    const secondGap = GAP_CATEGORIES[1];
    return [
      `Why is ${topGap.label} our largest gap at ${topGap.value}% vs competitors?`,
      `Is ${product.name} worth adding before Q1 — what's the ${product.revenue} upside?`,
      `How does Target compare to Amazon in ${secondGap.label}?`,
      "Which 3 item types would have the highest revenue impact if added now?",
    ];
  }

  if (page === "assortment-plan") {
    const { planItems, scheduledItems } = input;
    if (planItems.length === 0) {
      return [
        "Which gap items from Kitchen & Dining should I add to this plan first?",
        "Help me pick item types that hit the revenue goal fastest.",
        "What's the right mix of categories for a Q1 launch plan?",
        "Which competitor gaps should drive my plan priorities?",
      ];
    }
    if (scheduledItems.length === 0) {
      return [
        "Auto-schedule my plan items across Q1–Q4 based on seasonality.",
        "Which items should launch before Thanksgiving?",
        "What's the best launch window for Serveware and Lighting?",
        "Flag any items that conflict with holiday demand peaks.",
      ];
    }
    if (scheduledItems.length < planItems.length) {
      return [
        "Help me place the remaining items on the calendar.",
        "Are my Q1 launch windows aligned with competitor demand?",
        "Which unscheduled items have the highest revenue potential?",
        "Review timing risks in my current calendar plan.",
      ];
    }
    return [
      "Does my calendar plan maximize revenue across all quarters?",
      "Any timing conflicts between categories I should fix before sharing?",
      "Which launches should move earlier to capture holiday demand?",
      "Summarize my plan readiness for stakeholder review.",
    ];
  }

  if (page === "lead-discovery") {
    const top = [...sellers].sort((a, b) => b.confidenceScore - a.confidenceScore)[0];
    const lightingCount = sellers.filter((s) => s.categories.includes("Lighting") && s.confidenceScore >= 8).length;
    return [
      top
        ? `Why is ${top.legalBusinessName} rated ${top.confidenceScore.toFixed(1)}/10 — worth shortlisting?`
        : "Who are the top-scoring sellers in my current filters?",
      lightingCount > 0
        ? `Which Lighting sellers best close our ${topGap.revenueOpportunity} gap?`
        : "Which sellers align with my current assortment plan?",
      "Who reduces operational risk the most in Kitchen & Dining?",
      "Compare my top 3 discovered sellers side by side.",
    ];
  }

  if (page === "seller-profile") {
    const sellerId = input.pathname.split("/").pop();
    const seller = sellerId ? getSellerById(sellerId) : undefined;
    if (!seller) {
      return [
        "Who should I prioritize in Lead Discovery this week?",
        "Which sellers have the strongest assortment overlap?",
        "Find sellers that reduce category gap risk.",
        "Who's ready for outreach based on confidence score?",
      ];
    }
    return [
      `What are the main risks with ${seller.legalBusinessName}?`,
      `Does ${seller.legalBusinessName} fit our ${seller.category} assortment gaps?`,
      `Draft a personalized outreach email for ${seller.legalBusinessName}.`,
      `How does ${seller.legalBusinessName} compare to sellers already in onboarding?`,
    ];
  }

  if (page === "partner-onboarding") {
    if (input.pathname.includes("/review/documentation")) {
      const isBrands = input.searchParams.get("tab") === "brands";
      const docs = partner ? getDocumentationEvaluation(partner.sellerId) : undefined;
      const invalidBrand = docs?.brands.find((b) => b.validationStatus === "invalid");

      if (isBrands && invalidBrand) {
        return [
          `What's missing on ${invalidBrand.name}'s authorization letter?`,
          `Should I reject ${invalidBrand.name} or request a corrected document?`,
          `Which brand documents are safe to approve for ${partner?.legalBusinessName}?`,
          "What should my rejection comment say for the invalid brand doc?",
        ];
      }
      if (isBrands) {
        return [
          `Walk me through approve/reject criteria for ${partner?.legalBusinessName}'s brand docs.`,
          "Any red flags I should check before approving brand authorization letters?",
          "Which brands have the strongest documentation evidence?",
          "What does auto-validation cover vs what I need to verify manually?",
        ];
      }
      return [
        `Are ${partner?.legalBusinessName}'s address proof and DUNS certificate sufficient to approve?`,
        "What should I verify on general business documents before signing off?",
        "Any compliance gaps in the uploaded W9 or address proof?",
        "Summarize validation status for all general documents.",
      ];
    }

    if (input.pathname.includes("/review/profile")) {
      const invalidTask = blockers.find((b) => b.partnerId === partnerId);
      const validInsights = insights.filter((i) => i.validationStatus === "valid").slice(0, 2);
      return [
        invalidTask
          ? `Why was ${invalidTask.taskTitle.toLowerCase()} flagged for ${partner?.legalBusinessName}?`
          : `Summarize ${partner?.legalBusinessName}'s profile validation status.`,
        "What should I tell the partner in my review comment?",
        validInsights.length > 0
          ? `Confirm the evidence behind "${validInsights[0].title}" before I approve.`
          : "Which profile fields still need manual review?",
        "Is this partner ready to move to documentation review?",
      ];
    }

    if (partner && showsOnboardingChecklist(partner.status)) {
      const partnerBlockers = blockers.filter((b) => b.partnerId === partnerId);
      return [
        partnerBlockers[0]
          ? `What's the issue with ${partner.legalBusinessName}'s ${partnerBlockers[0].taskTitle.toLowerCase()}?`
          : `What's left for ${partner.legalBusinessName} to finish onboarding?`,
        `How far along is ${partner.legalBusinessName} compared to other partners?`,
        "Which checklist section should they tackle next?",
        `Draft a kickoff follow-up email for ${partner.legalBusinessName}.`,
      ];
    }

    if (partner && showsLeadForm(partner.status)) {
      const analysis = getLeadFormAnalysis(partner.id);
      return [
        analysis?.recommendation === "reject"
          ? `Why does Beacon recommend rejecting ${partner.legalBusinessName}?`
          : `Should I accept or defer ${partner.legalBusinessName}'s application?`,
        "What are the top risk signals in this lead form?",
        "Summarize validation results across business identity and assortment.",
        `What would a rejection comment to ${partner.legalBusinessName} look like?`,
      ];
    }

    // Partner onboarding list
    const nearComplete = outreachReminderPartners.length;
    return [
      nearComplete > 0
        ? "Thunder Brewing and Pinnacle Goods are missing docs — draft a reminder email."
        : "Which partners need a documentation follow-up this week?",
      blockers[0]
        ? `What's blocking ${blockers[0].partnerName} from going live?`
        : "Who's closest to completing onboarding?",
      blockers.length > 1
        ? `Compare validation blockers across ${blockers.slice(0, 2).map((b) => b.partnerName).join(" and ")}.`
        : "Which onboarding partners are at highest revenue risk?",
      "Prioritize my onboarding queue by launch urgency.",
    ];
  }

  return [
    "What's the highest-impact action across Acquisition & Onboarding right now?",
    `Where is our biggest assortment gap — ${topGap.label} or elsewhere?`,
    "Which partners or sellers need attention this week?",
    "Walk me through what I should focus on from this page.",
  ];
}

function buildContextSummary(
  page: BeaconPage,
  tasks: RecommendedTask[],
  input: BeaconContextInput,
): string {
  const lines: string[] = ["## Live session context (use for recommendations)"];

  lines.push(`Current path: ${input.pathname}`);
  if (input.searchParams.toString()) {
    lines.push(`Query: ${input.searchParams.toString()}`);
  }

  if (tasks.length > 0) {
    lines.push("\n### Priority recommended tasks shown in the panel");
    for (const t of tasks.slice(0, 5)) {
      lines.push(`- **${t.title}**: ${t.description || "No description"}`);
    }
  }

  if (page === "dashboard") {
    const topGap = [...GAP_CATEGORIES].sort((a, b) => b.value - a.value)[0];
    lines.push(`\nTop gap category: ${topGap.label} (${topGap.value}%, ${topGap.revenueOpportunity})`);
    const blockers = collectOnboardingBlockers(3);
    if (blockers.length) {
      lines.push(
        `Onboarding blockers: ${blockers.map((b) => `${b.partnerName} — ${b.taskTitle}`).join("; ")}`,
      );
    }
  }

  const partnerId = extractPartnerId(input.pathname);
  if (partnerId) {
    const partner = getPotentialPartnerById(partnerId);
    if (partner) {
      lines.push(`\nActive partner: ${partner.legalBusinessName} (${partner.status})`);
    }
  }

  const sellerId = input.pathname.match(/^\/sellers\/discovery\/([^/]+)/)?.[1];
  if (sellerId) {
    const seller = getSellerById(sellerId);
    if (seller) {
      lines.push(
        `\nActive seller: ${seller.legalBusinessName}, confidence ${seller.confidenceScore}/10, ${seller.category}`,
      );
    }
  }

  if (page === "assortment-plan") {
    lines.push(
      `\nPlan state: ${input.planItems.length} items, ${input.scheduledItems.length} scheduled on calendar.`,
    );
  }

  return lines.join("\n");
}

export function resolveBeaconContext(input: BeaconContextInput): BeaconContextResult {
  const page = getPageForPath(input.pathname);
  const partnerId = extractPartnerId(input.pathname);

  if (partnerId && isOnboardingReviewPath(input.pathname)) {
    const reviewPanel = getOnboardingReviewPanelTasks(
      partnerId,
      input.pathname,
      input.searchParams,
      input.activeTaskId,
    );
    const starters = buildConversationStarters(
      page,
      reviewPanel.tasks,
      reviewPanel.insights,
      input,
    );
    return {
      page,
      tasks: reviewPanel.tasks,
      insights: reviewPanel.insights,
      starters,
      contextSummary: buildContextSummary(page, reviewPanel.tasks, input),
    };
  }

  let tasks: RecommendedTask[] = [];

  if (input.pathname.startsWith("/assortment/plan") || input.pathname.startsWith("/assortment/finalize")) {
    tasks = buildPlanTasks(input);
  } else if (input.pathname.startsWith("/assortment/gap")) {
    tasks = buildGapAnalysisTasks();
  } else if (input.pathname === "/sellers/onboarding") {
    tasks = buildOnboardingListTasks();
  } else if (isPartnerProfilePath(input.pathname)) {
    tasks = buildPartnerProfileTasks(input.pathname, input.statusOverrides);
  } else if (isSellerProfilePath(input.pathname)) {
    tasks = buildSellerProfileTasks(input.pathname);
  } else if (input.pathname.startsWith("/sellers/discovery")) {
    tasks = buildLeadDiscoveryTasks();
  } else if (input.pathname.startsWith("/dashboard")) {
    tasks = buildDashboardTasks();
  } else {
    tasks = buildDashboardTasks();
  }

  const starters = buildConversationStarters(page, tasks, [], input);

  return {
    page,
    tasks,
    insights: [],
    starters,
    contextSummary: buildContextSummary(page, tasks, input),
  };
}
