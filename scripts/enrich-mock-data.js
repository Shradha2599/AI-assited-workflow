#!/usr/bin/env node
/**
 * enrich-mock-data.js
 *
 * Runs daily (via Cursor Automation or manually) to keep demo data feeling live.
 * Updates:
 *   - mock/business/assortment_gap_analysis.json  (revenues, missing products)
 *   - mock/business/treemap_hierarchy.json         (gap%, revenue per category)
 *   - mock/sources/google_trends.json              (trend directions, growth rates)
 *   - mock/sources/amazon_sales.json               (90-day revenue, growth)
 *   - mock/sources/competitor_catalog.json         (assortment depth, pricing)
 *   - mock/sources/social_signals.json             (engagement, viral items)
 *   - mock/business/leads.json                     (confidence scores, status drift)
 *   - mock/target/categories.json                  (gap scores, growth rates)
 *
 * Run:  node scripts/enrich-mock-data.js
 */

const fs   = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Seeded pseudo-random based on today's date so results are stable within a day */
function daySeeded(salt = 0) {
  const d   = new Date();
  const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate() + salt;
  // xorshift32
  let s = seed >>> 0;
  s ^= s << 13; s ^= s >> 17; s ^= s << 5;
  return Math.abs(s) / 0xffffffff;
}

/** Drift a number by ±maxPct% relative to its current value, seeded by salt */
function drift(value, maxPct, salt) {
  const r     = daySeeded(salt) * 2 - 1;        // -1 … +1
  const delta = value * (maxPct / 100) * r;
  return value + delta;
}

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function round2(v)         { return Math.round(v * 100) / 100; }
function roundInt(v)       { return Math.round(v); }

