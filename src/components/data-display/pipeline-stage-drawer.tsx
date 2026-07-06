"use client";

import { ExternalLink } from "lucide-react";
import Link from "next/link";

import {
  DrawerHeaderShell,
  DrawerPanel,
  DrawerTitleAccent,
} from "@/components/ui/drawer-panel";

// ── Seller catalog keyed by category ─────────────────────────────────────────
// Each seller specifies which categories they sell in (primary first), a base
// GMV, and a name. Progress is derived from the pipeline stage at render time
// so the same seller will look further along if they're in a later stage.

interface SellerTemplate {
  name: string;
  categories: string[];   // shown in card; first entry is always the opened category
  gmv: string;
}

const SELLER_CATALOG: Record<string, SellerTemplate[]> = {
  "Kitchen & Dining": [
    { name: "CraftHouse Co.",      categories: ["Kitchen & Dining"],                  gmv: "$1.4M" },
    { name: "Skyward Goods",       categories: ["Kitchen & Dining", "Home Decor"],    gmv: "$1.7M" },
    { name: "TableTop Brands",     categories: ["Kitchen & Dining"],                  gmv: "$2.3M" },
    { name: "Hearth & Table",      categories: ["Kitchen & Dining", "Furniture"],     gmv: "$1.1M" },
    { name: "Zest Culinary",       categories: ["Kitchen & Dining"],                  gmv: "$0.9M" },
    { name: "Pinnacle Goods",      categories: ["Kitchen & Dining", "Home Decor"],    gmv: "$1.2M" },
    { name: "Casa de Cocina",      categories: ["Kitchen & Dining"],                  gmv: "$1.6M" },
    { name: "WareHouse Select",    categories: ["Kitchen & Dining", "Storage & Organization"], gmv: "$2.0M" },
  ],
  "Home Decor": [
    { name: "Verde Décor",         categories: ["Home Decor"],                        gmv: "$0.9M" },
    { name: "Wishing Chair",       categories: ["Home Decor", "Furniture"],           gmv: "$1.5M" },
    { name: "SunSet Decor",        categories: ["Home Decor", "Lighting"],            gmv: "$1.2M" },
    { name: "Artisan Living",      categories: ["Home Decor"],                        gmv: "$1.8M" },
    { name: "Heritage Craft",      categories: ["Home Decor", "Furniture"],           gmv: "$2.1M" },
    { name: "Noma Studio",         categories: ["Home Decor"],                        gmv: "$0.7M" },
    { name: "UrbanNest Decor",     categories: ["Home Decor"],                        gmv: "$1.3M" },
    { name: "Bloom & Branch",      categories: ["Home Decor", "Outdoor Living"],      gmv: "$1.0M" },
  ],
  "Outdoor Living": [
    { name: "Apex Outdoor",        categories: ["Outdoor Living"],                    gmv: "$1.8M" },
    { name: "NaturePath",          categories: ["Outdoor Living", "Garden"],          gmv: "$1.6M" },
    { name: "Bloom & Branch",      categories: ["Outdoor Living", "Home Decor"],      gmv: "$1.0M" },
    { name: "SkyDeck Supply",      categories: ["Outdoor Living"],                    gmv: "$2.4M" },
    { name: "TerraLux Brands",     categories: ["Outdoor Living"],                    gmv: "$1.1M" },
    { name: "BackYard Collective", categories: ["Outdoor Living"],                    gmv: "$0.8M" },
    { name: "PatioPrime",          categories: ["Outdoor Living", "Furniture"],       gmv: "$1.9M" },
    { name: "WildRidge Co.",       categories: ["Outdoor Living"],                    gmv: "$1.3M" },
  ],
  "Storage & Organization": [
    { name: "StoreMax Inc.",       categories: ["Storage & Organization"],            gmv: "$1.1M" },
    { name: "ProVault",            categories: ["Storage & Organization"],            gmv: "$2.0M" },
    { name: "Daves & Co",          categories: ["Storage & Organization"],            gmv: "$1.5M" },
    { name: "Neat & Tidy Brands",  categories: ["Storage & Organization", "Home Decor"], gmv: "$1.3M" },
    { name: "Clutter Clear Co.",   categories: ["Storage & Organization"],            gmv: "$0.8M" },
    { name: "GridBox Supply",      categories: ["Storage & Organization"],            gmv: "$1.7M" },
    { name: "StackWell",           categories: ["Storage & Organization", "Kitchen & Dining"], gmv: "$1.2M" },
    { name: "OrdoCasa",            categories: ["Storage & Organization"],            gmv: "$0.6M" },
  ],
  "Furniture": [
    { name: "Cherry Oak",          categories: ["Furniture"],                         gmv: "$1.5M" },
    { name: "Heritage Home",       categories: ["Furniture", "Rugs"],                 gmv: "$2.5M" },
    { name: "Oasis & Co",          categories: ["Furniture", "Rugs"],                 gmv: "$1.5M" },
    { name: "Craftsmen Select",    categories: ["Furniture"],                         gmv: "$3.2M" },
    { name: "Plank & Pine",        categories: ["Furniture"],                         gmv: "$1.8M" },
    { name: "Modern Form Co.",     categories: ["Furniture", "Home Decor"],           gmv: "$2.0M" },
    { name: "WoodWell Brands",     categories: ["Furniture"],                         gmv: "$1.0M" },
    { name: "SolidOak Studio",     categories: ["Furniture"],                         gmv: "$1.4M" },
  ],
  "Party Supplies": [
    { name: "Nbyula Supplies",     categories: ["Party Supplies"],                    gmv: "$1.5M" },
    { name: "Nexus Supply",        categories: ["Party Supplies"],                    gmv: "$0.8M" },
    { name: "PopBash Co.",         categories: ["Party Supplies"],                    gmv: "$1.2M" },
    { name: "FeteCraft",           categories: ["Party Supplies", "Holiday & Festive Decor"], gmv: "$2.0M" },
    { name: "Revelry Brands",      categories: ["Party Supplies"],                    gmv: "$0.7M" },
    { name: "GalaGear",            categories: ["Party Supplies"],                    gmv: "$1.6M" },
    { name: "CelebrationHQ",       categories: ["Party Supplies"],                    gmv: "$1.1M" },
    { name: "FiestaPro",           categories: ["Party Supplies"],                    gmv: "$0.9M" },
  ],
  "Holiday & Festive Decor": [
    { name: "FestivePro",          categories: ["Holiday & Festive Decor"],           gmv: "$2.2M" },
    { name: "FeteCraft",           categories: ["Holiday & Festive Decor", "Party Supplies"], gmv: "$2.0M" },
    { name: "SeasonalLux",         categories: ["Holiday & Festive Decor"],           gmv: "$1.8M" },
    { name: "MerryMakers Co.",     categories: ["Holiday & Festive Decor"],           gmv: "$1.4M" },
    { name: "TinselTown Brands",   categories: ["Holiday & Festive Decor"],           gmv: "$1.0M" },
    { name: "GlowTree Supply",     categories: ["Holiday & Festive Decor", "Lighting"], gmv: "$1.3M" },
    { name: "WinterFête",          categories: ["Holiday & Festive Decor"],           gmv: "$0.9M" },
    { name: "HarvestHouse Co.",    categories: ["Holiday & Festive Decor", "Home Decor"], gmv: "$1.7M" },
  ],
  "Lighting": [
    { name: "Luminary Brands",     categories: ["Lighting", "Home Decor"],            gmv: "$2.1M" },
    { name: "BrightLight Co.",     categories: ["Lighting"],                          gmv: "$3.1M" },
    { name: "SunSet Decor",        categories: ["Lighting", "Home Decor"],            gmv: "$1.2M" },
    { name: "GlowTree Supply",     categories: ["Lighting", "Holiday & Festive Decor"], gmv: "$1.3M" },
    { name: "LuxArc Studio",       categories: ["Lighting"],                          gmv: "$1.9M" },
    { name: "NeonNest Co.",        categories: ["Lighting"],                          gmv: "$0.8M" },
    { name: "BeamCraft Brands",    categories: ["Lighting", "Outdoor Living"],        gmv: "$1.5M" },
    { name: "IlluminaHome",        categories: ["Lighting"],                          gmv: "$2.4M" },
  ],
  "Bedding": [
    { name: "Cozy Home Co.",       categories: ["Bedding", "Bath"],                   gmv: "$1.3M" },
    { name: "DreamWeave Brands",   categories: ["Bedding"],                           gmv: "$2.0M" },
    { name: "SilkCloud Supply",    categories: ["Bedding"],                           gmv: "$1.7M" },
    { name: "ThreadCount Co.",     categories: ["Bedding"],                           gmv: "$1.1M" },
    { name: "SlumberLux",          categories: ["Bedding"],                           gmv: "$0.9M" },
    { name: "CrestCotton",         categories: ["Bedding", "Bath"],                   gmv: "$1.4M" },
    { name: "NightOwl Textiles",   categories: ["Bedding"],                           gmv: "$1.6M" },
    { name: "PillowPeak Brands",   categories: ["Bedding"],                           gmv: "$0.7M" },
  ],
  "Bath": [
    { name: "Nexus Supply",        categories: ["Bath", "Party Supplies"],            gmv: "$0.8M" },
    { name: "Cozy Home Co.",       categories: ["Bath", "Bedding"],                   gmv: "$1.3M" },
    { name: "AquaLux Brands",      categories: ["Bath"],                              gmv: "$1.9M" },
    { name: "SpaHaven Co.",        categories: ["Bath"],                              gmv: "$1.5M" },
    { name: "CrestCotton",         categories: ["Bath", "Bedding"],                   gmv: "$1.4M" },
    { name: "PureSoak Supply",     categories: ["Bath"],                              gmv: "$1.1M" },
    { name: "TowelCraft Brands",   categories: ["Bath"],                              gmv: "$0.9M" },
    { name: "Refresh & Co.",       categories: ["Bath"],                              gmv: "$2.0M" },
  ],
};

