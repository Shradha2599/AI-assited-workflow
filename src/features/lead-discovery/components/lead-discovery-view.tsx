"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  Filter,
  Loader2,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { SvgIcon } from "@/components/ui/svg-icon";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TruncatedText } from "@/components/ui/truncated-text";
import {
  DashboardKpiStrip,
  type DashboardMetric,
} from "@/components/data-display/dashboard-kpi-card";
import { ConfidenceScoreBadge } from "@/components/data-display/confidence-score-badge";
import { ItemTypesDrawer } from "@/components/data-display/item-types-drawer";
import { ItemTypesInlineList } from "@/components/data-display/item-types-inline-list";
import { FiscalYearSelector } from "@/components/data-display/fiscal-year-selector";
import { useOutreachMail } from "@/features/outreach/hooks/use-outreach-mail";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { sellers, type Seller } from "@/lib/mock-data/sellers";
import { toDiscoveryPayload, rankSellersLocally } from "@/lib/mock-data/discover-leads-ranking";
import { getPlanCategories } from "@/lib/mock-data/plan-item-matching";
import { usePlanStore } from "@/features/assortment-plan/store/plan-store";
import { formatFYShort, type FiscalYearId } from "@/lib/mock-data/fy-plan-seeds";
import { useDiscoveryStore, useFYDiscoverySnapshot } from "../store/discovery-store";
import {
  LeadDiscoveryFiltersDrawer,
  type FilterDraft,
} from "./lead-discovery-filters-drawer";
import { SellerProfileDrawer } from "./seller-profile-drawer";

type Tab = "discovered" | "shortlisted";

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

function emptyFilterDraft(activeFilters: {
  businessType: string;
  marketplace: string;
  category: string;
  minConfidence: number;
  viralOnly: boolean;
}): FilterDraft {
  return {
    location: "",
    businessType: activeFilters.businessType,
    marketplace: activeFilters.marketplace,
    category: activeFilters.category,
    minConfidence: activeFilters.minConfidence,
    minGmv: 0,
    viralOnly: activeFilters.viralOnly,
  };
}

