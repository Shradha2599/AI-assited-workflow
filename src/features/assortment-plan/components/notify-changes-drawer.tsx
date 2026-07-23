"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { DrawerPanel } from "@/components/ui/drawer-panel";
import { MailComposer, MailComposerShimmer } from "@/components/ui/mail-composer";
import { usePlanStore } from "@/features/assortment-plan/store/plan-store";
import { useToastStore } from "@/stores/toast-store";

interface NotifyChangesDrawerProps {
  open: boolean;
  onClose: () => void;
}

function buildChangesEmailDraft(
  fyLabel: string,
  newItems: string[],
  newlyScheduled: string[],
): { to: string; subject: string; body: string } {
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
    subject: `${fyLabel} Assortment Plan — Updates to Review`,
    body: `Hi Avon,

I'm notifying you of updates to the ${fyLabel} assortment plan. New item types have been identified from gap analysis and added to the current calendar.

New item types added:
${itemLines}

Newly scheduled on the calendar:
${scheduleLines}

Please review the updated calendar and align acquisition outreach with the revised launch windows.

Thanks,
John Doe
Category Manager, Target`,
  };
}

export function NotifyChangesDrawer({ open, onClose }: NotifyChangesDrawerProps) {
  const showToast = useToastStore((s) => s.showToast);
  const fiscalYear = usePlanStore((s) => s.fiscalYear);
  const getOpportunityItems = usePlanStore((s) => s.getOpportunityItems);
  const getNewlyScheduledLabels = usePlanStore((s) => s.getNewlyScheduledLabels);

  const [generating, setGenerating] = useState(false);
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const fyLabel = fiscalYear.replace("-", "–");
  const newItems = useMemo(() => getOpportunityItems(), [getOpportunityItems, open]);
  const newlyScheduled = useMemo(() => getNewlyScheduledLabels(), [getNewlyScheduledLabels, open]);

  useEffect(() => {
    if (!open) return;
    setGenerating(true);
    const draft = buildChangesEmailDraft(fyLabel, newItems, newlyScheduled);
    const timer = setTimeout(() => {
      setTo(draft.to);
      setSubject(draft.subject);
      setBody(draft.body);
      setGenerating(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, [open, fyLabel, newItems, newlyScheduled]);

  if (!open) return null;

  function handleSend() {
    showToast({
      title: "Changes notified",
      description: `Assortment plan updates sent to ${to} via Outlook.`,
    });
    onClose();
  }

  return (
    <DrawerPanel
      title="Notify Plan Changes"
      ariaLabel="Notify acquisition manager of assortment plan changes"
      onClose={onClose}
      footer={
        <Button className="w-full" onClick={handleSend} disabled={generating || !to.trim()}>
          Send with Outlook
        </Button>
      }
    >
      {generating ? (
        <div className="p-[var(--space-4)]">
          <MailComposerShimmer />
        </div>
      ) : (
        <div className="space-y-4 p-[var(--space-4)]">
          <p className="text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
            Notify the acquisition manager of new item types and calendar updates for {fyLabel}.
          </p>
          <MailComposer
            to={to}
            subject={subject}
            body={body}
            onToChange={setTo}
            onSubjectChange={setSubject}
            onBodyChange={setBody}
          />
        </div>
      )}
    </DrawerPanel>
  );
}