// Fallback pool for categories not explicitly listed
const FALLBACK_POOL: SellerTemplate[] = [
  { name: "Pinnacle Goods",    categories: ["General Merchandise"],       gmv: "$1.2M" },
  { name: "Cherry Oak",        categories: ["General Merchandise"],       gmv: "$1.5M" },
  { name: "Luminary Brands",   categories: ["General Merchandise"],       gmv: "$2.1M" },
  { name: "ProVault",          categories: ["General Merchandise"],       gmv: "$2.0M" },
  { name: "Heritage Home",     categories: ["General Merchandise"],       gmv: "$2.5M" },
];

// Progress ranges by stage index (0 = Established is highest)
const STAGE_PROGRESS_RANGES: [number, number][] = [
  [88, 100], // Established
  [60, 87],  // Onboarding
  [40, 65],  // New Lead
  [25, 50],  // Contacted
  [10, 35],  // Shortlisted
  [5, 20],   // Discovered
];

/** Deterministic but varied progress value within a stage's range */
function stageProgress(range: [number, number], idx: number): number {
  const [lo, hi] = range;
  return lo + ((idx * 17 + 7) % (hi - lo + 1));
}

function sellersForCell(category: string, rowIndex: number, count: number): Array<SellerTemplate & { progress: number }> {
  const pool = SELLER_CATALOG[category] ?? FALLBACK_POOL;
  const range = STAGE_PROGRESS_RANGES[rowIndex] ?? STAGE_PROGRESS_RANGES[4];
  const visible = Math.min(count, 8);
  return Array.from({ length: visible }, (_, i) => {
    const tpl = pool[i % pool.length];
    return { ...tpl, progress: stageProgress(range, i) };
  });
}