export function LeadDiscoveryView() {
  const fiscalYear = usePlanStore((s) => s.fiscalYear);
  const planItems = usePlanStore((s) => s.planItems);
  const snap = useFYDiscoverySnapshot(fiscalYear);
  const { discoveredIds, shortlistedIds, contactedIds, hasUserInitiatedDiscovery } = snap;

  const isDiscovering = useDiscoveryStore((s) => s.isDiscovering);
  const activeFilters = useDiscoveryStore((s) => s.activeFilters);
  const setDiscovered = useDiscoveryStore((s) => s.setDiscovered);
  const shortlistSeller = useDiscoveryStore((s) => s.shortlistSeller);
  const removeFromShortlist = useDiscoveryStore((s) => s.removeFromShortlist);
  const setIsDiscovering = useDiscoveryStore((s) => s.setIsDiscovering);
  const setFilter = useDiscoveryStore((s) => s.setFilter);
  const clearDiscoveryResults = useDiscoveryStore((s) => s.clearDiscoveryResults);
  const syncLeadPoolVersion = useDiscoveryStore((s) => s.syncLeadPoolVersion);
  const syncFYDiscoverySeed = useDiscoveryStore((s) => s.syncFYDiscoverySeed);
  const openOutreach = useOutreachMail();

  const [activeTab, setActiveTab] = useState<Tab>("discovered");
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [planItemsDrawerOpen, setPlanItemsDrawerOpen] = useState(false);

  const [filterDraft, setFilterDraft] = useState<FilterDraft>(() =>
    emptyFilterDraft(activeFilters),
  );

  useEffect(() => {
    syncLeadPoolVersion();
    syncFYDiscoverySeed();
  }, [syncLeadPoolVersion, syncFYDiscoverySeed]);

  const planItemsKey = planItems.join("\u0001");
  const planCategories = useMemo(() => getPlanCategories(planItems), [planItemsKey]);

  useEffect(() => {
    if (planItems.length === 0 || discoveredIds.length === 0) return;

    const stillRelevant = discoveredIds.every((id) => {
      const seller = sellers.find((s) => s.id === id);
      if (!seller) return false;
      if (planCategories.length === 0) return true;
      return planCategories.some((cat) => seller.categories.includes(cat));
    });

    if (!stillRelevant) {
      clearDiscoveryResults(fiscalYear);
    }
  }, [planItemsKey, planCategories, discoveredIds, clearDiscoveryResults, fiscalYear]);

  async function runDiscovery() {
    setPage(1);
    setIsDiscovering(true);
    try {
      const res = await fetch("/api/discover-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planItems }),
      });
      const data = (await res.json()) as {
        rankedSellers?: {
          sellerId: string;
          relevanceReason: string;
          planMatch?: string[];
        }[];
        error?: string;
      };

      if (!res.ok) {
        throw new Error(data.error ?? "Discovery failed");
      }

      const rankedSellers =
        data.rankedSellers?.length ? data.rankedSellers : rankSellersLocally(planItems).rankedSellers;

      if (rankedSellers.length === 0) {
        setDiscovered(fiscalYear, [], {}, {});
        return;
      }

      const { ids, reasons, planMatches } = toDiscoveryPayload(rankedSellers);
      setDiscovered(fiscalYear, ids, reasons, planMatches);
      setActiveTab("discovered");
    } catch {
      const { rankedSellers } = rankSellersLocally(planItems);
      const { ids, reasons, planMatches } = toDiscoveryPayload(rankedSellers);
      setDiscovered(fiscalYear, ids, reasons, planMatches);
      setActiveTab("discovered");
    } finally {
      setIsDiscovering(false);
    }
  }

  useEffect(() => {
    if (discoveredIds.length === 0) return;
    const validIds = discoveredIds.filter((id) => sellers.some((s) => s.id === id));
    if (validIds.length !== discoveredIds.length) {
      if (validIds.length === 0) {
        clearDiscoveryResults(fiscalYear);
      } else {
        const reasons = useDiscoveryStore.getState().getSnapshot(fiscalYear).relevanceReasons;
        const planMatches = useDiscoveryStore.getState().getSnapshot(fiscalYear).planMatches;
        const nextReasons = Object.fromEntries(
          validIds.map((id) => [id, reasons[id] ?? ""]),
        );
        const nextPlanMatches = Object.fromEntries(
          validIds.flatMap((id) => (planMatches[id] ? [[id, planMatches[id]]] : [])),
        );
        setDiscovered(fiscalYear, validIds, nextReasons, nextPlanMatches);
      }
    }
  }, [clearDiscoveryResults, discoveredIds, setDiscovered, fiscalYear]);

  function openDiscoverDrawer() {
    setFilterDraft(emptyFilterDraft(activeFilters));
    setShowFilters(true);
  }

  async function runDiscoveryFromDrawer() {
    setFilter({
      businessType: filterDraft.businessType,
      marketplace: filterDraft.marketplace,
      category: filterDraft.category,
      minConfidence: filterDraft.minConfidence,
      viralOnly: filterDraft.viralOnly,
    });
    setShowFilters(false);
    await runDiscovery();
  }

  function clearFilters() {
    const reset = emptyFilterDraft({
      businessType: "",
      marketplace: "",
      category: "",
      minConfidence: 0,
      viralOnly: false,
    });
    setFilterDraft(reset);
    setFilter({
      businessType: "",
      marketplace: "",
      category: "",
      minConfidence: 0,
      viralOnly: false,
    });
    setPage(1);
  }

  const baseList = useMemo(() => {
    if (discoveredIds.length === 0) return [];
    return discoveredIds
      .map((id) => sellers.find((s) => s.id === id))
      .filter(Boolean) as Seller[];
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
    if (filterDraft.minGmv > 0) list = list.filter((s) => s.gmv >= filterDraft.minGmv);
    if (filterDraft.location)
      list = list.filter((s) => s.location.includes(filterDraft.location));
    return list;
  }, [baseList, search, activeFilters, filterDraft.minGmv, filterDraft.location]);

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
  const contactedCount = contactedIds.length;

  const hasActiveFilters = !!(
    activeFilters.category ||
    activeFilters.businessType ||
    activeFilters.marketplace ||
    activeFilters.minConfidence ||
    activeFilters.viralOnly
  );

  const discoveryMetrics: DashboardMetric[] = useMemo(
    () => [
      {
        label: "Total Leads Found",
        value: discoveredList.length.toLocaleString(),
        icon: "sellers",
      },
      {
        label: "High Match Leads (>80%)",
        value: highMatchCount.toLocaleString(),
        icon: "gap",
      },
      {
        label: "Leads Added to My List",
        value: shortlistedIds.length.toLocaleString(),
        icon: "goal",
      },
      {
        label: "Leads Contacted",
        value: contactedCount.toLocaleString(),
        icon: "sellers",
      },
    ],
    [discoveredList.length, highMatchCount, shortlistedIds.length, contactedCount],
  );

  const isShortlistedEmpty = activeTab === "shortlisted" && shortlistedIds.length === 0;
  const hasDiscoveredResults = discoveredIds.length > 0;
  const hasShortlistedResults = shortlistedIds.length > 0;
  const showTable =
    (activeTab === "discovered" && hasUserInitiatedDiscovery && hasDiscoveredResults) ||
    (activeTab === "shortlisted" && hasShortlistedResults);

  const fyShort = formatFYShort(fiscalYear as FiscalYearId);

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
        <FiscalYearSelector />
      </div>

      {isShortlistedEmpty ? (
        <Card className="px-6 py-14 text-center">
          <p className="text-[var(--text-body-size)] font-semibold text-[var(--color-foreground)]">
            No shortlisted leads yet. Discover and shortlist leads first.
          </p>
        </Card>
      ) : (
        <>
      {/* Search bar — discovered tab only */}
      {activeTab === "discovered" && (
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
      )}

      {/* Assortment Plan Items — discovered tab only */}
      {activeTab === "discovered" && (
        <Card className="mb-[var(--space-3)] px-[var(--space-4)] py-3">
          <div className="mb-2.5">
            <p className="text-[var(--text-caption-size)] font-semibold text-[var(--color-foreground)]">
              Assortment Plan Items · FY {fyShort}
            </p>
          </div>
          {planItems.length > 0 ? (
            <ItemTypesInlineList
              items={planItems}
              onShowAll={() => setPlanItemsDrawerOpen(true)}
            />
          ) : (
            <p className="text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
              No plan items loaded. Visit Assortment Plan to add item types.
            </p>
          )}
        </Card>
      )}

      {activeTab === "discovered" && (
        <div className="mb-[var(--space-4)]">
          <Button onClick={openDiscoverDrawer} disabled={isDiscovering} className="gap-2">
            {isDiscovering ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            {isDiscovering ? "Discovering…" : "Discover Leads"}
          </Button>
        </div>
      )}

      {activeTab === "discovered" && !hasUserInitiatedDiscovery && (
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

      {hasUserInitiatedDiscovery && hasDiscoveredResults && activeTab === "discovered" && (
        <DashboardKpiStrip metrics={discoveryMetrics} showChange={false} className="mb-[var(--space-4)]" />
      )}

      {/* Leads table */}
      {showTable && (
        <Card className="overflow-hidden">
          <div className="px-6">
          {/* Table toolbar */}
          <div className="flex items-center justify-between border-b border-[var(--color-border)] py-3">
            <p className="text-[var(--text-body-size)] font-semibold">
              {activeTab === "discovered"
                ? `Leads Discovered: ${totalCount.toLocaleString()}`
                : `Shortlisted Leads ${totalCount.toLocaleString()}`}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setFilterDraft(emptyFilterDraft(activeFilters));
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
                Categories ({ALL_CATEGORIES.length})
                <ChevronDown className="h-3.5 w-3.5 text-[var(--color-muted-foreground)]" />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[var(--text-caption-size)]">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-card)]">
                  <th className="py-2.5 text-left text-[var(--text-label-size)] font-semibold text-[var(--color-muted-foreground)]">
                    Legal Business Name
                  </th>
                  <th className="py-2.5 text-left text-[var(--text-label-size)] font-semibold text-[var(--color-muted-foreground)]">
                    Category
                  </th>
                  <th className="py-2.5 text-left text-[var(--text-label-size)] font-semibold text-[var(--color-muted-foreground)]">
                    GMV
                  </th>
                  <th className="py-2.5 text-left text-[var(--text-label-size)] font-semibold text-[var(--color-muted-foreground)]">
                    SKUs
                  </th>
                  <th className="py-2.5 text-left text-[var(--text-label-size)] font-semibold text-[var(--color-muted-foreground)]">
                    Viral
                  </th>
                  <th className="py-2.5 text-left text-[var(--text-label-size)] font-semibold text-[var(--color-muted-foreground)]">
                    Rating
                  </th>
                  <th className="py-2.5 text-left text-[var(--text-label-size)] font-semibold text-[var(--color-muted-foreground)]">
                    Marketplaces
                  </th>
                  <th className="py-2.5 text-left text-[var(--text-label-size)] font-semibold text-[var(--color-muted-foreground)]">
                    Confidence Score
                  </th>
                  <th className="py-2.5 text-left text-[var(--text-label-size)] font-semibold text-[var(--color-muted-foreground)]">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedList.map((seller) => {
                  const isShortlisted = shortlistedIds.includes(seller.id);
                  return (
                    <tr
                      key={seller.id}
                      className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-muted)]/20"
                    >
                      <td className="py-2.5 text-left">
                        <button
                          type="button"
                          onClick={() => setSelectedSeller(seller)}
                          className="text-left font-medium text-blue-600 hover:underline"
                        >
                          {seller.legalBusinessName}
                        </button>
                      </td>
                      <td className="py-2.5 text-left text-[var(--color-foreground)]">
                        {seller.category}
                      </td>
                      <td className="py-2.5 text-left tabular-nums">{formatGMV(seller.gmv)}</td>
                      <td className="py-2.5 text-left tabular-nums">{seller.skus.toLocaleString()}</td>
                      <td className="py-2.5 text-left text-[var(--color-muted-foreground)]">
                        {seller.viralTrendy ? "Yes" : "No"}
                      </td>
                      <td className="py-2.5 text-left tabular-nums">{seller.rating}</td>
                      <td className="max-w-[140px] py-2.5 text-left text-[var(--color-muted-foreground)]">
                        <TruncatedText
                          text={truncateMarketplaces(seller.marketplaces)}
                          tooltipText={seller.marketplaces.join(", ")}
                        />
                      </td>
                      <td className="py-2.5 text-left">
                        <ConfidenceScoreBadge score={seller.confidenceScore} variant="table" />
                      </td>
                      <td className="py-2.5 text-left">
                        {activeTab === "discovered" ? (
                          isShortlisted ? (
                            <button
                              type="button"
                              onClick={() => removeFromShortlist(fiscalYear, seller.id)}
                              className="text-[var(--text-caption-size)] text-green-600"
                            >
                              ✓ Shortlisted
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => shortlistSeller(fiscalYear, seller.id)}
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
                              className="text-[var(--color-primary)] hover:opacity-80"
                            >
                              <SvgIcon name="mail" size={16} variant="primary" />
                            </button>
                            <button
                              type="button"
                              title="Remove from shortlist"
                              onClick={() => removeFromShortlist(fiscalYear, seller.id)}
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
            <div className="flex items-center justify-between border-t border-[var(--color-border)] py-3">
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
          </div>
        </Card>
      )}
        </>
      )}

      <LeadDiscoveryFiltersDrawer
        open={showFilters}
        onClose={() => setShowFilters(false)}
        filterDraft={filterDraft}
        onChange={setFilterDraft}
        onDiscover={runDiscoveryFromDrawer}
        isDiscovering={isDiscovering}
        hasActiveFilters={hasActiveFilters}
        onClear={clearFilters}
        businessTypes={ALL_BUSINESS_TYPES}
        marketplaces={ALL_MARKETPLACES}
        categories={ALL_CATEGORIES}
      />

      {selectedSeller && (
        <SellerProfileDrawer seller={selectedSeller} onClose={() => setSelectedSeller(null)} />
      )}

      {planItemsDrawerOpen && planItems.length > 0 && (
        <ItemTypesDrawer
          title="Assortment Plan Items"
          items={planItems}
          onClose={() => setPlanItemsDrawerOpen(false)}
        />
      )}
    </>
  );
}
