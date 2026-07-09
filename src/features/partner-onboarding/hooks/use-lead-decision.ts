"use client";

import type { PotentialPartner } from "@/lib/mock-data/potential-partners";
import {
  type LeadDecision,
  usePartnerReviewStore,
} from "../store/partner-review-store";

export function useLeadDecision(partner: PotentialPartner) {
  const setPartnerDecision = usePartnerReviewStore((s) => s.setPartnerDecision);

  function decide(decision: LeadDecision) {
    setPartnerDecision(partner.id, partner.legalBusinessName, decision);
  }

  return {
    accept: () => decide("accept"),
    reject: () => decide("reject"),
    markFutureInterest: () => decide("future_interest"),
  };
}
