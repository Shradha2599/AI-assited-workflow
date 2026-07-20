"use client";

import { ChevronDown, FileText, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { DrawerPanel } from "@/components/ui/drawer-panel";
import { TruncatedText } from "@/components/ui/truncated-text";
import { usePlanStore } from "@/features/assortment-plan/store/plan-store";
import { getCalendarPdfFilename } from "@/lib/utils/calendar-pdf";
import { formatRevenueGoalDisplay } from "@/lib/utils/revenue-goal-input";
import { markerToneClass } from "@/components/ui/status-tag";
import { cn } from "@/lib/utils";
import { useToastStore } from "@/stores/toast-store";

interface EmailDraft {
  to: string;
  subject: string;
  body: string;
}

function buildEmailDraft(): EmailDraft {
  return {
    to: "shane.doe@target.com",
    subject: "FY 2025–26 Assortment Plan Ready",
    body: `Hi Avon,

I'm sharing the finalized FY 2025–26 assortment plan for acquisition execution. The calendar covers item types across Kitchen & Dining, Lighting, Furniture, Outdoor Living & Garden, Rugs, and Holiday & Festive Decor with seasonal launch windows aligned to key retail events.

Next steps for your team:
• Shortlist potential sellers aligned to launch windows
• Build category-wise acquisition pipelines
• Prioritize high-opportunity item types for outreach
• Coordinate onboarding timelines with category managers

Please review the finalized calendar and begin acquisition planning for the upcoming launch cycles.

Thanks,
John Doe
Category Manager, Target`,
  };
}

interface FinalizeShareDrawerProps {
  open: boolean;
  onClose: () => void;
}

function DrawerShimmer() {
  return (
    <div className="space-y-4 p-[var(--space-4)] animate-pulse" aria-hidden>
      <div className="h-9 rounded-[var(--radius-md)] bg-[var(--color-muted)]" />

      <div className="flex overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)]">
        <div className="flex-1 space-y-2 px-4 py-3">
          <div className="h-3 w-20 rounded bg-[var(--color-muted)]" />
          <div className="h-7 w-16 rounded bg-[var(--color-muted)]" />
        </div>
        <div className="w-px bg-[var(--color-border)]" />
        <div className="flex-1 space-y-2 px-4 py-3">
          <div className="h-3 w-28 rounded bg-[var(--color-muted)]" />
          <div className="h-7 w-10 rounded bg-[var(--color-muted)]" />
        </div>
      </div>

      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)]">
        <div className="flex items-center gap-2 border-b border-[var(--color-border)] px-4 py-3">
          <div className="h-8 w-8 rounded-full bg-[var(--color-muted)]" />
          <div className="space-y-1.5">
            <div className="h-3 w-16 rounded bg-[var(--color-muted)]" />
            <div className="h-3 w-32 rounded bg-[var(--color-muted)]" />
          </div>
        </div>
        <div className="space-y-3 border-b border-[var(--color-border)] px-4 py-3">
          <div className="h-3 w-3/4 rounded bg-[var(--color-muted)]" />
          <div className="h-3 w-1/2 rounded bg-[var(--color-muted)]" />
        </div>
        <div className="space-y-2 px-4 py-4">
          {[100, 92, 88, 65, 95, 78, 85, 70, 90, 55, 82, 60].map((w, i) => (
            <div
              key={i}
              className="h-3 rounded bg-[var(--color-muted)]"
              style={{ width: `${w}%` }}
            />
          ))}
        </div>
        <div className="border-t border-[var(--color-border)] px-4 py-3">
          <div className="h-9 w-56 rounded-[var(--radius-md)] bg-[var(--color-muted)]" />
        </div>
      </div>
    </div>
  );
}

