/**
 * Single source of truth for all pipeline partners across stages and categories.
 * Used by:
 *  - Dashboard Pipeline Heatmap (cell counts)
 *  - Pipeline Stage Drawer (partner cards)
 *  - Lead Discovery page (discovered / shortlisted sellers)
 *  - Partner Onboarding page (onboarding partners with task data)
 *  - Beacon system prompt (accurate partner counts)
 */

export type TaskStatus =
  | "validated"
  | "completed"
  | "in_progress"
  | "in_review"
  | "locked"
  | "error";

export type PartnerStage =
  | "Established"
  | "Onboarding"
  | "New Lead"
  | "Contacted"
  | "Shortlisted"
  | "Discovered";

export interface OnboardingTask {
  id: string;
  name: string;
  status: TaskStatus;
}

export interface PipelinePartner {
  id: string;
  name: string;
  primaryCategory: string;
  categories: string[];
  stage: PartnerStage;
  gmv: string;
  gmvValue: number;            // numeric, in millions
  confidenceScore?: number;    // 0-10, used for New Lead / Shortlisted
  lastContactDate?: string;    // ISO string, used for Contacted
  lastContactTime?: string;    // e.g. "3:45 PM"
  tasks?: OnboardingTask[];    // 6 tasks for Onboarding partners
  joinedDate?: string;         // for Established
  website?: string;
}

// ── Onboarding task templates ─────────────────────────────────────────────────
// Every onboarding partner gets 6 standard tasks in this order.
export const ONBOARDING_TASK_NAMES = [
  "Business Registration & Legal Docs",
  "Tax & Compliance Forms",
  "Banking & Payment Setup",
  "Catalog Upload & SKU Setup",
  "Product Photography & Content",
  "Shipping & Fulfillment Config",
] as const;

type TaskSet = OnboardingTask[];

function makeTasks(statuses: TaskStatus[]): TaskSet {
  return ONBOARDING_TASK_NAMES.map((name, i) => ({
    id: `task-${i + 1}`,
    name,
    status: statuses[i] ?? "locked",
  }));
}

// ── Partner records ───────────────────────────────────────────────────────────