// ── Avatar ────────────────────────────────────────────────────────────────────
function initials(name: string): string {
  return name
    .split(/[\s&]+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ── SellerCard ────────────────────────────────────────────────────────────────
interface SellerCardData extends SellerTemplate {
  progress: number;
}

function SellerCard({ seller }: { seller: SellerCardData }) {
  return (
    <div className="flex gap-3 rounded-[var(--radius-lg)] bg-[var(--color-task-card)] px-[var(--space-4)] py-[var(--space-4)]">
      {/* Avatar */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E8EDF7] text-[12px] font-bold text-[#3B5CA8]">
        {initials(seller.name)}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        {/* Row 1: name · GMV + external link */}
        <div className="flex items-start justify-between gap-2">
          <p className="text-[var(--text-body-size)] font-semibold text-[var(--color-foreground)]">
            {seller.name}
            <span className="ml-2 text-[var(--text-caption-size)] font-normal text-[var(--color-muted-foreground)]">
              · GMV{" "}
              <span className="font-semibold text-[var(--color-foreground)]">{seller.gmv}</span>
            </span>
          </p>
          <Link
            href="/sellers/onboarding"
            className="shrink-0 text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)]"
            aria-label={`Open ${seller.name}`}
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Row 2: categories */}
        <p className="mt-0.5 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
          Categories{" "}
          <span className="font-medium text-[var(--color-foreground)]">
            {seller.categories.join(", ")}
          </span>
        </p>

        {/* Row 3: progress bar */}
        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[var(--text-caption-size)] font-medium text-[var(--color-foreground)]">
              Onboarding Progress
            </span>
            <span className="text-[var(--text-caption-size)] font-semibold text-[var(--color-foreground)]">
              {seller.progress}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-muted)]">
            <div
              className="h-full rounded-full bg-[var(--color-primary)] transition-all"
              style={{ width: `${seller.progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── GMV + health helpers ─────────────────────────────────────────────────────
const AVG_GMV_PER_SELLER: Record<string, number> = {
  Established: 3_400_000,
  Onboarding:    278_000,
  "New Lead":    180_000,
  Contacted:     140_000,
  Shortlisted:   110_000,
  Discovered:     70_000,
};

function formatGmv(stage: string, count: number): string {
  const avg = AVG_GMV_PER_SELLER[stage] ?? 200_000;
  return `$${((count * avg) / 1_000_000).toFixed(1)}M`;
}

function pipelineHealth(count: number): { label: string; cls: string } {
  if (count >= 35) return { label: "On Track",        cls: "text-green-700" };
  if (count >= 20) return { label: "Needs Attention", cls: "text-amber-600" };
  return               { label: "At Risk",           cls: "text-red-600"   };
}

// ── Component ─────────────────────────────────────────────────────────────────

interface PipelineStageDrawerProps {
  category: string;
  stage: string;
  count: number;
  colIndex: number;
  rowIndex: number;
  onClose: () => void;
}

export function PipelineStageDrawer({
  category,
  stage,
  count,
  rowIndex,
  onClose,
}: PipelineStageDrawerProps) {
  const sellers = sellersForCell(category, rowIndex, count);
  const gmv = formatGmv(stage, count);
  const health = pipelineHealth(count);

  return (
    <DrawerPanel
      ariaLabel={`${category}: ${stage} stage pipeline`}
      onClose={onClose}
      header={
        <DrawerHeaderShell
          onClose={onClose}
          title={
            <>
              {category}:{" "}
              <DrawerTitleAccent>{stage} Stage</DrawerTitleAccent>
            </>
          }
        />
      }
    >
      <div className="p-[var(--space-4)]">
        {/* Summary cards */}
        <div className="mb-5 grid grid-cols-2 gap-3">
          <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
            <p className="text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
              Potential GMV in Pipeline
            </p>
            <p className="mt-1 text-[var(--text-section-size)] font-bold text-[var(--color-foreground)]">
              {gmv}
            </p>
          </div>
          <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
            <p className="text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
              Pipeline Health
            </p>
            <p className={`mt-1 text-[var(--text-section-size)] font-bold ${health.cls}`}>
              {health.label}
            </p>
          </div>
        </div>

        {/* Section header */}
        <div className="mb-3">
          <h3 className="text-[var(--text-section-size)] font-semibold text-[var(--color-foreground)]">
            Partners in {stage} Stage
          </h3>
          <p className="text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
            Showing {sellers.length} of {count} partners
          </p>
        </div>

        {/* Seller cards */}
        <div className="space-y-[var(--space-3)]">
          {sellers.map((seller, idx) => (
            <SellerCard key={`${seller.name}-${idx}`} seller={seller} />
          ))}

          {count > sellers.length && (
            <p className="py-2 text-center text-[var(--text-caption-size)] font-medium text-[var(--color-primary)]">
              + {count - sellers.length} more partners
            </p>
          )}
        </div>
      </div>
    </DrawerPanel>
  );
}
