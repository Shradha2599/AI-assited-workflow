"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Hash,
  ShoppingBag,
  Sparkles,
  Star,
  Store,
} from "lucide-react";

import { TruncatedText } from "@/components/ui/truncated-text";
import { Button } from "@/components/ui/button";
import { DrawerHeaderShell, DrawerPanel } from "@/components/ui/drawer-panel";
import { StatusTag, markerToneClass } from "@/components/ui/status-tag";
import { cn } from "@/lib/utils";
import type { LeadFormAnalysis, ValidationStatus } from "@/lib/mock-data/lead-form-analysis";
import { statusLabel } from "@/lib/mock-data/lead-form-analysis";
import type { PotentialPartner } from "@/lib/mock-data/potential-partners";
import { getConfidenceBadgeStyle } from "@/lib/utils/confidence-badge";
import { useLeadDecision } from "../hooks/use-lead-decision";
import { usePartnerReviewStore } from "../store/partner-review-store";

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

function DrawerSectionCard({
  title,
  icon,
  badge,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-card)] p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {icon}
        <p className="text-[var(--text-body-size)] font-semibold text-[var(--color-foreground)]">{title}</p>
        {badge}
      </div>
      {children}
    </div>
  );
}

function StatusMarker({ status }: { status: ValidationStatus }) {
  const styles: Record<ValidationStatus, string> = {
    valid: markerToneClass.success,
    invalid: markerToneClass.error,
    partial: markerToneClass.warning,
    unverified: markerToneClass.neutral,
  };
  return (
    <StatusTag className={cn(styles[status])}>
      {status === "valid" ? "No Risk" : statusLabel(status)}
    </StatusTag>
  );
}

function ConfidenceChip({ score }: { score: number }) {
  const { bg } = getConfidenceBadgeStyle(score);
  return (
    <StatusTag className="px-2.5 text-[var(--text-caption-size)]" style={{ backgroundColor: bg }}>
      {score.toFixed(1)}/10
    </StatusTag>
  );
}

function MarketplaceMetricsRow({
  skus,
  rating,
  reviewCount,
  comments,
}: {
  skus: number;
  rating: number;
  reviewCount: number;
  comments: number;
}) {
  return (
    <div className="grid grid-cols-3 gap-2 text-[var(--text-caption-size)]">
      <div>
        <p className="text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">SKUs</p>
        <p className="font-normal tabular-nums text-[var(--color-foreground)]">{skus.toLocaleString()}</p>
      </div>
      <div>
        <p className="text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">Ratings</p>
        <p className="font-normal tabular-nums text-[var(--color-foreground)]">
          {rating} ({reviewCount.toLocaleString()})
        </p>
      </div>
      <div>
        <p className="text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">Comments</p>
        <p className="font-normal tabular-nums text-[var(--color-foreground)]">{comments.toLocaleString()}</p>
      </div>
    </div>
  );
}

interface EvaluationAnalysisDrawerProps {
  partner: PotentialPartner;
  analysis: LeadFormAnalysis;
}

