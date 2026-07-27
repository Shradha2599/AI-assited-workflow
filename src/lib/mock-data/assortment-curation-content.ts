import assortmentCurationJson from "../../../mock/business/assortment_curation.json";
import { ASSORTMENT_ANALYSIS_DEMO } from "./assortment-analysis-demo";

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
  excludedSkuIds?: string[];
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
  const raw = records[sellerId] ?? records._default;
  return {
    ...raw,
    analysisSources: raw.analysisSources.map((source) =>
      source.id === "seller-excel" ? { ...ASSORTMENT_ANALYSIS_DEMO, id: source.id, label: source.label } : source,
    ),
  };
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

  const excluded = new Set(version.excludedSkuIds ?? []);
  const versionSkuIds = [...new Set([...version.includedSkuIds, ...version.removedSkuIds])].filter(
    (id) => !excluded.has(id),
  );

  const recommendationOrder: Record<AssortmentRecommendationAction, number> = {
    ai_add: 0,
    ai_remove: 1,
    keep: 2,
  };

  return versionSkuIds
    .map((id) => skuMap.get(id))
    .filter((sku): sku is AssortmentSkuRow => Boolean(sku))
    .sort((a, b) => {
      const aOrder = recommendationOrder[a.recommendationAction ?? "keep"];
      const bOrder = recommendationOrder[b.recommendationAction ?? "keep"];
      return aOrder - bOrder || a.partnerSku.localeCompare(b.partnerSku);
    });
}

export function getAnalysisForSource(
  content: AssortmentCurationContent,
  sourceId: string,
): AssortmentAnalysisSource {
  const direct = content.analysisSources.find((s) => s.id === sourceId);
  if (direct) return direct;

  const versionMatch = sourceId.match(/^version-(.+)$/);
  if (versionMatch) {
    const versionSource = content.analysisSources.find(
      (s) => s.type === "tm_version" && s.versionId === versionMatch[1],
    );
    if (versionSource) return versionSource;
  }

  return content.analysisSources[0];
}

export interface AnalysisSourceOption {
  id: string;
  label: string;
}

export function getAnalysisSourceOptions(
  content: AssortmentCurationContent,
): AnalysisSourceOption[] {
  const options: AnalysisSourceOption[] = [];
  const leadFormSource = content.analysisSources.find((s) => s.type === "seller_submission");

  if (leadFormSource) {
    options.push({ id: leadFormSource.id, label: "Lead form" });
  }

  for (const version of content.versions) {
    const versionSource = content.analysisSources.find(
      (s) => s.type === "tm_version" && s.versionId === version.id,
    );
    options.push({
      id: versionSource?.id ?? `version-${version.id}`,
      label: version.name,
    });
  }

  return options;
}

