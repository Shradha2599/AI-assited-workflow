"use client";

import Link from "next/link";
import { Activity, MessageSquare, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RegisterPageHeader } from "@/components/layout/page-header";
import { SvgIcon } from "@/components/ui/svg-icon";
import { useOutreachMail } from "@/features/outreach/hooks/use-outreach-mail";
import type { PotentialPartner } from "@/lib/mock-data/potential-partners";
import { showsOnboardingChecklist } from "@/lib/mock-data/potential-partners";
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

interface PartnerProfileHeaderProps {
  partner: PotentialPartner;
}

export function PartnerProfileHeader({ partner }: PartnerProfileHeaderProps) {
  const initials = getInitials(partner.legalBusinessName);
  const openOutreach = useOutreachMail();
  const mailType = showsOnboardingChecklist(partner.status)
    ? "onboarding_kickoff"
    : "acquisition_outreach";

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
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => openOutreach({ mailType, partnerId: partner.id })}
              >
                <SvgIcon name="mail" size={14} /> Send Email
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
        </div>
      </RegisterPageHeader>

      <Card className="mb-[var(--space-4)]">
        <div className="px-6 py-5">
          <div className="mb-5 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
              {initials}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
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
            <div>
              <p className="text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">
                Confidence Score
              </p>
              <span className="mt-1 inline-flex rounded-full bg-green-600 px-3 py-1 text-[var(--text-caption-size)] font-semibold text-white">
                {partner.confidenceScore.toFixed(1)}/10
              </span>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
}
