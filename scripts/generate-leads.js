#!/usr/bin/env node
/**
 * Generate a large lead pool with realistic company names for Lead Discovery.
 * Run: node scripts/generate-leads.js
 *
 * Output: mock/business/leads.json (1219 records; 15 hero sellers live in sellers-heroes.ts → 1234 total)
 */

const fs = require("fs");
const path = require("path");

const COUNT = 1219;

const CATEGORIES = [
  "Lighting",
  "Holiday & Festive Decor",
  "Kitchen & Dining",
  "Storage & Organization",
  "Outdoor Living & Garden",
  "Party Supplies",
  "Furniture",
  "Home Decor",
];

const BUSINESS_TYPES = ["Manufacturer", "Brand", "Distributor", "Wholesaler"];

const CITIES = [
  "Austin, TX",
  "Seattle, WA",
  "Chicago, IL",
  "Boston, MA",
  "San Francisco, CA",
  "Denver, CO",
  "Miami, FL",
  "Portland, OR",
  "Nashville, TN",
  "Phoenix, AZ",
  "Atlanta, GA",
  "Los Angeles, CA",
  "New York, NY",
  "Salt Lake City, UT",
  "Charlotte, NC",
  "Minneapolis, MN",
  "Dallas, TX",
  "Detroit, MI",
  "Philadelphia, PA",
  "San Diego, CA",
];

const ASSIGNEES = ["Maya Johnson", "Jordan Lee", "Alex Rivera", "Sam Chen", "Taylor Brooks"];

/** Realistic brand stems — no generic "X Home Co." patterns */
const STEMS = [
  "Northpoint",
  "Greenyard",
  "Pinnacle",
  "Elevate",
  "Harbour",
  "Luminate",
  "Horizon",
  "Wonder",
  "BrightLight",
  "LuxArc",
  "Illumina",
  "Luminary",
  "Solara",
  "Verdant",
  "Amberline",
  "Copperfield",
  "Driftwood",
  "Evergreen",
  "Firefly",
  "Granite",
  "Hearthstone",
  "Ironwood",
  "Juniper",
  "Kestrel",
  "Lantern",
  "Meridian",
  "Nova",
  "Oakridge",
  "Prairie",
  "Quartz",
  "Riverstone",
  "Summit",
  "Timberline",
  "Uplift",
  "Vantage",
  "Willowbrook",
  "Zenith",
  "Arcadia",
  "Boreal",
  "Cascade",
  "Dune",
  "Ember",
  "Fjord",
  "Grove",
  "Haven",
  "Ivory",
  "Jade",
  "Kodiak",
  "Lumen",
  "Mosaic",
  "Nimbus",
  "Orchard",
  "Pebble",
  "Quill",
  "Ridge",
  "Slate",
  "Terra",
  "Umber",
  "Violet",
  "Wavelength",
  "Yarrow",
  "Zephyr",
  "Craft",
  "Bold",
  "Crisp",
  "Rugged",
  "Thunder",
  "Nexus",
  "Ascend",
  "Beacon",
  "Cedar",
  "Delta",
  "Echo",
  "Flint",
  "Glacier",
  "Harbor",
  "Indigo",
  "Junction",
  "Kinetic",
  "Luxe",
  "Marble",
  "Nest",
  "Onyx",
  "Pulse",
  "Quest",
  "Roam",
  "Sterling",
  "Trail",
  "Union",
  "Vessel",
  "Wild",
];

const SUFFIXES = [
  "Co.",
  "Brands",
  "Studio",
  "Supply",
  "Goods",
  "Retail",
  "Inc",
  "Works",
  "Collective",
  "Trading",
  "Partners",
  "Group",
  "Design",
  "Living",
  "Home",
];

function seeded(i, salt = 0) {
  const x = Math.sin((i + 1) * (997 + salt)) * 10000;
  return x - Math.floor(x);
}

