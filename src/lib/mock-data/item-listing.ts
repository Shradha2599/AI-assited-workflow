import type { AssortmentSkuRow } from "@/lib/mock-data/assortment-curation-content";
import {
  getAssortmentCurationContent,
  getVersionSkus,
} from "@/lib/mock-data/assortment-curation-content";

export type ListingLatestStatus =
  | "DRAFT"
  | "AI_READY"
  | "NEEDS_REVIEW"
  | "UNLISTED"
  | "APPROVED"
  | "REJECTED"
  | "SUSPENDED";

export type ListingRelationship = "SA" | "VC" | "VAR";

export interface ListingItemRow {
  partnerSku: string;
  tcin: string | null;
  title: string;
  itemType: string;
  inventory: number;
  relationship: ListingRelationship;
  publishStatus: "Yes" | "No";
  latestStatus: ListingLatestStatus;
  lastUpdated: string;
  listPrice: string;
  imageUrl: string;
}

export interface ListingFieldRow {
  field: string;
  value: string;
  aiGenerated?: boolean;
}

export interface ListingItemDetail extends ListingItemRow {
  barcode: string;
  brand: string;
  productDescription: string;
  submittedPrice: string;
  submittedPriceAsOf: string;
  fields: ListingFieldRow[];
  listingErrors: string[];
  /** Required listing attributes not yet populated (AI can draft). */
  attributesMissing?: boolean;
  /** Shimmer while AI fills missing attributes. */
  generatingAttributes?: boolean;
}

const RELATIONSHIPS: ListingRelationship[] = ["SA", "VC", "VAR"];

