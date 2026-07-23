"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  CircleDashed,
  ExternalLink,
  Loader2,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Sparkles,
  Star,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfidenceScoreBadge } from "@/components/data-display/confidence-score-badge";
import { ItemTypesDrawer } from "@/components/data-display/item-types-drawer";
import { ItemTypesInlineList } from "@/components/data-display/item-types-inline-list";
import { RegisterPageHeader } from "@/components/layout/page-header";
import { SvgIcon } from "@/components/ui/svg-icon";
import { useOutreachMail } from "@/features/outreach/hooks/use-outreach-mail";
import { cn } from "@/lib/utils";
import type { Seller } from "@/lib/mock-data/sellers";
import { getSellerProfileDetails } from "@/lib/mock-data/seller-profile-details";
import { useSellerMatchingPlanItems } from "../hooks/use-seller-matching-plan-items";
import { usePlanStore } from "@/features/assortment-plan/store/plan-store";
import {
  useDiscoveryStore,
  useFYDiscoverySnapshot,
  type VerificationResult,
  type VerificationSource,
} from "../store/discovery-store";

type ProfileTab = "overview" | "contacts" | "products";

interface SellerProfileViewProps {
  seller: Seller;
}

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

export function SellerProfileView({ seller }: SellerProfileViewProps) {
  const fiscalYear = usePlanStore((s) => s.fiscalYear);
  const snap = useFYDiscoverySnapshot(fiscalYear);
  const verifications = useDiscoveryStore((s) => s.verifications);
  const shortlistSeller = useDiscoveryStore((s) => s.shortlistSeller);
  const removeFromShortlist = useDiscoveryStore((s) => s.removeFromShortlist);
  const setVerification = useDiscoveryStore((s) => s.setVerification);
  const openOutreach = useOutreachMail();

  const openAcquisitionMail = () =>
    openOutreach({
      mailType: "acquisition_outreach",
      sellerId: seller.id,
      sellerName: seller.legalBusinessName,
      sellerWebsite: seller.website,
    });

  const details = getSellerProfileDetails(seller);
  const matchingItems = useSellerMatchingPlanItems(seller);
  const cached = verifications[seller.id];
  const isShortlisted = snap.shortlistedIds.includes(seller.id);

  const [activeTab, setActiveTab] = useState<ProfileTab>("overview");
  const [verifying, setVerifying] = useState(!cached);
  const [verification, setLocalVerification] = useState<VerificationResult | null>(cached ?? null);
  const [itemTypesDrawerOpen, setItemTypesDrawerOpen] = useState(false);

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
  const categoriesLabel = seller.categories.join(", ");

  return (
    <>
    <div className="space-y-[var(--space-4)]">
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
                <Link href="/sellers/discovery" className="hover:text-[var(--color-foreground)]">
                  Lead Discovery
                </Link>
              </li>
              <li>/</li>
              <li>
                <span className="font-medium text-[var(--color-foreground)]">
                  {seller.legalBusinessName}
                </span>
              </li>
            </ol>
          </nav>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                {initials}
              </div>
              <h1 className="text-[21px] font-bold leading-tight">
                {seller.legalBusinessName}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              {isShortlisted ? (
                <Button variant="outline" size="sm" onClick={() => removeFromShortlist(fiscalYear, seller.id)}>
                  Remove from Shortlist
                </Button>
              ) : (
                <Button size="sm" className="gap-1.5" onClick={() => shortlistSeller(fiscalYear, seller.id)}>
                  <Plus className="h-3.5 w-3.5" /> Shortlist Lead
                </Button>
              )}
              <Button variant="outline" size="sm" className="gap-1.5" onClick={openAcquisitionMail}>
                <SvgIcon name="mail" size={14} variant="primary" /> Send Email
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

      <div className="mb-[var(--space-4)] flex flex-wrap gap-[var(--space-6)]">
        {[
          { label: "Avg. Annual GMV", value: formatCurrency(seller.gmv) },
          { label: "Categories", value: categoriesLabel },
          { label: "SKUs", value: seller.skus.toLocaleString() },
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
          <div className="mt-1">
            <ConfidenceScoreBadge score={seller.confidenceScore} variant="profile" />
          </div>
        </div>
      </div>

      <div className="mb-[var(--space-4)] flex w-fit rounded-[var(--radius-md)] border border-[var(--color-border)] p-0.5">
        {(
          [
            { id: "overview" as const, label: "Overview" },
            { id: "contacts" as const, label: "Contacts" },
            { id: "products" as const, label: "Products & Categories" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "rounded-[var(--radius-sm)] px-4 py-1.5 text-[var(--text-caption-size)] font-medium transition-colors",
              activeTab === tab.id
                ? "bg-[var(--color-foreground)] text-[var(--color-background)]"
                : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="grid gap-[var(--space-4)] lg:grid-cols-3">
          {/* Main column */}
          <div className="space-y-[var(--space-4)] lg:col-span-2">
            {/* About */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-[var(--text-body-size)]">About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[var(--text-caption-size)] leading-relaxed text-[var(--color-foreground)]">
                  {seller.description}
                </p>
                <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
                  {[
                    { label: "Founded", value: seller.founded.toString() },
                    { label: "Company Type", value: seller.businessType },
                    { label: "Employee Size", value: details.employeeSize },
                    { label: "Address", value: seller.location },
                    {
                      label: "Confidence Score",
                      value: `${seller.confidenceScore.toFixed(1)}/10`,
                    },
                  ].map((item) => (
                    <div key={item.label}>
                      <dt className="text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">
                        {item.label}
                      </dt>
                      <dd className="mt-0.5 text-[var(--text-caption-size)] font-medium">
                        {item.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>

            {/* Top Categories */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-[var(--text-body-size)]">Top Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {seller.categories.map((cat) => (
                    <span
                      key={cat}
                      className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1 text-[var(--text-caption-size)]"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Marketplace Presence */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-[var(--text-body-size)]">Marketplace Presence</CardTitle>
              </CardHeader>
              <CardContent className="p-0 pt-0">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-[var(--text-caption-size)]">
                    <thead>
                      <tr className="border-b border-t border-[var(--color-border)] bg-[var(--color-muted)]/30">
                        <th className="px-6 py-2.5 text-left font-semibold text-[var(--color-muted-foreground)]">
                          Marketplace
                        </th>
                        <th className="px-3 py-2.5 text-left font-semibold text-[var(--color-muted-foreground)]">
                          SKUs
                        </th>
                        <th className="px-3 py-2.5 text-left font-semibold text-[var(--color-muted-foreground)]">
                          Rating
                        </th>
                        <th className="px-3 py-2.5 text-left font-semibold text-[var(--color-muted-foreground)]">
                          Comments
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {details.marketplaces.map((mp) => (
                        <tr
                          key={mp.name}
                          className="border-b border-[var(--color-border)] last:border-0"
                        >
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-2 font-medium">
                              {mp.name}
                              <ExternalLink className="h-3 w-3 text-[var(--color-muted-foreground)]" />
                            </div>
                          </td>
                          <td className="px-3 py-3 tabular-nums">{mp.skus.toLocaleString()}</td>
                          <td className="px-3 py-3">
                            <span className="inline-flex items-center gap-1 tabular-nums">
                              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                              {mp.rating}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <span className="inline-flex items-center gap-1 tabular-nums">
                              <MessageSquare className="h-3 w-3 text-[var(--color-muted-foreground)]" />
                              {mp.comments}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Social Media Presence */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-[var(--text-body-size)]">Social Media Presence</CardTitle>
              </CardHeader>
              <CardContent className="p-0 pt-0">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-[var(--text-caption-size)]">
                    <thead>
                      <tr className="border-b border-t border-[var(--color-border)] bg-[var(--color-muted)]/30">
                        <th className="px-6 py-2.5 text-left font-semibold text-[var(--color-muted-foreground)]">
                          Platform
                        </th>
                        <th className="px-3 py-2.5 text-left font-semibold text-[var(--color-muted-foreground)]">
                          Followers
                        </th>
                        <th className="px-3 py-2.5 text-left font-semibold text-[var(--color-muted-foreground)]">
                          Posts
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {details.socialPlatforms.map((social) => (
                        <tr
                          key={social.platform}
                          className="border-b border-[var(--color-border)] last:border-0"
                        >
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-2 font-medium">
                              {social.platform}
                              <ExternalLink className="h-3 w-3 text-[var(--color-muted-foreground)]" />
                            </div>
                          </td>
                          <td className="px-3 py-3 tabular-nums">
                            {social.followers >= 1000
                              ? `${(social.followers / 1000).toFixed(0)}K`
                              : social.followers}
                          </td>
                          <td className="px-3 py-3 tabular-nums">{social.posts.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar column */}
          <div className="space-y-[var(--space-4)]">
            {/* Item Type Match */}
            {matchingItems.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-[var(--text-body-size)]">
                    Item Type Match ({matchingItems.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ItemTypesInlineList
                    items={matchingItems}
                    variant="tag"
                    onShowAll={() => setItemTypesDrawerOpen(true)}
                  />
                </CardContent>
              </Card>
            )}

            {/* Confidence Summary */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[var(--color-primary)]" />
                  <CardTitle className="text-[var(--text-body-size)]">Confidence Summary</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {verifying && (
                  <div className="flex items-center gap-2 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Analyzing seller signals…
                  </div>
                )}
                {!verifying && (
                  <p className="text-[var(--text-caption-size)] leading-relaxed">
                    {verification?.summary ?? details.confidenceSummary}
                  </p>
                )}
                {!verifying && verification && (
                  <div className="mt-3 divide-y divide-[var(--color-border)] rounded-[var(--radius-md)] border border-[var(--color-border)] px-3">
                    <SourceRow label="Amazon" source={verification.sources.amazon} />
                    <SourceRow label="Walmart" source={verification.sources.walmart} />
                    <SourceRow label="Social Media" source={verification.sources.socialMedia} />
                    <SourceRow
                      label="Business Registry"
                      source={verification.sources.businessRegistry}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact Snapshot */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-[var(--text-body-size)]">Contact Snapshot</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2.5">
                  {[
                    { label: "Primary Contact", value: details.contact.name },
                    { label: "Email", value: details.contact.email },
                    { label: "Phone", value: details.contact.phone },
                    { label: "Website", value: seller.website, isLink: true },
                  ].map((item) => (
                    <div key={item.label}>
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
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "contacts" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-[var(--text-body-size)]">Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-2">
              {[
                { label: "Primary Contact", value: details.contact.name },
                { label: "Email", value: details.contact.email },
                { label: "Phone", value: details.contact.phone },
                { label: "Website", value: seller.website },
              ].map((item) => (
                <div key={item.label}>
                  <dt className="text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">
                    {item.label}
                  </dt>
                  <dd className="mt-0.5 text-[var(--text-caption-size)] font-medium">{item.value}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      )}

      {activeTab === "products" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-[var(--text-body-size)]">Products &amp; Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <p className="mb-2 text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">
                Primary Category
              </p>
              <p className="text-[var(--text-caption-size)] font-medium">{seller.category}</p>
            </div>
            <div className="mb-4">
              <p className="mb-2 text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">
                All Categories
              </p>
              <div className="flex flex-wrap gap-2">
                {seller.categories.map((cat) => (
                  <span
                    key={cat}
                    className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1 text-[var(--text-caption-size)]"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
            {matchingItems.length > 0 && (
              <div>
                <p className="mb-2 text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">
                  Matching Item Types from Assortment Plan
                </p>
                <ItemTypesInlineList
                  items={matchingItems}
                  variant="plan"
                  onShowAll={() => setItemTypesDrawerOpen(true)}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>

    {itemTypesDrawerOpen && matchingItems.length > 0 && (
      <ItemTypesDrawer
        title="Item Type Match"
        accent={seller.legalBusinessName}
        items={matchingItems}
        onClose={() => setItemTypesDrawerOpen(false)}
      />
    )}
    </>
  );
}
