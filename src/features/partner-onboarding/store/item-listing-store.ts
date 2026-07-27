import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  getListingItemsForPartner,
  type ListingItemDetail,
} from "@/lib/mock-data/item-listing";

interface ItemListingStore {
  /** partnerId → AI-generated listing drafts */
  byPartner: Record<string, ListingItemDetail[]>;
  generatingPartnerId: string | null;
  ensureListingsForPartner: (partnerId: string) => void;
  regenerateListings: (partnerId: string) => Promise<void>;
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
    { name: "item-listing-drafts", skipHydration: true },
  ),
);