function parsePrice(price: string): number {
  const n = parseFloat(price.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function formatListPrice(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

function hashSku(sku: string): number {
  let h = 0;
  for (let i = 0; i < sku.length; i++) h = (h * 31 + sku.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function buildBullets(sku: AssortmentSkuRow): string[] {
  const cat = sku.partnerItemSubcategory || sku.itemType || "product";
  return [
    `Designed for everyday ${cat.toLowerCase()} use with durable materials suited for Target guests.`,
    `${sku.brand} quality standards — easy to care for and shelf-ready packaging.`,
    `Pairs with complementary ${sku.partnerItemCategory} items in your approved assortment.`,
    `Ships in ${sku.shipSpeed} — inventory-ready for marketplace fulfilment.`,
    `Barcode ${sku.barcodeStatus === "Available" ? "validated" : "pending validation"} for listing compliance.`,
  ];
}

function buildAiDescription(sku: AssortmentSkuRow): string {
  const base = sku.productDescription?.trim() || "";
  const enriched = `${base} This ${sku.itemType ?? "item"} is positioned for ${sku.partnerItemCategory} on Target.com with guest-focused merchandising, compliant product copy, and attributes aligned to Walmart and Amazon item-setup best practices (title clarity, bullet benefits, and logistics data).`;
  return enriched.replace(/\s+/g, " ").trim();
}

function cleanProductTitle(title: string): string {
  return title
    .replace(/\s*—\s*seller assortment\s*$/i, "")
    .replace(/^AI suggested\s+/i, "")
    .trim();
}

function shouldMarkAttributesMissing(index: number, sku: AssortmentSkuRow): boolean {
  if (sku.recommendationAction === "ai_add") return index % 4 === 0;
  return index % 9 === 1 || index % 9 === 5;
}

export function generateListingDetailFromSku(
  sku: AssortmentSkuRow,
  index: number,
): ListingItemDetail {
  const seed = hashSku(sku.partnerSku);
  const attributesMissing = shouldMarkAttributesMissing(index, sku);
  const retail = parsePrice(sku.retailPrice);
  const listAmount = retail > 0 ? retail : 12.99 + (seed % 40);
  const listPrice = formatListPrice(listAmount);
  const submitted = formatListPrice(Math.max(listAmount - 0.5, listAmount * 0.92));
  const inventory = 15 + (seed % 85);
  const relationship = RELATIONSHIPS[seed % RELATIONSHIPS.length];
  const latestStatus: ListingLatestStatus = attributesMissing
    ? "NEEDS_REVIEW"
    : index < 3
      ? "NEEDS_REVIEW"
      : "AI_READY";
  const bullets = buildBullets(sku);

  const depth = 4 + (seed % 6);
  const height = 3 + (seed % 8);
  const length = 6 + (seed % 10);
  const weight = 0.5 + (seed % 15) / 10;

  const fields: ListingFieldRow[] = [
    { field: "GTIN-14", value: sku.barcode, aiGenerated: false },
    { field: "Item Type", value: sku.itemType ?? sku.partnerItemSubcategory, aiGenerated: true },
    { field: "IDC Code", value: `IDC-${800000 + (seed % 99999)}`, aiGenerated: true },
    { field: "Brand", value: sku.brand, aiGenerated: false },
    { field: "Product Title", value: cleanProductTitle(sku.productTitle), aiGenerated: true },
    { field: "Product Description", value: buildAiDescription(sku), aiGenerated: true },
    ...bullets.map((text, i) => ({
      field: `Bullet Feature ${i + 1}`,
      value: text,
      aiGenerated: true,
    })),
    { field: "main_image_url", value: sku.primaryImageUrl || "—", aiGenerated: false },
    { field: "Import Designation", value: "Made in USA", aiGenerated: true },
    { field: "Prop 65", value: "No", aiGenerated: true },
    { field: "Shipping Exclusion", value: "None", aiGenerated: true },
    { field: "Fulfillment Two Day Shipping Eligible", value: sku.shipSpeed.includes("1") ? "Yes" : "No", aiGenerated: true },
    { field: "package_dimension_measurements_depth", value: `${depth} in`, aiGenerated: true },
    { field: "package_dimension_measurements_height", value: `${height} in`, aiGenerated: true },
    { field: "package_dimension_measurements_length", value: `${length} in`, aiGenerated: true },
    { field: "package_dimension_measurements_weight", value: `${weight.toFixed(1)} lb`, aiGenerated: true },
    { field: "Color Family", value: "Multicolor", aiGenerated: true },
    { field: "Package Quantity", value: "1", aiGenerated: true },
  ];

  const listingErrors =
    latestStatus === "NEEDS_REVIEW"
      ? ["Product description requires TM review before publish.", "Verify package weight against WERCS registration."]
      : [];

  return {
    partnerSku: sku.partnerSku,
    tcin: null,
    title: cleanProductTitle(sku.productTitle),
    itemType: attributesMissing ? "—" : (sku.itemType ?? sku.partnerItemSubcategory),
    inventory: attributesMissing ? 0 : inventory,
    relationship,
    publishStatus: "No",
    latestStatus,
    lastUpdated: attributesMissing ? "Attributes pending" : "Pending setup",
    listPrice: attributesMissing ? "—" : listPrice,
    imageUrl: sku.primaryImageUrl,
    barcode: sku.barcode,
    brand: sku.brand,
    productDescription: attributesMissing ? "" : buildAiDescription(sku),
    submittedPrice: attributesMissing ? "—" : submitted,
    submittedPriceAsOf: attributesMissing ? "—" : "As of today, AI draft",
    fields: attributesMissing ? [] : fields,
    listingErrors: attributesMissing
      ? ["Missing required listing attributes — generate an AI draft to continue."]
      : listingErrors,
    attributesMissing,
    generatingAttributes: false,
  };
}

export function getListingItemsForPartner(partnerId: string, limit = 23): ListingItemDetail[] {
  const content = getAssortmentCurationContent(partnerId);
  const version = content.versions[0];
  const skus = version ? getVersionSkus(content, version.id) : content.submittedSkus;
  return skus.slice(0, limit).map((sku, index) => generateListingDetailFromSku(sku, index));
}

export function getListingItemForPartner(partnerId: string, partnerSku: string): ListingItemDetail | null {
  const items = getListingItemsForPartner(partnerId, 200);
  return items.find((item) => item.partnerSku === partnerSku) ?? null;
}

export function isAssortmentApprovedForListing(partnerId: string, approvedIds: string[]): boolean {
  return approvedIds.includes(`assortment-${partnerId}`);
}
