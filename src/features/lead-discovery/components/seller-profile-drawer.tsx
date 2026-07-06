"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleDashed,
  ExternalLink,
  Loader2,
  Mail,
  Plus,
  Sparkles,
  Star,
  TrendingUp,
  X,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOutreachMail } from "@/features/outreach/hooks/use-outreach-mail";
import { cn } from "@/lib/utils";
import type { Seller } from "@/lib/mock-data/sellers";
import { getSellerProfilePath } from "@/lib/mock-data/seller-profile-details";
import { usePlanStore } from "@/features/assortment-plan/store/plan-store";
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
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
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

function ConfidenceChip({ score }: { score: number }) {
  const color =
    score >= 9.0
      ? "bg-green-100 text-green-800 border-green-300"
      : score >= 8.0
        ? "bg-green-50 text-green-700 border-green-200"
        : score >= 7.0
          ? "bg-amber-50 text-amber-800 border-amber-200"
          : "bg-red-50 text-red-700 border-red-200";
  return (
    <span className={cn("rounded-full border px-2.5 py-0.5 text-[var(--text-caption-size)] font-semibold", color)}>
      Confidence : {score.toFixed(1)}/10
    </span>
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
  const planItems = usePlanStore((s) => s.planItems);
  const verifications = useDiscoveryStore((s) => s.verifications);
  const shortlistedIds = useDiscoveryStore((s) => s.shortlistedIds);
  const shortlistSeller = useDiscoveryStore((s) => s.shortlistSeller);
  const removeFromShortlist = useDiscoveryStore((s) => s.removeFromShortlist);
  const setVerification = useDiscoveryStore((s) => s.setVerification);
  const openOutreach = useOutreachMail();

  const cached = verifications[seller.id];
  const isShortlisted = shortlistedIds.includes(seller.id);

  const [verifying, setVerifying] = useState(!cached);
  const [verification, setLocalVerification] = useState<VerificationResult | null>(cached ?? null);
  const [summaryExpanded, setSummaryExpanded] = useState(true);

  // Item types from the assortment plan that match this seller's categories
  const matchingPlanItems = planItems.filter(() => true); // show all plan items as potential matches

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

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[var(--z-drawer)] bg-black/30"
        onClick={onClose}
        aria-hidden
      />

      {/* Drawer */}
      <aside
        className="fixed inset-y-0 right-[var(--tasks-panel-width)] z-[calc(var(--z-drawer)+1)] flex w-[440px] flex-col border-l border-[var(--color-border)] bg-[var(--color-card)] shadow-2xl"
        aria-label={`Seller profile: ${seller.legalBusinessName}`}
      >
        {/* Header */}
        <div className="border-b border-[var(--color-border)] px-5 py-4">
          <div className="mb-3 flex items-start justify-between">
            <div className="flex items-center gap-3">
              {/* Initials avatar */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
                {initials}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-[var(--text-section-size)] font-bold leading-tight">
                    {seller.legalBusinessName}
                  </h2>
                  <Link
                    href={getSellerProfilePath(seller.id)}
                    className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Open full profile for ${seller.legalBusinessName}`}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
                <div className="mt-0.5 flex items-center gap-1 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <span className="font-medium text-[var(--color-foreground)]">{seller.rating}</span>
                  {seller.viralTrendy && (
                    <span className="ml-1 flex items-center gap-0.5 text-purple-600">
                      <TrendingUp className="h-3 w-3" /> Viral
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* 3-stat row */}
          <div className="grid grid-cols-3 gap-px rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-border)]">
            {[
              { label: "Avg. annual GMV", value: formatCurrency(seller.gmv) },
              { label: "Largest Category", value: seller.category },
              { label: "SKUs", value: seller.skus.toLocaleString() },
            ].map((stat) => (
              <div key={stat.label} className="bg-[var(--color-card)] px-3 py-2.5">
                <p className="text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">
                  {stat.label}
                </p>
                <p className="mt-0.5 text-[var(--text-caption-size)] font-semibold">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {/* Partner summary (verification agent output) */}
          <div className="border-b border-[var(--color-border)] px-5 py-4">
            <button
              type="button"
              onClick={() => setSummaryExpanded((v) => !v)}
              className="flex w-full items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-[var(--color-primary)]" />
                <span className="text-[var(--text-body-size)] font-semibold">Partner summary</span>
              </div>
              {summaryExpanded ? (
                <ChevronUp className="h-4 w-4 text-[var(--color-muted-foreground)]" />
              ) : (
                <ChevronDown className="h-4 w-4 text-[var(--color-muted-foreground)]" />
              )}
            </button>

            {verifying && (
              <div className="mt-3 flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-ai-insight-border)] bg-[var(--color-ai-insight)] px-3 py-2.5 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Verifying across data sources…
              </div>
            )}

            {!verifying && verification && (
              <div className="mt-3">
                <ConfidenceChip score={verification.confidenceScore} />

                {summaryExpanded && (
                  <div className="mt-3 space-y-3">
                    {/* Summary text */}
                    <p className="rounded-[var(--radius-md)] border border-[var(--color-ai-insight-border)] bg-[var(--color-ai-insight)] px-3 py-2.5 text-[var(--text-caption-size)] leading-relaxed">
                      {verification.summary}
                    </p>

                    {/* Strengths */}
                    {verification.strengths.length > 0 && (
                      <div>
                        <p className="mb-1 text-[var(--text-caption-size)] font-medium text-green-700">
                          Strengths
                        </p>
                        <ul className="space-y-0.5">
                          {verification.strengths.map((s, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-[var(--text-caption-size)]">
                              <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-green-500" />
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Risks */}
                    {verification.risks.length > 0 && (
                      <div>
                        <p className="mb-1 text-[var(--text-caption-size)] font-medium text-amber-700">
                          Risks
                        </p>
                        <ul className="space-y-0.5">
                          {verification.risks.map((r, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-[var(--text-caption-size)]">
                              <CircleDashed className="mt-0.5 h-3 w-3 shrink-0 text-amber-500" />
                              {r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Sources */}
                    <div>
                      <p className="mb-1 text-[var(--text-caption-size)] font-medium text-[var(--color-muted-foreground)]">
                        Sources Verified
                      </p>
                      <div className="divide-y divide-[var(--color-border)] rounded-[var(--radius-md)] border border-[var(--color-border)] px-3">
                        <SourceRow label="Amazon" source={verification.sources.amazon} />
                        <SourceRow label="Walmart" source={verification.sources.walmart} />
                        <SourceRow label="Social Media" source={verification.sources.socialMedia} />
                        <SourceRow
                          label="Business Registry"
                          source={verification.sources.businessRegistry}
                        />
                        <SourceRow
                          label="Financial Data"
                          source={verification.sources.financialData}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!verifying && !verification && (
              <p className="mt-3 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
                Verification unavailable.
              </p>
            )}
          </div>

          {/* Item Type Match */}
          {matchingPlanItems.length > 0 && (
            <div className="border-b border-[var(--color-border)] px-5 py-4">
              <p className="mb-2.5 text-[var(--text-body-size)] font-semibold">
                Item Type Match ({matchingPlanItems.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {matchingPlanItems.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1 text-[var(--text-caption-size)]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Business information */}
          <div className="border-b border-[var(--color-border)] px-5 py-4">
            <p className="mb-3 text-[var(--text-body-size)] font-semibold">Business information</p>
            <dl className="space-y-2.5">
              {[
                { label: "Type of partner", value: seller.businessType },
                { label: "Official website", value: seller.website },
                { label: "Address", value: seller.location },
                { label: "Founded", value: seller.founded.toString() },
              ].map((item) => (
                <div key={item.label}>
                  <dt className="text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">
                    {item.label}
                  </dt>
                  <dd className="text-[var(--text-caption-size)] font-medium">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* E-commerce presence */}
          <div className="border-b border-[var(--color-border)] px-5 py-4">
            <p className="mb-3 text-[var(--text-body-size)] font-semibold">E-commerce presence</p>
            <div className="space-y-3">
              {/* Amazon */}
              {(seller.amazonSkus || seller.amazonRating) && (
                <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-[var(--text-caption-size)] font-semibold">Amazon</span>
                    <ExternalLink className="h-3 w-3 text-[var(--color-muted-foreground)]" />
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[var(--text-caption-size)]">
                    {seller.amazonSkus && (
                      <div>
                        <p className="text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">SKUs</p>
                        <p className="font-semibold">{seller.amazonSkus.toLocaleString()}</p>
                      </div>
                    )}
                    {seller.amazonRating && (
                      <div>
                        <p className="text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">Ratings</p>
                        <p className="font-semibold">{seller.amazonRating}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {/* Walmart */}
              {seller.walmartPresent && (
                <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--text-caption-size)] font-semibold">Walmart</span>
                    <ExternalLink className="h-3 w-3 text-[var(--color-muted-foreground)]" />
                  </div>
                  <p className="mt-1 text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">
                    Active seller
                  </p>
                </div>
              )}
              {/* Other marketplaces */}
              {seller.marketplaces.filter((m) => m !== "Amazon" && m !== "Walmart").length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {seller.marketplaces
                    .filter((m) => m !== "Amazon" && m !== "Walmart")
                    .map((m) => (
                      <span
                        key={m}
                        className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-0.5 text-[var(--text-caption-size)]"
                      >
                        {m}
                      </span>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Social presence */}
          {seller.socialFollowers && (
            <div className="px-5 py-4">
              <p className="mb-2.5 text-[var(--text-body-size)] font-semibold">Social Media Presence</p>
              <div className="flex items-center gap-3 text-[var(--text-caption-size)]">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="font-semibold">{(seller.socialFollowers / 1000).toFixed(0)}K followers</p>
                  {seller.viralTrendy && (
                    <p className="text-purple-600">Trending product signal detected</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 border-t border-[var(--color-border)] p-4">
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
            <Mail className="h-3.5 w-3.5" /> Send Mail
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
            <Button
              size="sm"
              className="flex-1 gap-1.5"
              onClick={() => shortlistSeller(seller.id)}
            >
              <Plus className="h-3.5 w-3.5" /> Shortlist Lead
            </Button>
          )}
        </div>
      </aside>
    </>
  );
}
