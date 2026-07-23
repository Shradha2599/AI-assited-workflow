import { create } from "zustand";

import type { GapItem } from "@/components/data-display/gaps-drawer";
import { getGapItemsByCategory } from "@/lib/mock-data/gap-items-catalog";

export type GapDrawerMode = "gap-analysis" | "calendar-update";

interface GapDrawerStore {
  open: boolean;
  category: string;
  displayCategory: string;
  items: GapItem[];
  mode: GapDrawerMode;
  openDrawer: (category?: string, mode?: GapDrawerMode, displayCategory?: string) => void;
  closeDrawer: () => void;
}

export const useGapDrawerStore = create<GapDrawerStore>((set) => ({
  open: false,
  category: "Serveware",
  displayCategory: "Serveware",
  items: getGapItemsByCategory("Serveware"),
  mode: "gap-analysis",

  openDrawer: (category = "Serveware", mode: GapDrawerMode = "gap-analysis", displayCategory?: string) =>
    set({
      open: true,
      category,
      displayCategory: displayCategory ?? category,
      items: getGapItemsByCategory(category),
      mode,
    }),

  closeDrawer: () => set({ open: false }),
}));
