/**
 * Generates mock/business/assortment_curation.json for TM assortment curation flows.
 * Run: node scripts/generate-assortment-curation.js
 */

const fs = require("fs");
const path = require("path");

const SUBMITTED_SKU_COUNT = 72;
const AI_ADD_COUNT = 22;

const CATEGORIES = [
  { category: "Kitchen & Dining", sub: "Mixing Bowls", itemType: "Mixing Bowl", division: "Kitchen", department: "Cookware" },
  { category: "Kitchen & Dining", sub: "Cutting Boards", itemType: "Cutting Board", division: "Kitchen", department: "Tools" },
  { category: "Kitchen & Dining", sub: "Bakeware", itemType: "Baking Sheet", division: "Kitchen", department: "Bakeware" },
  { category: "Home Decor", sub: "Table Linens", itemType: "Table Runner", division: "Decor", department: "Textiles" },
  { category: "Home Decor", sub: "Coasters", itemType: "Coaster", division: "Decor", department: "Accessories" },
  { category: "Storage & Organization", sub: "Food Storage", itemType: "Food Storage", division: "Kitchen", department: "Storage" },
];

const BARCODE_STATUSES = ["Available", "Available", "Available", "Invalid", "Unavailable"];
const MARKETPLACE_SOURCES = ["Amazon", "Google Shopping", "Walmart Marketplace", "Target.com", "Google Search"];

function pick(arr, index) {
  return arr[index % arr.length];
}

function buildSubmittedSkus(count) {
  const skus = [];
  for (let i = 0; i < count; i++) {
    const n = i + 1;
    const meta = pick(CATEGORIES, i);
    const barcodeStatus = pick(BARCODE_STATUSES, i);
    skus.push({
      partnerSku: `PG-${1000 + n}`,
      barcode: `0194251234${String(560 + n).padStart(3, "0")}`,
      brand: "Pinnacle Goods",
      productTitle: `${meta.itemType} ${n} — seller assortment`,
      productDescription: `Submitted SKU ${n} for onboarding demo.`,
      partnerItemCategory: meta.category,
      partnerItemSubcategory: meta.sub,
      shipSpeed: n % 3 === 0 ? "3 days" : "2 days",
      retailPrice: `$${(12 + (n % 40)).toFixed(2)}`,
      primaryImageUrl: `https://cdn.example.com/pinnacle/sku-${n}.jpg`,
      bu: "Home",
      division: meta.division,
      department: meta.department,
      itemType: meta.itemType,
      protectedBrand: n % 17 === 0,
      barcodeStatus,
      wercsStatus: barcodeStatus === "Unavailable" ? "Not submitted" : barcodeStatus === "Invalid" ? "Pending review" : "Registered",
      wercsActionRequired: barcodeStatus === "Available" ? "—" : "Review required",
    });
  }
  return skus;
}

function buildAiAddSkus(count, submittedSkus) {
  const skus = [];
  for (let i = 0; i < count; i++) {
    const n = i + 1;
    const meta = pick(CATEGORIES, i + 3);
    skus.push({
      partnerSku: `AI-PG-${2000 + n}`,
      barcode: `0194259876${String(500 + n).padStart(3, "0")}`,
      brand: "Pinnacle Goods",
      productTitle: `AI suggested ${meta.itemType} ${n}`,
      productDescription: `Marketplace match — complements seller catalog.`,
      partnerItemCategory: meta.category,
      partnerItemSubcategory: meta.sub,
      shipSpeed: "2 days",
      retailPrice: `$${(18 + (n % 35)).toFixed(2)}`,
      primaryImageUrl: `https://cdn.example.com/pinnacle/ai-sku-${n}.jpg`,
      marketplaceSource: pick(MARKETPLACE_SOURCES, i),
      aiReason: `Gap vs. competitor listings; aligns with ${submittedSkus[0]?.partnerItemCategory ?? "Home"}.`,
      bu: "Home",
      division: meta.division,
      department: meta.department,
      itemType: meta.itemType,
      protectedBrand: false,
      barcodeStatus: "Available",
      wercsStatus: "Registered",
      wercsActionRequired: "—",
    });
  }
  return skus;
}

const SUBMITTED_SKUS = buildSubmittedSkus(SUBMITTED_SKU_COUNT);
const AI_ADD_SKUS = buildAiAddSkus(AI_ADD_COUNT, SUBMITTED_SKUS);

