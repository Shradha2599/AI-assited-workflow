"use client";

import { ArrowRight, Check, Copy, ExternalLink, Loader2, Pencil, Plus, RotateCcw, ThumbsDown, ThumbsUp, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { useGapDrawerStore } from "@/features/assortment-gap/store/gap-drawer-store";

import { Button } from "@/components/ui/button";
import { TruncatedText } from "@/components/ui/truncated-text";

import { SvgIcon } from "@/components/ui/svg-icon";
import { StatusTag } from "@/components/ui/status-tag";
import { useOnboardingReviewStore } from "@/features/partner-onboarding/store/onboarding-review-store";
import { useOutreachStore } from "@/features/outreach/store/outreach-store";
import { usePlanStore } from "@/features/assortment-plan/store/plan-store";
import { usePartnerReviewStore } from "@/features/partner-onboarding/store/partner-review-store";
import { getPotentialPartnerById } from "@/lib/mock-data/potential-partners";
import { statusLabel } from "@/lib/mock-data/lead-form-analysis";
import { cn } from "@/lib/utils";
import type { BeaconPage } from "@/lib/agents/system-prompt";

export interface RecommendedTask {
  id: string;
  title: string;
  description: string;
  actionLabel: string;
  actionHref?: string;
  actionType?: "open_analysis" | "open_onboarding_comment" | "approve_onboarding" | "navigate_review" | "open_outreach" | "open_finalize_drawer" | "lead_decision";
  secondaryActionLabel?: string;
  leadDecision?: "accept" | "reject" | "future_interest";
  partnerId?: string;
  score?: number;
  sellerId?: string;
  sellerName?: string;
  sellerWebsite?: string;
  mailType?: "document_reminder" | "acquisition_outreach" | "onboarding_kickoff" | "onboarding_completion";
  validationStatus?: "valid" | "invalid" | "partial" | "unverified";
  source?: string;
  checkedOn?: string;
  sectionId?: string;
  reviewTaskId?: string;
}

interface TasksPanelProps {
  tasks: RecommendedTask[];
  insights?: RecommendedTask[];
  showInsightsTab?: boolean;
  defaultTab?: "tasks" | "beacon" | "insights";
  page?: BeaconPage;
  /** Context-aware conversation starters — derived from current page data */
  starterPrompts?: string[];
  /** Extra context appended to Beacon system prompt */
  contextSummary?: string;
  pathname?: string;
}

function scoreBadgeColor(score: number): string {
  if (score >= 9) return "bg-green-600";
  if (score >= 8) return "bg-green-500";
  if (score >= 7) return "bg-amber-500";
  return "bg-red-500";
}

function validationBadgeClass(status: RecommendedTask["validationStatus"]): string {
  if (status === "valid") return "bg-[var(--color-success-light)] text-[var(--color-success)]";
  if (status === "invalid") return "bg-[var(--color-error-light)] text-[var(--color-error)]";
  if (status === "partial") return "bg-[var(--color-warning-light)] text-[var(--color-warning)]";
  return "bg-[var(--color-muted)] text-[var(--color-muted-foreground)]";
}

function OnboardingTaskCard({
  task,
  onAction,
  approved,
}: {
  task: RecommendedTask;
  onAction: (task: RecommendedTask) => void;
  approved?: boolean;
}) {
  return (
    <article className="rounded-[var(--radius-lg)] bg-[var(--color-task-card)] p-[var(--space-4)]">
      <div className="flex items-start gap-3">
        <SvgIcon name="aiSparkle" size={16} variant="primary" className="shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-[var(--text-body-size)] font-medium leading-snug">{task.title}</h3>
            <div className="flex shrink-0 items-center gap-2">
              {task.validationStatus && (
                <StatusTag className={validationBadgeClass(task.validationStatus)}>
                  {statusLabel(task.validationStatus)}
                </StatusTag>
              )}
              {task.score != null && (
                <StatusTag className={cn("text-white", scoreBadgeColor(task.score))}>
                  {task.score.toFixed(1)}/10
                </StatusTag>
              )}
              {task.sectionId && (
                <Link
                  href={`/sellers/onboarding/${task.partnerId ?? ""}/review/${task.sectionId}${task.reviewTaskId ? `?task=${task.reviewTaskId}` : ""}`}
                  className="text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)]"
                  aria-label="Open review"
                >
                  <ExternalLink className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
          <p className="mt-1 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
            {task.description}
          </p>
          {task.source && (
            <p className="mt-1 text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">
              Source: {task.source}
              {task.checkedOn ? ` · Checked on ${task.checkedOn}` : ""}
            </p>
          )}
          {task.actionHref ? (
            <Button variant="ghost" size="sm" className="mt-2 h-auto px-0 py-0 text-[var(--color-primary)]" asChild>
              <Link href={task.actionHref}>{task.actionLabel}</Link>
            </Button>
          ) : approved && task.actionType === "approve_onboarding" ? (
            <span className="mt-2 inline-flex items-center gap-1 text-[var(--text-caption-size)] font-medium text-[var(--color-success)]">
              <Check className="h-3 w-3" /> Approved
            </span>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 h-auto px-0 py-0 text-[var(--color-primary)]"
              onClick={() => onAction(task)}
            >
              {task.actionLabel}
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}

function StandardTaskCard({
  task,
  onAction,
  onSecondaryAction,
}: {
  task: RecommendedTask;
  onAction: (task: RecommendedTask) => void;
  onSecondaryAction?: (task: RecommendedTask) => void;
}) {
  return (
    <article className="rounded-[var(--radius-lg)] bg-[var(--color-task-card)] p-[var(--space-4)]">
      <div className="flex items-start gap-3">
        <SvgIcon name="aiSparkle" size={16} variant="primary" className="shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-[var(--text-body-size)] font-medium leading-snug text-[var(--color-foreground)]">
              {task.title}
            </h3>
            <div className="flex shrink-0 items-center gap-2">
              {task.score != null && (
                <StatusTag className={cn("text-white", scoreBadgeColor(task.score))}>
                  {task.score.toFixed(1)}/10
                </StatusTag>
              )}
              <button type="button" className="text-[var(--color-muted-foreground)]" aria-label="More options">
                <SvgIcon name="menuAction" size={16} />
              </button>
            </div>
          </div>
          <p className="mt-1 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
            {task.description}
          </p>
          {task.actionHref ? (
            <Button variant="ghost" size="sm" className="mt-2 h-auto px-0 py-0 text-[var(--color-primary)]" asChild>
              <Link href={task.actionHref}>{task.actionLabel}</Link>
            </Button>
          ) : (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-auto px-0 py-0 text-[var(--color-primary)]"
                onClick={() => onAction(task)}
              >
                {task.actionLabel}
              </Button>
              {task.secondaryActionLabel && task.leadDecision && onSecondaryAction && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSecondaryAction(task)}
                >
                  {task.secondaryActionLabel}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

// ─── Suggested items catalog — keyed by category ─────────────────────────────
type SuggestedItem = { id: string; name: string; opportunity: string; img: string };

const ITEMS_BY_CATEGORY: Record<string, SuggestedItem[]> = {
  "Lighting": [
    { id: "l-1", name: "Ceramic Table Lamp",      opportunity: "82% opp.", img: "/images/products/ceramic-table-lamp.svg" },
    { id: "l-2", name: "Pendant Light Fixture",   opportunity: "76% opp.", img: "/images/products/pendant-light-fixture.svg" },
    { id: "l-3", name: "Outdoor String Lights",   opportunity: "71% opp.", img: "/images/products/outdoor-string-lights.svg" },
    { id: "l-4", name: "Halloween Lantern Set",   opportunity: "68% opp.", img: "/images/products/halloween-lantern-set.svg" },
  ],
  "Serveware": [
    { id: "sw-1", name: "Ceramic Serving Bowls",       opportunity: "79% opp.", img: "/images/products/ceramic-serving-high-bowls.svg" },
    { id: "sw-2", name: "Glass Beverage Dispenser",    opportunity: "74% opp.", img: "/images/products/glass-beverage-dispenser.svg" },
    { id: "sw-3", name: "Cake Stands & Tiered Servers",opportunity: "72% opp.", img: "/images/products/cake-stands-tiered-servers.svg" },
    { id: "sw-4", name: "Dip & Condiment Servers",     opportunity: "65% opp.", img: "/images/products/dip-condiment-servers.svg" },
    { id: "sw-5", name: "Sugar Bowl & Creamer Sets",   opportunity: "61% opp.", img: "/images/products/sugar-bowl-creamer-sets.svg" },
  ],
  "Kitchen & Dining": [
    { id: "kd-1", name: "Glass Cake Domes",              opportunity: "77% opp.", img: "/images/products/glass-cake-domes.svg" },
    { id: "kd-2", name: "Cupcake Stand & Tiered Server", opportunity: "70% opp.", img: "/images/products/cupcake-stand-tiered-server.svg" },
    { id: "kd-3", name: "Ceramic Serving Bowls",         opportunity: "68% opp.", img: "/images/products/ceramic-serving-high-bowls.svg" },
    { id: "kd-4", name: "Sugar Bowl & Creamer Sets",     opportunity: "62% opp.", img: "/images/products/sugar-bowl-creamer-sets.svg" },
  ],
  "Furniture": [
    { id: "f-1", name: "Decorative Wall Mirror",   opportunity: "75% opp.", img: "/images/products/decorative-wall-mirror.svg" },
    { id: "f-2", name: "Linen Dining Chair Cover", opportunity: "69% opp.", img: "/images/products/linen-dining-chair-cover.svg" },
    { id: "f-3", name: "Storage Basket Set",       opportunity: "66% opp.", img: "/images/products/storage-basket-set.svg" },
  ],
  "Storage & Organization": [
    { id: "so-1", name: "Storage Basket Set",      opportunity: "80% opp.", img: "/images/products/storage-basket-set.svg" },
    { id: "so-2", name: "Decorative Wall Mirror",  opportunity: "65% opp.", img: "/images/products/decorative-wall-mirror.svg" },
  ],
  "Outdoor Living & Garden": [
    { id: "og-1", name: "Outdoor String Lights",  opportunity: "78% opp.", img: "/images/products/outdoor-string-lights.svg" },
    { id: "og-2", name: "Halloween Lantern Set",  opportunity: "71% opp.", img: "/images/products/halloween-lantern-set.svg" },
  ],
};

/**
 * Returns the gap category being discussed if the AI is making a product
 * recommendation, otherwise returns null (no widget shown).
 */
function extractSuggestedCategory(content: string): string | null {
  const lower = content.toLowerCase();

  // Only show widget if the AI is actively recommending products/items
  const isRecommending =
    /\b(recommend|suggest|add|consider|prioritize|plan|schedule|expand|launch|focus)\b/.test(lower);
  const isAboutItems =
    /\b(item|product|sku|type|category|assortment|gap|coverage)\b/.test(lower);
  if (!isRecommending || !isAboutItems) return null;

  // Most-specific category wins
  if (/\b(lighting|lamp|pendant|fixture|lantern|string light)\b/.test(lower)) return "Lighting";
  if (/\b(serveware|serving bowl|beverage dispenser|cake stand|condiment)\b/.test(lower)) return "Serveware";
  if (/\b(kitchen|dining|cookware|bakeware|cake dome|cupcake)\b/.test(lower)) return "Kitchen & Dining";
  if (/\b(storage|basket|organiz|bin|container)\b/.test(lower)) return "Storage & Organization";
  if (/\b(furniture|mirror|chair|sofa|table)\b/.test(lower)) return "Furniture";
  if (/\b(outdoor|garden|patio|lawn)\b/.test(lower)) return "Outdoor Living & Garden";

  return null;
}

function SuggestedItemsWidget({
  category,
  onViewItems,
}: {
  category: string;
  onViewItems: () => void;
}) {
  const items = ITEMS_BY_CATEGORY[category] ?? ITEMS_BY_CATEGORY["Serveware"];
  const visible = items.slice(0, 2);
  const remaining = items.length - 2;

  return (
    <div className="overflow-hidden rounded-[var(--radius-md)] border border-[#e5e7eb] bg-white shadow-sm">
      <div className="border-b border-[#f3f4f6] px-3 py-2">
        <p className="text-[11px] font-semibold text-[var(--color-foreground)]">Suggested Items</p>
        <p className="text-[10px] text-[var(--color-muted-foreground)]">{category} · Based on assortment gap analysis</p>
      </div>
      <div className="divide-y divide-[#f3f4f6]">
        {visible.map((item) => (
          <div key={item.id} className="flex items-center gap-2 px-3 py-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[#f9fafb]">
              <Image src={item.img} alt={item.name} width={28} height={28} className="object-contain" />
            </div>
            <div className="min-w-0 flex-1">
              <TruncatedText
                text={item.name}
                className="text-[11px] font-medium text-[var(--color-foreground)]"
              />
              <p className="text-[10px] text-[var(--color-muted-foreground)]">{item.opportunity}</p>
            </div>
            <button
              type="button"
              className="flex shrink-0 cursor-pointer items-center gap-0.5 rounded-[var(--radius-sm)] border border-[var(--color-primary)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)] hover:text-white"
            >
              <Plus className="h-2.5 w-2.5" /> Add
            </button>
          </div>
        ))}
      </div>
      {remaining > 0 && (
        <div className="border-t border-[#f3f4f6] px-3 py-1.5 text-[10px] text-[var(--color-muted-foreground)]">
          +{remaining} more items
        </div>
      )}
      <div className="flex items-center gap-2 border-t border-[#e5e7eb] px-3 py-2">
        <Button variant="ghost" size="sm" className="h-auto px-0 py-0 text-[10px]" onClick={onViewItems}>
          View Items <ArrowRight className="h-2.5 w-2.5" />
        </Button>
        <span className="text-[var(--color-muted-foreground)]">·</span>
        <Button variant="ghost" size="sm" className="h-auto px-0 py-0 text-[10px]" asChild>
          <Link href="/assortment/plan">Open Plan <ArrowRight className="h-2.5 w-2.5" /></Link>
        </Button>
      </div>
    </div>
  );
}

// ─── Bad-response modal ───────────────────────────────────────────────────────
const BAD_RESPONSE_REASONS = [
  "Not accurate",
  "Irrelevant to my question",
  "Incomplete response",
  "Harmful or inappropriate",
  "Other",
];

function BadResponseModal({ onClose }: { onClose: () => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [details, setDetails] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center bg-black/40 p-4">
        <div className="w-full max-w-sm rounded-[var(--radius-lg)] bg-white p-6 shadow-[var(--shadow-drawer)]">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <Check className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-[var(--text-body-size)] font-semibold text-[var(--color-foreground)]">Feedback submitted</p>
            <p className="text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">Thank you — Beacon will use this to improve future responses.</p>
            <Button size="sm" onClick={onClose} className="mt-1">Done</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-[var(--radius-lg)] bg-white shadow-[var(--shadow-drawer)]">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
          <div>
            <p className="text-[var(--text-body-size)] font-semibold text-[var(--color-foreground)]">What went wrong?</p>
            <p className="text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">Help Beacon improve its responses</p>
          </div>
          <button type="button" onClick={onClose} className="cursor-pointer rounded p-1 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-2 px-5 py-4">
          {BAD_RESPONSE_REASONS.map((reason) => (
            <label key={reason} className="flex cursor-pointer items-center gap-2.5">
              <input
                type="radio"
                name="bad-reason"
                value={reason}
                checked={selected === reason}
                onChange={() => setSelected(reason)}
                className="accent-[var(--color-primary)]"
              />
              <span className="text-[var(--text-caption-size)] text-[var(--color-foreground)]">{reason}</span>
            </label>
          ))}
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Additional details (optional)"
            rows={2}
            className="mt-2 w-full resize-none rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2 text-[var(--text-caption-size)] placeholder:text-[var(--color-muted-foreground)] focus:border-[var(--color-primary)] focus:outline-none"
          />
        </div>
        <div className="flex justify-end gap-2 border-t border-[var(--color-border)] px-5 py-3">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" disabled={!selected} onClick={() => setSubmitted(true)}>Submit Feedback</Button>
        </div>
      </div>
    </div>
  );
}

export function TasksPanel({
  tasks,
  insights = [],
  showInsightsTab = false,
  defaultTab = "tasks",
  page,
  starterPrompts = [],
  contextSummary = "",
  pathname = "",
}: TasksPanelProps) {
  const openGapDrawer = useGapDrawerStore((s) => s.openDrawer);

  const [activeTab, setActiveTab] = useState<"tasks" | "beacon" | "insights">(
    defaultTab === "insights" ? "insights" : defaultTab === "beacon" ? "beacon" : "tasks",
  );
  const [inputValue, setInputValue] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [feedback, setFeedback] = useState<Record<string, "good" | "bad">>({});
  const [badModalMessageId, setBadModalMessageId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const openAnalysis = usePartnerReviewStore((s) => s.openAnalysis);
  const setPartnerDecision = usePartnerReviewStore((s) => s.setPartnerDecision);
  const openComments = useOnboardingReviewStore((s) => s.openComments);
  const approveItem = useOnboardingReviewStore((s) => s.approveItem);
  const isApproved = useOnboardingReviewStore((s) => s.isApproved);
  const openOutreach = useOutreachStore((s) => s.openDrawer);
  const openFinalizeDrawer = usePlanStore((s) => s.openFinalizeDrawer);

  const { messages, append, setMessages, reload, isLoading, error } = useChat({
    api: "/api/beacon",
    body: { page, contextSummary, pathname },
    id: `beacon-${page ?? "global"}-${pathname}`,
  });

  useEffect(() => {
    if (activeTab === "beacon") {
      const el = messagesContainerRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    }
  }, [messages, activeTab]);

  function handleTaskAction(task: RecommendedTask) {
    if (task.actionType === "open_analysis") {
      openAnalysis();
      return;
    }
    if (task.actionType === "open_onboarding_comment" && task.reviewTaskId) {
      openComments(task.reviewTaskId);
      return;
    }
    if (task.actionType === "approve_onboarding" && task.reviewTaskId) {
      approveItem(task.reviewTaskId);
      return;
    }
    if (task.actionType === "open_outreach" && task.mailType) {
      openOutreach({
        mailType: task.mailType,
        partnerId: task.partnerId,
        sellerId: task.sellerId,
        sellerName: task.sellerName,
        sellerWebsite: task.sellerWebsite,
        multiPartner: task.mailType === "document_reminder" && !task.partnerId,
      });
      return;
    }
    if (task.actionType === "open_finalize_drawer") {
      openFinalizeDrawer();
    }
  }

  function handleTaskSecondaryAction(task: RecommendedTask) {
    if (task.actionType === "lead_decision" || task.leadDecision) {
      if (!task.partnerId || !task.leadDecision) return;
      const partner = getPotentialPartnerById(task.partnerId);
      if (partner) {
        setPartnerDecision(partner.id, partner.legalBusinessName, task.leadDecision);
      }
    }
  }

  function handleSubmit(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    setInputValue("");
    append({ role: "user", content: trimmed });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(inputValue);
    }
  }

  function handleEditSubmit(messageId: string) {
    const trimmed = editValue.trim();
    if (!trimmed) return;
    const idx = messages.findIndex((m) => m.id === messageId);
    if (idx === -1) return;
    setMessages(messages.slice(0, idx));
    setEditingId(null);
    setEditValue("");
    append({ role: "user", content: trimmed });
  }

  function handleRetry(messageId: string) {
    const idx = messages.findIndex((m) => m.id === messageId);
    if (idx === -1) return;
    setMessages(messages.slice(0, idx));
    reload();
  }

  function handleCopy(content: string, id: string) {
    navigator.clipboard.writeText(content).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  function handleFeedback(id: string, type: "good" | "bad") {
    setFeedback((prev) => ({ ...prev, [id]: type }));
    if (type === "bad") setBadModalMessageId(id);
  }

  const insightItems = insights.length > 0 ? insights : [];

  const isOnboardingPanel =
    showInsightsTab ||
    tasks.some((t) => t.validationStatus) ||
    insightItems.some((t) => t.validationStatus);

  return (
    <aside
      className="flex h-full min-h-0 flex-col overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-tasks-panel)] shadow-[var(--shadow-medium)]"
      aria-label="Tasks and AI assistant"
    >
      <div className="shrink-0 p-[var(--space-3)]">
        <div className="flex rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-card)] p-0.5">
          <button
            type="button"
            onClick={() => setActiveTab("tasks")}
            className={cn(
              "flex-1 rounded-[var(--radius-sm)] px-3 py-1.5 text-[var(--text-caption-size)] font-medium transition-colors",
              activeTab === "tasks"
                ? "bg-[var(--color-tasks-tab-active)] text-white"
                : "bg-[var(--color-tasks-tab-inactive)] text-[var(--color-muted-foreground)]",
            )}
          >
            Tasks
          </button>
          {showInsightsTab ? (
            <button
              type="button"
              onClick={() => setActiveTab("insights")}
              className={cn(
                "flex-1 rounded-[var(--radius-sm)] px-3 py-1.5 text-[var(--text-caption-size)] font-medium transition-colors",
                activeTab === "insights"
                  ? "bg-[var(--color-tasks-tab-active)] text-white"
                  : "bg-[var(--color-tasks-tab-inactive)] text-[var(--color-muted-foreground)]",
              )}
            >
              Insights
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setActiveTab("beacon")}
              className={cn(
                "flex-1 rounded-[var(--radius-sm)] px-3 py-1.5 text-[var(--text-caption-size)] font-medium transition-colors",
                activeTab === "beacon"
                  ? "bg-[var(--color-tasks-tab-active)] text-white"
                  : "bg-[var(--color-tasks-tab-inactive)] text-[var(--color-muted-foreground)]",
              )}
            >
              Chat with Beacon
            </button>
          )}
        </div>
      </div>

      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-[var(--space-4)]">
        {activeTab === "tasks" ? (
          <>
            <h2 className="mb-[var(--space-4)] text-[var(--text-body-size)] font-bold text-[var(--color-foreground)]">
              Recommended Tasks
            </h2>
            <div className="space-y-[var(--space-3)]">
              {tasks.length === 0 ? (
                <p className="text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
                  No pending review tasks.
                </p>
              ) : (
                tasks.map((task) =>
                  isOnboardingPanel ? (
                    <OnboardingTaskCard
                      key={task.id}
                      task={task}
                      onAction={handleTaskAction}
                      approved={task.reviewTaskId ? isApproved(task.reviewTaskId) : false}
                    />
                  ) : (
                    <StandardTaskCard
                      key={task.id}
                      task={task}
                      onAction={handleTaskAction}
                      onSecondaryAction={handleTaskSecondaryAction}
                    />
                  ),
                )
              )}
            </div>

            {!showInsightsTab && insightItems.length > 0 && (
              <div className="mt-[var(--space-6)]">
                <h3 className="mb-[var(--space-3)] text-[var(--text-body-size)] font-bold text-[var(--color-foreground)]">
                  Validation Insights
                </h3>
                <div className="space-y-[var(--space-3)]">
                  {insightItems.map((task) => (
                    <OnboardingTaskCard
                      key={task.id}
                      task={task}
                      onAction={handleTaskAction}
                      approved={task.reviewTaskId ? isApproved(task.reviewTaskId) : false}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        ) : activeTab === "insights" ? (
          <>
            <h2 className="mb-[var(--space-4)] text-[var(--text-section-size)] font-semibold text-[var(--color-foreground)]">
              Insights
            </h2>
            <div className="space-y-[var(--space-3)]">
              {insightItems.length === 0 ? (
                <p className="text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
                  No validated insights yet.
                </p>
              ) : (
                insightItems.map((task) => (
                  <OnboardingTaskCard
                    key={task.id}
                    task={task}
                    onAction={handleTaskAction}
                    approved={task.reviewTaskId ? isApproved(task.reviewTaskId) : false}
                  />
                ))
              )}
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col gap-[var(--space-3)]">
            {messages.length === 0 ? (
              <div className="flex flex-col gap-[var(--space-2)]">
                <p className="text-[var(--text-label-size)] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                  Try asking
                </p>
                {(starterPrompts.length > 0
                  ? starterPrompts
                  : ["What are the highest-priority actions on this page right now?"]
                ).map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => handleSubmit(prompt)}
                    className="group flex cursor-pointer items-start gap-2.5 rounded-[var(--radius-md)] border border-[var(--color-primary)] bg-white px-[var(--space-3)] py-[var(--space-2)] text-left transition-colors hover:bg-[var(--color-ai-insight)]"
                  >
                    <SvgIcon name="aiSparkle" size={14} variant="primary" className="mt-0.5 shrink-0" />
                    <span className="text-[var(--text-caption-size)] text-[var(--color-foreground)]">{prompt}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-[var(--space-3)]">
                {messages.map((msg) => {
                  const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                  const isEditing = editingId === msg.id;
                  const fb = feedback[msg.id];
                  return (
                    <div key={msg.id} className={cn("flex flex-col gap-1", msg.role === "user" ? "items-end" : "items-start")}>
                      {msg.role === "user" ? (
                        <>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-[var(--color-muted-foreground)]">You</span>
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-primary)] text-[10px] font-bold text-white">J</div>
                          </div>
                          {isEditing ? (
                            <div className="w-full max-w-[92%]">
                              <textarea
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleEditSubmit(msg.id); }
                                  if (e.key === "Escape") { setEditingId(null); setEditValue(""); }
                                }}
                                autoFocus
                                rows={2}
                                className="w-full resize-none rounded-[var(--radius-md)] border border-[var(--color-primary)] bg-[#f3f4f6] px-3 py-2 text-[var(--text-caption-size)] leading-relaxed text-[var(--color-foreground)] focus:outline-none"
                              />
                              <div className="mt-1 flex justify-end gap-1.5">
                                <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px]" onClick={() => { setEditingId(null); setEditValue(""); }}>Cancel</Button>
                                <Button size="sm" className="h-6 px-2 text-[10px]" onClick={() => handleEditSubmit(msg.id)} disabled={!editValue.trim() || isLoading}>Send</Button>
                              </div>
                            </div>
                          ) : (
                            <div className="max-w-[88%] rounded-[var(--radius-lg)] rounded-tr-sm bg-[#f3f4f6] px-[var(--space-3)] py-[var(--space-2)] text-[var(--text-caption-size)] leading-relaxed text-[var(--color-foreground)]">
                              {msg.content}
                            </div>
                          )}
                          {!isEditing && (
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-[var(--color-muted-foreground)]">{time}</span>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  aria-label="Edit message"
                                  onClick={() => { setEditingId(msg.id); setEditValue(msg.content); }}
                                  className="cursor-pointer rounded p-0.5 text-[var(--color-muted-foreground)] transition-colors hover:text-[var(--color-foreground)]"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  aria-label="Copy message"
                                  onClick={() => handleCopy(msg.content, msg.id)}
                                  className="cursor-pointer rounded p-0.5 transition-colors hover:text-[var(--color-foreground)]"
                                >
                                  {copiedId === msg.id
                                    ? <Check className="h-3.5 w-3.5 text-green-600" />
                                    : <Copy className="h-3.5 w-3.5 text-[var(--color-muted-foreground)]" />
                                  }
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-1.5">
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-ai-insight-border)]">
                              <SvgIcon name="aiSparkle" size={12} variant="primary" />
                            </div>
                            <span className="text-[10px] font-medium text-[var(--color-primary)]">Beacon</span>
                          </div>
                          <div className="w-full max-w-[92%] rounded-[var(--radius-lg)] rounded-tl-sm border border-[#e5e7eb] bg-white px-[var(--space-3)] py-[var(--space-2)]">
                            <p className="whitespace-pre-wrap text-[var(--text-caption-size)] leading-relaxed text-[var(--color-foreground)]">
                              {msg.content}
                            </p>
                          </div>
                          {(() => {
                            const cat = extractSuggestedCategory(msg.content);
                            return cat ? (
                              <div className="w-full max-w-[92%]">
                                <SuggestedItemsWidget
                                  category={cat}
                                  onViewItems={() => openGapDrawer(cat)}
                                />
                              </div>
                            ) : null;
                          })()}
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-[var(--color-muted-foreground)]">{time}</span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                aria-label="Good response"
                                onClick={() => handleFeedback(msg.id, "good")}
                                className={cn("cursor-pointer rounded p-0.5 transition-colors", fb === "good" ? "text-green-600" : "text-[var(--color-muted-foreground)] hover:text-green-600")}
                              >
                                <ThumbsUp className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                aria-label="Bad response"
                                onClick={() => handleFeedback(msg.id, "bad")}
                                className={cn("cursor-pointer rounded p-0.5 transition-colors", fb === "bad" ? "text-red-500" : "text-[var(--color-muted-foreground)] hover:text-red-500")}
                              >
                                <ThumbsDown className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                aria-label="Retry"
                                onClick={() => handleRetry(msg.id)}
                                disabled={isLoading}
                                className="cursor-pointer rounded p-0.5 text-[var(--color-muted-foreground)] transition-colors hover:text-[var(--color-foreground)] disabled:opacity-40"
                              >
                                <RotateCcw className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
                {isLoading && (
                  <div className="flex flex-col items-start gap-1">
                    <div className="flex items-center gap-1.5">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-ai-insight-border)]">
                        <SvgIcon name="aiSparkle" size={12} variant="primary" />
                      </div>
                      <span className="text-[10px] font-medium text-[var(--color-primary)]">Beacon</span>
                    </div>
                    <div className="rounded-[var(--radius-lg)] rounded-tl-sm border border-[#e5e7eb] bg-white px-[var(--space-3)] py-[var(--space-2)]">
                      <div className="flex items-center gap-1.5 text-[var(--color-muted-foreground)]">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span className="text-[var(--text-caption-size)]">Thinking…</span>
                      </div>
                    </div>
                  </div>
                )}
                {error && (
                  <div className="rounded-[var(--radius-md)] border border-red-200 bg-red-50 px-[var(--space-3)] py-[var(--space-2)] text-[var(--text-caption-size)] text-red-700">
                    Something went wrong. Please try again.
                  </div>
                )}
              </div>
            )}
            {badModalMessageId && <BadResponseModal onClose={() => setBadModalMessageId(null)} />}
          </div>
        )}
      </div>

      {activeTab === "beacon" && (
        <div className="shrink-0 border-t border-[var(--color-border)] p-[var(--space-3)]">
          <div className="flex items-center gap-2">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Write here"
              rows={1}
              className="h-7 min-h-7 flex-1 resize-none rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-[var(--space-3)] py-0 text-[var(--text-caption-size)] leading-7 placeholder:text-[var(--color-muted-foreground)] focus:border-[var(--color-primary)] focus:outline-none"
              aria-label="Message Beacon"
            />
            <Button
              size="sm"
              className="shrink-0"
              onClick={() => handleSubmit(inputValue)}
              disabled={isLoading || !inputValue.trim()}
            >
              Send
            </Button>
          </div>
          <p className="mt-1.5 text-center text-[10px] text-[var(--color-muted-foreground)]">
            GenAI related information
          </p>
        </div>
      )}
    </aside>
  );
}