export const ALL_PARTNERS: PipelinePartner[] = [

  // ── LIGHTING ─────────────────────────────────────────────────────────────

  // Established (5)
  { id: "p-l-e1", name: "BrightLight Co.",    primaryCategory: "Lighting", categories: ["Lighting"],                  stage: "Established", gmv: "$3.1M", gmvValue: 3.1, joinedDate: "Jan 2023", website: "brightlight.co" },
  { id: "p-l-e2", name: "LuxArc Studio",      primaryCategory: "Lighting", categories: ["Lighting", "Home Decor"],   stage: "Established", gmv: "$1.9M", gmvValue: 1.9, joinedDate: "Mar 2023", website: "luxarc.com" },
  { id: "p-l-e3", name: "IlluminaHome",        primaryCategory: "Lighting", categories: ["Lighting"],                  stage: "Established", gmv: "$2.4M", gmvValue: 2.4, joinedDate: "Jun 2022", website: "illuminahome.com" },
  { id: "p-l-e4", name: "Luminary Brands",    primaryCategory: "Lighting", categories: ["Lighting"],                  stage: "Established", gmv: "$2.1M", gmvValue: 2.1, joinedDate: "Sep 2022", website: "luminarybrands.com" },
  { id: "p-l-e5", name: "NeonNest Co.",        primaryCategory: "Lighting", categories: ["Lighting"],                  stage: "Established", gmv: "$0.8M", gmvValue: 0.8, joinedDate: "Nov 2023", website: "neonnest.co" },

  // Onboarding (8) — each has 6 tasks
  { id: "p-l-o1", name: "BeamCraft Brands",   primaryCategory: "Lighting", categories: ["Lighting", "Outdoor Living"], stage: "Onboarding", gmv: "$1.5M", gmvValue: 1.5, confidenceScore: 8.7,
    tasks: makeTasks(["completed","completed","completed","in_progress","locked","locked"]) },
  { id: "p-l-o2", name: "GlowTree Supply",    primaryCategory: "Lighting", categories: ["Lighting", "Holiday & Festive Decor"], stage: "Onboarding", gmv: "$1.3M", gmvValue: 1.3, confidenceScore: 8.2,
    tasks: makeTasks(["completed","completed","in_review","locked","locked","locked"]) },
  { id: "p-l-o3", name: "SunSet Decor",       primaryCategory: "Lighting", categories: ["Lighting"],                  stage: "Onboarding", gmv: "$1.2M", gmvValue: 1.2, confidenceScore: 7.9,
    tasks: makeTasks(["completed","completed","completed","in_progress","in_review","locked"]) },
  { id: "p-l-o4", name: "ArcLab Studio",      primaryCategory: "Lighting", categories: ["Lighting"],                  stage: "Onboarding", gmv: "$1.8M", gmvValue: 1.8, confidenceScore: 9.0,
    tasks: makeTasks(["completed","completed","completed","completed","in_progress","locked"]) },
  { id: "p-l-o5", name: "VoltHome Co.",        primaryCategory: "Lighting", categories: ["Lighting"],                  stage: "Onboarding", gmv: "$0.9M", gmvValue: 0.9, confidenceScore: 7.5,
    tasks: makeTasks(["completed","error","locked","locked","locked","locked"]) },
  { id: "p-l-o6", name: "Zenith Lights",      primaryCategory: "Lighting", categories: ["Lighting"],                  stage: "Onboarding", gmv: "$2.0M", gmvValue: 2.0, confidenceScore: 8.5,
    tasks: makeTasks(["completed","completed","completed","completed","completed","in_progress"]) },
  { id: "p-l-o7", name: "PrismaLux",          primaryCategory: "Lighting", categories: ["Lighting", "Home Decor"],   stage: "Onboarding", gmv: "$1.4M", gmvValue: 1.4, confidenceScore: 8.1,
    tasks: makeTasks(["completed","completed","in_review","in_progress","locked","locked"]) },
  { id: "p-l-o8", name: "Harbour Lighting",   primaryCategory: "Lighting", categories: ["Lighting"],                  stage: "Onboarding", gmv: "$1.6M", gmvValue: 1.6, confidenceScore: 8.9,
    tasks: makeTasks(["completed","completed","completed","in_review","locked","locked"]) },

  // New Lead (7)
  { id: "p-l-n1", name: "Green Co.",           primaryCategory: "Lighting", categories: ["Lighting"],        stage: "New Lead",    gmv: "$1.5M", gmvValue: 1.5, confidenceScore: 9.1 },
  { id: "p-l-n2", name: "Elevate Labs",        primaryCategory: "Lighting", categories: ["Lighting"],        stage: "New Lead",    gmv: "$1.8M", gmvValue: 1.8, confidenceScore: 9.1 },
  { id: "p-l-n3", name: "Wonder Lights",       primaryCategory: "Lighting", categories: ["Lighting"],        stage: "New Lead",    gmv: "$2.1M", gmvValue: 2.1, confidenceScore: 9.3 },
  { id: "p-l-n4", name: "Horizon Light",       primaryCategory: "Lighting", categories: ["Lighting"],        stage: "New Lead",    gmv: "$1.2M", gmvValue: 1.2, confidenceScore: 8.5 },
  { id: "p-l-n5", name: "Starfield Co.",       primaryCategory: "Lighting", categories: ["Lighting"],        stage: "New Lead",    gmv: "$0.9M", gmvValue: 0.9, confidenceScore: 7.8 },
  { id: "p-l-n6", name: "LightPath Brands",    primaryCategory: "Lighting", categories: ["Lighting"],        stage: "New Lead",    gmv: "$1.4M", gmvValue: 1.4, confidenceScore: 8.3 },
  { id: "p-l-n7", name: "GlimmerHQ",           primaryCategory: "Lighting", categories: ["Lighting"],        stage: "New Lead",    gmv: "$1.7M", gmvValue: 1.7, confidenceScore: 8.8 },

  // Contacted (6)
  { id: "p-l-c1", name: "Harbour",             primaryCategory: "Lighting", categories: ["Lighting"],        stage: "Contacted",   gmv: "$1.5M", gmvValue: 1.5, lastContactDate: "2026-07-02", lastContactTime: "10:30 AM" },
  { id: "p-l-c2", name: "FluxLight Co.",       primaryCategory: "Lighting", categories: ["Lighting"],        stage: "Contacted",   gmv: "$1.1M", gmvValue: 1.1, lastContactDate: "2026-06-28", lastContactTime: "2:15 PM" },
  { id: "p-l-c3", name: "LightHouse Supply",   primaryCategory: "Lighting", categories: ["Lighting"],        stage: "Contacted",   gmv: "$0.8M", gmvValue: 0.8, lastContactDate: "2026-06-25", lastContactTime: "11:00 AM" },
  { id: "p-l-c4", name: "Dawnrise Brands",     primaryCategory: "Lighting", categories: ["Lighting"],        stage: "Contacted",   gmv: "$1.6M", gmvValue: 1.6, lastContactDate: "2026-07-05", lastContactTime: "9:45 AM" },
  { id: "p-l-c5", name: "Crestline Lights",    primaryCategory: "Lighting", categories: ["Lighting"],        stage: "Contacted",   gmv: "$2.0M", gmvValue: 2.0, lastContactDate: "2026-07-01", lastContactTime: "4:00 PM" },
  { id: "p-l-c6", name: "BoldBeam Co.",        primaryCategory: "Lighting", categories: ["Lighting"],        stage: "Contacted",   gmv: "$1.3M", gmvValue: 1.3, lastContactDate: "2026-06-30", lastContactTime: "1:20 PM" },

  // Shortlisted (5)
  { id: "p-l-s1", name: "Northpoint",          primaryCategory: "Lighting", categories: ["Lighting"],        stage: "Shortlisted", gmv: "$1.5M", gmvValue: 1.5, confidenceScore: 8.3 },
  { id: "p-l-s2", name: "Greenyard",           primaryCategory: "Lighting", categories: ["Lighting"],        stage: "Shortlisted", gmv: "$1.8M", gmvValue: 1.8, confidenceScore: 8.4 },
  { id: "p-l-s3", name: "LuxWave Brands",      primaryCategory: "Lighting", categories: ["Lighting"],        stage: "Shortlisted", gmv: "$1.1M", gmvValue: 1.1, confidenceScore: 7.9 },
  { id: "p-l-s4", name: "SparkleCo",           primaryCategory: "Lighting", categories: ["Lighting"],        stage: "Shortlisted", gmv: "$0.9M", gmvValue: 0.9, confidenceScore: 8.0 },
  { id: "p-l-s5", name: "Nexus Retail",        primaryCategory: "Lighting", categories: ["Lighting"],        stage: "Shortlisted", gmv: "$1.4M", gmvValue: 1.4, confidenceScore: 6.4 },

  // Discovered (9)
  { id: "p-l-d1", name: "Glimmer Base",        primaryCategory: "Lighting", categories: ["Lighting"],        stage: "Discovered",  gmv: "$0.6M", gmvValue: 0.6 },
  { id: "p-l-d2", name: "Volta Supply",        primaryCategory: "Lighting", categories: ["Lighting"],        stage: "Discovered",  gmv: "$0.8M", gmvValue: 0.8 },
  { id: "p-l-d3", name: "RayPath Co.",         primaryCategory: "Lighting", categories: ["Lighting"],        stage: "Discovered",  gmv: "$1.0M", gmvValue: 1.0 },
  { id: "p-l-d4", name: "Aurelius Light",      primaryCategory: "Lighting", categories: ["Lighting"],        stage: "Discovered",  gmv: "$0.7M", gmvValue: 0.7 },
  { id: "p-l-d5", name: "BrightPath Brands",   primaryCategory: "Lighting", categories: ["Lighting"],        stage: "Discovered",  gmv: "$1.1M", gmvValue: 1.1 },
  { id: "p-l-d6", name: "Solaris Co.",         primaryCategory: "Lighting", categories: ["Lighting"],        stage: "Discovered",  gmv: "$0.5M", gmvValue: 0.5 },
  { id: "p-l-d7", name: "DayGlow Supply",      primaryCategory: "Lighting", categories: ["Lighting"],        stage: "Discovered",  gmv: "$0.9M", gmvValue: 0.9 },
  { id: "p-l-d8", name: "LumiBase Co.",        primaryCategory: "Lighting", categories: ["Lighting"],        stage: "Discovered",  gmv: "$0.7M", gmvValue: 0.7 },
  { id: "p-l-d9", name: "ClearBeam Brands",    primaryCategory: "Lighting", categories: ["Lighting"],        stage: "Discovered",  gmv: "$1.2M", gmvValue: 1.2 },

  // ── FURNITURE ─────────────────────────────────────────────────────────────

  { id: "p-f-e1", name: "Craftsmen Select",    primaryCategory: "Furniture", categories: ["Furniture"],                stage: "Established", gmv: "$3.2M", gmvValue: 3.2, joinedDate: "Feb 2022" },
  { id: "p-f-e2", name: "Heritage Home",       primaryCategory: "Furniture", categories: ["Furniture", "Rugs"],         stage: "Established", gmv: "$2.5M", gmvValue: 2.5, joinedDate: "Apr 2023" },
  { id: "p-f-e3", name: "Modern Form Co.",     primaryCategory: "Furniture", categories: ["Furniture"],                stage: "Established", gmv: "$2.0M", gmvValue: 2.0, joinedDate: "Jan 2024" },
  { id: "p-f-e4", name: "Plank & Pine",        primaryCategory: "Furniture", categories: ["Furniture"],                stage: "Established", gmv: "$1.8M", gmvValue: 1.8, joinedDate: "Jul 2023" },

  { id: "p-f-o1", name: "Cherry Oak",          primaryCategory: "Furniture", categories: ["Furniture"],                stage: "Onboarding", gmv: "$1.5M", gmvValue: 1.5, confidenceScore: 8.4,
    tasks: makeTasks(["completed","completed","completed","in_progress","locked","locked"]) },
  { id: "p-f-o2", name: "Oasis & Co",          primaryCategory: "Furniture", categories: ["Furniture", "Rugs"],         stage: "Onboarding", gmv: "$1.5M", gmvValue: 1.5, confidenceScore: 8.1,
    tasks: makeTasks(["completed","completed","in_review","locked","locked","locked"]) },
  { id: "p-f-o3", name: "WoodWell Brands",     primaryCategory: "Furniture", categories: ["Furniture"],                stage: "Onboarding", gmv: "$1.0M", gmvValue: 1.0, confidenceScore: 7.6,
    tasks: makeTasks(["completed","error","locked","locked","locked","locked"]) },
  { id: "p-f-o4", name: "SolidOak Studio",     primaryCategory: "Furniture", categories: ["Furniture"],                stage: "Onboarding", gmv: "$1.4M", gmvValue: 1.4, confidenceScore: 8.6,
    tasks: makeTasks(["completed","completed","completed","completed","in_review","locked"]) },
  { id: "p-f-o5", name: "UrbanCraft Co.",      primaryCategory: "Furniture", categories: ["Furniture"],                stage: "Onboarding", gmv: "$1.2M", gmvValue: 1.2, confidenceScore: 8.0,
    tasks: makeTasks(["completed","completed","completed","in_progress","in_progress","locked"]) },
  { id: "p-f-o6", name: "TimberLine Brands",   primaryCategory: "Furniture", categories: ["Furniture"],                stage: "Onboarding", gmv: "$1.7M", gmvValue: 1.7, confidenceScore: 8.8,
    tasks: makeTasks(["completed","completed","completed","completed","completed","in_progress"]) },

  { id: "p-f-n1", name: "Wishing Chair",       primaryCategory: "Furniture", categories: ["Furniture", "Home Decor"],  stage: "New Lead",    gmv: "$1.5M", gmvValue: 1.5, confidenceScore: 8.6 },
  { id: "p-f-n2", name: "FrameWork Co.",       primaryCategory: "Furniture", categories: ["Furniture"],                stage: "New Lead",    gmv: "$2.2M", gmvValue: 2.2, confidenceScore: 9.0 },
  { id: "p-f-n3", name: "Dwell Supply",        primaryCategory: "Furniture", categories: ["Furniture"],                stage: "New Lead",    gmv: "$1.0M", gmvValue: 1.0, confidenceScore: 7.7 },
  { id: "p-f-n4", name: "HomeBase Studio",     primaryCategory: "Furniture", categories: ["Furniture"],                stage: "New Lead",    gmv: "$1.6M", gmvValue: 1.6, confidenceScore: 8.2 },
  { id: "p-f-n5", name: "Everwood Brands",     primaryCategory: "Furniture", categories: ["Furniture"],                stage: "New Lead",    gmv: "$1.3M", gmvValue: 1.3, confidenceScore: 7.9 },

  { id: "p-f-c1", name: "MapleCraft Co.",      primaryCategory: "Furniture", categories: ["Furniture"],                stage: "Contacted",   gmv: "$1.1M", gmvValue: 1.1, lastContactDate: "2026-07-03", lastContactTime: "9:00 AM" },
  { id: "p-f-c2", name: "Summit Furnishings",  primaryCategory: "Furniture", categories: ["Furniture"],                stage: "Contacted",   gmv: "$1.8M", gmvValue: 1.8, lastContactDate: "2026-06-29", lastContactTime: "3:30 PM" },
  { id: "p-f-c3", name: "NordHaus Co.",        primaryCategory: "Furniture", categories: ["Furniture"],                stage: "Contacted",   gmv: "$2.0M", gmvValue: 2.0, lastContactDate: "2026-06-26", lastContactTime: "11:15 AM" },
  { id: "p-f-c4", name: "Elara Home",          primaryCategory: "Furniture", categories: ["Furniture"],                stage: "Contacted",   gmv: "$1.4M", gmvValue: 1.4, lastContactDate: "2026-07-04", lastContactTime: "2:00 PM" },

  { id: "p-f-s1", name: "BoldHome Brands",     primaryCategory: "Furniture", categories: ["Furniture"],                stage: "Shortlisted", gmv: "$1.2M", gmvValue: 1.2, confidenceScore: 8.1 },
  { id: "p-f-s2", name: "KlausCo",             primaryCategory: "Furniture", categories: ["Furniture"],                stage: "Shortlisted", gmv: "$1.5M", gmvValue: 1.5, confidenceScore: 7.8 },
  { id: "p-f-s3", name: "ArcHouse Studio",     primaryCategory: "Furniture", categories: ["Furniture"],                stage: "Shortlisted", gmv: "$0.9M", gmvValue: 0.9, confidenceScore: 8.3 },

  { id: "p-f-d1", name: "PineRidge Co.",       primaryCategory: "Furniture", categories: ["Furniture"],                stage: "Discovered",  gmv: "$0.7M", gmvValue: 0.7 },
  { id: "p-f-d2", name: "OakPath Supply",      primaryCategory: "Furniture", categories: ["Furniture"],                stage: "Discovered",  gmv: "$0.9M", gmvValue: 0.9 },
  { id: "p-f-d3", name: "Vantage Furniture",   primaryCategory: "Furniture", categories: ["Furniture"],                stage: "Discovered",  gmv: "$1.1M", gmvValue: 1.1 },
  { id: "p-f-d4", name: "CraftBase Co.",       primaryCategory: "Furniture", categories: ["Furniture"],                stage: "Discovered",  gmv: "$0.6M", gmvValue: 0.6 },

  // ── KITCHEN & DINING ─────────────────────────────────────────────────────

  { id: "p-k-e1", name: "TableTop Brands",     primaryCategory: "Kitchen & Dining", categories: ["Kitchen & Dining"],                  stage: "Established", gmv: "$2.3M", gmvValue: 2.3, joinedDate: "Mar 2022" },
  { id: "p-k-e2", name: "Hearth & Table",      primaryCategory: "Kitchen & Dining", categories: ["Kitchen & Dining", "Furniture"],     stage: "Established", gmv: "$1.1M", gmvValue: 1.1, joinedDate: "Aug 2023" },
  { id: "p-k-e3", name: "WareHouse Select",    primaryCategory: "Kitchen & Dining", categories: ["Kitchen & Dining"],                  stage: "Established", gmv: "$2.0M", gmvValue: 2.0, joinedDate: "Jan 2023" },

  { id: "p-k-o1", name: "CraftHouse Co.",      primaryCategory: "Kitchen & Dining", categories: ["Kitchen & Dining"],                  stage: "Onboarding", gmv: "$1.4M", gmvValue: 1.4, confidenceScore: 8.3,
    tasks: makeTasks(["completed","completed","in_review","locked","locked","locked"]) },
  { id: "p-k-o2", name: "Pinnacle Goods",      primaryCategory: "Kitchen & Dining", categories: ["Kitchen & Dining", "Home Decor"],    stage: "Onboarding", gmv: "$1.2M", gmvValue: 1.2, confidenceScore: 9.2,
    tasks: makeTasks(["completed","completed","completed","in_progress","locked","locked"]) },
  { id: "p-k-o3", name: "Skyward Goods",       primaryCategory: "Kitchen & Dining", categories: ["Kitchen & Dining"],                  stage: "Onboarding", gmv: "$1.7M", gmvValue: 1.7, confidenceScore: 8.0,
    tasks: makeTasks(["completed","completed","completed","completed","in_review","locked"]) },
  { id: "p-k-o4", name: "Casa de Cocina",      primaryCategory: "Kitchen & Dining", categories: ["Kitchen & Dining"],                  stage: "Onboarding", gmv: "$1.6M", gmvValue: 1.6, confidenceScore: 8.7,
    tasks: makeTasks(["completed","completed","completed","completed","completed","in_progress"]) },
  { id: "p-k-o5", name: "Thunder Brewing",     primaryCategory: "Kitchen & Dining", categories: ["Kitchen & Dining"],                  stage: "Onboarding", gmv: "$1.3M", gmvValue: 1.3, confidenceScore: 7.9,
    tasks: makeTasks(["completed","completed","error","locked","locked","locked"]) },
  { id: "p-k-o6", name: "Zest Culinary",       primaryCategory: "Kitchen & Dining", categories: ["Kitchen & Dining"],                  stage: "Onboarding", gmv: "$0.9M", gmvValue: 0.9, confidenceScore: 7.5,
    tasks: makeTasks(["completed","in_progress","locked","locked","locked","locked"]) },
  { id: "p-k-o7", name: "StackWell",           primaryCategory: "Kitchen & Dining", categories: ["Kitchen & Dining", "Storage"],       stage: "Onboarding", gmv: "$1.2M", gmvValue: 1.2, confidenceScore: 8.1,
    tasks: makeTasks(["completed","completed","in_review","in_progress","locked","locked"]) },

  { id: "p-k-n1", name: "Horizon Kitchens",    primaryCategory: "Kitchen & Dining", categories: ["Kitchen & Dining"],        stage: "New Lead",    gmv: "$1.8M", gmvValue: 1.8, confidenceScore: 8.5 },
  { id: "p-k-n2", name: "DineWell Co.",        primaryCategory: "Kitchen & Dining", categories: ["Kitchen & Dining"],        stage: "New Lead",    gmv: "$1.1M", gmvValue: 1.1, confidenceScore: 7.9 },
  { id: "p-k-n3", name: "GourmetBase",         primaryCategory: "Kitchen & Dining", categories: ["Kitchen & Dining"],        stage: "New Lead",    gmv: "$2.0M", gmvValue: 2.0, confidenceScore: 9.1 },
  { id: "p-k-n4", name: "BistroLine",          primaryCategory: "Kitchen & Dining", categories: ["Kitchen & Dining"],        stage: "New Lead",    gmv: "$0.9M", gmvValue: 0.9, confidenceScore: 8.2 },
  { id: "p-k-n5", name: "KitchenPrime",        primaryCategory: "Kitchen & Dining", categories: ["Kitchen & Dining"],        stage: "New Lead",    gmv: "$1.5M", gmvValue: 1.5, confidenceScore: 8.8 },

  { id: "p-k-c1", name: "ChefHouse Co.",       primaryCategory: "Kitchen & Dining", categories: ["Kitchen & Dining"],        stage: "Contacted",   gmv: "$1.2M", gmvValue: 1.2, lastContactDate: "2026-07-01", lastContactTime: "10:00 AM" },
  { id: "p-k-c2", name: "TableCraft Brands",   primaryCategory: "Kitchen & Dining", categories: ["Kitchen & Dining"],        stage: "Contacted",   gmv: "$1.5M", gmvValue: 1.5, lastContactDate: "2026-06-28", lastContactTime: "1:45 PM" },
  { id: "p-k-c3", name: "SavorBase Co.",       primaryCategory: "Kitchen & Dining", categories: ["Kitchen & Dining"],        stage: "Contacted",   gmv: "$0.8M", gmvValue: 0.8, lastContactDate: "2026-06-27", lastContactTime: "3:00 PM" },

  { id: "p-k-s1", name: "CuisinePro",          primaryCategory: "Kitchen & Dining", categories: ["Kitchen & Dining"],        stage: "Shortlisted", gmv: "$1.0M", gmvValue: 1.0, confidenceScore: 8.0 },
  { id: "p-k-s2", name: "PlateLine Co.",       primaryCategory: "Kitchen & Dining", categories: ["Kitchen & Dining"],        stage: "Shortlisted", gmv: "$1.4M", gmvValue: 1.4, confidenceScore: 8.4 },

  { id: "p-k-d1", name: "ForkPath Supply",     primaryCategory: "Kitchen & Dining", categories: ["Kitchen & Dining"],        stage: "Discovered",  gmv: "$0.6M", gmvValue: 0.6 },
  { id: "p-k-d2", name: "PlateBase Co.",       primaryCategory: "Kitchen & Dining", categories: ["Kitchen & Dining"],        stage: "Discovered",  gmv: "$0.9M", gmvValue: 0.9 },
  { id: "p-k-d3", name: "DishCraft Brands",    primaryCategory: "Kitchen & Dining", categories: ["Kitchen & Dining"],        stage: "Discovered",  gmv: "$1.1M", gmvValue: 1.1 },

  // ── HOLIDAY & FESTIVE DECOR ───────────────────────────────────────────────

  { id: "p-h-e1", name: "FestivePro",          primaryCategory: "Holiday & Festive Decor", categories: ["Holiday & Festive Decor"],           stage: "Established", gmv: "$2.2M", gmvValue: 2.2, joinedDate: "Oct 2022" },
  { id: "p-h-e2", name: "SeasonalLux",         primaryCategory: "Holiday & Festive Decor", categories: ["Holiday & Festive Decor"],           stage: "Established", gmv: "$1.8M", gmvValue: 1.8, joinedDate: "Sep 2023" },
  { id: "p-h-e3", name: "HarvestHouse Co.",    primaryCategory: "Holiday & Festive Decor", categories: ["Holiday & Festive Decor", "Home Decor"], stage: "Established", gmv: "$1.7M", gmvValue: 1.7, joinedDate: "Nov 2022" },

  { id: "p-h-o1", name: "FeteCraft",           primaryCategory: "Holiday & Festive Decor", categories: ["Holiday & Festive Decor", "Party Supplies"], stage: "Onboarding", gmv: "$2.0M", gmvValue: 2.0, confidenceScore: 8.9,
    tasks: makeTasks(["completed","completed","completed","in_progress","locked","locked"]) },
  { id: "p-h-o2", name: "MerryMakers Co.",     primaryCategory: "Holiday & Festive Decor", categories: ["Holiday & Festive Decor"],           stage: "Onboarding", gmv: "$1.4M", gmvValue: 1.4, confidenceScore: 8.2,
    tasks: makeTasks(["completed","completed","in_review","locked","locked","locked"]) },
  { id: "p-h-o3", name: "TinselTown Brands",   primaryCategory: "Holiday & Festive Decor", categories: ["Holiday & Festive Decor"],           stage: "Onboarding", gmv: "$1.0M", gmvValue: 1.0, confidenceScore: 7.7,
    tasks: makeTasks(["completed","error","locked","locked","locked","locked"]) },
  { id: "p-h-o4", name: "WinterFête",          primaryCategory: "Holiday & Festive Decor", categories: ["Holiday & Festive Decor"],           stage: "Onboarding", gmv: "$0.9M", gmvValue: 0.9, confidenceScore: 8.0,
    tasks: makeTasks(["completed","completed","completed","completed","in_progress","locked"]) },
  { id: "p-h-o5", name: "GlowFest Supply",     primaryCategory: "Holiday & Festive Decor", categories: ["Holiday & Festive Decor"],           stage: "Onboarding", gmv: "$1.3M", gmvValue: 1.3, confidenceScore: 8.5,
    tasks: makeTasks(["completed","completed","completed","in_review","in_progress","locked"]) },

  { id: "p-h-n1", name: "HolidayBright Co.",   primaryCategory: "Holiday & Festive Decor", categories: ["Holiday & Festive Decor"],           stage: "New Lead",    gmv: "$1.5M", gmvValue: 1.5, confidenceScore: 8.7 },
  { id: "p-h-n2", name: "SparkFest Brands",    primaryCategory: "Holiday & Festive Decor", categories: ["Holiday & Festive Decor"],           stage: "New Lead",    gmv: "$1.2M", gmvValue: 1.2, confidenceScore: 8.1 },
  { id: "p-h-n3", name: "FestHouse Co.",       primaryCategory: "Holiday & Festive Decor", categories: ["Holiday & Festive Decor"],           stage: "New Lead",    gmv: "$2.0M", gmvValue: 2.0, confidenceScore: 9.0 },
  { id: "p-h-n4", name: "CheerCraft",          primaryCategory: "Holiday & Festive Decor", categories: ["Holiday & Festive Decor"],           stage: "New Lead",    gmv: "$0.8M", gmvValue: 0.8, confidenceScore: 7.6 },

  { id: "p-h-c1", name: "JollyBase Co.",       primaryCategory: "Holiday & Festive Decor", categories: ["Holiday & Festive Decor"],           stage: "Contacted",   gmv: "$1.1M", gmvValue: 1.1, lastContactDate: "2026-07-02", lastContactTime: "11:30 AM" },
  { id: "p-h-c2", name: "CelebHouse Brands",   primaryCategory: "Holiday & Festive Decor", categories: ["Holiday & Festive Decor"],           stage: "Contacted",   gmv: "$1.4M", gmvValue: 1.4, lastContactDate: "2026-06-30", lastContactTime: "2:30 PM" },
  { id: "p-h-c3", name: "FêteWorks Co.",       primaryCategory: "Holiday & Festive Decor", categories: ["Holiday & Festive Decor"],           stage: "Contacted",   gmv: "$0.9M", gmvValue: 0.9, lastContactDate: "2026-06-26", lastContactTime: "4:15 PM" },

  { id: "p-h-s1", name: "SeasonalCraft",       primaryCategory: "Holiday & Festive Decor", categories: ["Holiday & Festive Decor"],           stage: "Shortlisted", gmv: "$1.0M", gmvValue: 1.0, confidenceScore: 8.2 },
  { id: "p-h-s2", name: "DeckTheHalls Co.",    primaryCategory: "Holiday & Festive Decor", categories: ["Holiday & Festive Decor"],           stage: "Shortlisted", gmv: "$1.6M", gmvValue: 1.6, confidenceScore: 8.6 },
  { id: "p-h-s3", name: "MerryCraft Supply",   primaryCategory: "Holiday & Festive Decor", categories: ["Holiday & Festive Decor"],           stage: "Shortlisted", gmv: "$0.8M", gmvValue: 0.8, confidenceScore: 7.9 },

  { id: "p-h-d1", name: "WreathBase Co.",      primaryCategory: "Holiday & Festive Decor", categories: ["Holiday & Festive Decor"],           stage: "Discovered",  gmv: "$0.7M", gmvValue: 0.7 },
  { id: "p-h-d2", name: "HolidayCo Supply",    primaryCategory: "Holiday & Festive Decor", categories: ["Holiday & Festive Decor"],           stage: "Discovered",  gmv: "$0.9M", gmvValue: 0.9 },

  // ── OUTDOOR LIVING ────────────────────────────────────────────────────────

  { id: "p-o-e1", name: "Apex Outdoor",        primaryCategory: "Outdoor Living", categories: ["Outdoor Living"],                    stage: "Established", gmv: "$1.8M", gmvValue: 1.8, joinedDate: "May 2022" },
  { id: "p-o-e2", name: "SkyDeck Supply",      primaryCategory: "Outdoor Living", categories: ["Outdoor Living"],                    stage: "Established", gmv: "$2.4M", gmvValue: 2.4, joinedDate: "Aug 2022" },
  { id: "p-o-e3", name: "PatioPrime",          primaryCategory: "Outdoor Living", categories: ["Outdoor Living", "Furniture"],       stage: "Established", gmv: "$1.9M", gmvValue: 1.9, joinedDate: "Feb 2023" },

  { id: "p-o-o1", name: "NaturePath",          primaryCategory: "Outdoor Living", categories: ["Outdoor Living"],                    stage: "Onboarding", gmv: "$1.6M", gmvValue: 1.6, confidenceScore: 8.4,
    tasks: makeTasks(["completed","completed","completed","in_progress","locked","locked"]) },
  { id: "p-o-o2", name: "BackYard Collective", primaryCategory: "Outdoor Living", categories: ["Outdoor Living"],                    stage: "Onboarding", gmv: "$0.8M", gmvValue: 0.8, confidenceScore: 7.8,
    tasks: makeTasks(["completed","in_review","locked","locked","locked","locked"]) },
  { id: "p-o-o3", name: "WildRidge Co.",       primaryCategory: "Outdoor Living", categories: ["Outdoor Living"],                    stage: "Onboarding", gmv: "$1.3M", gmvValue: 1.3, confidenceScore: 8.1,
    tasks: makeTasks(["completed","completed","completed","completed","in_progress","locked"]) },
  { id: "p-o-o4", name: "TerraLux Brands",     primaryCategory: "Outdoor Living", categories: ["Outdoor Living"],                    stage: "Onboarding", gmv: "$1.1M", gmvValue: 1.1, confidenceScore: 8.6,
    tasks: makeTasks(["completed","completed","in_review","in_progress","locked","locked"]) },
  { id: "p-o-o5", name: "Bloom & Branch",      primaryCategory: "Outdoor Living", categories: ["Outdoor Living", "Home Decor"],      stage: "Onboarding", gmv: "$1.0M", gmvValue: 1.0, confidenceScore: 7.9,
    tasks: makeTasks(["completed","completed","completed","in_review","locked","locked"]) },

  { id: "p-o-n1", name: "PatioPoint Co.",      primaryCategory: "Outdoor Living", categories: ["Outdoor Living"],                    stage: "New Lead",    gmv: "$1.4M", gmvValue: 1.4, confidenceScore: 8.5 },
  { id: "p-o-n2", name: "GardenBase Brands",   primaryCategory: "Outdoor Living", categories: ["Outdoor Living"],                    stage: "New Lead",    gmv: "$0.9M", gmvValue: 0.9, confidenceScore: 8.0 },
  { id: "p-o-n3", name: "OutdoorLux Co.",      primaryCategory: "Outdoor Living", categories: ["Outdoor Living"],                    stage: "New Lead",    gmv: "$2.0M", gmvValue: 2.0, confidenceScore: 9.2 },

  { id: "p-o-c1", name: "DeckWorks Co.",       primaryCategory: "Outdoor Living", categories: ["Outdoor Living"],                    stage: "Contacted",   gmv: "$1.2M", gmvValue: 1.2, lastContactDate: "2026-07-03", lastContactTime: "10:45 AM" },
  { id: "p-o-c2", name: "YardCraft Supply",    primaryCategory: "Outdoor Living", categories: ["Outdoor Living"],                    stage: "Contacted",   gmv: "$1.5M", gmvValue: 1.5, lastContactDate: "2026-06-27", lastContactTime: "2:00 PM" },

  { id: "p-o-s1", name: "GardenPrime",         primaryCategory: "Outdoor Living", categories: ["Outdoor Living"],                    stage: "Shortlisted", gmv: "$1.0M", gmvValue: 1.0, confidenceScore: 8.3 },
  { id: "p-o-s2", name: "VerandaCo",           primaryCategory: "Outdoor Living", categories: ["Outdoor Living"],                    stage: "Shortlisted", gmv: "$1.4M", gmvValue: 1.4, confidenceScore: 8.7 },

  { id: "p-o-d1", name: "TerracePath Co.",     primaryCategory: "Outdoor Living", categories: ["Outdoor Living"],                    stage: "Discovered",  gmv: "$0.7M", gmvValue: 0.7 },
  { id: "p-o-d2", name: "OutdoorBase Supply",  primaryCategory: "Outdoor Living", categories: ["Outdoor Living"],                    stage: "Discovered",  gmv: "$0.8M", gmvValue: 0.8 },
  { id: "p-o-d3", name: "PatioCraft Brands",   primaryCategory: "Outdoor Living", categories: ["Outdoor Living"],                    stage: "Discovered",  gmv: "$1.0M", gmvValue: 1.0 },

  // ── RUGS ─────────────────────────────────────────────────────────────────

  { id: "p-r-e1", name: "Artisan Living",      primaryCategory: "Rugs", categories: ["Rugs", "Home Decor"],                        stage: "Established", gmv: "$1.8M", gmvValue: 1.8, joinedDate: "Apr 2023" },
  { id: "p-r-e2", name: "UrbanNest Decor",     primaryCategory: "Rugs", categories: ["Rugs"],                                      stage: "Established", gmv: "$1.3M", gmvValue: 1.3, joinedDate: "Dec 2022" },

  { id: "p-r-o1", name: "Heritage Craft",      primaryCategory: "Rugs", categories: ["Rugs", "Home Decor"],                        stage: "Onboarding", gmv: "$2.1M", gmvValue: 2.1, confidenceScore: 8.8,
    tasks: makeTasks(["completed","completed","completed","in_progress","locked","locked"]) },
  { id: "p-r-o2", name: "LoopWeave Co.",       primaryCategory: "Rugs", categories: ["Rugs"],                                      stage: "Onboarding", gmv: "$1.2M", gmvValue: 1.2, confidenceScore: 8.0,
    tasks: makeTasks(["completed","completed","in_review","locked","locked","locked"]) },
  { id: "p-r-o3", name: "WeavePath Brands",    primaryCategory: "Rugs", categories: ["Rugs"],                                      stage: "Onboarding", gmv: "$0.9M", gmvValue: 0.9, confidenceScore: 7.7,
    tasks: makeTasks(["completed","error","locked","locked","locked","locked"]) },
  { id: "p-r-o4", name: "FiberBase Co.",       primaryCategory: "Rugs", categories: ["Rugs"],                                      stage: "Onboarding", gmv: "$1.5M", gmvValue: 1.5, confidenceScore: 8.4,
    tasks: makeTasks(["completed","completed","completed","completed","in_review","locked"]) },

  { id: "p-r-n1", name: "LoomBase Supply",     primaryCategory: "Rugs", categories: ["Rugs"],                                      stage: "New Lead",    gmv: "$1.4M", gmvValue: 1.4, confidenceScore: 8.6 },
  { id: "p-r-n2", name: "KnotCraft Co.",       primaryCategory: "Rugs", categories: ["Rugs"],                                      stage: "New Lead",    gmv: "$1.1M", gmvValue: 1.1, confidenceScore: 8.0 },
  { id: "p-r-n3", name: "WeaveLux Brands",     primaryCategory: "Rugs", categories: ["Rugs"],                                      stage: "New Lead",    gmv: "$1.8M", gmvValue: 1.8, confidenceScore: 8.9 },

  { id: "p-r-c1", name: "PilePath Co.",        primaryCategory: "Rugs", categories: ["Rugs"],                                      stage: "Contacted",   gmv: "$1.0M", gmvValue: 1.0, lastContactDate: "2026-07-04", lastContactTime: "10:00 AM" },
  { id: "p-r-c2", name: "GroundWorks Supply",  primaryCategory: "Rugs", categories: ["Rugs"],                                      stage: "Contacted",   gmv: "$1.3M", gmvValue: 1.3, lastContactDate: "2026-06-29", lastContactTime: "3:15 PM" },

  { id: "p-r-s1", name: "TexBase Co.",         primaryCategory: "Rugs", categories: ["Rugs"],                                      stage: "Shortlisted", gmv: "$0.9M", gmvValue: 0.9, confidenceScore: 8.1 },
  { id: "p-r-s2", name: "FloorCraft Brands",   primaryCategory: "Rugs", categories: ["Rugs"],                                      stage: "Shortlisted", gmv: "$1.2M", gmvValue: 1.2, confidenceScore: 7.9 },

  { id: "p-r-d1", name: "PileCraft Co.",       primaryCategory: "Rugs", categories: ["Rugs"],                                      stage: "Discovered",  gmv: "$0.6M", gmvValue: 0.6 },
  { id: "p-r-d2", name: "WeftBase Supply",     primaryCategory: "Rugs", categories: ["Rugs"],                                      stage: "Discovered",  gmv: "$0.8M", gmvValue: 0.8 },

  // ── PARTY SUPPLIES ───────────────────────────────────────────────────────

  { id: "p-p-e1", name: "CelebrationHQ",       primaryCategory: "Party Supplies", categories: ["Party Supplies"],                    stage: "Established", gmv: "$1.1M", gmvValue: 1.1, joinedDate: "Jun 2023" },
  { id: "p-p-e2", name: "GalaGear",            primaryCategory: "Party Supplies", categories: ["Party Supplies"],                    stage: "Established", gmv: "$1.6M", gmvValue: 1.6, joinedDate: "Nov 2022" },

  { id: "p-p-o1", name: "PopBash Co.",         primaryCategory: "Party Supplies", categories: ["Party Supplies"],                    stage: "Onboarding", gmv: "$1.2M", gmvValue: 1.2, confidenceScore: 8.1,
    tasks: makeTasks(["completed","completed","in_progress","locked","locked","locked"]) },
  { id: "p-p-o2", name: "Revelry Brands",      primaryCategory: "Party Supplies", categories: ["Party Supplies"],                    stage: "Onboarding", gmv: "$0.7M", gmvValue: 0.7, confidenceScore: 7.6,
    tasks: makeTasks(["completed","in_review","locked","locked","locked","locked"]) },
  { id: "p-p-o3", name: "FiestaPro",           primaryCategory: "Party Supplies", categories: ["Party Supplies"],                    stage: "Onboarding", gmv: "$0.9M", gmvValue: 0.9, confidenceScore: 7.9,
    tasks: makeTasks(["completed","completed","completed","in_progress","in_review","locked"]) },
  { id: "p-p-o4", name: "Nbyula Supplies",     primaryCategory: "Party Supplies", categories: ["Party Supplies"],                    stage: "Onboarding", gmv: "$1.5M", gmvValue: 1.5, confidenceScore: 8.5,
    tasks: makeTasks(["completed","completed","completed","completed","in_progress","locked"]) },

  { id: "p-p-n1", name: "BashCraft Co.",       primaryCategory: "Party Supplies", categories: ["Party Supplies"],                    stage: "New Lead",    gmv: "$1.0M", gmvValue: 1.0, confidenceScore: 8.2 },
  { id: "p-p-n2", name: "RevelBase Supply",    primaryCategory: "Party Supplies", categories: ["Party Supplies"],                    stage: "New Lead",    gmv: "$0.8M", gmvValue: 0.8, confidenceScore: 7.8 },

  { id: "p-p-c1", name: "PartyHQ Brands",      primaryCategory: "Party Supplies", categories: ["Party Supplies"],                    stage: "Contacted",   gmv: "$0.9M", gmvValue: 0.9, lastContactDate: "2026-07-01", lastContactTime: "9:30 AM" },
  { id: "p-p-c2", name: "FêteBase Co.",        primaryCategory: "Party Supplies", categories: ["Party Supplies"],                    stage: "Contacted",   gmv: "$1.1M", gmvValue: 1.1, lastContactDate: "2026-06-28", lastContactTime: "11:00 AM" },

  { id: "p-p-s1", name: "CelebCraft Brands",   primaryCategory: "Party Supplies", categories: ["Party Supplies"],                    stage: "Shortlisted", gmv: "$0.8M", gmvValue: 0.8, confidenceScore: 7.9 },
  { id: "p-p-s2", name: "PartyBase Supply",    primaryCategory: "Party Supplies", categories: ["Party Supplies"],                    stage: "Shortlisted", gmv: "$1.0M", gmvValue: 1.0, confidenceScore: 8.1 },

  { id: "p-p-d1", name: "BalloonBase Co.",     primaryCategory: "Party Supplies", categories: ["Party Supplies"],                    stage: "Discovered",  gmv: "$0.5M", gmvValue: 0.5 },
  { id: "p-p-d2", name: "FêteCraft Supply",    primaryCategory: "Party Supplies", categories: ["Party Supplies"],                    stage: "Discovered",  gmv: "$0.7M", gmvValue: 0.7 },

  // ── STORAGE & ORGANIZATION ────────────────────────────────────────────────

  { id: "p-st-e1", name: "ProVault",           primaryCategory: "Storage & Organization", categories: ["Storage & Organization"],    stage: "Established", gmv: "$2.0M", gmvValue: 2.0, joinedDate: "Jan 2023" },
  { id: "p-st-e2", name: "GridBox Supply",     primaryCategory: "Storage & Organization", categories: ["Storage & Organization"],    stage: "Established", gmv: "$1.7M", gmvValue: 1.7, joinedDate: "May 2023" },

  { id: "p-st-o1", name: "StoreMax Inc.",      primaryCategory: "Storage & Organization", categories: ["Storage & Organization"],    stage: "Onboarding", gmv: "$1.1M", gmvValue: 1.1, confidenceScore: 8.0,
    tasks: makeTasks(["completed","completed","in_review","locked","locked","locked"]) },
  { id: "p-st-o2", name: "Daves & Co",         primaryCategory: "Storage & Organization", categories: ["Storage & Organization"],    stage: "Onboarding", gmv: "$1.5M", gmvValue: 1.5, confidenceScore: 8.4,
    tasks: makeTasks(["completed","completed","completed","in_progress","locked","locked"]) },
  { id: "p-st-o3", name: "Neat & Tidy Brands", primaryCategory: "Storage & Organization", categories: ["Storage & Organization"],    stage: "Onboarding", gmv: "$1.3M", gmvValue: 1.3, confidenceScore: 8.2,
    tasks: makeTasks(["completed","completed","completed","in_review","in_progress","locked"]) },
  { id: "p-st-o4", name: "Clutter Clear Co.",  primaryCategory: "Storage & Organization", categories: ["Storage & Organization"],    stage: "Onboarding", gmv: "$0.8M", gmvValue: 0.8, confidenceScore: 7.7,
    tasks: makeTasks(["completed","error","locked","locked","locked","locked"]) },
  { id: "p-st-o5", name: "OrdoCasa",           primaryCategory: "Storage & Organization", categories: ["Storage & Organization"],    stage: "Onboarding", gmv: "$0.6M", gmvValue: 0.6, confidenceScore: 7.5,
    tasks: makeTasks(["completed","in_progress","locked","locked","locked","locked"]) },

  { id: "p-st-n1", name: "SortBase Co.",       primaryCategory: "Storage & Organization", categories: ["Storage & Organization"],    stage: "New Lead",    gmv: "$1.2M", gmvValue: 1.2, confidenceScore: 8.3 },
  { id: "p-st-n2", name: "ShelfLine Brands",   primaryCategory: "Storage & Organization", categories: ["Storage & Organization"],    stage: "New Lead",    gmv: "$1.5M", gmvValue: 1.5, confidenceScore: 8.7 },
  { id: "p-st-n3", name: "CabinetCo",          primaryCategory: "Storage & Organization", categories: ["Storage & Organization"],    stage: "New Lead",    gmv: "$0.9M", gmvValue: 0.9, confidenceScore: 8.0 },

  { id: "p-st-c1", name: "RackWorks Supply",   primaryCategory: "Storage & Organization", categories: ["Storage & Organization"],    stage: "Contacted",   gmv: "$1.0M", gmvValue: 1.0, lastContactDate: "2026-07-02", lastContactTime: "2:00 PM" },
  { id: "p-st-c2", name: "StackBase Co.",      primaryCategory: "Storage & Organization", categories: ["Storage & Organization"],    stage: "Contacted",   gmv: "$1.3M", gmvValue: 1.3, lastContactDate: "2026-06-30", lastContactTime: "10:30 AM" },

  { id: "p-st-s1", name: "VaultPro Brands",    primaryCategory: "Storage & Organization", categories: ["Storage & Organization"],    stage: "Shortlisted", gmv: "$0.9M", gmvValue: 0.9, confidenceScore: 8.0 },
  { id: "p-st-s2", name: "OrderBase Co.",      primaryCategory: "Storage & Organization", categories: ["Storage & Organization"],    stage: "Shortlisted", gmv: "$1.2M", gmvValue: 1.2, confidenceScore: 8.3 },

  { id: "p-st-d1", name: "BinBase Supply",     primaryCategory: "Storage & Organization", categories: ["Storage & Organization"],    stage: "Discovered",  gmv: "$0.5M", gmvValue: 0.5 },
  { id: "p-st-d2", name: "CrateBase Co.",      primaryCategory: "Storage & Organization", categories: ["Storage & Organization"],    stage: "Discovered",  gmv: "$0.8M", gmvValue: 0.8 },
];

