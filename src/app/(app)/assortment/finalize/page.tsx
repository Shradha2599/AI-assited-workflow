"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { usePlanStore } from "@/features/assortment-plan/store/plan-store";

export default function FinalizePage() {
  const router = useRouter();
  const openFinalizeDrawer = usePlanStore((s) => s.openFinalizeDrawer);

  useEffect(() => {
    openFinalizeDrawer();
    router.replace("/assortment/plan");
  }, [openFinalizeDrawer, router]);

  return null;
}
