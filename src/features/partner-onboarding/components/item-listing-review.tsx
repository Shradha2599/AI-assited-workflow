"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusTag, markerToneClass } from "@/components/ui/status-tag";
import type { OnboardingPartner } from "@/lib/mock-data/onboarding";
import { getSectionProgressPercent } from "@/lib/mock-data/onboarding";
import type { ListingLatestStatus } from "@/lib/mock-data/item-listing";
import type { PotentialPartner } from "@/lib/mock-data/potential-partners";
import { cn } from "@/lib/utils";
import { OnboardingCommentsDrawer } from "./onboarding-comments-drawer";
import { AgentFeedbackModal } from "./agent-feedback-modal";
import { OnboardingSectionReviewLayout } from "./onboarding-section-review-layout";
import { getOnboardingSectionSubtitle } from "../constants/onboarding-section-copy";
import { useItemListingStore } from "../store/item-listing-store";
import { useOnboardingReviewStore } from "../store/onboarding-review-store";

interface ItemListingReviewProps {
  partner: PotentialPartner;
  onboarding: OnboardingPartner;
}

function statusTone(status: ListingLatestStatus): string {
  switch (status) {
    case "AI_READY":
      return markerToneClass.success;
    case "NEEDS_REVIEW":
      return markerToneClass.review;
    case "APPROVED":
      return markerToneClass.success;
    case "REJECTED":
    case "SUSPENDED":
      return markerToneClass.error;
    default:
      return markerToneClass.muted;
  }
}

const ITEMS_PER_PAGE = 20;

