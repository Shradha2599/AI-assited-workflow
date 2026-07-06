import { create } from "zustand";

import type { GapItem } from "@/components/data-display/gaps-drawer";
import { getGapItemsByCategory } from "@/lib/mock-data/gap-items-catalog";

interface GapDrawerStore {
  open: boolean;
  category: string;
  items: GapItem[];
  openDrawer: (category?: string) => void;
  closeDrawer: () => void;
}

export const useGapDrawerStore = create<GapDrawerStore>((set) => ({
  open: false,
  category: "Serveware",
  items: getGapItemsByCategory("Serveware"),

  openDrawer: (category = "Serveware") =>
    set({ open: true, category, items: getGapItemsByCategory(category) }),

  closeDrawer: () => set({ open: false }),
}));
