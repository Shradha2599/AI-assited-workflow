"use client";

import Link from "next/link";
import { Activity, MessageSquare, MoreHorizontal } from "lucide-react";

import { ConfidenceScoreBadge } from "@/components/data-display/confidence-score-badge";
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

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function formatLaunchDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

interface PartnerProfileHeaderProps {
  partner: PotentialPartner;
  /** When set, replaces Confidence Score with Launch date (onboarding profile). */
  launchDate?: string;
  outreachMailType?: "acquisition_outreach" | "onboarding_kickoff";
}

export function PartnerProfileHeader({
  partner,
  launchDate,
  outreachMailType = "acquisition_outreach",
}: PartnerProfileHeaderProps) {
  const initials = getInitials(partner.legalBusinessName);
  const openOutreach = useOutreachMail();

  return (
    <RegisterPageHeader>
      <div>
        <nav aria-label="Breadcrumb" className="mb-3">
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
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
              {initials}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-[21px] font-bold leading-tight">
                {partner.legalBusinessName}
              </h1>
              <PartnerStatusBadge status={partner.status} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() =>
                openOutreach({ mailType: outreachMailType, partnerId: partner.id })
              }
            >
              <SvgIcon name="mail" size={14} variant="primary" /> Send Email
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Activity className="h-3.5 w-3.5" /> Activity
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" /> Comments
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]"
              aria-label="More actions"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mt-[var(--space-4)] flex flex-wrap gap-[var(--space-6)]">
          {[
            { label: "Avg. Annual GMV", value: formatCurrency(partner.gmv) },
            { label: "Categories", value: partner.categories.join(", ") },
            { label: "SKUs", value: partner.skus.toLocaleString() },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">
                {stat.label}
              </p>
              <p className="mt-0.5 text-[var(--text-body-size)] font-semibold">{stat.value}</p>
            </div>
          ))}
          {launchDate ? (
            <div>
              <p className="text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">
                Launch date
              </p>
              <p className="mt-0.5 text-[var(--text-body-size)] font-semibold">
                {formatLaunchDate(launchDate)}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">
                Confidence Score
              </p>
              <div className="mt-1">
                <ConfidenceScoreBadge score={partner.confidenceScore} variant="profile" />
              </div>
            </div>
          )}
        </div>
      </div>
    </RegisterPageHeader>
  );
}