export function ItemListingReview({ partner, onboarding }: ItemListingReviewProps) {
  const setContext = useOnboardingReviewStore((s) => s.setContext);
  const approvedIds = useOnboardingReviewStore((s) => s.approvedIds);
  const isApproved = useOnboardingReviewStore((s) => s.isApproved);
  const ensureListings = useItemListingStore((s) => s.ensureListingsForPartner);
  const regenerateListings = useItemListingStore((s) => s.regenerateListings);
  const generatingPartnerId = useItemListingStore((s) => s.generatingPartnerId);
  const listings = useItemListingStore((s) => s.byPartner[partner.id] ?? []);

  const listingSection = onboarding.sections.find((s) => s.id === "item-listing");
  const listingTask = listingSection?.tasks[0];
  const assortmentApproved = isApproved(`assortment-${partner.id}`);
  const progress = listingSection
    ? getSectionProgressPercent(listingSection, approvedIds)
    : 0;

  const [page, setPage] = useState(1);
  const generating = generatingPartnerId === partner.id;

  useEffect(() => {
    setContext(partner.id, "item-listing", listingTask?.id);
  }, [partner.id, listingTask?.id, setContext]);

  useEffect(() => {
    if (assortmentApproved) {
      ensureListings(partner.id);
    }
  }, [partner.id, assortmentApproved, ensureListings]);

  const publishedCount = useMemo(
    () => listings.filter((item) => item.publishStatus === "Yes").length,
    [listings],
  );

  const totalPages = Math.max(1, Math.ceil(listings.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pageItems = listings.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE,
  );

  if (!assortmentApproved) {
    return (
      <OnboardingSectionReviewLayout
        partner={partner}
        onboarding={onboarding}
        breadcrumbExtra="Item listing"
        sectionTitle="Item listing"
        sectionSubtitle={getOnboardingSectionSubtitle("item-listing")}
        progress={0}
        headerIconSrc="/icons/box-closed.svg"
      >
        <Card className="px-6 py-12 text-center">
          <p className="text-[var(--text-body-size)] font-semibold">Item listing is locked</p>
          <p className="mt-2 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
            Approve the assortment curation review to unlock AI item setup for this partner.
          </p>
          <Button className="mt-4" asChild>
            <Link href={`/sellers/onboarding/${partner.id}/review/assortment`}>Go to assortment review</Link>
          </Button>
        </Card>
      </OnboardingSectionReviewLayout>
    );
  }

  return (
    <>
      <OnboardingSectionReviewLayout
        partner={partner}
        onboarding={onboarding}
        breadcrumbExtra="Item listing"
        sectionTitle="Item listing"
        sectionSubtitle={getOnboardingSectionSubtitle("item-listing")}
        progress={progress}
        headerIconSrc="/icons/box-closed.svg"
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-[20px] font-semibold text-[var(--color-foreground)]">All items</h3>
            <p className="mt-1 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
              Total Items: {listings.length.toLocaleString()} | Items Published:{" "}
              {publishedCount.toLocaleString()} · Pre-listing setup (AI drafts)
            </p>
          </div>
          <Button
            size="sm"
            className="gap-1.5"
            disabled={generating}
            onClick={() => void regenerateListings(partner.id)}
          >
            {generating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            {generating ? "Generating…" : "Regenerate AI drafts"}
          </Button>
        </div>

        <Card className="overflow-hidden border-[var(--color-border)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] border-collapse text-[var(--text-caption-size)]">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-muted)]/30 text-left">
                  <th className="px-4 py-2.5 font-semibold text-[var(--color-muted-foreground)]">Partner SKU</th>
                  <th className="px-4 py-2.5 font-semibold text-[var(--color-muted-foreground)]">TCIN</th>
                  <th className="px-4 py-2.5 font-semibold text-[var(--color-muted-foreground)]">Title</th>
                  <th className="px-4 py-2.5 font-semibold text-[var(--color-muted-foreground)]">Item Type</th>
                  <th className="px-4 py-2.5 font-semibold text-[var(--color-muted-foreground)]">Inventory</th>
                  <th className="px-4 py-2.5 font-semibold text-[var(--color-muted-foreground)]">Relationship</th>
                  <th className="px-4 py-2.5 font-semibold text-[var(--color-muted-foreground)]">Publish Status</th>
                  <th className="px-4 py-2.5 font-semibold text-[var(--color-muted-foreground)]">Latest Status</th>
                  <th className="px-4 py-2.5 font-semibold text-[var(--color-muted-foreground)]">List Price</th>
                </tr>
              </thead>
              <tbody>
                {generating && listings.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-16 text-center text-[var(--color-muted-foreground)]">
                      <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin" />
                      AI is building item setup drafts from your approved assortment…
                    </td>
                  </tr>
                ) : (
                  pageItems.map((item) => (
                    <tr
                      key={item.partnerSku}
                      className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-muted)]/20"
                    >
                      <td className="px-4 py-2.5 font-medium">{item.partnerSku}</td>
                      <td className="px-4 py-2.5 text-[var(--color-muted-foreground)]">
                        {item.tcin ?? "Pending"}
                      </td>
                      <td className="max-w-[220px] px-4 py-2.5">
                        <Link
                          href={`/sellers/onboarding/${partner.id}/review/item-listing/${encodeURIComponent(item.partnerSku)}`}
                          className="font-medium text-[var(--color-primary)] hover:underline"
                        >
                          {item.title}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5">{item.itemType}</td>
                      <td className="px-4 py-2.5 tabular-nums">{item.inventory}</td>
                      <td className="px-4 py-2.5">{item.relationship}</td>
                      <td className="px-4 py-2.5">
                        <span
                          className={cn(
                            item.publishStatus === "Yes"
                              ? "text-[var(--color-primary)]"
                              : "text-[var(--color-foreground)]",
                          )}
                        >
                          {item.publishStatus}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <StatusTag className={cn("text-[10px] font-semibold uppercase", statusTone(item.latestStatus))}>
                          {item.latestStatus.replace("_", " ")}
                        </StatusTag>
                      </td>
                      <td className="px-4 py-2.5 tabular-nums">{item.listPrice}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {listings.length > ITEMS_PER_PAGE && (
            <div className="flex items-center justify-between border-t border-[var(--color-border)] px-4 py-3 text-[var(--text-caption-size)]">
              <span className="text-[var(--color-muted-foreground)]">
                {(safePage - 1) * ITEMS_PER_PAGE + 1}–
                {Math.min(safePage * ITEMS_PER_PAGE, listings.length)} of {listings.length}
              </span>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" disabled={safePage <= 1} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={safePage >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>

        <p className="mt-4 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
          Inspired by Target seller portal item setup and marketplace listing flows (Walmart / Amazon item
          creation). Open any row to review AI-generated copy, pricing, and logistics before publish.
        </p>
      </OnboardingSectionReviewLayout>

      <OnboardingCommentsDrawer partner={partner} />
      <AgentFeedbackModal />
    </>
  );
}
