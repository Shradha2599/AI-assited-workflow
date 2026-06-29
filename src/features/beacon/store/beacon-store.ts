import { create } from "zustand";

import type { BeaconContext } from "@/types";

interface BeaconStore {
  isOpen: boolean;
  context: BeaconContext | null;
  toggle: () => void;
  setOpen: (open: boolean) => void;
  setContext: (context: BeaconContext) => void;
}

export const useBeaconStore = create<BeaconStore>((set) => ({
  isOpen: true,
  context: null,
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  setOpen: (open) => set({ isOpen: open }),
  setContext: (context) => set({ context }),
}));
