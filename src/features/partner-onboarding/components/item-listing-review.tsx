"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";

import { InfoBanner } from "@/components/data-display/info-banner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusTag, markerToneClass } from "@/components/ui/status-tag";
import type { OnboardingPartner } from "@/lib/mock-data/onboarding";
import { getSectionProgressPercent } from "@/lib/mock-data/onboarding";
import type { ListingLatestStatus, ListingItemDetail } from "@/lib/mock-data/item-listing";
import type { PotentialPartner } from "@/lib/mock-data/potential-partners";
import { cn } from "@/lib/utils";
import { TruncatedText } from "@/components/ui/truncated-text";
import { OnboardingCommentsDrawer } from "./onboarding-comments-drawer";
import { AgentFeedbackModal } from "./agent-feedback-modal";
import { OnboardingSectionReviewLayout } from "./onboarding-section-review-layout";
import { TablePagination } from "./profile-review-shared";
import { getOnboardingSectionSubtitle } from "../constants/onboarding-section-copy";
import { useItemListingStore } from "../store/item-listing-store";
import { useOnboardingReviewStore } from "../store/onboarding-review-store";
import { useToastStore } from "@/stores/toast-store";

interface ItemListingReviewProps {
  partner: PotentialPartner;
  onboarding: OnboardingPartner;
}

function AiGenFillIcon({ className }: { className?: string }) {
  return (
    <span
      className={cn("inline-block h-3.5 w-3.5 shrink-0 bg-current", className)}
      style={{
        WebkitMaskImage: "url(/icons/ai-gen-fill.svg)",
        WebkitMaskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        WebkitMaskSize: "contain",
        maskImage: "url(/icons/ai-gen-fill.svg)",
        maskRepeat: "no-repeat",
        maskPosition: "center",
        maskSize: "contain",
      }}
      aria-hidden
    />
  );
}

const STATUS_LABELS: Record<ListingLatestStatus, string> = {
  DRAFT: "Draft",
  AI_READY: "AI ready",
  NEEDS_REVIEW: "Needs review",
  UNLISTED: "Unlisted",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  SUSPENDED: "Suspended",
};

function statusTone(status: ListingLatestStatus): string {
  switch (status) {
    case "AI_READY":
    case "APPROVED":
      return markerToneClass.success;
    case "NEEDS_REVIEW":
      return markerToneClass.review;
    case "REJECTED":
    case "SUSPENDED":
      return markerToneClass.error;
    default:
      return markerToneClass.muted;
  }
}

function ListingStatusMarker({ status }: { status: ListingLatestStatus }) {
  return (
    <StatusTag className={cn("inline-flex font-normal", statusTone(status))}>
      {STATUS_LABELS[status]}
    </StatusTag>
  );
}

function PublishStatusMarker({ value }: { value: "Yes" | "No" }) {
  return value === "Yes" ? (
    <StatusTag className={cn("font-normal", markerToneClass.success)}>Published</StatusTag>
  ) : (
    <StatusTag className={cn("font-normal", markerToneClass.muted)}>Not published</StatusTag>
  );
}

const ITEMS_PER_PAGE = 20;

const EMPTY_LISTINGS: ListingItemDetail[] = [];

