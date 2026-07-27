import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  generateListingDetailFromSku,
  getListingItemsForPartner,
  type ListingItemDetail,
} from "@/lib/mock-data/item-listing";
import { getAssortmentCurationContent, getVersionSkus } from "@/lib/mock-data/assortment-curation-content";

interface ItemListingStore {
  /** partnerId → AI-generated listing drafts */
  byPartner: Record<string, ListingItemDetail[]>;
  generatingPartnerId: string | null;
  ensureListingsForPartner: (partnerId: string) => void;
  regenerateListings: (partnerId: string) => Promise<void>;
  generateMissingAttributesDrafts: (partnerId: string) => Promise<number>;
  updateListingField: (
    partnerId: string,
    partnerSku: string,
    field: string,
    value: string,
  ) => void;
  getListings: (partnerId: string) => ListingItemDetail[];
  getListing: (partnerId: string, partnerSku: string) => ListingItemDetail | undefined;
}

export const useItemListingStore = create<ItemListingStore>()(
  persist(
    (set, get) => ({
      byPartner: {},
      generatingPartnerId: null,
      ensureListingsForPartner: (partnerId) => {
        if (get().byPartner[partnerId]?.length) return;
        set((s) => ({
          byPartner: {
            ...s.byPartner,
            [partnerId]: getListingItemsForPartner(partnerId),
          },
        }));
      },
      regenerateListings: async (partnerId) => {
        set({ generatingPartnerId: partnerId });
        await new Promise((r) => setTimeout(r, 1200));
        set((s) => ({
          generatingPartnerId: null,
          byPartner: {
            ...s.byPartner,
            [partnerId]: getListingItemsForPartner(partnerId),
          },
        }));
      },
      generateMissingAttributesDrafts: async (partnerId) => {
        const list = get().byPartner[partnerId] ?? [];
        const missingSkus = list.filter((item) => item.attributesMissing).map((i) => i.partnerSku);
        if (missingSkus.length === 0) return 0;

        set((s) => ({
          byPartner: {
            ...s.byPartner,
            [partnerId]: list.map((item) =>
              item.attributesMissing
                ? { ...item, generatingAttributes: true }
                : item,
            ),
          },
        }));

        await new Promise((r) => setTimeout(r, 5000));

        const content = getAssortmentCurationContent(partnerId);
        const version = content.versions[0];
        const skus = version ? getVersionSkus(content, version.id) : content.submittedSkus;
        const skuById = new Map(skus.map((s, index) => [s.partnerSku, { sku: s, index }]));

        set((s) => {
          const current = s.byPartner[partnerId] ?? [];
          return {
            byPartner: {
              ...s.byPartner,
              [partnerId]: current.map((item) => {
                if (!missingSkus.includes(item.partnerSku)) return item;
                const match = skuById.get(item.partnerSku);
                if (!match) {
                  return { ...item, generatingAttributes: false, attributesMissing: false };
                }
                const filled = generateListingDetailFromSku(match.sku, match.index);
                return {
                  ...filled,
                  attributesMissing: false,
                  generatingAttributes: false,
                  latestStatus: "AI_READY" as const,
                };
              }),
            },
          };
        });

        return missingSkus.length;
      },
      updateListingField: (partnerId, partnerSku, field, value) => {
        set((s) => {
          const list = s.byPartner[partnerId];
          if (!list) return s;
          return {
            byPartner: {
              ...s.byPartner,
              [partnerId]: list.map((item) => {
                if (item.partnerSku !== partnerSku) return item;
                const fields = item.fields.map((row) =>
                  row.field === field ? { ...row, value, aiGenerated: false } : row,
                );
                return { ...item, fields };
              }),
            },
          };
        });
      },
      getListings: (partnerId) => get().byPartner[partnerId] ?? [],
      getListing: (partnerId, partnerSku) =>
        get().byPartner[partnerId]?.find((i) => i.partnerSku === partnerSku),
    }),
    { name: "item-listing-drafts-v2", skipHydration: true },
  ),
);
