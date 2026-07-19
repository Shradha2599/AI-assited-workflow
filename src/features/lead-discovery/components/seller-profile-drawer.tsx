"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleDashed,
  ExternalLink,
  Loader2,
  Plus,
  Sparkles,
  Star,
  XCircle,
} from "lucide-react";
import { SvgIcon } from "@/components/ui/svg-icon";
import { StatusTag } from "@/components/ui/status-tag";
import { Button } from "@/components/ui/button";
import { TruncatedText } from "@/components/ui/truncated-text";
import {
  DrawerHeaderShell,
  DrawerPanel,
} from "@/components/ui/drawer-panel";
import { useOutreachMail } from "@/features/outreach/hooks/use-outreach-mail";
import { cn } from "@/lib/utils";
import type { Seller } from "@/lib/mock-data/sellers";
import {
  getSellerDrawerDetails,
  getSellerProfileDetails,
  getSellerProfilePath,
  type MarketplacePresence,
} from "@/lib/mock-data/seller-profile-details";
import { useSellerMatchingPlanItems } from "../hooks/use-seller-matching-plan-items";
import { getConfidenceBadgeStyle } from "@/lib/utils/confidence-badge";
import {
  useDiscoveryStore,
  type VerificationResult,
  type VerificationSource,
} from "../store/discovery-store";

interface SellerProfileDrawerProps {
  seller: Seller;
  onClose: () => void;
}