export function FinalizeShareDrawer({ open, onClose }: FinalizeShareDrawerProps) {
  const showToast = useToastStore((s) => s.showToast);
  const scheduledItems = usePlanStore((s) => s.scheduledItems);
  const revenueGoal = usePlanStore((s) => s.revenueGoal);
  const calendarVersions = usePlanStore((s) => s.calendarVersions);
  const activeVersionId = usePlanStore((s) => s.activeVersionId);
  const switchVersion = usePlanStore((s) => s.switchVersion);

  const activeVersion = calendarVersions.find((v) => v.id === activeVersionId) ?? calendarVersions[0];
  const versionName = activeVersion?.name ?? "Version 1";
  const attachmentName = getCalendarPdfFilename(versionName);

  const plannedItemCount = useMemo(
    () => new Set(scheduledItems.map((item) => item.label)).size,
    [scheduledItems],
  );

  const revenueGoalLabel = revenueGoal ? formatRevenueGoalDisplay(revenueGoal) : "—";

  const [generating, setGenerating] = useState(false);
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    if (!open) return;
    setGenerating(true);
    const draft = buildEmailDraft();
    const timer = setTimeout(() => {
      setTo(draft.to);
      setSubject(draft.subject);
      setBody(draft.body);
      setGenerating(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, [open]);

  if (!open) return null;

  function handleSend() {
    showToast({
      title: "Email sent",
      description: `Assortment plan shared with ${to} via Outlook.`,
    });
    onClose();
  }

  return (
    <DrawerPanel
      title="Finalize & Share Assortment Plan"
      ariaLabel="Finalize and share assortment plan"
      onClose={onClose}
      footer={
        <Button className="w-full" onClick={handleSend} disabled={generating || !to.trim()}>
          Send with Outlook
        </Button>
      }
    >
      {generating ? (
        <DrawerShimmer />
      ) : (
      <div className="space-y-4 p-[var(--space-4)]">
        <div className="relative">
          <select
            value={activeVersionId}
            onChange={(e) => switchVersion(e.target.value)}
            className="w-full appearance-none rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 pr-8 text-[var(--text-caption-size)] text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none"
            aria-label="Calendar version"
          >
            {calendarVersions.map((version) => (
              <option key={version.id} value={version.id}>
                {version.name}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
        </div>

        <div className="flex overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)]">
          <div className="flex-1 px-4 py-3">
            <p className="text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
              Revenue Goal
            </p>
            <p className="mt-1 text-xl font-bold text-[var(--color-foreground)]">{revenueGoalLabel}</p>
          </div>
          <div className="w-px bg-[var(--color-border)]" />
          <div className="flex-1 px-4 py-3">
            <p className="text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
              Planned Item Types
            </p>
            <p className="mt-1 text-xl font-bold text-[var(--color-foreground)]">{plannedItemCount}</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card)]">
          <div className="flex items-center gap-2 border-b border-[var(--color-border)] px-4 py-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#22C55E] text-[11px] font-bold text-white">
              SD
            </span>
            <div className="min-w-0">
              <p className="text-[var(--text-caption-size)] font-semibold text-[var(--color-foreground)]">
                New Mail
              </p>
              <TruncatedText
                text="shaun.doe@target.com"
                className="text-[var(--text-label-size)] text-[var(--color-muted-foreground)]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 border-b border-[var(--color-border)] px-4 py-2.5">
            <span className="w-14 shrink-0 text-[var(--text-caption-size)] font-medium text-[var(--color-muted-foreground)]">
              To
            </span>
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
              <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 text-[var(--text-caption-size)]", markerToneClass.muted)}>
                {to}
                <button
                  type="button"
                  onClick={() => setTo("")}
                  className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
                  aria-label="Remove recipient"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
              {!to && (
                <input
                  type="email"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="Add recipient"
                  className="min-w-0 flex-1 bg-transparent text-[var(--text-caption-size)] focus:outline-none"
                />
              )}
            </div>
            <div className="flex shrink-0 gap-2 text-[var(--text-caption-size)] text-[var(--color-primary)]">
              <button type="button" className="hover:underline">Cc</button>
              <button type="button" className="hover:underline">Bcc</button>
            </div>
          </div>

          <div className="flex items-center gap-2 border-b border-[var(--color-border)] px-4 py-2.5">
            <span className="w-14 shrink-0 text-[var(--text-caption-size)] font-medium text-[var(--color-muted-foreground)]">
              Subject
            </span>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="min-w-0 flex-1 bg-transparent text-[var(--text-caption-size)] font-medium text-[var(--color-foreground)] focus:outline-none"
            />
          </div>

          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={14}
            className="w-full resize-none bg-transparent px-4 py-3 text-[var(--text-caption-size)] leading-relaxed text-[var(--color-foreground)] focus:outline-none"
            aria-label="Email message"
          />

          <div className="border-t border-[var(--color-border)] px-4 py-3">
            <div
              className={cn(
                "inline-flex max-w-full items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)]",
                "bg-[var(--color-muted)]/30 px-3 py-2",
              )}
            >
              <FileText className="h-4 w-4 shrink-0 text-[var(--color-error)]" aria-hidden />
              <TruncatedText text={attachmentName} inline className="text-[var(--text-caption-size)] text-[var(--color-foreground)]" />
            </div>
          </div>
        </div>
      </div>
      )}
    </DrawerPanel>
  );
}
