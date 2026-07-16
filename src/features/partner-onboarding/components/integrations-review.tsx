"use client";

import { useEffect } from "react";

import type { OnboardingPartner } from "@/lib/mock-data/onboarding";
import { getIntegrationsContent } from "@/lib/mock-data/integrations-content";
import type { PotentialPartner } from "@/lib/mock-data/potential-partners";
import { cn } from "@/lib/utils";
import { OnboardingCommentsDrawer } from "./onboarding-comments-drawer";
import { AgentFeedbackModal } from "./agent-feedback-modal";
import { OnboardingSectionReviewLayout } from "./onboarding-section-review-layout";
import { CompleteBadge, ReadOnlyBadge, SectionDivider, UnderlinedField } from "./profile-review-shared";
import { getOnboardingSectionSubtitle } from "../constants/onboarding-section-copy";
import { useOnboardingReviewStore } from "../store/onboarding-review-store";

interface IntegrationsReviewProps {
  partner: PotentialPartner;
  onboarding: OnboardingPartner;
}

function IntegrationTypeReadOnly({ selected }: { selected: "channel-partner" | "direct-integrator" }) {
  const options = [
    { id: "channel-partner" as const, label: "Channel partner" },
    { id: "direct-integrator" as const, label: "Direct integrator" },
  ];

  return (
    <div>
      <p className="text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">
        Integration type<span className="text-[var(--color-error)]">*</span>
      </p>
      <div className="mt-3 space-y-3">
        {options.map((option) => {
          const isSelected = option.id === selected;
          return (
            <div
              key={option.id}
              className={cn("flex items-center gap-2", !isSelected && "opacity-50")}
            >
              <span
                className={cn(
                  "flex h-4 w-4 items-center justify-center rounded-full border",
                  isSelected
                    ? "border-[5px] border-[var(--color-primary)]"
                    : "border-[var(--color-border)]",
                )}
                aria-hidden
              />
              <span className="text-[var(--text-body-size)] font-medium text-[var(--color-foreground)]">
                {option.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ChannelPartnerCard({
  name,
  description,
  services,
}: {
  name: string;
  description: string;
  services: string[];
}) {
  return (
    <div>
      <p className="text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">
        About channel partner
      </p>
      <div className="relative mt-3 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-info-banner-bg)]">
        <div
          className="absolute bottom-0 left-0 top-0 w-1 rounded-l-[var(--radius-lg)] bg-[var(--color-primary)]"
          aria-hidden
        />
        <div className="py-[var(--space-5)] pl-[var(--space-5)] pr-[var(--space-4)]">
          <p className="text-[var(--text-heading-size)] font-semibold text-[var(--color-foreground)]">
            {name}
          </p>
          <p className="mt-3 text-[var(--text-body-size)] leading-relaxed text-[var(--color-muted-foreground)]">
            {description}
          </p>
          <p className="mt-5 text-[var(--text-caption-size)] font-semibold text-[var(--color-foreground)]">
            Services provided:
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {services.map((service) => (
              <span
                key={service}
                className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white px-3 py-1 text-[var(--text-caption-size)] text-[var(--color-foreground)]"
              >
                {service}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function IntegrationsReview({ partner, onboarding }: IntegrationsReviewProps) {
  const setContext = useOnboardingReviewStore((s) => s.setContext);

  const integrationsSection = onboarding.sections.find((s) => s.id === "integrations");
  const integrationsTask = integrationsSection?.tasks[0];
  const content = getIntegrationsContent(partner.sellerId);

  useEffect(() => {
    if (integrationsTask) {
      setContext(partner.id, "integrations", integrationsTask.id);
    } else {
      setContext(partner.id, "integrations");
    }
  }, [partner.id, integrationsTask, setContext]);

  if (!integrationsSection || !integrationsTask) return null;

  return (
    <>
      <OnboardingSectionReviewLayout
        partner={partner}
        onboarding={onboarding}
        breadcrumbExtra="Integrations"
        sectionTitle="Integrations"
        sectionSubtitle={getOnboardingSectionSubtitle("integrations")}
        progress={100}
        headerIconSrc="/icons/join-inner.svg"
      >
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-[20px] font-semibold text-[var(--color-foreground)]">Integrations</h3>
          <div className="flex items-center gap-2">
            <ReadOnlyBadge />
            <CompleteBadge />
          </div>
        </div>

        <IntegrationTypeReadOnly selected={content.integrationType} />

        {content.integrationType === "channel-partner" && (
          <>
            <div className="mt-6">
              <UnderlinedField label="Channel partner" value={content.channelPartner.name} />
            </div>
            <SectionDivider />
            <ChannelPartnerCard
              name={content.channelPartner.name}
              description={content.channelPartner.description}
              services={content.channelPartner.services}
            />
          </>
        )}
      </OnboardingSectionReviewLayout>

      <OnboardingCommentsDrawer partner={partner} />
      <AgentFeedbackModal />
    </>
  );
}
