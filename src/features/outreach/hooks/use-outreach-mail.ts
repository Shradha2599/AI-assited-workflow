"use client";

import type { OutreachMailType } from "@/lib/mock-data/outreach-mail";
import { useOutreachStore } from "@/features/outreach/store/outreach-store";

interface OpenOutreachOptions {
  mailType: OutreachMailType;
  partnerId?: string;
  sellerId?: string;
  sellerName?: string;
  sellerWebsite?: string;
  multiPartner?: boolean;
}

export function useOutreachMail() {
  const openDrawer = useOutreachStore((s) => s.openDrawer);
  return (opts: OpenOutreachOptions) => openDrawer(opts);
}
