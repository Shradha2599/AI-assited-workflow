"use client";

import { useMemo, useState } from "react";
import {
  ChevronDown,
  Filter,
  Loader2,
  Mail,
  Plus,
  Search,
  Sparkles,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useOutreachMail } from "@/features/outreach/hooks/use-outreach-mail";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { sellers, type Seller } from "@/lib/mock-data/sellers";
import { usePlanStore } from "@/features/assortment-plan/store/plan-store";
import { useDiscoveryStore } from "../store/discovery-store";
import { SellerProfileDrawer } from "./seller-profile-drawer";

type Tab = "discovered" | "shortlisted";

function ConfidenceBadge({ score }: { score: number }) {
  const color =
    score >= 9.0
      ? "bg-green-600 text-white"
      : score >= 8.0
        ? "bg-green-500 text-white"
        : score >= 7.0
          ? "bg-amber-500 text-white"
          : "bg-red-500 text-white";
  return (
    <span
      className={cn(
        "inline-flex min-w-[36px] items-center justify-center rounded px-2 py-0.5 text-[var(--text-caption-size)] font-semibold tabular-nums",
        color,
      )}
    >
      {score.toFixed(1)}
    </span>
  );
}

function StatBox({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-3">
      <div className="text-[var(--color-muted-foreground)]">{icon}</div>
      <div>
        <p className="text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">
          {label}
        </p>
        <p className="text-xl font-bold tabular-nums">{value.toLocaleString()}</p>
      </div>
    </div>
  );
}