export function buildLiveAnalysisSourceForVersion(
  content: AssortmentCurationContent,
  versionId: string,
): AssortmentAnalysisSource {
  const version = content.versions.find((v) => v.id === versionId);
  const skuDrillDown = getVersionSkus(content, versionId);
  const template =
    content.analysisSources.find((s) => s.type === "tm_version") ??
    content.analysisSources.find((s) => s.type === "seller_submission") ??
    content.analysisSources[0];

  const totalSkus = skuDrillDown.length;
  const homeSkus = skuDrillDown.filter((s) => s.bu === "Home" || !s.bu).length;
  const apparelSkus = Math.max(0, totalSkus - homeSkus);

  const brandMap = new Map<string, { skus: number; protected: boolean; agp: number }>();
  for (const row of skuDrillDown) {
    const brand = row.brand || "Unknown";
    const existing = brandMap.get(brand) ?? {
      skus: 0,
      protected: false,
      agp: 0,
    };
    brandMap.set(brand, {
      skus: existing.skus + 1,
      protected: existing.protected || Boolean(row.protectedBrand),
      agp: existing.agp,
    });
  }
  const brands: BrandSummaryRow[] = Array.from(brandMap.entries())
    .map(([brand, data]) => ({ brand, ...data }))
    .sort((a, b) => b.skus - a.skus);

  const itemTypeMap = new Map<
    string,
    { total: number; available: number; invalid: number; unavailable: number }
  >();
  for (const row of skuDrillDown) {
    const itemType = row.itemType ?? "Other";
    const cur = itemTypeMap.get(itemType) ?? {
      total: 0,
      available: 0,
      invalid: 0,
      unavailable: 0,
    };
    cur.total += 1;
    if (row.barcodeStatus === "Available") cur.available += 1;
    else if (row.barcodeStatus === "Invalid") cur.invalid += 1;
    else cur.unavailable += 1;
    itemTypeMap.set(itemType, cur);
  }
  const itemTypes: ItemTypeAnalysisRow[] = Array.from(itemTypeMap.entries())
    .map(([itemType, stats]) => ({
      itemType,
      totalSkus: stats.total,
      coveragePercent: totalSkus > 0 ? Math.round((stats.total / totalSkus) * 100) : 0,
      barcodeAvailable: stats.available,
      barcodeInvalid: stats.invalid,
      barcodeUnavailable: stats.unavailable,
    }))
    .sort((a, b) => b.totalSkus - a.totalSkus);

  const barcodesAvailable = skuDrillDown.filter((s) => s.barcodeStatus === "Available").length;
  const barcodesInvalid = skuDrillDown.filter((s) => s.barcodeStatus === "Invalid").length;
  const barcodesUnavailable = skuDrillDown.filter((s) => s.barcodeStatus === "Unavailable").length;

  return {
    ...template,
    id: `version-${versionId}`,
    label: version?.name ?? versionId,
    type: "tm_version",
    versionId,
    analysis: {
      totalSkus,
      wercsFlagged: skuDrillDown.filter((s) => s.wercsStatus !== "Registered").length,
      homeSkus,
      apparelSkus,
      uniqueBrands: brands.length,
      protectedBrands: brands.filter((b) => b.protected).length,
      barcodesAvailable,
      barcodesInvalid,
      barcodesUnavailable,
    },
    brands,
    itemTypes,
    skuDrillDown,
  };
}

export function buildAnalysisSourceForVersion(
  content: AssortmentCurationContent,
  version: AssortmentVersion,
): AssortmentAnalysisSource {
  const template =
    content.analysisSources.find((s) => s.type === "tm_version") ??
    content.analysisSources.find((s) => s.type === "seller_submission") ??
    content.analysisSources[0];

  const excluded = new Set(version.excludedSkuIds ?? []);
  const skuCount = [...new Set([...version.includedSkuIds, ...version.removedSkuIds])].filter(
    (id) => !excluded.has(id),
  ).length;

  return {
    ...template,
    id: `version-${version.id}`,
    label: version.label,
    type: "tm_version",
    versionId: version.id,
    analysis: {
      ...template.analysis,
      totalSkus: skuCount,
    },
  };
}

export function buildVersionFromSellerBaseline(
  content: AssortmentCurationContent,
  versionNumber: number,
  name?: string,
): AssortmentVersion {
  const keepIds = content.submittedSkus
    .map((s) => s.partnerSku)
    .filter((id) => !content.aiRecommendations.remove.some((r) => r.partnerSku === id));
  const aiAddIds = content.aiRecommendations.add.map((s) => s.partnerSku);
  const versionName = name?.trim() || `Version ${versionNumber}`;

  return {
    id: `v${versionNumber}`,
    name: versionName,
    label: versionName,
    createdAt: new Date().toISOString(),
    createdBy: "Shaun Doe",
    status: "draft",
    includedSkuIds: [...keepIds, ...aiAddIds],
    aiAddedSkuIds: aiAddIds,
    removedSkuIds: content.aiRecommendations.remove.map((r) => r.partnerSku),
    recommendedCount: keepIds.length + aiAddIds.length + content.aiRecommendations.remove.length,
  };
}
