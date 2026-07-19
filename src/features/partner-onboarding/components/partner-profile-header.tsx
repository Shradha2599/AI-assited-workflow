"use client";

import { Fragment } from "react";
import Link from "next/link";
import { Activity, MessageSquare, MoreHorizontal } from "lucide-react";

import { ConfidenceScoreBadge } from "@/components/data-display/confidence-score-badge";
import { Button } from "@/components/ui/button";
import { RegisterPageHeader } from "@/components/layout/page-header";
import { SvgIcon } from "@/components/ui/svg-icon";
import { TruncatedText } from "@/components/ui/truncated-text";
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

function MetadataSeparator() {
  return <div className="h-8 w-px shrink-0 bg-[var(--color-border)]" aria-hidden />;
}

function MetadataItem({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col justify-center px-[var(--space-5)] py-[var(--space-3)]">
      <p className="text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">{label}</p>
      <div className="mt-0.5 min-w-0">{children}</div>
    </div>
  );
}

interface PartnerProfileHeaderProps {
  partner: PotentialPartner;
  /** When set, replaces Confidence Score with Launch date (onboarding profile). */
  launchDate?: string;
  outreachMailType?: "acquisition_outreach" | "onboarding_kickoff";
  /** Extra breadcrumb segment after partner name (e.g. Profile Information). */
  breadcrumbExtra?: string;
  /** Hide GMV / categories / SKUs metadata row. */
  hideMetadata?: boolean;
  /** When set, partner name in breadcrumb links here instead of plain text. */
  partnerNameHref?: string;
}

export function PartnerProfileHeader({
  partner,
  launchDate,
  outreachMailType = "acquisition_outreach",
  breadcrumbExtra,
  hideMetadata = false,
  partnerNameHref,
}: PartnerProfileHeaderProps) {
  const initials = getInitials(partner.legalBusinessName);
  const openOutreach = useOutreachMail();

  const metadataItems = [
    {
      label: "Avg. Annual GMV",
      content: (
        <p className="text-[var(--text-body-size)] font-semibold">{formatCurrency(partner.gmv)}</p>
      ),
    },
    {
      label: "Categories",
      content: (
        <TruncatedText
          text={partner.categories.join(", ")}
          className="text-[var(--text-body-size)] font-semibold"
        />
      ),
    },
    {
      label: "SKUs",
      content: (
        <p className="text-[var(--text-body-size)] font-semibold tabular-nums">
          {partner.skus.toLocaleString()}
        </p>
      ),
    },
    launchDate
      ? {
          label: "Launch date",
          content: (
            <p className="text-[var(--text-body-size)] font-semibold">
              {formatLaunchDate(launchDate)}
            </p>
          ),
        }
      : {
          label: "Confidence Score",
          content: <ConfidenceScoreBadge score={partner.confidenceScore} variant="profile" />,
        },
  ];

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
              {partnerNameHref ? (
                <Link href={partnerNameHref} className="hover:text-[var(--color-foreground)]">
                  {partner.legalBusinessName}
                </Link>
              ) : (
                <span className="font-medium text-[var(--color-foreground)]">
                  {partner.legalBusinessName}
                </span>
              )}
            </li>
            {breadcrumbExtra && (
              <>
                <li>/</li>
                <li className="font-medium text-[var(--color-foreground)]">{breadcrumbExtra}</li>
              </>
            )}
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

        {!hideMetadata && (
          <div className="-mx-[var(--space-4)] mt-[var(--space-4)] flex w-[calc(100%+2*var(--space-4))] items-center">
            {metadataItems.map((item, index) => (
              <Fragment key={item.label}>
                {index > 0 && <MetadataSeparator />}
                <MetadataItem label={item.label}>{item.content}</MetadataItem>
              </Fragment>
            ))}
          </div>
        )}
      </div>
    </RegisterPageHeader>
  );
}