// ── Query helpers ─────────────────────────────────────────────────────────────

/** All unique categories in the database */
export const ALL_CATEGORIES = [
  "Lighting",
  "Furniture",
  "Holiday & Festive Decor",
  "Storage & Organization",
  "Kitchen & Dining",
  "Outdoor Living",
  "Party Supplies",
  "Rugs",
] as const;

/** Maps heatmap column labels → partner primaryCategory values */
const COL_TO_CAT: Record<string, string> = {
  "Lighting":        "Lighting",
  "Furniture":       "Furniture",
  "Holiday & Fes...":"Holiday & Festive Decor",
  "Storage & Or...": "Storage & Organization",
  "Kitchen & Din...":"Kitchen & Dining",
  "Outdoor Livi...": "Outdoor Living",
  "Party Supplies":  "Party Supplies",
  "Rugs":            "Rugs",
};

export function getPartnersByStageAndCategory(
  stage: PartnerStage,
  categoryOrColLabel: string,
): PipelinePartner[] {
  const cat = COL_TO_CAT[categoryOrColLabel] ?? categoryOrColLabel;
  return ALL_PARTNERS.filter(
    (p) => p.stage === stage && p.primaryCategory === cat,
  );
}

/** Count for one pipeline cell (stage × category column label) */
export function cellCount(stage: PartnerStage, colLabel: string): number {
  return getPartnersByStageAndCategory(stage, colLabel).length;
}

/** All partners currently in Onboarding stage */
export function getOnboardingPartners(): PipelinePartner[] {
  return ALL_PARTNERS.filter((p) => p.stage === "Onboarding");
}

/** Partners shown on the Partner Onboarding page (matches pipeline funnel rows) */
export function getPartnerOnboardingPagePartners(): PipelinePartner[] {
  return ALL_PARTNERS.filter(
    (p) => p.stage === "Onboarding" || p.stage === "New Lead" || p.stage === "Contacted",
  );
}

/** Summary counts per stage (for Beacon system prompt) */
export function getStageSummary(): Record<PartnerStage, number> {
  const summary: Partial<Record<PartnerStage, number>> = {};
  for (const p of ALL_PARTNERS) {
    summary[p.stage] = (summary[p.stage] ?? 0) + 1;
  }
  return summary as Record<PartnerStage, number>;
}

/** Per-category count for a given stage (for Beacon) */
export function getCategoryCounts(stage: PartnerStage): Record<string, number> {
  const result: Record<string, number> = {};
  for (const p of ALL_PARTNERS.filter((p) => p.stage === stage)) {
    result[p.primaryCategory] = (result[p.primaryCategory] ?? 0) + 1;
  }
  return result;
}
