"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Copy, Send, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { cn } from "@/lib/utils";
import { usePlanStore } from "@/features/assortment-plan/store/plan-store";
import { useToastStore } from "@/stores/toast-store";

// ── Email draft generator (outreach agent logic) ──────────────────────────────

interface EmailDraft {
  to: string;
  subject: string;
  body: string;
}


function generateOutreachDraft(
  categories: string[],
  items: string[],
  totalRevM: number,
  versions: string[],
): EmailDraft {
  const catList = categories.length > 0
    ? categories.join(", ")
    : "Home & Living";
  const itemCount = items.length;
  const revStr = `$${totalRevM.toFixed(1)}M`;
  const versionName = versions[0] ?? "Version 1";

  return {
    to: "marketplace-partners@target.com",
    subject: `Q1 FY 2025-26 Assortment Plan — Seller Outreach Opportunity (${catList})`,
    body: `Hi Target+ Marketplace Partner Team,

I'm reaching out on behalf of the Target+ Acquisition & Onboarding team regarding our finalized FY 2025-26 assortment plan for the ${catList} categories.

We have identified ${itemCount} high-priority item type${itemCount > 1 ? "s" : ""} representing an estimated ${revStr} annual revenue opportunity where Target has a significant gap versus key competitors (Amazon, Walmart, Wayfair).

**${versionName} — Assortment Plan Highlights**

${items.slice(0, 6).map((item, i) => `${i + 1}. ${item}`).join("\n")}${items.length > 6 ? `\n   … and ${items.length - 6} more item types` : ""}

These categories are currently under-indexed at Target+ with a lag of 20–36% vs competitors. We are actively seeking qualified sellers who can supply these items at scale.

If you or any sellers in your network specialize in ${catList}, I'd welcome a conversation to discuss:
• Product listing requirements & category specifications
• Onboarding timeline and go-live targets (Q1: Nov–Jan launch)
• GMV potential and co-marketing opportunities

Please reply to this email or book a 30-minute discovery call using the link below.

We look forward to partnering with you to close this gap and grow together.

Warm regards,

Jordan Lee
Sr. Merchant, Acquisition & Onboarding
Target+ Marketplace
jordan.lee@target.com | (612) 555-0182`,
  };
}

// ── Shimmer placeholder ───────────────────────────────────────────────────────

