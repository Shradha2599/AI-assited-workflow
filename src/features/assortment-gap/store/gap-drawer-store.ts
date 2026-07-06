import { create } from "zustand";

import type { GapItem } from "@/components/data-display/gaps-drawer";

// Shared mock items — mirrors the servewareGapItems in assortment-gap.ts
const DEFAULT_GAP_ITEMS: GapItem[] = [
  {
    id: "gw-1",
    name: "Ceramic Serving High Bowls",
    lagPercent: 28,
    lagSeverity: "high",
    estimatedRevenue: "$1.5M",
    competitor: "Amazon",
    skuCount: 102,
    imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=96&h=96&fit=crop",
  },
  {
    id: "gw-2",
    name: "Sugar Bowl & Creamer Sets",
    lagPercent: 18.2,
    lagSeverity: "medium-high",
    estimatedRevenue: "$1.5M",
    competitor: "Amazon",
    skuCount: 102,
    imageUrl: "https://images.unsplash.com/photo-1603199508936-b5735cab581e?w=96&h=96&fit=crop",
  },
  {
    id: "gw-3",
    name: "Dip & Condiment Servers",
    lagPercent: 9.8,
    lagSeverity: "medium",
    estimatedRevenue: "$1.5M",
    competitor: "Amazon",
    skuCount: 102,
    imageUrl: "https://images.unsplash.com/photo-1604719312566-8912b06350af?w=96&h=96&fit=crop",
  },
  {
    id: "gw-4",
    name: "Cake Stands & Tiered Servers",
    lagPercent: 14,
    lagSeverity: "medium-high",
    estimatedRevenue: "$1.5M",
    competitor: "Amazon",
    skuCount: 102,
    imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=96&h=96&fit=crop",
  },
  {
    id: "gw-5",
    name: "Glass Cake Domes",
    lagPercent: 25,
    lagSeverity: "high",
    estimatedRevenue: "$1.5M",
    competitor: "Amazon",
    skuCount: 102,
    imageUrl: "https://images.unsplash.com/photo-1464305796206-3f0dd815fc22?w=96&h=96&fit=crop",
  },
];

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
  items: DEFAULT_GAP_ITEMS,

  openDrawer: (category = "Serveware") =>
    set({ open: true, category, items: DEFAULT_GAP_ITEMS }),

  closeDrawer: () => set({ open: false }),
}));
