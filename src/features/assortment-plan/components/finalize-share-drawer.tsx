"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { DrawerPanel } from "@/components/ui/drawer-panel";
import { MailComposer, MailComposerShimmer } from "@/components/ui/mail-composer";
import { usePlanStore } from "@/features/assortment-plan/store/plan-store";
import { getCalendarPdfFilename } from "@/lib/utils/calendar-pdf";
import { formatRevenueGoalDisplay } from "@/lib/utils/revenue-goal-input";
import { useToastStore } from "@/stores/toast-store";

interface EmailDraft {
  to: string;
  subject: string;
  body: string;
}

function buildEmailDraft(
  fyLabel: string,
  fiscalYear: string,
  newItems: string[],
  newlyScheduled: string[],
  hasPendingChanges: boolean,
  plannedItemCount: number,
): EmailDraft {
  if (fiscalYear === "2026-2027") {
    return {
      to: "shane.doe@target.com",
      subject: `${fyLabel} Assortment Plan — Strategic Calendar for Review`,
      body: `Hi Avon,

I'm sharing the draft ${fyLabel} Kitchen & Dining assortment plan for your review. This calendar reflects our forward-looking strategy for item type selection, seasonal timing, and acquisition sequencing across the fiscal year.

Planning approach:
• Item types prioritized by gap analysis and revenue opportunity in Kitchen & Dining
• Launch windows aligned to seasonal demand peaks (Back to School, Halloween, and holiday entertaining)
• Staggered acquisition timelines to balance seller onboarding capacity and shelf-readiness
• Revenue-weighted mix designed to meet our category goal while filling identified assortment gaps

The attached calendar includes ${plannedItemCount} planned item types with recommended acquisition months. Please review the sequencing and share feedback so we can finalize seller outreach priorities for the year ahead.

Thanks,
John Doe
Category Manager, Target`,
    };
  }

  if (hasPendingChanges) {
    const itemLines =
      newItems.length > 0
        ? newItems.map((item, i) => `${i + 1}. ${item}`).join("\n")
        : "None";

    const scheduleLines =
      newlyScheduled.length > 0
        ? newlyScheduled.map((item, i) => `${i + 1}. ${item}`).join("\n")
        : "None";

    return {
      to: "shane.doe@target.com",
      subject: `${fyLabel} Assortment Plan — New Changes Require Urgent Acquisition Action`,
      body: `Hi Avon,

I'm notifying you of important updates to the ${fyLabel} assortment plan. New item types have been added to the current calendar and require immediate acquisition action to meet seasonal assortment requirements on time.

New item types added:
${itemLines}

Newly scheduled acquisition windows:
${scheduleLines}

Please prioritize seller outreach and onboarding for these items. Delays in acquisition will directly impact our ability to be shelf-ready ahead of peak seasonal demand.

Thanks,
John Doe
Category Manager, Target`,
    };
  }

  return {
    to: "shane.doe@target.com",
    subject: `${fyLabel} Assortment Plan Ready`,
    body: `Hi Avon,

I'm sharing the finalized ${fyLabel} assortment plan for acquisition execution. The calendar covers item types across Kitchen & Dining, Lighting, Furniture, Outdoor Living & Garden, Rugs, and Holiday & Festive Decor with seasonal launch windows aligned to key retail events.

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
        <div className="flex-1 space-y-2 px-4 py-3">
          <div className="h-3 w-20 rounded bg-[var(--color-muted)]" />
          <div className="h-7 w-16 rounded bg-[var(--color-muted)]" />
        </div>
      </div>

      <MailComposerShimmer withAttachment />
    </div>
  );
}

export function FinalizeShareDrawer({ open, onClose }: FinalizeShareDrawerProps) {
  const showToast = useToastStore((s) => s.showToast);
  const scheduledItems = usePlanStore((s) => s.scheduledItems);
  const revenueGoal = usePlanStore((s) => s.revenueGoal);
  const fiscalYear = usePlanStore((s) => s.fiscalYear);
  const getOpportunityItems = usePlanStore((s) => s.getOpportunityItems);
  const getNewlyScheduledLabels = usePlanStore((s) => s.getNewlyScheduledLabels);
  const hasPendingPlanChanges = usePlanStore((s) => s.hasPendingPlanChanges);
  const calendarVersions = usePlanStore((s) => s.calendarVersions);
  const activeVersionId = usePlanStore((s) => s.activeVersionId);
  const switchVersion = usePlanStore((s) => s.switchVersion);

  const activeVersion = calendarVersions.find((v) => v.id === activeVersionId) ?? calendarVersions[0];
  const versionName = activeVersion?.name ?? "Version 1";
  const attachmentName = getCalendarPdfFilename(versionName);
  const fyLabel = fiscalYear.replace("-", "–");
  const pendingChanges = hasPendingPlanChanges();
  const newItems = useMemo(() => getOpportunityItems(), [getOpportunityItems, open]);
  const newlyScheduled = useMemo(() => getNewlyScheduledLabels(), [getNewlyScheduledLabels, open]);

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
    const draft = buildEmailDraft(
      fyLabel,
      fiscalYear,
      newItems,
      newlyScheduled,
      pendingChanges,
      plannedItemCount,
    );
    const timer = setTimeout(() => {
      setTo(draft.to);
      setSubject(draft.subject);
      setBody(draft.body);
      setGenerating(false);
    }, pendingChanges ? 1200 : 3000);
    return () => clearTimeout(timer);
  }, [open, fyLabel, fiscalYear, newItems, newlyScheduled, pendingChanges, plannedItemCount]);

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
      title={pendingChanges ? "Finalize & Share Plan Updates" : "Finalize & Share Assortment Plan"}
      ariaLabel="Finalize and share assortment plan"
      onClose={onClose}
      bodyClassName="flex flex-col overflow-hidden"
      footerClassName="pt-0"
      footer={
        <Button className="w-full" onClick={handleSend} disabled={generating || !to.trim()}>
          Send with Outlook
        </Button>
      }
    >
      {generating ? (
        <DrawerShimmer />
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-4 p-[var(--space-4)] pb-6">
          <div className="relative shrink-0">
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

          <div className="flex shrink-0 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)]">
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

          <MailComposer
            fillHeight
            className="min-h-0 flex-1"
            to={to}
            subject={subject}
            body={body}
            onToChange={setTo}
            onSubjectChange={setSubject}
            onBodyChange={setBody}
            attachment={{ name: attachmentName }}
          />
        </div>
      )}
    </DrawerPanel>
  );
}
