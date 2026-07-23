"use client";

import { useEffect } from "react";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { StatusTag, markerToneClass } from "@/components/ui/status-tag";
import { DrawerPanel } from "@/components/ui/drawer-panel";
import { MailComposer, MailComposerShimmer } from "@/components/ui/mail-composer";
import { cn } from "@/lib/utils";
import type { OutreachMailType } from "@/lib/mock-data/outreach-mail";
import { useOutreachStore } from "../store/outreach-store";

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function drawerTitle(mailType: OutreachMailType): string {
  if (mailType === "acquisition_outreach") return "Outreach Email";
  if (mailType === "onboarding_kickoff") return "Onboarding Email";
  return "Reminder Email";
}

export function OutreachEmailDrawer() {
  const drawerOpen = useOutreachStore((s) => s.drawerOpen);
  const mailType = useOutreachStore((s) => s.mailType);
  const multiPartner = useOutreachStore((s) => s.multiPartner);
  const partners = useOutreachStore((s) => s.partners);
  const selectedPartnerId = useOutreachStore((s) => s.selectedPartnerId);
  const draft = useOutreachStore((s) => s.draft);
  const isGenerating = useOutreachStore((s) => s.isGenerating);
  const closeDrawer = useOutreachStore((s) => s.closeDrawer);
  const selectPartner = useOutreachStore((s) => s.selectPartner);
  const generateDraft = useOutreachStore((s) => s.generateDraft);
  const updateDraft = useOutreachStore((s) => s.updateDraft);
  const sendMail = useOutreachStore((s) => s.sendMail);

  const selectedPartner =
    (selectedPartnerId
      ? partners.find((p) => p.partnerId === selectedPartnerId)
      : undefined) ?? (partners.length === 1 ? partners[0] : undefined);

  const showPartnerList = multiPartner && partners.length > 1;
  const showComposer = Boolean(draft);
  const autoGenerate = mailType === "acquisition_outreach" && Boolean(selectedPartner);

  useEffect(() => {
    if (!drawerOpen || !autoGenerate || draft || isGenerating) return;
    void generateDraft();
  }, [drawerOpen, autoGenerate, draft, isGenerating, generateDraft, selectedPartnerId]);

  if (!drawerOpen) return null;

  return (
    <DrawerPanel
      title={drawerTitle(mailType)}
      ariaLabel={drawerTitle(mailType)}
      onClose={closeDrawer}
      bodyClassName="flex flex-col overflow-hidden"
      footerClassName="pt-0"
      footer={
        <Button className="w-full" disabled={!draft || isGenerating} onClick={sendMail}>
          Send with Outlook
        </Button>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col gap-4 px-[var(--space-4)] py-[var(--space-4)] pb-6">
        {showPartnerList && (
          <section className="shrink-0">
            <p className="mb-3 text-[var(--text-caption-size)] font-semibold">Partners</p>
            <div className="space-y-2">
              {partners.map((partner) => {
                const selected = partner.partnerId === selectedPartnerId;
                return (
                  <button
                    key={partner.partnerId}
                    type="button"
                    onClick={() => selectPartner(partner.partnerId)}
                    className={cn(
                      "w-full rounded-[var(--radius-md)] border p-3 text-left transition-colors",
                      selected
                        ? "border-[var(--color-primary)] bg-[var(--color-primary-light)]"
                        : "border-[var(--color-border)] hover:border-[var(--color-primary)]/50",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-foreground)] text-xs font-bold text-white">
                        {getInitials(partner.legalBusinessName)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[var(--text-caption-size)] font-semibold">
                          {partner.legalBusinessName}
                        </p>
                        <p className="mt-0.5 text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">
                          {partner.summary}
                        </p>
                        {partner.missingItems.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {partner.missingItems.map((item) => (
                              <StatusTag key={item} className={markerToneClass.muted}>
                                {item}
                              </StatusTag>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {!showComposer && !isGenerating && !autoGenerate && (
          <div className="shrink-0 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center">
            {selectedPartner ? (
              <>
                <Sparkles className="mx-auto mb-3 h-8 w-8 text-[var(--color-primary)]" />
                <p className="text-[var(--text-body-size)] font-semibold">
                  Ready to generate email for {selectedPartner.legalBusinessName}
                </p>
                <Button size="sm" className="mt-4 gap-1.5" onClick={() => generateDraft()}>
                  <Sparkles className="h-3.5 w-3.5" />
                  Generate Draft
                </Button>
              </>
            ) : (
              <>
                <Sparkles className="mx-auto mb-3 h-8 w-8 text-[var(--color-muted-foreground)]" />
                <p className="text-[var(--text-body-size)] font-semibold">
                  Select a partner to generate a contextual email
                </p>
              </>
            )}
          </div>
        )}

        {isGenerating && <MailComposerShimmer />}

        {showComposer && draft && (
          <MailComposer
            fillHeight
            className="min-h-0 flex-1"
            fromName={draft.fromName}
            fromEmail={draft.fromEmail}
            to={draft.to}
            subject={draft.subject}
            body={draft.body}
            onToChange={(to) => updateDraft({ to })}
            onSubjectChange={(subject) => updateDraft({ subject })}
            onBodyChange={(body) => updateDraft({ body })}
          />
        )}
      </div>
    </DrawerPanel>
  );
}