function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${n.toLocaleString()}`;
  return `$${n}`;
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
  children,
  className,
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-card)] p-4",
        className,
      )}
    >
      {title ? (
        <p className="mb-3 text-[var(--text-body-size)] font-semibold">{title}</p>
      ) : null}
      {children}
    </div>
  );
}

function ConfidenceChip({ score }: { score: number }) {
  const { bg, text } = getConfidenceBadgeStyle(score);
  return (
    <StatusTag
      className="px-2.5 text-[var(--text-caption-size)]"
      style={{ backgroundColor: bg, color: text }}
    >
      Confidence : {score.toFixed(1)}/10
    </StatusTag>
  );
}

function MarketplaceMetricsRow({ mp }: { mp: MarketplacePresence }) {
  return (
    <div className="grid grid-cols-3 gap-2 text-[var(--text-caption-size)]">
      <div>
        <p className="text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">SKUs</p>
        <p className="font-semibold tabular-nums">{mp.skus.toLocaleString()}</p>
      </div>
      <div>
        <p className="text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">Ratings</p>
        <p className="font-semibold tabular-nums">
          {mp.rating} ({mp.reviewCount.toLocaleString()})
        </p>
      </div>
      <div>
        <p className="text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">Comments</p>
        <p className="font-semibold tabular-nums">{mp.comments.toLocaleString()}</p>
      </div>
    </div>
  );
}

function MarketplaceBlock({
  mp,
  icon,
}: {
  mp: MarketplacePresence;
  icon?: React.ReactNode;
}) {
  return (
    <div className="border-b border-[var(--color-border)] py-3 last:border-b-0 last:pb-0 first:pt-0">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[var(--text-caption-size)] font-semibold">{mp.name}</span>
          <ExternalLink className="h-3 w-3 text-[var(--color-muted-foreground)]" />
        </div>
        {icon}
      </div>
      <MarketplaceMetricsRow mp={mp} />
    </div>
  );
}

function SourceRow({ label, source }: { label: string; source: VerificationSource }) {
  const icon =
    source.status === "verified" ? (
      <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
    ) : source.status === "partial" ? (
      <CircleDashed className="h-4 w-4 shrink-0 text-amber-500" />
    ) : (
      <XCircle className="h-4 w-4 shrink-0 text-[var(--color-muted-foreground)]" />
    );
  return (
    <div className="flex items-start gap-2 py-1.5">
      {icon}
      <div className="min-w-0">
        <span className="text-[var(--text-caption-size)] font-medium">{label}</span>
        <p className="text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">
          {source.detail}
        </p>
      </div>
    </div>
  );
}

export function SellerProfileDrawer({ seller, onClose }: SellerProfileDrawerProps) {
  const verifications = useDiscoveryStore((s) => s.verifications);
  const shortlistedIds = useDiscoveryStore((s) => s.shortlistedIds);
  const shortlistSeller = useDiscoveryStore((s) => s.shortlistSeller);
  const removeFromShortlist = useDiscoveryStore((s) => s.removeFromShortlist);
  const setVerification = useDiscoveryStore((s) => s.setVerification);
  const openOutreach = useOutreachMail();

  const drawerDetails = getSellerDrawerDetails(seller);
  const profileDetails = getSellerProfileDetails(seller);
  const cached = verifications[seller.id];
  const isShortlisted = shortlistedIds.includes(seller.id);
  const matchingItems = useSellerMatchingPlanItems(seller);

  const [verifying, setVerifying] = useState(!cached);
  const [verification, setLocalVerification] = useState<VerificationResult | null>(cached ?? null);
  const [summaryExpanded, setSummaryExpanded] = useState(false);

  useEffect(() => {
    if (cached) {
      setLocalVerification(cached);
      setVerifying(false);
      return;
    }
    setVerifying(true);
    fetch("/api/verify-seller", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ seller }),
    })
      .then((r) => r.json())
      .then((result: VerificationResult) => {
        setLocalVerification(result);
        setVerification(seller.id, result);
      })
      .catch(() => setLocalVerification(null))
      .finally(() => setVerifying(false));
  }, [seller.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const initials = getInitials(seller.legalBusinessName);
  const confidenceScore = verification?.confidenceScore ?? seller.confidenceScore;

  return (
    <DrawerPanel
      ariaLabel={`Seller profile: ${seller.legalBusinessName}`}
      onClose={onClose}
      header={
        <DrawerHeaderShell onClose={onClose} title={seller.legalBusinessName} />
      }
      footer={
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1.5"
            onClick={() =>
              openOutreach({
                mailType: "acquisition_outreach",
                sellerId: seller.id,
                sellerName: seller.legalBusinessName,
                sellerWebsite: seller.website,
              })
            }
          >
            <SvgIcon name="mail" size={14} variant="primary" /> Send Mail
          </Button>
          {isShortlisted ? (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => removeFromShortlist(seller.id)}
            >
              Remove from Shortlist
            </Button>
          ) : (
            <Button size="sm" className="flex-1 gap-1.5" onClick={() => shortlistSeller(seller.id)}>
              <Plus className="h-3.5 w-3.5" /> Shortlist Lead
            </Button>
          )}
        </div>
      }
    >
      {/* Profile meta */}
      <div className="px-[var(--space-4)] py-[var(--space-4)]">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <TruncatedText
                  text={seller.legalBusinessName}
                  inline
                  className="text-[var(--text-body-size)] font-semibold"
                />
                <Link
                  href={getSellerProfilePath(seller.id)}
                  className="shrink-0 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
                  onClick={(e) => e.stopPropagation()}
                  aria-label={`Open full profile for ${seller.legalBusinessName}`}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="mt-0.5 flex items-center gap-1 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                <span className="font-medium text-[var(--color-foreground)]">{seller.rating}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex divide-x divide-[var(--color-border)]">
          {[
            { label: "Avg. annual GMV", value: formatCurrency(seller.gmv) },
            { label: "Largest Category", value: seller.category },
            { label: "SKUs", value: seller.skus.toLocaleString() },
          ].map((stat) => (
            <div key={stat.label} className="min-w-0 flex-1 px-3 first:pl-0 last:pr-0">
              <p className="text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">
                {stat.label}
              </p>
              <TruncatedText
                text={stat.value}
                className="mt-0.5 text-[var(--text-caption-size)] font-semibold"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3 p-[var(--space-4)]">
        <DrawerSectionCard>
          <button
            type="button"
            onClick={() => setSummaryExpanded((v) => !v)}
            className="flex w-full items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-[var(--color-primary)]" />
              <span className="text-[var(--text-body-size)] font-semibold">Partner summary</span>
              {!summaryExpanded && (
                <ConfidenceChip score={confidenceScore} />
              )}
            </div>
            {summaryExpanded ? (
              <ChevronUp className="h-4 w-4 shrink-0 text-[var(--color-muted-foreground)]" />
            ) : (
              <ChevronDown className="h-4 w-4 shrink-0 text-[var(--color-muted-foreground)]" />
            )}
          </button>

          {summaryExpanded && (
            <div className="mt-3 space-y-3">
              {verifying && (
                <div className="flex items-center gap-2 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Analyzing seller signals…
                </div>
              )}

              {!verifying && (
                <>
                  <ConfidenceChip score={confidenceScore} />
                  <p className="text-[var(--text-caption-size)] leading-relaxed text-[var(--color-foreground)]">
                    {verification?.summary ?? profileDetails.confidenceSummary}
                  </p>
                  {verification && (
                    <div className="divide-y divide-[var(--color-border)] rounded-[var(--radius-md)] border border-[var(--color-border)] px-3">
                      <SourceRow label="Amazon" source={verification.sources.amazon} />
                      <SourceRow label="Walmart" source={verification.sources.walmart} />
                      <SourceRow label="Social Media" source={verification.sources.socialMedia} />
                      <SourceRow
                        label="Business Registry"
                        source={verification.sources.businessRegistry}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </DrawerSectionCard>

        {matchingItems.length > 0 && (
          <DrawerSectionCard title={`Item Type Match (${matchingItems.length})`}>
            <div className="flex flex-wrap gap-1.5">
              {matchingItems.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1 text-[var(--text-caption-size)]"
                >
                  {item}
                </span>
              ))}
            </div>
          </DrawerSectionCard>
        )}

        <DrawerSectionCard title="Business information">
          <dl>
            {[
              { label: "Type of partner", value: drawerDetails.partnerType },
              {
                label: "Official website",
                value: seller.website,
                isLink: true,
              },
              { label: "Address", value: drawerDetails.fullAddress },
              { label: "Founded", value: seller.founded.toString() },
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
                <dd className="text-[var(--text-caption-size)] font-medium">
                  {"isLink" in item && item.isLink ? (
                    <a
                      href={`https://${seller.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
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

        <DrawerSectionCard title="E-commerce presence">
          {drawerDetails.marketplaces.map((mp) => (
            <MarketplaceBlock key={mp.name} mp={mp} />
          ))}
        </DrawerSectionCard>

        <DrawerSectionCard title="Social media presence">
          {drawerDetails.socialPlatforms.map((social) => (
            <div
              key={social.platform}
              className="border-b border-[var(--color-border)] py-3 last:border-b-0 last:pb-0 first:pt-0"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[var(--text-caption-size)] font-semibold">
                  {social.platform}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[var(--text-caption-size)]">
                <div>
                  <p className="text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">
                    Posts
                  </p>
                  <p className="font-semibold tabular-nums">{social.posts.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">
                    Followers
                  </p>
                  <p className="font-semibold tabular-nums">
                    {social.followers >= 1000
                      ? `${(social.followers / 1000).toFixed(0)}K`
                      : social.followers.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </DrawerSectionCard>

        <Link
          href={getSellerProfilePath(seller.id)}
          className="inline-flex items-center gap-1 px-1 text-[var(--text-caption-size)] font-medium text-[var(--color-primary)] hover:underline"
        >
          View More Details <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </DrawerPanel>
  );
}
