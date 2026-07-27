"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusTag, markerToneClass } from "@/components/ui/status-tag";
import { RegisterPageHeader } from "@/components/layout/page-header";
import type { ListingItemDetail } from "@/lib/mock-data/item-listing";
import type { PotentialPartner } from "@/lib/mock-data/potential-partners";
import { cn } from "@/lib/utils";
import { useItemListingStore } from "../store/item-listing-store";
import { useOnboardingReviewStore } from "../store/onboarding-review-store";

interface ItemListingDetailViewProps {
  partner: PotentialPartner;
  item: ListingItemDetail;
}

export function ItemListingDetailView({ partner, item }: ItemListingDetailViewProps) {
  const setContext = useOnboardingReviewStore((s) => s.setContext);
  const ensureListings = useItemListingStore((s) => s.ensureListingsForPartner);
  const updateField = useItemListingStore((s) => s.updateListingField);
  const stored = useItemListingStore((s) => s.byPartner[partner.id]?.find((i) => i.partnerSku === item.partnerSku));

  const detail = stored ?? item;

  useEffect(() => {
    setContext(partner.id, "item-listing");
    ensureListings(partner.id);
  }, [partner.id, setContext, ensureListings]);

  const backHref = `/sellers/onboarding/${partner.id}/review/item-listing`;

  return (
    <div className="space-y-[var(--space-4)]">
      <RegisterPageHeader>
        <nav aria-label="Breadcrumb" className="mb-2 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
          <Link href="/sellers/onboarding" className="hover:text-[var(--color-foreground)]">
            Partner Onboarding
          </Link>
          {" / "}
          <Link href={backHref} className="hover:text-[var(--color-foreground)]">
            Item listing
          </Link>
          {" / "}
          <span className="text-[var(--color-foreground)]">Item detail</span>
        </nav>
        <h1 className="text-[21px] font-bold">{detail.title}</h1>
      </RegisterPageHeader>

      <div className="grid gap-[var(--space-4)] lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-[var(--space-4)]">
          <Card className="overflow-hidden border-[var(--color-border)] p-[var(--space-4)]">
            <div className="flex flex-wrap gap-6">
              <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-muted)]/40 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
                {detail.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={detail.imageUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  "Image"
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <StatusTag className={cn("font-semibold uppercase", markerToneClass.muted)}>
                  UNLISTED
                </StatusTag>
                <p className="text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
                  Not published on Target.com · Pre-listing AI setup
                </p>
                <dl className="grid gap-x-6 gap-y-1 text-[var(--text-caption-size)] sm:grid-cols-2">
                  <div>
                    <dt className="text-[var(--color-muted-foreground)]">Partner SKU</dt>
                    <dd className="font-medium">{detail.partnerSku}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--color-muted-foreground)]">Barcode</dt>
                    <dd className="font-medium">{detail.barcode}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--color-muted-foreground)]">TCIN</dt>
                    <dd className="font-medium">{detail.tcin ?? "Assigned at publish"}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--color-muted-foreground)]">Item Type</dt>
                    <dd className="font-medium">{detail.itemType}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--color-muted-foreground)]">List Price</dt>
                    <dd className="font-semibold">{detail.listPrice}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--color-muted-foreground)]">Submitted Price</dt>
                    <dd className="font-medium">
                      {detail.submittedPrice}{" "}
                      <span className="text-[var(--color-muted-foreground)]">({detail.submittedPriceAsOf})</span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[var(--color-muted-foreground)]">Inventory (on hand)</dt>
                    <dd className="font-medium">{detail.inventory}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--color-muted-foreground)]">Relationship</dt>
                    <dd className="font-medium">{detail.relationship}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </Card>

          <Card className="overflow-hidden border-[var(--color-border)]">
            <div className="border-b border-[var(--color-border)] bg-[var(--color-muted)]/30 px-4 py-2.5">
              <p className="text-[var(--text-caption-size)] font-semibold">Latest key data</p>
              <p className="flex items-center gap-1 text-[var(--text-label-size)] text-[var(--color-primary)]">
                <Sparkles className="h-3 w-3" />
                AI populated from approved assortment + marketplace item-setup templates
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[var(--text-caption-size)]">
                <thead>
                  <tr className="border-b border-[var(--color-border)] text-left">
                    <th className="w-[40%] px-4 py-2 font-semibold text-[var(--color-muted-foreground)]">Field</th>
                    <th className="px-4 py-2 font-semibold text-[var(--color-muted-foreground)]">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.fields.map((row) => (
                    <tr key={row.field} className="border-b border-[var(--color-border)] last:border-0 align-top">
                      <td className="px-4 py-2.5 font-medium text-[var(--color-foreground)]">
                        {row.field}
                        {row.aiGenerated ? (
                          <span className="ml-1.5 text-[10px] font-normal text-[var(--color-primary)]">AI</span>
                        ) : null}
                      </td>
                      <td className="px-4 py-2.5">
                        {row.field === "Product Description" || row.field.startsWith("Bullet") ? (
                          <textarea
                            className="min-h-[72px] w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1.5 text-[var(--text-caption-size)] focus:border-[var(--color-primary)] focus:outline-none"
                            value={row.value}
                            onChange={(e) =>
                              updateField(partner.id, detail.partnerSku, row.field, e.target.value)
                            }
                          />
                        ) : (
                          <span className="text-[var(--color-foreground)]">{row.value}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <aside className="space-y-[var(--space-4)]">
          <Card className="border-[var(--color-border)] p-4">
            <h3 className="text-[var(--text-caption-size)] font-semibold">Listing errors</h3>
            <p className="mt-1 text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">
              Shown for items flagged before publish.
            </p>
            {detail.listingErrors.length === 0 ? (
              <p className="mt-3 text-[var(--text-caption-size)] text-[var(--color-success)]">
                No blocking errors — ready for TM review.
              </p>
            ) : (
              <ul className="mt-3 list-disc space-y-1 pl-4 text-[var(--text-caption-size)] text-[var(--color-foreground)]">
                {detail.listingErrors.map((err) => (
                  <li key={err}>{err}</li>
                ))}
              </ul>
            )}
          </Card>
          <Button variant="outline" className="w-full" asChild>
            <Link href={backHref}>Back to all items</Link>
          </Button>
        </aside>
      </div>
    </div>
  );
}