export function ItemListingReview({ partner, onboarding }: ItemListingReviewProps) {
  const setContext = useOnboardingReviewStore((s) => s.setContext);
  const approvedIds = useOnboardingReviewStore((s) => s.approvedIds);
  const isApproved = useOnboardingReviewStore((s) => s.isApproved);
  const ensureListings = useItemListingStore((s) => s.ensureListingsForPartner);
  const generateMissingAttributesDrafts = useItemListingStore(
    (s) => s.generateMissingAttributesDrafts,
  );
  const generatingPartnerId = useItemListingStore((s) => s.generatingPartnerId);
  const listings = useItemListingStore((s) => s.byPartner[partner.id] ?? EMPTY_LISTINGS);
  const showToast = useToastStore((s) => s.showToast);

  const listingSection = onboarding.sections.find((s) => s.id === "item-listing");
  const listingTask = listingSection?.tasks[0];
  const assortmentApproved = isApproved(`assortment-${partner.id}`);
  const progress = listingSection
    ? getSectionProgressPercent(listingSection, approvedIds)
    : 0;

  const [page, setPage] = useState(1);
  const [generatingAttributes, setGeneratingAttributes] = useState(false);
  const initialLoading = generatingPartnerId === partner.id;

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

  const missingAttributesCount = useMemo(
    () => listings.filter((item) => item.attributesMissing).length,
    [listings],
  );

  const totalPages = Math.max(1, Math.ceil(listings.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pageItems = listings.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE,
  );

  const handleGenerateDraft = async () => {
    if (missingAttributesCount === 0 || generatingAttributes) return;
    setGeneratingAttributes(true);
    const count = await generateMissingAttributesDrafts(partner.id);
    setGeneratingAttributes(false);
    if (count > 0) {
      showToast({
        title: "AI drafts generated",
        description: `${count} SKU${count === 1 ? "" : "s"} now have listing attributes filled in.`,
      });
    }
  };

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
        <div className="mb-4">
          <h3 className="text-[20px] font-semibold text-[var(--color-foreground)]">All items</h3>
          <p className="mt-1 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
            Total Items: {listings.length.toLocaleString()} | Items Published:{" "}
            {publishedCount.toLocaleString()} · Pre-listing setup (AI drafts)
          </p>
        </div>

        {missingAttributesCount > 0 ? (
          <InfoBanner
            className="mb-6 border-[var(--color-primary)]/20 bg-[var(--color-primary-light)]/30"
            title="Missing listing attributes"
            message={`AI suggests that ${missingAttributesCount} SKU${missingAttributesCount === 1 ? "" : "s"} ${missingAttributesCount === 1 ? "is" : "are"} missing attributes required for item setup.`}
            actions={
              <Button
                size="sm"
                className="shrink-0 gap-1.5 self-center"
                disabled={generatingAttributes}
                onClick={() => void handleGenerateDraft()}
              >
                {generatingAttributes ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <AiGenFillIcon />
                )}
                {generatingAttributes ? "Generating…" : "Generate Draft"}
              </Button>
            }
          />
        ) : null}

        <section>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] border-collapse text-[var(--text-caption-size)]">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-card)] text-left text-[var(--text-label-size)] font-semibold text-[var(--color-muted-foreground)]">
                  {[
                    "Partner SKU",
                    "TCIN",
                    "Product title",
                    "Item type",
                    "Inventory",
                    "Relationship",
                    "Publish status",
                    "Latest status",
                    "List price",
                  ].map((col) => (
                    <th key={col} className="px-3 py-2.5 font-semibold">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {initialLoading && listings.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-3 py-16 text-center text-[var(--color-muted-foreground)]">
                      <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin" />
                      Loading items from approved assortment…
                    </td>
                  </tr>
                ) : (
                  pageItems.map((item) => (
                    <tr
                      key={item.partnerSku}
                      className={cn(
                        "border-b border-[var(--color-border)] last:border-0",
                        item.generatingAttributes && "animate-pulse bg-[var(--color-muted)]/40",
                      )}
                    >
                      <td className="px-3 py-2.5 tabular-nums font-medium">{item.partnerSku}</td>
                      <td className="px-3 py-2.5 tabular-nums text-[var(--color-muted-foreground)]">
                        {item.tcin ?? "Pending"}
                      </td>
                      <td className="max-w-[220px] px-3 py-2.5">
                        {item.generatingAttributes ? (
                          <span className="inline-block h-4 w-40 rounded bg-[var(--color-muted)]" />
                        ) : (
                          <Link
                            href={`/sellers/onboarding/${partner.id}/review/item-listing/${encodeURIComponent(item.partnerSku)}`}
                            className="text-[var(--color-primary)] hover:underline"
                          >
                            <TruncatedText text={item.title} />
                          </Link>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        {item.generatingAttributes ? (
                          <span className="inline-block h-4 w-24 rounded bg-[var(--color-muted)]" />
                        ) : item.attributesMissing || item.itemType === "—" ? (
                          <StatusTag className={cn("font-normal", markerToneClass.review)}>
                            Unavailable
                          </StatusTag>
                        ) : (
                          item.itemType
                        )}
                      </td>
                      <td className="px-3 py-2.5 tabular-nums">
                        {item.generatingAttributes ? (
                          <span className="inline-block h-4 w-10 rounded bg-[var(--color-muted)]" />
                        ) : item.attributesMissing ? (
                          "—"
                        ) : (
                          item.inventory
                        )}
                      </td>
                      <td className="px-3 py-2.5">{item.relationship}</td>
                      <td className="px-3 py-2.5">
                        <PublishStatusMarker value={item.publishStatus} />
                      </td>
                      <td className="px-3 py-2.5">
                        {item.generatingAttributes ? (
                          <StatusTag className={cn("inline-flex gap-1 font-normal", markerToneClass.info)}>
                            <AiGenFillIcon />
                            Generating…
                          </StatusTag>
                        ) : (
                          <ListingStatusMarker status={item.latestStatus} />
                        )}
                      </td>
                      <td className="px-3 py-2.5 tabular-nums">
                        {item.generatingAttributes ? (
                          <span className="inline-block h-4 w-14 rounded bg-[var(--color-muted)]" />
                        ) : (
                          item.listPrice
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <TablePagination
            showing={
              listings.length === 0
                ? 0
                : (safePage - 1) * ITEMS_PER_PAGE + pageItems.length
            }
            total={listings.length}
            pageSize={ITEMS_PER_PAGE}
          />
          {listings.length > ITEMS_PER_PAGE ? (
            <div className="mt-3 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
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
          ) : null}
        </section>
      </OnboardingSectionReviewLayout>

      <OnboardingCommentsDrawer partner={partner} />
      <AgentFeedbackModal />
    </>
  );
}