function EmailShimmer() {
  return (
    <div className="space-y-3 animate-pulse" aria-hidden>
      {/* To / Subject lines */}
      <div className="h-4 w-3/4 rounded bg-gray-200" />
      <div className="h-4 w-1/2 rounded bg-gray-200" />
      <div className="mt-4 h-px w-full rounded bg-gray-100" />
      {/* Body lines */}
      {[100, 90, 95, 60, 100, 80, 70, 100, 85, 50, 100, 65, 90, 40].map((w, i) => (
        <div key={i} className={`h-3 rounded bg-gray-200`} style={{ width: `${w}%` }} />
      ))}
    </div>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────

export function FinalizeShareView() {
  const router = useRouter();
  const showToast = useToastStore((s) => s.showToast);

  const scheduledItems = usePlanStore((s) => s.scheduledItems);
  const planRevenues = usePlanStore((s) => s.planRevenues);
  const calendarVersions = usePlanStore((s) => s.calendarVersions);
  const activeVersionId = usePlanStore((s) => s.activeVersionId);

  const activeVersion = calendarVersions.find((v) => v.id === activeVersionId) ?? calendarVersions[0];
  const categories = useMemo(() => [...new Set(scheduledItems.map((s) => s.row))], [scheduledItems]);
  const itemNames = useMemo(() => [...new Set(scheduledItems.map((s) => s.label))], [scheduledItems]);
  const totalRevM = useMemo(
    () => Object.values(planRevenues).reduce((sum, r) => sum + r, 0),
    [planRevenues],
  );

  // ── Email draft state ─────────────────────────────────────────────────────
  const [draft, setDraft] = useState<EmailDraft | null>(null);
  const [generating, setGenerating] = useState(true);
  const [copied, setCopied] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // 3-second shimmer before "AI" delivers the draft
    const t = setTimeout(() => {
      const generated = generateOutreachDraft(
        categories,
        itemNames,
        totalRevM,
        calendarVersions.map((v) => v.name),
      );
      setDraft(generated);
      setGenerating(false);
    }, 3000);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleCopy() {
    if (!draft) return;
    const text = `To: ${draft.to}\nSubject: ${draft.subject}\n\n${draft.body}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleSend() {
    showToast({
      title: "Email sent",
      description: `Outreach email sent via Outlook to ${draft?.to ?? "marketplace-partners@target.com"}.`,
    });
    router.push("/assortment/plan");
  }


  return (
    <>
      <PageHeader
        title="Finalize & Share Plan"
        breadcrumbs={[
          { label: "Acquisition & Onboarding", href: "/dashboard" },
          { label: "Assortment Plan", href: "/assortment/plan" },
          { label: "Finalize & Share" },
        ]}
        actions={
          <Button variant="outline" size="sm" onClick={() => router.push("/assortment/plan")}>
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Plan
          </Button>
        }
      />

      <div className="space-y-[var(--space-4)]">

        {/* ── Plan Summary ─────────────────────────────────────────────────── */}
        <Card className="p-[var(--space-4)]">
          <h2 className="mb-3 text-[var(--text-section-size)] font-semibold">Plan Overview</h2>
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Version", value: activeVersion?.name ?? "Version 1" },
              { label: "Categories", value: categories.length.toString() },
              { label: "Item Types", value: itemNames.length.toString() },
              {
                label: "Revenue Target",
                value: totalRevM > 0 ? `$${totalRevM.toFixed(1)}M` : "—",
              },
            ].map((kpi) => (
              <div key={kpi.label} className="rounded-[var(--radius-lg)] bg-[var(--color-muted)]/40 p-3">
                <p className="text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">{kpi.label}</p>
                <p className="mt-0.5 text-xl font-bold text-[var(--color-foreground)]">{kpi.value}</p>
              </div>
            ))}
          </div>

          {/* Category chips */}
          {categories.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {categories.map((cat) => (
                <span
                  key={cat}
                  className="rounded-full border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/8 px-2.5 py-1 text-[var(--text-caption-size)] font-medium text-[var(--color-primary)]"
                >
                  {cat}
                </span>
              ))}
            </div>
          )}

          {/* Item types list */}
          {itemNames.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-[var(--text-caption-size)] font-semibold text-[var(--color-muted-foreground)]">
                SCHEDULED ITEM TYPES
              </p>
              <div className="flex flex-wrap gap-1.5">
                {itemNames.map((name) => (
                  <span
                    key={name}
                    className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-card)] px-2 py-0.5 text-[var(--text-caption-size)] text-[var(--color-foreground)]"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* ── Outreach Email ───────────────────────────────────────────────── */}
        <Card className="p-[var(--space-4)]">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[var(--color-primary)]" />
                <h2 className="text-[var(--text-section-size)] font-semibold">Outreach Agent Draft</h2>
              </div>
              <p className="mt-0.5 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
                {generating
                  ? "Beacon Outreach Agent is analysing your plan and drafting a contextual email…"
                  : "Your outreach email is ready. Review, edit if needed, and send."}
              </p>
            </div>
            {!generating && draft && (
              <div className="flex shrink-0 gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
                <Button size="sm" onClick={handleSend}>
                  <Send className="h-3.5 w-3.5" />
                  Send via Outlook
                </Button>
              </div>
            )}
          </div>

          {/* Email composer shell */}
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]">
            {/* Header rows */}
            <div className="border-b border-[var(--color-border)] px-4 py-2.5">
              <div className="flex items-center gap-2 text-[var(--text-caption-size)]">
                <span className="w-16 shrink-0 font-semibold text-[var(--color-muted-foreground)]">To</span>
                {generating ? (
                  <div className="h-4 w-64 rounded bg-gray-200 animate-pulse" />
                ) : (
                  <span className="text-[var(--color-foreground)]">{draft?.to}</span>
                )}
              </div>
            </div>
            <div className="border-b border-[var(--color-border)] px-4 py-2.5">
              <div className="flex items-center gap-2 text-[var(--text-caption-size)]">
                <span className="w-16 shrink-0 font-semibold text-[var(--color-muted-foreground)]">Subject</span>
                {generating ? (
                  <div className="h-4 w-80 rounded bg-gray-200 animate-pulse" />
                ) : (
                  <span className="font-medium text-[var(--color-foreground)]">{draft?.subject}</span>
                )}
              </div>
            </div>

            {/* Body */}
            <div className="p-4">
              {generating ? (
                <EmailShimmer />
              ) : (
                <textarea
                  ref={bodyRef}
                  defaultValue={draft?.body ?? ""}
                  rows={22}
                  spellCheck
                  className="w-full resize-none bg-transparent text-[var(--text-body-size)] leading-relaxed text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none"
                />
              )}
            </div>

            {/* Footer */}
            {!generating && (
              <div className="flex items-center justify-between border-t border-[var(--color-border)] px-4 py-3">
                <p className="text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
                  Drafted by Beacon Outreach Agent · based on your FY 2025-26 assortment plan
                </p>
                <Button size="sm" onClick={handleSend}>
                  <Send className="h-3.5 w-3.5" />
                  Send via Outlook
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}