const AI_REMOVE_SKU_IDS = [SUBMITTED_SKUS[2].partnerSku, SUBMITTED_SKUS[5].partnerSku, SUBMITTED_SKUS[8].partnerSku];

const AI_REMOVE_REASONS = {
  [SUBMITTED_SKUS[2].partnerSku]: "Invalid barcode — duplicate UPC conflict with existing Target catalog item.",
  [SUBMITTED_SKUS[5].partnerSku]: "WERCS documentation missing; requires compliance review before launch.",
  [SUBMITTED_SKUS[8].partnerSku]: "Low margin + barcode issue; better alternatives from AI search.",
};

function buildAnalysis(totalSkus, homeSkus, apparelSkus, brands, itemTypes, skuDrillDown) {
  const barcodesAvailable = skuDrillDown.filter((s) => s.barcodeStatus === "Available").length;
  const barcodesInvalid = skuDrillDown.filter((s) => s.barcodeStatus === "Invalid").length;
  const barcodesUnavailable = skuDrillDown.filter((s) => s.barcodeStatus === "Unavailable").length;
  return {
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

function aggregateBrands(skuDrillDown, sellerName) {
  const map = new Map();
  for (const row of skuDrillDown) {
    const brand = row.brand;
    const cur = map.get(brand) ?? { skus: 0, protected: false, agp: 0 };
    map.set(brand, {
      skus: cur.skus + 1,
      protected: cur.protected || Boolean(row.protectedBrand),
      agp: cur.agp,
    });
  }
  if (map.size === 0) {
    return [{ brand: sellerName, skus: 0, protected: false, agp: 0 }];
  }
  return Array.from(map.entries()).map(([brand, data]) => ({ brand, ...data }));
}

function aggregateItemTypes(skuDrillDown) {
  const map = new Map();
  for (const row of skuDrillDown) {
    const t = row.itemType ?? "Other";
    const cur = map.get(t) ?? { total: 0, available: 0, invalid: 0, unavailable: 0 };
    cur.total += 1;
    if (row.barcodeStatus === "Available") cur.available += 1;
    else if (row.barcodeStatus === "Invalid") cur.invalid += 1;
    else cur.unavailable += 1;
    map.set(t, cur);
  }
  const total = skuDrillDown.length || 1;
  return Array.from(map.entries())
    .map(([itemType, stats]) => ({
      itemType,
      totalSkus: stats.total,
      coveragePercent: Math.round((stats.total / total) * 100),
      barcodeAvailable: stats.available,
      barcodeInvalid: stats.invalid,
      barcodeUnavailable: stats.unavailable,
    }))
    .sort((a, b) => b.totalSkus - a.totalSkus)
    .slice(0, 8);
}

function versionSkuIds(submitted, aiAdds, removeIds, aiAddSlice) {
  const keep = submitted.filter((s) => !removeIds.includes(s.partnerSku)).map((s) => s.partnerSku);
  const adds = aiAdds.slice(0, aiAddSlice).map((s) => s.partnerSku);
  return {
    included: [...keep, ...adds],
    aiAdded: adds,
    removed: removeIds.filter((id) => submitted.some((s) => s.partnerSku === id)),
  };
}

function buildPartnerRecord(sellerId, sellerName) {
  const submittedCount = SUBMITTED_SKUS.length;
  const v1Meta = versionSkuIds(SUBMITTED_SKUS, AI_ADD_SKUS, AI_REMOVE_SKU_IDS, 14);
  const v2Meta = versionSkuIds(
    SUBMITTED_SKUS,
    AI_ADD_SKUS,
    [SUBMITTED_SKUS[5].partnerSku, SUBMITTED_SKUS[8].partnerSku],
    AI_ADD_SKUS.length,
  );

  const v1Skus = [
    ...SUBMITTED_SKUS.filter((s) => v1Meta.included.includes(s.partnerSku) || v1Meta.removed.includes(s.partnerSku)),
    ...AI_ADD_SKUS.filter((s) => v1Meta.included.includes(s.partnerSku)),
  ];
  const v2Skus = [
    ...SUBMITTED_SKUS.filter((s) => v2Meta.included.includes(s.partnerSku) || v2Meta.removed.includes(s.partnerSku)),
    ...AI_ADD_SKUS.filter((s) => v2Meta.included.includes(s.partnerSku)),
  ];

  const sellerDrillDown = SUBMITTED_SKUS;

  return {
    sellerId,
    sellerName,
    submittedCount,
    submittedSkus: SUBMITTED_SKUS,
    marketplaceSearch: {
      query: `"${sellerName}" site:target.com OR site:amazon.com kitchen dining home decor`,
      searchedAt: "2026-07-08T14:32:00Z",
      sources: ["Google Search", "Google Shopping", "Amazon", "Walmart Marketplace", "Target.com"],
      summary: `Found ${AI_ADD_SKUS.length} additional SKUs across marketplaces and flagged ${AI_REMOVE_SKU_IDS.length} submitted items for removal based on barcode, WERCS, and category fit.`,
      addCount: AI_ADD_SKUS.length,
      removeCount: AI_REMOVE_SKU_IDS.length,
    },
    aiRecommendations: {
      add: AI_ADD_SKUS,
      remove: AI_REMOVE_SKU_IDS.map((id) => ({
        partnerSku: id,
        reason: AI_REMOVE_REASONS[id],
      })),
    },
    versions: [
      {
        id: "v1",
        name: "Version 1",
        label: "Version 1 — conservative add",
        createdAt: "2026-07-09T10:00:00Z",
        createdBy: "Shaun Doe",
        status: "draft",
        includedSkuIds: v1Meta.included,
        aiAddedSkuIds: v1Meta.aiAdded,
        removedSkuIds: v1Meta.removed,
        recommendedCount: v1Meta.included.length + v1Meta.removed.length,
      },
      {
        id: "v2",
        name: "Version 2",
        label: "Version 2 — expanded assortment",
        createdAt: "2026-07-11T11:30:00Z",
        createdBy: "Shaun Doe",
        status: "draft",
        includedSkuIds: v2Meta.included,
        aiAddedSkuIds: v2Meta.aiAdded,
        removedSkuIds: v2Meta.removed,
        recommendedCount: v2Meta.included.length + v2Meta.removed.length,
      },
    ],
    analysisSources: [
      {
        id: "seller-excel",
        label: "Excel shared by seller",
        type: "seller_submission",
        ...buildAnalysis(
          submittedCount,
          Math.round(submittedCount * 0.85),
          Math.round(submittedCount * 0.15),
          aggregateBrands(sellerDrillDown, sellerName),
          aggregateItemTypes(sellerDrillDown),
          sellerDrillDown,
        ),
      },
      {
        id: "version-v1",
        label: "Version 1 — conservative add",
        type: "tm_version",
        versionId: "v1",
        ...buildAnalysis(
          v1Meta.included.length + v1Meta.removed.length,
          Math.round((v1Meta.included.length + v1Meta.removed.length) * 0.85),
          Math.round((v1Meta.included.length + v1Meta.removed.length) * 0.15),
          aggregateBrands(v1Skus, sellerName),
          aggregateItemTypes(v1Skus),
          v1Skus,
        ),
      },
      {
        id: "version-v2",
        label: "Version 2 — expanded assortment",
        type: "tm_version",
        versionId: "v2",
        ...buildAnalysis(
          v2Meta.included.length + v2Meta.removed.length,
          Math.round((v2Meta.included.length + v2Meta.removed.length) * 0.85),
          Math.round((v2Meta.included.length + v2Meta.removed.length) * 0.15),
          aggregateBrands(v2Skus, sellerName),
          aggregateItemTypes(v2Skus),
          v2Skus,
        ),
      },
    ],
  };
}

const data = {
  _default: buildPartnerRecord("default", "Partner"),
  "p-k-o2": buildPartnerRecord("p-k-o2", "Pinnacle Goods"),
  "p-l-c2": buildPartnerRecord("p-l-c2", "FluxLight Co."),
  "p-f-c1": buildPartnerRecord("p-f-c1", "MapleCraft Co."),
  "p-k-c2": buildPartnerRecord("p-k-c2", "TableCraft Brands"),
};

const outPath = path.join(__dirname, "..", "mock", "business", "assortment_curation.json");
fs.writeFileSync(outPath, JSON.stringify(data, null, 2));
console.log(
  `Wrote ${outPath} — ${SUBMITTED_SKU_COUNT} submitted SKUs, ${AI_ADD_COUNT} AI suggestions per partner`,
);
