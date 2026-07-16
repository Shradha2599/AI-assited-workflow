import assortmentCurationJson from "../../../mock/business/assortment_curation.json";

export type AssortmentSource =
  | "Seller provided"
  | "Target recommended"
  | "AI marketplace search"
  | "TM curated";

export type AssortmentRecommendationAction = "keep" | "ai_add" | "ai_remove";

export interface AssortmentSkuRow {
  partnerSku: string;
  barcode: string;
  source?: AssortmentSource;
  brand: string;
  productTitle: string;
  productDescription: string;
  partnerItemCategory: string;
  partnerItemSubcategory: string;
  shipSpeed: string;
  retailPrice: string;
  primaryImageUrl: string;
  bu?: string;
  division?: string;
  department?: string;
  itemType?: string;
  protectedBrand?: boolean;
  barcodeStatus?: "Available" | "Invalid" | "Unavailable";
  wercsStatus?: string;
  wercsActionRequired?: string;
  marketplaceSource?: string;
  aiReason?: string;
  recommendationAction?: AssortmentRecommendationAction;
  removeReason?: string;
}

export interface BrandSummaryRow {
  brand: string;
  skus: number;
  protected: boolean;
  agp: number;
}

export interface ItemTypeAnalysisRow {
  itemType: string;
  totalSkus: number;
  coveragePercent: number;
  barcodeAvailable: number;
  barcodeInvalid: number;
  barcodeUnavailable: number;
}

export interface AssortmentAnalysisSummary {
  totalSkus: number;
  wercsFlagged: number;
  homeSkus: number;
  apparelSkus: number;
  uniqueBrands: number;
  protectedBrands: number;
  barcodesAvailable: number;
  barcodesInvalid: number;
  barcodesUnavailable: number;
}

export interface MarketplaceSearchResult {
  query: string;
  searchedAt: string;
  sources: string[];
  summary: string;
  addCount: number;
  removeCount: number;
}

export interface AiRemoveRecommendation {
  partnerSku: string;
  reason: string;
}

export interface AssortmentVersion {
  id: string;
  name: string;
  label: string;
  createdAt: string;
  createdBy: string;
  status: "draft" | "shared" | "seller_review" | "approved";
  sharedAt?: string;
  includedSkuIds: string[];
  aiAddedSkuIds: string[];
  removedSkuIds: string[];
  recommendedCount: number;
}

export interface AssortmentAnalysisSource {
  id: string;
  label: string;
  type: "seller_submission" | "tm_version";
  versionId?: string;
  analysis: AssortmentAnalysisSummary;
  brands: BrandSummaryRow[];
  itemTypes: ItemTypeAnalysisRow[];
  skuDrillDown: AssortmentSkuRow[];
}

export interface AssortmentCurationContent {
  sellerId: string;
  sellerName: string;
  submittedCount: number;
  submittedSkus: AssortmentSkuRow[];
  marketplaceSearch: MarketplaceSearchResult;
  aiRecommendations: {
    add: AssortmentSkuRow[];
    remove: AiRemoveRecommendation[];
  };
  versions: AssortmentVersion[];
  analysisSources: AssortmentAnalysisSource[];
}

type RawRecord = Omit<AssortmentCurationContent, never>;

const records = assortmentCurationJson as Record<string, RawRecord>;

export function getAssortmentCurationContent(sellerId: string): AssortmentCurationContent {
  return records[sellerId] ?? records._default;
}

export function getVersionSkus(
  content: AssortmentCurationContent,
  versionId: string,
): AssortmentSkuRow[] {
  const version = content.versions.find((v) => v.id === versionId);
  if (!version) return [];

  const skuMap = new Map<string, AssortmentSkuRow>();

  for (const sku of content.submittedSkus) {
    const isRemoved = version.removedSkuIds.includes(sku.partnerSku);
    skuMap.set(sku.partnerSku, {
      ...sku,
      source: "Seller provided",
      recommendationAction: isRemoved ? "ai_remove" : "keep",
      removeReason: content.aiRecommendations.remove.find((r) => r.partnerSku === sku.partnerSku)
        ?.reason,
    });
  }

  for (const sku of content.aiRecommendations.add) {
    skuMap.set(sku.partnerSku, {
      ...sku,
      source: "AI marketplace search",
      recommendationAction: "ai_add",
    });
  }

  const included = version.includedSkuIds
    .map((id) => skuMap.get(id))
    .filter((sku): sku is AssortmentSkuRow => Boolean(sku));

  const removedRows = version.removedSkuIds
    .map((id) => skuMap.get(id))
    .filter((sku): sku is AssortmentSkuRow => Boolean(sku));

  return [...included, ...removedRows];
}

export function getAnalysisForSource(
  content: AssortmentCurationContent,
  sourceId: string,
): AssortmentAnalysisSource {
  return (
    content.analysisSources.find((s) => s.id === sourceId) ?? content.analysisSources[0]
  );
}

export function buildVersionFromSellerBaseline(
  content: AssortmentCurationContent,
  versionNumber: number,
): AssortmentVersion {
  const keepIds = content.submittedSkus
    .map((s) => s.partnerSku)
    .filter((id) => !content.aiRecommendations.remove.some((r) => r.partnerSku === id));
  const aiAddIds = content.aiRecommendations.add.map((s) => s.partnerSku);

  return {
    id: `v${versionNumber}`,
    name: `Version ${versionNumber}`,
    label: `Version ${versionNumber}`,
    createdAt: new Date().toISOString(),
    createdBy: "Shaun Doe",
    status: "draft",
    includedSkuIds: [...keepIds, ...aiAddIds],
    aiAddedSkuIds: aiAddIds,
    removedSkuIds: content.aiRecommendations.remove.map((r) => r.partnerSku),
    recommendedCount: keepIds.length + aiAddIds.length + (content.submittedCount - content.submittedSkus.length),
  };
}