function readJson(rel)  { return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8")); }
function writeJson(rel, data) {
  fs.writeFileSync(path.join(ROOT, rel), JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log(`  ✓ updated ${rel}`);
}

function today() {
  return new Date().toISOString();
}

// ── 1. treemap_hierarchy.json ─────────────────────────────────────────────────

function enrichTreemap() {
  const tree = readJson("mock/business/treemap_hierarchy.json");

  tree.children = tree.children.map((node, i) => {
    const revM  = parseFloat((node.revenue || "$0M").replace(/[^0-9.]/g, "")) || 5;
    const newRev = clamp(drift(revM, 4, i * 7), 0.5, 100);

    const gapN  = parseFloat((node.gapPercent || "20%").replace(/[^0-9.]/g, "")) || 20;
    const newGap = clamp(drift(gapN, 3, i * 13), 5, 55);

    return {
      ...node,
      revenue:    `$${newRev.toFixed(1)}M`,
      gapPercent: `${roundInt(newGap)}%`,
    };
  });

  writeJson("mock/business/treemap_hierarchy.json", tree);
}

// ── 2. assortment_gap_analysis.json ──────────────────────────────────────────

const TREND_DIRS   = ["Rising", "Steady", "Peaking", "Declining"];
const COMPETITORS  = ["Amazon", "Walmart", "Home Depot", "Lowe's", "Wayfair"];
const GAP_OPPS     = ["High", "High", "High", "Medium", "Medium"];  // weighted toward High

function enrichGapAnalysis() {
  const gap = readJson("mock/business/assortment_gap_analysis.json");

  // Bump lastUpdatedAt to now
  gap.lastUpdatedAt = today();

  // Drift opportunityScore and estimatedRevenue on each missing product
  gap.missingProducts = gap.missingProducts.map((p, i) => {
    const revRaw  = parseFloat(p.estimatedRevenue.replace(/[^0-9.]/g, "")) || 1;
    const newRev  = clamp(drift(revRaw, 8, i * 11 + 1), 0.1, 10);
    const unit    = p.estimatedRevenue.toUpperCase().includes("K") ? "K" : "M";
    const newOpp  = round2(clamp(drift(p.opportunityScore || 0.7, 10, i * 3 + 2), 0.3, 1.0));
    const gapOpp  = GAP_OPPS[roundInt(newOpp * (GAP_OPPS.length - 1))];

    return {
      ...p,
      estimatedRevenue: `$${newRev.toFixed(unit === "K" ? 0 : 1)}${unit}`,
      opportunityScore:  newOpp,
      gapOpportunity:    gapOpp,
      topCompetitor:     COMPETITORS[Math.abs(Math.floor(daySeeded(i * 5) * COMPETITORS.length)) % COMPETITORS.length],
    };
  });

  writeJson("mock/business/assortment_gap_analysis.json", gap);
}

// ── 3. google_trends.json ────────────────────────────────────────────────────

const TREND_ITEMS = [
  { query: "Ceramic Table Lamp",          category: "Lighting",               seasonality: "Q1" },
  { query: "Glass Beverage Dispenser",    category: "Kitchen & Dining",        seasonality: "Q2" },
  { query: "Storage Basket Set",          category: "Storage & Organization",  seasonality: "Q1" },
  { query: "Outdoor String Lights",       category: "Outdoor Living",          seasonality: "Q3" },
  { query: "Halloween Lanterns",          category: "Holiday & Festive Decor", seasonality: "Q4" },
  { query: "Ceramic Serving Bowl",        category: "Kitchen & Dining",        seasonality: "Q2" },
  { query: "Crystal Wine Glasses",        category: "Kitchen & Dining",        seasonality: "Q2" },
  { query: "Modern Pendant Light",        category: "Lighting",                seasonality: "Q2" },
  { query: "Accent Area Rug",             category: "Rugs",                    seasonality: "Q1" },
  { query: "Outdoor Dining Set",          category: "Outdoor Living",          seasonality: "Q3" },
  { query: "Floating Wall Shelf",         category: "Storage & Organization",  seasonality: "Q1" },
  { query: "Holiday Garland Lights",      category: "Holiday & Festive Decor", seasonality: "Q4" },
  { query: "Velvet Accent Chair",         category: "Furniture",               seasonality: "Q1" },
  { query: "Modular Bookshelf",           category: "Furniture",               seasonality: "Q1" },
  { query: "Party Tableware Set",         category: "Party Supplies",          seasonality: "Q4" },
  { query: "Smart LED Strip Lights",      category: "Lighting",                seasonality: "Q2" },
  { query: "Bamboo Cutting Board",        category: "Kitchen & Dining",        seasonality: "Q2" },
  { query: "Spice Rack Organizer",        category: "Storage & Organization",  seasonality: "Q1" },
  { query: "Plush Throw Pillows",         category: "Home Decor",              seasonality: "Q4" },
  { query: "Canvas Wall Art Set",         category: "Home Decor",              seasonality: "Q1" },
];

function enrichGoogleTrends() {
  const trends = TREND_ITEMS.map((item, i) => {
    const growth      = round2(clamp(drift(0.18, 35, i * 7), -0.15, 0.85));
    const dirIdx      = Math.abs(Math.floor(daySeeded(i * 11) * TREND_DIRS.length)) % TREND_DIRS.length;
    return {
      query:          item.query,
      category:       item.category,
      trendDirection: TREND_DIRS[dirIdx],
      trendGrowth:    growth,
      seasonality:    item.seasonality,
    };
  });

  writeJson("mock/sources/google_trends.json", trends);
}

// ── 4. amazon_sales.json ─────────────────────────────────────────────────────

const SALES_ITEMS = [
  { itemType: "Ceramic Table Lamp",       category: "Lighting",               baseRev: 1_800_000 },
  { itemType: "Glass Beverage Dispenser", category: "Kitchen & Dining",        baseRev: 1_200_000 },
  { itemType: "Storage Basket Set",       category: "Storage & Organization",  baseRev: 980_000 },
  { itemType: "Outdoor String Lights",    category: "Outdoor Living",           baseRev: 1_600_000 },
  { itemType: "Halloween Lanterns",       category: "Holiday & Festive Decor", baseRev: 2_100_000 },
  { itemType: "Crystal Wine Glasses",     category: "Kitchen & Dining",        baseRev: 2_300_000 },
  { itemType: "Modern Pendant Light",     category: "Lighting",                baseRev: 1_900_000 },
  { itemType: "Accent Area Rug",          category: "Rugs",                    baseRev: 1_400_000 },
  { itemType: "Velvet Accent Chair",      category: "Furniture",               baseRev: 2_800_000 },
  { itemType: "Smart LED Strip Lights",   category: "Lighting",                baseRev: 1_100_000 },
  { itemType: "Spice Rack Organizer",     category: "Storage & Organization",  baseRev: 860_000 },
  { itemType: "Canvas Wall Art Set",      category: "Home Decor",              baseRev: 1_050_000 },
];

function enrichAmazonSales() {
  const sales = SALES_ITEMS.map((item, i) => {
    const rev90   = roundInt(drift(item.baseRev, 12, i * 9));
    const avgPrice = round2(clamp(drift(55, 20, i * 3 + 100), 15, 250));
    const units    = roundInt(rev90 / avgPrice);
    const growth   = round2(clamp(drift(0.12, 40, i * 5 + 200), -0.2, 0.9));
    return {
      itemType:         item.itemType,
      category:         item.category,
      revenueLast90Days: rev90,
      unitsLast90Days:  units,
      growthRate:       growth,
    };
  });

  writeJson("mock/sources/amazon_sales.json", sales);
}

// ── 5. competitor_catalog.json ────────────────────────────────────────────────

const COMPETITOR_ITEMS = [
  { retailer: "Amazon",    category: "Lighting",               itemType: "Ceramic Table Lamp",       baseDepth: 380 },
  { retailer: "Walmart",   category: "Kitchen & Dining",        itemType: "Glass Beverage Dispenser", baseDepth: 210 },
  { retailer: "Amazon",    category: "Outdoor Living",           itemType: "Outdoor String Lights",    baseDepth: 450 },
  { retailer: "Home Depot",category: "Outdoor Living",           itemType: "Patio Dining Set",          baseDepth: 185 },
  { retailer: "Amazon",    category: "Holiday & Festive Decor", itemType: "Halloween Lanterns",       baseDepth: 320 },
  { retailer: "Wayfair",   category: "Furniture",               itemType: "Velvet Accent Chair",      baseDepth: 280 },
  { retailer: "Amazon",    category: "Rugs",                    itemType: "Accent Area Rug",          baseDepth: 510 },
  { retailer: "Walmart",   category: "Storage & Organization",  itemType: "Storage Basket Set",       baseDepth: 160 },
  { retailer: "Amazon",    category: "Lighting",               itemType: "Smart LED Strip Lights",   baseDepth: 620 },
  { retailer: "Wayfair",   category: "Home Decor",              itemType: "Canvas Wall Art Set",      baseDepth: 290 },
  { retailer: "Amazon",    category: "Kitchen & Dining",        itemType: "Crystal Wine Glasses",     baseDepth: 410 },
  { retailer: "Home Depot",category: "Storage & Organization",  itemType: "Spice Rack Organizer",     baseDepth: 130 },
];

function enrichCompetitorCatalog() {
  const catalog = COMPETITOR_ITEMS.map((item, i) => {
    const depth    = clamp(roundInt(drift(item.baseDepth, 8, i * 7 + 300)), 10, 2000);
    const avgPrice = round2(clamp(drift(65, 25, i * 3 + 400), 10, 400));
    return {
      retailer:        item.retailer,
      category:        item.category,
      itemType:        item.itemType,
      assortmentDepth: depth,
      avgPrice:        avgPrice,
    };
  });

  writeJson("mock/sources/competitor_catalog.json", catalog);
}

// ── 6. social_signals.json ────────────────────────────────────────────────────

const SOCIAL_ITEMS = [
  { itemType: "Ceramic Table Lamp",     platform: "Instagram", baseEngagement: 48000 },
  { itemType: "Outdoor String Lights",  platform: "TikTok",    baseEngagement: 125000 },
  { itemType: "Halloween Lanterns",     platform: "TikTok",    baseEngagement: 210000 },
  { itemType: "Crystal Wine Glasses",   platform: "Instagram", baseEngagement: 67000 },
  { itemType: "Velvet Accent Chair",    platform: "Pinterest", baseEngagement: 88000 },
  { itemType: "Smart LED Strip Lights", platform: "TikTok",    baseEngagement: 310000 },
  { itemType: "Canvas Wall Art Set",    platform: "Pinterest", baseEngagement: 54000 },
  { itemType: "Storage Basket Set",     platform: "Instagram", baseEngagement: 39000 },
  { itemType: "Modern Pendant Light",   platform: "Instagram", baseEngagement: 71000 },
  { itemType: "Accent Area Rug",        platform: "Pinterest", baseEngagement: 62000 },
];

function enrichSocialSignals() {
  const signals = SOCIAL_ITEMS.map((item, i) => {
    const engagement = roundInt(clamp(drift(item.baseEngagement, 15, i * 11 + 500), 1000, 2_000_000));
    const viral      = engagement > 100_000;
    return {
      itemType:        item.itemType,
      platform:        item.platform,
      engagementCount: engagement,
      isViral:         viral,
      capturedAt:      today(),
    };
  });

  writeJson("mock/sources/social_signals.json", signals);
}

// ── 7. target/categories.json ────────────────────────────────────────────────

function enrichCategories() {
  const cats = readJson("mock/target/categories.json");

  const updated = cats.map((cat, i) => {
    const newRev    = roundInt(drift(cat.annualRevenue, 3, i * 17 + 600));
    const newGrowth = round2(clamp(drift(cat.growthRate, 8, i * 7 + 700), -0.05, 0.5));
    const newGap    = round2(clamp(drift(cat.assortmentGapScore, 4, i * 5 + 800), 0.3, 0.99));

    return {
      ...cat,
      annualRevenue:      newRev,
      growthRate:         newGrowth,
      assortmentGapScore: newGap,
    };
  });

  writeJson("mock/target/categories.json", updated);
}

// ── 8. leads.json — drift confidence scores + status transitions ──────────────

const STATUS_FLOW = {
  New:       ["New", "New", "In Review"],
  "In Review": ["In Review", "In Review", "Approved", "Rejected"],
  Approved:  ["Approved"],
  Rejected:  ["Rejected"],
  Pending:   ["Pending", "New"],
};

function enrichLeads() {
  const leads = readJson("mock/business/leads.json");

  const updated = leads.map((lead, i) => {
    const newConf    = round2(clamp(drift(lead.confidenceScore, 5, i * 13 + 900), 3.0, 10.0));
    const newMatch   = round2(clamp(drift(lead.assortmentMatchScore, 6, i * 7 + 1000), 0.3, 1.0));
    const statuses   = STATUS_FLOW[lead.reviewOutcome] || ["Pending"];
    const newStatus  = statuses[Math.abs(Math.floor(daySeeded(i * 3 + 1100) * statuses.length)) % statuses.length];

    return {
      ...lead,
      confidenceScore:      newConf,
      assortmentMatchScore: newMatch,
      reviewOutcome:        newStatus,
    };
  });

  writeJson("mock/business/leads.json", updated);
}

// ── 9. smart_scout.json ─────────────────────────────────────────────────────

const SCOUT_CATEGORIES = [
  "Lighting", "Furniture", "Kitchen & Dining", "Outdoor Living",
  "Holiday & Festive Decor", "Storage & Organization", "Rugs", "Party Supplies",
];

function enrichSmartScout() {
  let scout;
  try { scout = readJson("mock/sources/smart_scout.json"); }
  catch { scout = []; }

  if (!Array.isArray(scout) || scout.length === 0) {
    // Bootstrap if empty
    scout = SCOUT_CATEGORIES.map((cat, i) => ({
      category: cat,
      sellerCount: 200 + i * 30,
      avgMonthlyRevenue: 45_000 + i * 8_000,
      topSeller: "Various",
      marketShareLeader: COMPETITORS[i % COMPETITORS.length],
    }));
  }

  const updated = scout.map((entry, i) => ({
    ...entry,
    sellerCount:         roundInt(clamp(drift(entry.sellerCount || 200, 5, i * 9 + 1200), 50, 5000)),
    avgMonthlyRevenue:   roundInt(clamp(drift(entry.avgMonthlyRevenue || 50000, 8, i * 7 + 1300), 10_000, 500_000)),
    marketShareLeader:   COMPETITORS[Math.abs(Math.floor(daySeeded(i * 3 + 1400) * COMPETITORS.length)) % COMPETITORS.length],
  }));

  writeJson("mock/sources/smart_scout.json", updated);
}

// ── 10. jungle_scout.json ─────────────────────────────────────────────────────

function enrichJungleScout() {
  let jungle;
  try { jungle = readJson("mock/sources/jungle_scout.json"); }
  catch { jungle = []; }

  if (!Array.isArray(jungle) || jungle.length === 0) {
    jungle = SALES_ITEMS.slice(0, 8).map((item, i) => ({
      itemType: item.itemType,
      category: item.category,
      estimatedMonthlySales: roundInt(item.baseRev / 12),
      bsr: 1000 + i * 200,
      reviewCount: 500 + i * 150,
      avgRating: 4.2,
    }));
  }

  const updated = jungle.map((entry, i) => ({
    ...entry,
    estimatedMonthlySales: roundInt(clamp(drift(entry.estimatedMonthlySales || 50000, 10, i * 11 + 1500), 1000, 500_000)),
    bsr:                   roundInt(clamp(drift(entry.bsr || 1000, 15, i * 7 + 1600), 10, 50_000)),
    reviewCount:           roundInt(clamp(drift(entry.reviewCount || 500, 5, i * 3 + 1700), 10, 50_000)),
    avgRating:             round2(clamp(drift(entry.avgRating || 4.2, 4, i * 5 + 1800), 1.0, 5.0)),
  }));

  writeJson("mock/sources/jungle_scout.json", updated);
}

// ── Run all enrichments ───────────────────────────────────────────────────────

console.log(`\n🔄  Mock data enrichment — ${new Date().toDateString()}\n`);

try { enrichTreemap();          } catch (e) { console.error("  ✗ treemap:", e.message); }
try { enrichGapAnalysis();      } catch (e) { console.error("  ✗ gap analysis:", e.message); }
try { enrichGoogleTrends();     } catch (e) { console.error("  ✗ google trends:", e.message); }
try { enrichAmazonSales();      } catch (e) { console.error("  ✗ amazon sales:", e.message); }
try { enrichCompetitorCatalog();} catch (e) { console.error("  ✗ competitor catalog:", e.message); }
try { enrichSocialSignals();    } catch (e) { console.error("  ✗ social signals:", e.message); }
try { enrichCategories();       } catch (e) { console.error("  ✗ categories:", e.message); }
try { enrichLeads();            } catch (e) { console.error("  ✗ leads:", e.message); }
try { enrichSmartScout();       } catch (e) { console.error("  ✗ smart scout:", e.message); }
try { enrichJungleScout();      } catch (e) { console.error("  ✗ jungle scout:", e.message); }

console.log("\n✅  Done. All mock files updated.\n");
