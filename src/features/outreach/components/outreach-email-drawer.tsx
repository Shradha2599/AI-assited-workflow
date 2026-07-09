"use client";

import { Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DrawerPanel } from "@/components/ui/drawer-panel";
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

  if (!drawerOpen) return null;

  const selectedPartner =
    (selectedPartnerId
      ? partners.find((p) => p.partnerId === selectedPartnerId)
      : undefined) ?? (partners.length === 1 ? partners[0] : undefined);

  const generateHeading = selectedPartner
    ? mailType === "document_reminder" || mailType === "onboarding_completion"
      ? `Ready to generate reminder email for ${selectedPartner.legalBusinessName}`
      : mailType === "onboarding_kickoff"
        ? `Ready to generate onboarding email for ${selectedPartner.legalBusinessName}`
        : `Ready to generate outreach email for ${selectedPartner.legalBusinessName}`
    : "Select a partner to generate a contextual email";

  const showPartnerList = multiPartner && partners.length > 1;
  const canGenerate = Boolean(selectedPartner) && !draft && !isGenerating;
  const showComposer = Boolean(draft);

  return (
    <DrawerPanel
      title={drawerTitle(mailType)}
      ariaLabel={drawerTitle(mailType)}
      onClose={closeDrawer}
      footer={
        <Button className="w-full" disabled={!draft} onClick={sendMail}>
          Send with Outlook
        </Button>
      }
    >
      <div className="px-[var(--space-4)] py-[var(--space-4)]">
        {showPartnerList && (
          <section className="mb-5">
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
                              <span
                                key={item}
                                className="rounded-full bg-[var(--color-muted)] px-2 py-0.5 text-[var(--text-label-size)] font-medium text-[var(--color-foreground)]"
                              >
                                {item}
                              </span>
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

        {!showComposer && !isGenerating && (
          <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center">
            {selectedPartner ? (
              <>
                <Sparkles className="mx-auto mb-3 h-8 w-8 text-[var(--color-primary)]" />
                <p className="text-[var(--text-body-size)] font-semibold">{generateHeading}</p>
                <p className="mt-2 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
                  The Outreach Agent will create a personalized draft based on the partner&apos;s context
                  and current workflow stage.
                </p>
                <Button
                  size="sm"
                  className="mt-4 gap-1.5"
                  onClick={() => generateDraft()}
                  disabled={!canGenerate}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Generate Draft
                </Button>
              </>
            ) : (
              <>
                <Sparkles className="mx-auto mb-3 h-8 w-8 text-[var(--color-muted-foreground)]" />
                <p className="text-[var(--text-body-size)] font-semibold">
                  Select a partner to generate a contextual reminder email
                </p>
                <p className="mt-2 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
                  The Outreach Agent will draft a personalized message based on each partner&apos;s missing
                  documentation and onboarding progress.
                </p>
              </>
            )}
          </div>
        )}

        {isGenerating && (
          <div className="flex flex-col items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] py-16">
            <Loader2 className="mb-3 h-8 w-8 animate-spin text-[var(--color-primary)]" />
            <p className="text-[var(--text-caption-size)] font-medium">Outreach Agent is drafting…</p>
            <p className="mt-1 text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">
              Personalizing based on partner context
            </p>
          </div>
        )}

        {showComposer && draft && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-[var(--color-border)] pb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary)] text-[10px] font-bold text-white">
                SD
              </div>
              <div>
                <p className="text-[var(--text-caption-size)] font-semibold">{draft.fromName}</p>
                <p className="text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">
                  {draft.fromEmail}
                </p>
              </div>
            </div>

            <div>
              <label className="text-[var(--text-label-size)] font-medium text-[var(--color-muted-foreground)]">
                To
              </label>
              <input
                type="email"
                value={draft.to}
                onChange={(e) => updateDraft({ to: e.target.value })}
                className="mt-1 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--text-caption-size)] focus:border-[var(--color-primary)] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[var(--text-label-size)] font-medium text-[var(--color-muted-foreground)]">
                Subject
              </label>
              <input
                type="text"
                value={draft.subject}
                onChange={(e) => updateDraft({ subject: e.target.value })}
                className="mt-1 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--text-caption-size)] focus:border-[var(--color-primary)] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[var(--text-label-size)] font-medium text-[var(--color-muted-foreground)]">
                Message
              </label>
              <textarea
                value={draft.body}
                onChange={(e) => updateDraft({ body: e.target.value })}
                rows={14}
                className="mt-1 w-full resize-none rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--text-caption-size)] leading-relaxed focus:border-[var(--color-primary)] focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>
    </DrawerPanel>
  );
}
