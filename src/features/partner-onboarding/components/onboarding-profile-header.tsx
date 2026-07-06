"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { RegisterPageHeader } from "@/components/layout/page-header";
import { SvgIcon } from "@/components/ui/svg-icon";
import { useOutreachMail } from "@/features/outreach/hooks/use-outreach-mail";
import type { PotentialPartner } from "@/lib/mock-data/potential-partners";
import { PartnerStatusBadge } from "./partner-status-badge";

function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

function formatLaunchDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

interface OnboardingProfileHeaderProps {
  partner: PotentialPartner;
  launchDate: string;
}

export function OnboardingProfileHeader({ partner, launchDate }: OnboardingProfileHeaderProps) {
  const initials = getInitials(partner.legalBusinessName);
  const openOutreach = useOutreachMail();

  return (
    <>
      <RegisterPageHeader>
        <div>
          <nav aria-label="Breadcrumb" className="mb-1">
            <ol className="flex flex-wrap items-center gap-1 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
              <li>
                <Link href="/dashboard" className="hover:text-[var(--color-foreground)]">
                  Acquisition &amp; Onboarding
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link href="/sellers/onboarding" className="hover:text-[var(--color-foreground)]">
                  Partner Onboarding
                </Link>
              </li>
              <li>/</li>
              <li>
                <span className="font-medium text-[var(--color-foreground)]">
                  {partner.legalBusinessName}
                </span>
              </li>
            </ol>
          </nav>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-[var(--text-headline-xl-size)] font-bold leading-[var(--text-headline-xl-line-height)]">
                {partner.legalBusinessName}
              </h1>
              <PartnerStatusBadge status={partner.status} />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() =>
                openOutreach({ mailType: "onboarding_kickoff", partnerId: partner.id })
              }
            >
              <SvgIcon name="mail" size={14} /> Send Mail
            </Button>
          </div>
        </div>
      </RegisterPageHeader>

      <div className="mb-[var(--space-4)] flex flex-wrap items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-foreground)] text-sm font-bold text-white">
          {initials}
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-[var(--text-caption-size)]">
          <span>
            <span className="text-[var(--color-muted-foreground)]">Avg. Annual GMV</span>{" "}
            <span className="font-semibold">{formatCurrency(partner.gmv)}</span>
          </span>
          <span>
            <span className="text-[var(--color-muted-foreground)]">Categories</span>{" "}
            <span className="font-semibold">{partner.categories.join(", ")}</span>
          </span>
          <span>
            <span className="text-[var(--color-muted-foreground)]">SKUs</span>{" "}
            <span className="font-semibold">{partner.skus.toLocaleString()}</span>
          </span>
          <span>
            <span className="text-[var(--color-muted-foreground)]">Launch date</span>{" "}
            <span className="font-semibold">{formatLaunchDate(launchDate)}</span>
          </span>
        </div>
      </div>
    </>
  );
}