function pick(arr, i, salt = 0) {
  return arr[Math.floor(seeded(i, salt) * arr.length) % arr.length];
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

function companyName(i) {
  const stem = STEMS[i % STEMS.length];
  const suffix = SUFFIXES[Math.floor(seeded(i, 41) * SUFFIXES.length) % SUFFIXES.length];
  // ~25% compound names (e.g. "Wonder Lights", "BrightLight Co.")
  if (seeded(i, 77) > 0.75) {
    const second = pick(["Lights", "Living", "Kitchen", "Outdoor", "Decor", "Home", "Garden", "Craft"], i, 88);
    return `${stem} ${second}`;
  }
  if (suffix === "Home" && seeded(i, 99) > 0.5) {
    return `${stem} ${suffix}`;
  }
  return `${stem} ${suffix}`;
}

function leadStatus(i) {
  const r = seeded(i, 200);
  if (r < 0.05) return "Shortlisted";
  if (r < 0.12) return "New";
  return "Discovered";
}

function categoriesFor(i) {
  const primary = pick(CATEGORIES, i, 300);
  const secondary =
    seeded(i, 301) > 0.55 ? pick(CATEGORIES.filter((c) => c !== primary), i, 302) : null;
  return secondary ? [primary, secondary] : [primary];
}

function discoveredDate(i) {
  const daysAgo = Math.floor(seeded(i, 400) * 90);
  const d = new Date("2026-07-08T12:00:00Z");
  d.setDate(d.getDate() - daysAgo);
  d.setHours(Math.floor(seeded(i, 401) * 12) + 8);
  d.setMinutes(Math.floor(seeded(i, 402) * 60));
  return d.toISOString();
}

const usedNames = new Set();

function uniqueCompanyName(i) {
  let name = companyName(i);
  let attempt = 0;
  while (usedNames.has(name) && attempt < 20) {
    name = `${STEMS[(i + attempt) % STEMS.length]} ${SUFFIXES[(i + attempt * 3) % SUFFIXES.length]}`;
    attempt++;
  }
  usedNames.add(name);
  return name;
}

const leads = [];

for (let i = 1; i <= COUNT; i++) {
  const id = `lead-${String(i).padStart(4, "0")}`;
  const conf = round2(4.5 + seeded(i, 500) * 5.2);
  const gmv = Math.round(400_000 + seeded(i, 501) * 8_500_000);
  const status = leadStatus(i);

  leads.push({
    id,
    sellerId: id,
    companyName: uniqueCompanyName(i),
    categories: categoriesFor(i),
    businessType: pick(BUSINESS_TYPES, i, 600),
    headquarters: pick(CITIES, i, 700),
    estimatedGMV: gmv,
    confidenceScore: conf,
    assortmentMatchScore: round2(0.35 + seeded(i, 800) * 0.6),
    trendScore: round2(0.2 + seeded(i, 900) * 0.75),
    riskScore: round2(0.08 + seeded(i, 1000) * 0.45),
    status,
    reviewOutcome: status === "Shortlisted" ? "Pending" : "Pending",
    assignedTo: pick(ASSIGNEES, i, 1100),
    discoveredDate: discoveredDate(i),
  });
}

const root = path.join(__dirname, "..");
const outPath = path.join(root, "mock", "business", "leads.json");
const metaPath = path.join(root, "mock", "business", "leads.meta.json");

const meta = {
  version: 2,
  count: leads.length,
  totalWithHeroes: leads.length + 15,
  generatedAt: new Date().toISOString(),
};

fs.writeFileSync(outPath, JSON.stringify(leads, null, 2) + "\n");
fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2) + "\n");

console.log("");
console.log("✅  Lead pool generated");
console.log(`    File:     ${outPath}`);
console.log(`    Records:  ${leads.length.toLocaleString()} leads in JSON`);
console.log(`    UI total: ${meta.totalWithHeroes.toLocaleString()} (includes 15 hero sellers)`);
console.log(`    Sample:   ${leads[0].companyName}, ${leads[42].companyName}, ${leads[999].companyName}`);
console.log("");
console.log("    Next steps:");
console.log("    1. Restart dev server  →  npm run dev   (so the app reloads the JSON file)");
console.log("    2. Hard-refresh Lead Discovery in the browser");
console.log("    3. If count still looks wrong, clear site data for localhost or click “View all leads”");
console.log("");
