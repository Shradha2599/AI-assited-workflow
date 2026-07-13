"use client";

import Image from "next/image";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { OnboardingPartner } from "@/lib/mock-data/onboarding";
import type { PotentialPartner } from "@/lib/mock-data/potential-partners";
import { PartnerProfileHeader } from "./partner-profile-header";

export const REVIEW_NAV_PL = "pl-[64px]";
export const REVIEW_NAV_PR = "pr-[48px]";
export const REVIEW_CONTENT_PX = "px-[48px]";

const WHITE_ICON_FILTER = "brightness(0) invert(1)";

interface OnboardingSectionReviewLayoutProps {
  partner: PotentialPartner;
  onboarding: OnboardingPartner;
  breadcrumbExtra: string;
  sectionTitle: string;
  sectionSubtitle: string;
  progress: number;
  headerIconSrc?: string;
  sidebar?: React.ReactNode;
  children: React.ReactNode;
}

export function OnboardingSectionReviewLayout({
  partner,
  onboarding,
  breadcrumbExtra,
  sectionTitle,
  sectionSubtitle,
  progress,
  headerIconSrc = "/icons/marketplace.svg",
  sidebar,
  children,
}: OnboardingSectionReviewLayoutProps) {
  return (
    <div className="space-y-[var(--space-4)]">
      <PartnerProfileHeader
        partner={partner}
        launchDate={onboarding.targetLaunchDate}
        outreachMailType="onboarding_kickoff"
        breadcrumbExtra={breadcrumbExtra}
        hideMetadata
        partnerNameHref={`/sellers/onboarding/${partner.id}`}
      />

      <Card className="overflow-hidden rounded-[var(--radius-xl)] border-[var(--color-border)] shadow-[var(--shadow-low)]">
        <div
          className={cn(REVIEW_CONTENT_PX, "py-8 text-white")}
          style={{
            background:
              "linear-gradient(90deg, #AC0000 0%, var(--color-background-page-brand, #212121) 84%)",
          }}
        >
          <div className="flex items-end justify-between gap-6">
            <div className="flex items-end gap-5">
              <Image
                src={headerIconSrc}
                alt=""
                width={64}
                height={64}
                className="shrink-0"
                style={{ filter: WHITE_ICON_FILTER }}
                aria-hidden
              />
              <div className="pb-0.5">
                <h2 className="text-[21px] font-semibold capitalize leading-tight">{sectionTitle}</h2>
                <p className="mt-1 text-[var(--text-caption-size)] text-white/80">{sectionSubtitle}</p>
              </div>
            </div>
            <div className="w-[200px] shrink-0 pb-0.5">
              <div className="flex items-center justify-end gap-2">
                <span className="text-[var(--text-body-size)] font-semibold tabular-nums">{progress}%</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/25">
                <div
                  className="h-full rounded-full bg-white transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex min-h-[520px]">
          {sidebar}
          <div className={cn("min-w-0 flex-1 py-8", REVIEW_CONTENT_PX)}>{children}</div>
        </div>
      </Card>
    </div>
  );
}