export function EvaluationAnalysisDrawer({ partner, analysis }: EvaluationAnalysisDrawerProps) {
  const analysisOpen = usePartnerReviewStore((s) => s.analysisOpen);
  const closeAnalysis = usePartnerReviewStore((s) => s.closeAnalysis);
  const { accept, reject, markFutureInterest } = useLeadDecision(partner);
  const [summaryExpanded, setSummaryExpanded] = useState(true);

  if (!analysisOpen) return null;

  const initials = getInitials(partner.legalBusinessName);
  const rating = analysis.rating ?? 4.1;
  const businessInfo = analysis.businessInfo;
  const socialPlatforms =
    analysis.socialPlatforms ??
    [
      { platform: "Facebook", posts: 186, followers: 4200 },
      { platform: "Instagram", posts: 312, followers: 8900 },
    ];
  const legalRisks =
    analysis.legalRisks ??
    [
      {
        label: "Legal Issues",
        status: "valid" as const,
        detail: "No evidence of active lawsuits or regulatory actions found.",
      },
      {
        label: "Negative Press/PR",
        status: "valid" as const,
        detail: "No negative news coverage identified in the last 24 months.",
      },
      {
        label: "Customer Feedback",
        status: "valid" as const,
        detail: "Customer service rankings are stable across marketplaces.",
      },
    ];

  const isReadOnly =
    partner.status === "Rejected" ||
    partner.status === "Future Interest" ||
    partner.status === "Onboarding";

  return (
    <DrawerPanel
      ariaLabel={`Beacon analysis: ${partner.legalBusinessName}`}
      onClose={closeAnalysis}
      widthClassName="w-[440px]"
      className="border-l border-[var(--color-border)]"
      header={<DrawerHeaderShell onClose={closeAnalysis} title={partner.legalBusinessName} />}
      footer={
        !isReadOnly ? (
          <div className="flex flex-wrap justify-start gap-2">
            <Button size="sm" onClick={accept}>
              Approve
            </Button>
            <Button variant="outline" size="sm" onClick={markFutureInterest}>
              Future Interest
            </Button>
            <Button variant="outline" size="sm" onClick={reject}>
              Reject
            </Button>
          </div>
        ) : undefined
      }
    >
      <div className="px-[var(--space-4)] py-[var(--space-4)]">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <TruncatedText
                text={partner.legalBusinessName}
                inline
                className="text-[var(--text-body-size)] font-normal text-[var(--color-foreground)]"
              />
              <ExternalLink className="h-3.5 w-3.5 shrink-0 text-[var(--color-muted-foreground)]" />
            </div>
            <div className="mt-0.5 flex items-center gap-1 text-[var(--text-caption-size)]">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span className="font-normal text-[var(--color-foreground)]">{rating.toFixed(1)}</span>
            </div>
          </div>
        </div>

        <div className="flex divide-x divide-[var(--color-border)]">
          {[
            { label: "Avg. Annual GMV", value: formatCurrency(partner.gmv) },
            { label: "Categories", value: partner.categories.slice(0, 2).join(", ") },
            { label: "SKUs", value: partner.skus.toLocaleString() },
          ].map((stat) => (
            <div key={stat.label} className="min-w-0 flex-1 px-3 first:pl-0 last:pr-0">
              <p className="text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">
                {stat.label}
              </p>
              <TruncatedText
                text={stat.value}
                className="mt-0.5 text-[var(--text-caption-size)] font-normal text-[var(--color-foreground)]"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3 px-[var(--space-4)] pb-[var(--space-4)]">
        <DrawerSectionCard
          title="Partner summary"
          icon={<Sparkles className="h-3.5 w-3.5 text-[var(--color-primary)]" />}
          badge={
            <>
              {!summaryExpanded && <ConfidenceChip score={analysis.confidenceScore} />}
              <button
                type="button"
                onClick={() => setSummaryExpanded((v) => !v)}
                className="ml-auto flex items-center"
                aria-expanded={summaryExpanded}
              >
                {summaryExpanded ? (
                  <ChevronUp className="h-4 w-4 text-[var(--color-muted-foreground)]" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-[var(--color-muted-foreground)]" />
                )}
              </button>
            </>
          }
        >
          <button
            type="button"
            className="flex w-full text-left"
            onClick={() => setSummaryExpanded((v) => !v)}
          >
            {summaryExpanded && (
              <div className="space-y-3">
                <ConfidenceChip score={analysis.confidenceScore} />
                <p className="text-[var(--text-caption-size)] font-normal leading-relaxed text-[var(--color-foreground)]">
                  {analysis.summary}
                </p>
                {analysis.strengths.length > 0 && (
                  <ul className="space-y-1 text-[var(--text-caption-size)] font-normal text-[var(--color-foreground)]">
                    {analysis.strengths.map((s) => (
                      <li key={s}>• {s}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </button>
        </DrawerSectionCard>

        {businessInfo && (
          <DrawerSectionCard
            title="Business information"
            icon={<ShoppingBag className="h-3.5 w-3.5 text-[var(--color-muted-foreground)]" />}
            badge={
              <StatusTag className={markerToneClass.success}>Valid</StatusTag>
            }
          >
            <dl>
              {[
                { label: "Type of partner", value: businessInfo.partnerType },
                { label: "Official website", value: businessInfo.website, isLink: true },
                { label: "Address", value: businessInfo.address },
                { label: "Founded", value: businessInfo.founded },
              ].map((item, index, arr) => (
                <div
                  key={item.label}
                  className={cn(
                    "py-2.5",
                    index < arr.length - 1 && "border-b border-[var(--color-border)]",
                  )}
                >
                  <dt className="text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">
                    {item.label}
                  </dt>
                  <dd className="text-[var(--text-caption-size)] font-normal text-[var(--color-foreground)]">
                    {"isLink" in item && item.isLink ? (
                      <a
                        href={`https://${item.value.replace(/^https?:\/\//, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--color-primary)] hover:underline"
                      >
                        {item.value}
                      </a>
                    ) : (
                      item.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </DrawerSectionCard>
        )}

        <DrawerSectionCard
          title="Marketplace presence"
          icon={<Store className="h-3.5 w-3.5 text-[var(--color-muted-foreground)]" />}
        >
          {analysis.marketplaces.map((mp, index) => {
            const reviewCount = Math.round((mp.skus ?? partner.skus) * 4.8);
            const comments = Math.round(reviewCount * 0.35);
            return (
              <div
                key={mp.name}
                className={cn(
                  "py-3",
                  index < analysis.marketplaces.length - 1 && "border-b border-[var(--color-border)]",
                  index === 0 && "pt-0",
                )}
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--text-caption-size)] font-normal text-[var(--color-foreground)]">{mp.name}</span>
                    <ExternalLink className="h-3 w-3 text-[var(--color-muted-foreground)]" />
                  </div>
                </div>
                <MarketplaceMetricsRow
                  skus={mp.skus ?? partner.skus}
                  rating={mp.rating ?? 4.0}
                  reviewCount={reviewCount}
                  comments={comments}
                />
              </div>
            );
          })}
          {businessInfo && (
            <div className="border-t border-[var(--color-border)] py-3">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-[var(--text-caption-size)] font-normal text-[var(--color-foreground)]">Official website</span>
              </div>
              <MarketplaceMetricsRow
                skus={Math.round(partner.skus * 0.4)}
                rating={rating}
                reviewCount={840}
                comments={210}
              />
            </div>
          )}
        </DrawerSectionCard>

        <DrawerSectionCard
          title="Social media presence"
          icon={<Hash className="h-3.5 w-3.5 text-[var(--color-muted-foreground)]" />}
        >
          {socialPlatforms.map((social, index) => (
            <div
              key={social.platform}
              className={cn(
                "py-3",
                index < socialPlatforms.length - 1 && "border-b border-[var(--color-border)]",
                index === 0 && "pt-0",
              )}
            >
              <p className="mb-2 text-[var(--text-caption-size)] font-normal text-[var(--color-foreground)]">{social.platform}</p>
              <div className="grid grid-cols-2 gap-2 text-[var(--text-caption-size)]">
                <div>
                  <p className="text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">Posts</p>
                  <p className="font-normal tabular-nums text-[var(--color-foreground)]">{social.posts.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">Followers</p>
                  <p className="font-normal tabular-nums text-[var(--color-foreground)]">
                    {social.followers >= 1000
                      ? `${(social.followers / 1000).toFixed(1)}K`
                      : social.followers.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </DrawerSectionCard>

        <DrawerSectionCard
          title="Regulation & Legal Risk"
          icon={<BookOpen className="h-3.5 w-3.5 text-[var(--color-muted-foreground)]" />}
        >
          <div className="space-y-3">
            {legalRisks.map((risk) => (
              <div key={risk.label}>
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <p className="text-[var(--text-caption-size)] font-normal text-[var(--color-foreground)]">
                    {risk.label}
                  </p>
                  {risk.label !== "Negative Press/PR" && <StatusMarker status={risk.status} />}
                </div>
                <p className="text-[var(--text-caption-size)] font-normal text-[var(--color-foreground)]">
                  {risk.detail}
                </p>
              </div>
            ))}
          </div>
        </DrawerSectionCard>

        <Link
          href={`/sellers/onboarding/${partner.id}`}
          className="inline-flex items-center gap-1 py-2 text-[var(--text-caption-size)] font-normal text-[var(--color-primary)] hover:underline"
          onClick={closeAnalysis}
        >
          View More Details
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </DrawerPanel>
  );
}