function formatGMV(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

function truncateMarketplaces(mps: string[]): string {
  if (mps.length <= 2) return mps.join(", ");
  return mps.slice(0, 2).join(", ") + "...";
}

const ALL_CATEGORIES = [...new Set(sellers.flatMap((s) => s.categories))].sort();
const ALL_BUSINESS_TYPES = [...new Set(sellers.map((s) => s.businessType))].sort();
const ALL_MARKETPLACES = [...new Set(sellers.flatMap((s) => s.marketplaces))].sort();

const ITEMS_PER_PAGE = 11;

export function LeadDiscoveryView() {
  const planItems = usePlanStore((s) => s.planItems);

  const discoveredIds = useDiscoveryStore((s) => s.discoveredIds);
  const shortlistedIds = useDiscoveryStore((s) => s.shortlistedIds);
  const relevanceReasons = useDiscoveryStore((s) => s.relevanceReasons);
  const isDiscovering = useDiscoveryStore((s) => s.isDiscovering);
  const activeFilters = useDiscoveryStore((s) => s.activeFilters);
  const setDiscovered = useDiscoveryStore((s) => s.setDiscovered);
  const shortlistSeller = useDiscoveryStore((s) => s.shortlistSeller);
  const removeFromShortlist = useDiscoveryStore((s) => s.removeFromShortlist);
  const setIsDiscovering = useDiscoveryStore((s) => s.setIsDiscovering);
  const setFilter = useDiscoveryStore((s) => s.setFilter);
  const openOutreach = useOutreachMail();

  const [activeTab, setActiveTab] = useState<Tab>("discovered");
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  const [filterDraft, setFilterDraft] = useState({
    businessType: activeFilters.businessType,
    marketplace: activeFilters.marketplace,
    category: activeFilters.category,
    minConfidence: activeFilters.minConfidence,
    viralOnly: activeFilters.viralOnly,
  });

  async function handleDiscover() {
    setIsDiscovering(true);
    try {
      const res = await fetch("/api/discover-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planItems }),
      });
      if (!res.ok) throw new Error("Discovery failed");
      const { rankedSellers } = (await res.json()) as {
        rankedSellers: { sellerId: string; relevanceReason: string }[];
      };
      const ids = rankedSellers.map((s) => s.sellerId);
      const reasons: Record<string, string> = {};
      for (const s of rankedSellers) reasons[s.sellerId] = s.relevanceReason;
      setDiscovered(ids, reasons);
      setActiveTab("discovered");
      setPage(1);
    } catch {
      // silent
    } finally {
      setIsDiscovering(false);
    }
  }

  function applyFilters() {
    setFilter({
      businessType: filterDraft.businessType,
      marketplace: filterDraft.marketplace,
      category: filterDraft.category,
      minConfidence: filterDraft.minConfidence,
      viralOnly: filterDraft.viralOnly,
    });
    setShowFilters(false);
    setPage(1);
  }

  function clearFilters() {
    const reset = {
      businessType: "",
      marketplace: "",
      category: "",
      minConfidence: 0,
      viralOnly: false,
    };
    setFilterDraft(reset);
    setFilter(reset);
    setPage(1);
  }

  const baseList = useMemo(() => {
    return discoveredIds.length > 0
      ? (discoveredIds
          .map((id) => sellers.find((s) => s.id === id))
          .filter(Boolean) as Seller[])
      : [...sellers].sort((a, b) => b.confidenceScore - a.confidenceScore);
  }, [discoveredIds]);

  const discoveredList = useMemo(() => {
    let list = baseList;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.legalBusinessName.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          s.location.toLowerCase().includes(q),
      );
    }
    if (activeFilters.category)
      list = list.filter((s) => s.categories.includes(activeFilters.category));
    if (activeFilters.businessType)
      list = list.filter((s) => s.businessType === activeFilters.businessType);
    if (activeFilters.marketplace)
      list = list.filter((s) => s.marketplaces.includes(activeFilters.marketplace));
    if (activeFilters.minConfidence > 0)
      list = list.filter((s) => s.confidenceScore >= activeFilters.minConfidence);
    if (activeFilters.viralOnly) list = list.filter((s) => s.viralTrendy);
    return list;
  }, [baseList, search, activeFilters]);

  const shortlistedList = useMemo(() => {
    return shortlistedIds
      .map((id) => sellers.find((s) => s.id === id))
      .filter(Boolean) as Seller[];
  }, [shortlistedIds]);

  const displayedList = activeTab === "discovered" ? discoveredList : shortlistedList;
  const totalCount = displayedList.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginatedList = displayedList.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE,
  );

  const highMatchCount = discoveredList.filter((s) => s.confidenceScore >= 8).length;
  const contactedCount = sellers.filter(
    (s) => s.status === "contacted" || s.status === "applied",
  ).length;

  const hasActiveFilters = !!(
    activeFilters.category ||
    activeFilters.businessType ||
    activeFilters.marketplace ||
    activeFilters.minConfidence ||
    activeFilters.viralOnly
  );

  const hasResults = discoveredIds.length > 0 || search || activeTab === "shortlisted";

  return (
    <>
      <PageHeader
        title="Lead Discovery"
        breadcrumbs={[
          { label: "Acquisition & Onboarding", href: "/dashboard" },
          { label: "Lead Discovery" },
        ]}
      />

      {/* Tabs + FY row */}
      <div className="mb-[var(--space-3)] flex items-center justify-between">
        <div className="flex rounded-[var(--radius-md)] border border-[var(--color-border)] p-0.5">
          {(["discovered", "shortlisted"] as Tab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setActiveTab(tab);
                setPage(1);
              }}
              className={cn(
                "rounded-[var(--radius-sm)] px-4 py-1.5 text-[var(--text-caption-size)] font-medium transition-colors",
                activeTab === tab
                  ? "bg-[var(--color-foreground)] text-[var(--color-background)]"
                  : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]",
              )}
            >
              {tab === "discovered" ? "Discovered Leads" : "Shortlisted Leads"}
            </button>
          ))}
        </div>
        <div className="flex cursor-default items-center gap-1 rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-1.5 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
          FY 2026-2027
          <ChevronDown className="h-3.5 w-3.5" />
        </div>
      </div>

      {/* Search bar */}
      <div className="relative mb-[var(--space-3)]">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search Leads"
          className="h-10 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-card)] pl-9 pr-4 text-[var(--text-body-size)] shadow-sm focus:border-[var(--color-primary)] focus:outline-none"
        />
      </div>

      {/* Assortment Plan Items — discovered tab only */}
      {activeTab === "discovered" && (
        <Card className="mb-[var(--space-3)] px-[var(--space-4)] py-3">
          <div className="mb-2.5 flex items-center justify-between">
            <p className="text-[var(--text-caption-size)] font-semibold text-[var(--color-foreground)]">
              Assortment Plan Items
            </p>
            <button
              type="button"
              className="flex items-center gap-1 rounded-[var(--radius-md)] border border-[var(--color-primary)] px-2.5 py-1 text-[var(--text-caption-size)] font-medium text-[var(--color-primary)] hover:bg-blue-50"
            >
              <Plus className="h-3 w-3" /> Categories
            </button>
          </div>
          {planItems.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {planItems.map((item) => (
                <span
                  key={item}
                  className="flex items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-[var(--text-caption-size)] font-medium"
                >
                  {item}
                  <X className="h-3.5 w-3.5 cursor-pointer text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]" />
                </span>
              ))}
            </div>
          ) : (
            <p className="text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
              No plan items loaded. Visit Assortment Plan to add item types.
            </p>
          )}
        </Card>
      )}

      {/* Discover Leads button */}
      {activeTab === "discovered" && (
        <div className="mb-[var(--space-4)]">
          <Button onClick={handleDiscover} disabled={isDiscovering} className="gap-2">
            {isDiscovering ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            {isDiscovering ? "Discovering…" : "Discover Leads"}
          </Button>
        </div>
      )}

      {/* 4-stat bar */}
      {(discoveredIds.length > 0 || activeTab === "shortlisted") && (
        <div className="mb-[var(--space-4)] grid grid-cols-4 gap-[var(--space-3)]">
          <StatBox
            icon={<Search className="h-4 w-4" />}
            label="Total Leads Found"
            value={discoveredList.length}
          />
          <StatBox
            icon={<TrendingUp className="h-4 w-4" />}
            label="High Match Leads (>80%)"
            value={highMatchCount}
          />
          <StatBox
            icon={<Sparkles className="h-4 w-4" />}
            label="Leads Added to My List"
            value={shortlistedIds.length}
          />
          <StatBox
            icon={<Mail className="h-4 w-4" />}
            label="Leads Contacted"
            value={contactedCount}
          />
        </div>
      )}

      {/* Empty state */}
      {!hasResults && (
        <Card className="px-6 py-14 text-center">
          <p className="text-[var(--text-body-size)] font-semibold text-[var(--color-foreground)]">
            You haven&apos;t started your lead discovery yet
          </p>
          <p className="mt-1.5 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
            Find high potential sellers that match your category needs, demand period and other
            requirements
          </p>
        </Card>
      )}

      {/* Leads table */}
      {hasResults && (
        <Card className="overflow-hidden">
          {/* Table toolbar */}
          <div className="flex items-center justify-between border-b border-[var(--color-border)] px-[var(--space-4)] py-3">
            <p className="text-[var(--text-body-size)] font-semibold">
              {activeTab === "discovered"
                ? `Leads Discovered: ${totalCount.toLocaleString()}`
                : `Shortlisted Leads ${totalCount.toLocaleString()}`}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setFilterDraft({
                    businessType: activeFilters.businessType,
                    marketplace: activeFilters.marketplace,
                    category: activeFilters.category,
                    minConfidence: activeFilters.minConfidence,
                    viralOnly: activeFilters.viralOnly,
                  });
                  setShowFilters(true);
                }}
                className={cn(
                  "flex items-center gap-1.5 rounded-[var(--radius-md)] border px-3 py-1.5 text-[var(--text-caption-size)] font-medium hover:bg-[var(--color-muted)]",
                  hasActiveFilters
                    ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                    : "border-[var(--color-border)] text-[var(--color-foreground)]",
                )}
              >
                <Filter className="h-3.5 w-3.5" /> Filter
                {hasActiveFilters && (
                  <span className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-primary)] text-[10px] font-bold text-white">
                    !
                  </span>
                )}
              </button>
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-1.5 text-[var(--text-caption-size)] font-medium hover:bg-[var(--color-muted)]"
              >
                <span className="text-[var(--color-primary)]">
                  <Sparkles className="h-3.5 w-3.5" />
                </span>
                Categories ({ALL_CATEGORIES.length})
                <ChevronDown className="h-3.5 w-3.5 text-[var(--color-muted-foreground)]" />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[var(--text-caption-size)]">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-muted)]/40">
                  <th className="px-3 py-2.5 text-left text-[var(--text-label-size)] font-semibold text-[var(--color-muted-foreground)]">
                    Legal Business Name
                  </th>
                  <th className="px-3 py-2.5 text-left text-[var(--text-label-size)] font-semibold text-[var(--color-muted-foreground)]">
                    Category
                  </th>
                  <th className="px-3 py-2.5 text-left text-[var(--text-label-size)] font-semibold text-[var(--color-muted-foreground)]">
                    GMV
                  </th>
                  <th className="px-3 py-2.5 text-left text-[var(--text-label-size)] font-semibold text-[var(--color-muted-foreground)]">
                    SKUs
                  </th>
                  <th className="px-3 py-2.5 text-left text-[var(--text-label-size)] font-semibold text-[var(--color-muted-foreground)]">
                    Viral/Trendy
                  </th>
                  <th className="px-3 py-2.5 text-left text-[var(--text-label-size)] font-semibold text-[var(--color-muted-foreground)]">
                    Rating
                  </th>
                  <th className="px-3 py-2.5 text-left text-[var(--text-label-size)] font-semibold text-[var(--color-muted-foreground)]">
                    Marketplaces
                  </th>
                  <th className="px-3 py-2.5 text-left text-[var(--text-label-size)] font-semibold text-[var(--color-muted-foreground)]">
                    Confidence Score
                  </th>
                  <th className="px-3 py-2.5 text-left text-[var(--text-label-size)] font-semibold text-[var(--color-muted-foreground)]">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedList.map((seller) => {
                  const isShortlisted = shortlistedIds.includes(seller.id);
                  const reason = relevanceReasons[seller.id];
                  return (
                    <tr
                      key={seller.id}
                      className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-muted)]/20"
                    >
                      <td className="px-3 py-2.5">
                        <button
                          type="button"
                          onClick={() => setSelectedSeller(seller)}
                          className="text-left"
                        >
                          <span className="font-medium text-blue-600 hover:underline">
                            {seller.legalBusinessName}
                          </span>
                          {reason && (
                            <p className="mt-0.5 max-w-[200px] truncate text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">
                              {reason}
                            </p>
                          )}
                        </button>
                      </td>
                      <td className="px-3 py-2.5 text-[var(--color-foreground)]">
                        {seller.category}
                      </td>
                      <td className="px-3 py-2.5 tabular-nums">{formatGMV(seller.gmv)}</td>
                      <td className="px-3 py-2.5 tabular-nums">{seller.skus.toLocaleString()}</td>
                      <td className="px-3 py-2.5">
                        {seller.viralTrendy ? (
                          <span className="font-medium text-purple-600">Yes</span>
                        ) : (
                          <span className="text-[var(--color-muted-foreground)]">No</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 tabular-nums">{seller.rating}</td>
                      <td className="max-w-[140px] px-3 py-2.5 text-[var(--color-muted-foreground)]">
                        {truncateMarketplaces(seller.marketplaces)}
                      </td>
                      <td className="px-3 py-2.5">
                        <ConfidenceBadge score={seller.confidenceScore} />
                      </td>
                      <td className="px-3 py-2.5">
                        {activeTab === "discovered" ? (
                          isShortlisted ? (
                            <button
                              type="button"
                              onClick={() => removeFromShortlist(seller.id)}
                              className="text-[var(--text-caption-size)] text-green-600"
                            >
                              ✓ Shortlisted
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => shortlistSeller(seller.id)}
                              className="flex items-center gap-1 text-[var(--text-caption-size)] font-semibold text-blue-600 hover:text-blue-700"
                            >
                              <Plus className="h-3.5 w-3.5" /> Shortlist
                            </button>
                          )
                        ) : (
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              title="Send outreach email"
                              onClick={() =>
                                openOutreach({
                                  mailType: "acquisition_outreach",
                                  sellerId: seller.id,
                                  sellerName: seller.legalBusinessName,
                                  sellerWebsite: seller.website,
                                })
                              }
                              className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
                            >
                              <Mail className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              title="Remove from shortlist"
                              onClick={() => removeFromShortlist(seller.id)}
                              className="text-[var(--color-muted-foreground)] hover:text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {paginatedList.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-4 py-12 text-center text-[var(--text-body-size)] text-[var(--color-muted-foreground)]"
                    >
                      {activeTab === "shortlisted"
                        ? "No shortlisted leads yet. Discover and shortlist leads first."
                        : "No leads match the current filters."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalCount > ITEMS_PER_PAGE && (
            <div className="flex items-center justify-between border-t border-[var(--color-border)] px-4 py-3">
              <p className="text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
                Showing {Math.min((safePage - 1) * ITEMS_PER_PAGE + 1, totalCount)}-
                {Math.min(safePage * ITEMS_PER_PAGE, totalCount)} of{" "}
                {totalCount.toLocaleString()} items
              </p>
              <div className="flex items-center gap-1 text-[var(--text-caption-size)]">
                <button
                  type="button"
                  onClick={() => setPage(1)}
                  disabled={safePage === 1}
                  className="rounded px-2 py-1 hover:bg-[var(--color-muted)] disabled:opacity-40"
                >
                  «
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="rounded px-2 py-1 hover:bg-[var(--color-muted)] disabled:opacity-40"
                >
                  ‹
                </button>
                <span className="flex items-center gap-1 px-1">
                  Page
                  <select
                    value={safePage}
                    onChange={(e) => setPage(Number(e.target.value))}
                    className="mx-1 rounded border border-[var(--color-border)] px-1.5 py-0.5"
                  >
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="rounded px-2 py-1 hover:bg-[var(--color-muted)] disabled:opacity-40"
                >
                  ›
                </button>
                <button
                  type="button"
                  onClick={() => setPage(totalPages)}
                  disabled={safePage === totalPages}
                  className="rounded px-2 py-1 hover:bg-[var(--color-muted)] disabled:opacity-40"
                >
                  »
                </button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Filters slide-out panel */}
      {showFilters && (
        <>
          <div
            className="fixed inset-0 z-[var(--z-drawer)] bg-black/20"
            onClick={() => setShowFilters(false)}
            aria-hidden
          />
          <aside className="fixed inset-y-0 right-[var(--tasks-panel-width)] z-[calc(var(--z-drawer)+1)] flex w-[360px] flex-col border-l border-[var(--color-border)] bg-[var(--color-card)] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
              <h2 className="text-[var(--text-section-size)] font-semibold">Filters</h2>
              <button
                type="button"
                onClick={() => setShowFilters(false)}
                className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
              {/* Seller Business */}
              <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] px-4 py-4">
                <p className="mb-3 text-[var(--text-body-size)] font-semibold">Seller Business</p>
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
                      Business Type
                    </label>
                    <select
                      value={filterDraft.businessType}
                      onChange={(e) =>
                        setFilterDraft((f) => ({ ...f, businessType: e.target.value }))
                      }
                      className="h-9 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-[var(--text-caption-size)] focus:outline-none"
                    >
                      <option value="">Select Business Type</option>
                      {ALL_BUSINESS_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
                      Marketplace Experience
                    </label>
                    <select
                      value={filterDraft.marketplace}
                      onChange={(e) =>
                        setFilterDraft((f) => ({ ...f, marketplace: e.target.value }))
                      }
                      className="h-9 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-[var(--text-caption-size)] focus:outline-none"
                    >
                      <option value="">Select Marketplaces</option>
                      {ALL_MARKETPLACES.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Advanced Filters */}
              <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] px-4 py-4">
                <p className="mb-3 text-[var(--text-body-size)] font-semibold">Advanced Filters</p>
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
                      Category
                    </label>
                    <select
                      value={filterDraft.category}
                      onChange={(e) =>
                        setFilterDraft((f) => ({ ...f, category: e.target.value }))
                      }
                      className="h-9 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-[var(--text-caption-size)] focus:outline-none"
                    >
                      <option value="">All Categories</option>
                      {ALL_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
                      Minimum Confidence Score
                    </label>
                    <select
                      value={filterDraft.minConfidence}
                      onChange={(e) =>
                        setFilterDraft((f) => ({ ...f, minConfidence: Number(e.target.value) }))
                      }
                      className="h-9 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-[var(--text-caption-size)] focus:outline-none"
                    >
                      <option value={0}>Any Score</option>
                      <option value={7}>7.0+</option>
                      <option value={8}>8.0+</option>
                      <option value={9}>9.0+</option>
                    </select>
                  </div>
                  <label className="flex cursor-pointer items-center gap-2 text-[var(--text-caption-size)]">
                    <input
                      type="checkbox"
                      checked={filterDraft.viralOnly}
                      onChange={(e) =>
                        setFilterDraft((f) => ({ ...f, viralOnly: e.target.checked }))
                      }
                      className="accent-[var(--color-primary)]"
                    />
                    <TrendingUp className="h-3.5 w-3.5 text-purple-500" />
                    Viral / Trending sellers only
                  </label>
                </div>
              </div>
            </div>

            <div className="border-t border-[var(--color-border)] p-5 space-y-2">
              <Button className="w-full gap-2" onClick={applyFilters}>
                <Search className="h-4 w-4" /> Discover Leads
              </Button>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="w-full text-center text-[var(--text-caption-size)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </aside>
        </>
      )}

      {selectedSeller && (
        <SellerProfileDrawer seller={selectedSeller} onClose={() => setSelectedSeller(null)} />
      )}
    </>
  );
}
