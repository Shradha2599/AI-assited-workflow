import type { PipelineCategoryRow } from "@/components/data-display/pipeline-heatmap";
import type { PartnerStage, PipelinePartner } from "@/lib/mock-data/pipeline-partners";
import { sellers, type Seller } from "@/lib/mock-data/sellers";

export interface PipelineData {
  stageColumns: string[];
  categoryRows: PipelineCategoryRow[];
}

export interface DiscoveryPipelineCounts {
  discovered: number;
  shortlisted: number;
  contacted: number;
  hasUserInitiatedDiscovery: boolean;
}

const KITCHEN_CATEGORY = "Kitchen & Dining";

function stageIndex(columns: string[], stage: PartnerStage): number {
  return columns.indexOf(stage);
}

/** Merge lead-discovery counts into pipeline heatmap for Kitchen & Dining */
export function mergePipelineWithDiscovery(
  baseline: PipelineData,
  counts: DiscoveryPipelineCounts,
): PipelineData {
  if (!counts.hasUserInitiatedDiscovery || baseline.categoryRows.length === 0) {
    return baseline;
  }

  const row = baseline.categoryRows[0];
  const values = [...row.values];
  const discoveredIdx = stageIndex(baseline.stageColumns, "Discovered");
  const shortlistedIdx = stageIndex(baseline.stageColumns, "Shortlisted");
  const contactedIdx = stageIndex(baseline.stageColumns, "Contacted");

  if (discoveredIdx >= 0) values[discoveredIdx] = counts.discovered;
  if (shortlistedIdx >= 0) values[shortlistedIdx] = counts.shortlisted;
  if (contactedIdx >= 0) values[contactedIdx] = counts.contacted;

  return {
    ...baseline,
    categoryRows: [{ ...row, values }],
  };
}

function sellerToPipelinePartner(seller: Seller, stage: PartnerStage): PipelinePartner {
  const gmvM = seller.gmv / 1_000_000;
  return {
    id: seller.id,
    name: seller.legalBusinessName,
    primaryCategory: KITCHEN_CATEGORY,
    categories: seller.categories,
    stage,
    gmv: formatGmv(seller.gmv),
    gmvValue: gmvM,
    confidenceScore: seller.confidenceScore,
    website: seller.website,
    lastContactDate: stage === "Contacted" ? new Date().toISOString().slice(0, 10) : undefined,
    lastContactTime: stage === "Contacted" ? "Today" : undefined,
  };
}

function formatGmv(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

/** Resolve partners for a pipeline cell, preferring live discovery data when available */
export function getPartnersForPipelineCell(
  stage: PartnerStage,
  categoryLabel: string,
  staticPartners: PipelinePartner[],
  discovery: {
    discoveredIds: string[];
    shortlistedIds: string[];
    contactedIds: string[];
    hasUserInitiatedDiscovery: boolean;
  },
): PipelinePartner[] {
  const cat = categoryLabel.includes("Kitchen") ? KITCHEN_CATEGORY : categoryLabel;
  if (cat !== KITCHEN_CATEGORY || !discovery.hasUserInitiatedDiscovery) {
    return staticPartners;
  }

  let ids: string[] = [];
  if (stage === "Discovered") ids = discovery.discoveredIds;
  if (stage === "Shortlisted") ids = discovery.shortlistedIds;
  if (stage === "Contacted") ids = discovery.contactedIds;

  if (ids.length === 0) return staticPartners;

  const fromDiscovery = ids
    .map((id) => sellers.find((s) => s.id === id))
    .filter(Boolean)
    .map((s) => sellerToPipelinePartner(s!, stage));

  return fromDiscovery;
}
