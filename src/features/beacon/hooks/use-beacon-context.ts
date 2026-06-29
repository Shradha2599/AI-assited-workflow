"use client";

import { useEffect } from "react";

import { useBeaconStore } from "@/features/beacon/store/beacon-store";
import type { BeaconContext } from "@/types";

export function useBeaconContext(context: BeaconContext) {
  const setContext = useBeaconStore((state) => state.setContext);

  useEffect(() => {
    setContext(context);
  }, [context, setContext]);
}
