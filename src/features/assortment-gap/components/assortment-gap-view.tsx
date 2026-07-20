"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Calendar } from "lucide-react";

import { AssortmentAnalysisBanner } from "@/components/data-display/assortment-analysis-banner";
import {
  CategoryTreemap,
  type TreemapItem,
} from "@/components/data-display/category-treemap";
import { GapsDrawer } from "@/components/data-display/gaps-drawer";
import { MissingProductsTable, type MissingProduct } from "@/components/data-display/missing-products-table";
import { RevenueGoalPanel } from "@/components/data-display/revenue-goal-panel";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { NoGoalModal } from "@/components/ui/no-goal-modal";
import { usePlanStore } from "@/features/assortment-plan/store/plan-store";
import { abbreviateRevenueGoalInput, formatRevenueGoalDisplay, parseRevenueGoalToMillions } from "@/lib/utils/revenue-goal-input";
import {
  findTreemapNode,
  getTreemapBreadcrumbLabels,
  getTreemapGridConfig,
  getTreemapLevelItems,
  type TreemapHierarchyRoot,
  type TreemapNode,
} from "@/lib/mock-data/treemap-hierarchy";
import type { TargetCategory } from "@/lib/mock-data/target-categories";
import { computeOpportunityForCategories } from "@/lib/mock-data/treemap-revenue";
import { CategoryMultiSelectFilter } from "@/components/data-display/category-multi-select-filter";
import { getGapItemsByCategory } from "@/lib/mock-data/gap-items-catalog";
import { layoutTreemapItems } from "@/lib/utils/treemap-layout";

interface AssortmentGapViewProps {
  lastUpdatedLabel: string;
  competitors: string[];
  categories: TargetCategory[];
  defaultCategoryIds: string[];
  treemapRoot: TreemapHierarchyRoot;
  products: MissingProduct[];
}

function nodeToTreemapItem(node: TreemapNode): TreemapItem {
  return {
    id: node.id,
    label: node.label,
    lag: node.lag,
    gridArea: node.gridArea,
    revenue: node.revenue,
    gapPercent: node.gapPercent,
    competitorLeader: node.competitorLeader,
    categoryId: node.categoryId,
    opensDrawer: node.opensDrawer,
    children: node.children,
  };
}

function filterProductsByCategories(
  products: MissingProduct[],
  selectedCategoryIds: string[],
  categories: TargetCategory[],
): MissingProduct[] {
  const selectedNames = new Set(
    categories.filter((c) => selectedCategoryIds.includes(c.id)).map((c) => c.name),
  );

  return products.filter((product) => {
    if (product.categoryId) return selectedCategoryIds.includes(product.categoryId);
    return (
      selectedNames.has(product.category) ||
      [...selectedNames].some(
        (name) => product.category.startsWith(name) || name.startsWith(product.category),
      )
    );
  });
}

export function AssortmentGapView({
  lastUpdatedLabel,
  competitors,
  categories,
  defaultCategoryIds,
  treemapRoot,
  products,
}: AssortmentGapViewProps) {
  const [drillPath, setDrillPath] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawerCategory, setDrawerCategory] = useState<string | null>(null);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(defaultCategoryIds);

  const categoryOptions = useMemo(
    () => categories.map((category) => ({ id: category.id, name: category.name })),
    [categories],
  );

  const filteredProducts = useMemo(
    () => filterProductsByCategories(products, selectedCategoryIds, categories),
    [products, selectedCategoryIds, categories],
  );

  const filteredRevenueOpportunity = useMemo(
    () => computeOpportunityForCategories(treemapRoot, selectedCategoryIds),
    [treemapRoot, selectedCategoryIds],
  );

  useEffect(() => {
    if (drillPath.length === 0) return;
    const topNode = findTreemapNode(treemapRoot, [drillPath[0]]);
    const categoryId = "categoryId" in topNode ? topNode.categoryId : undefined;
    if (categoryId && !selectedCategoryIds.includes(categoryId)) {
      setDrillPath([]);
      setSelectedId(null);
      setDrawerCategory(null);
    }
  }, [selectedCategoryIds, drillPath, treemapRoot]);

  const planItems      = usePlanStore((state) => state.planItems);
  const planRevenues   = usePlanStore((state) => state.planRevenues);
  const revenueGoal    = usePlanStore((state) => state.revenueGoal);
  const storeSetGoal   = usePlanStore((state) => state.setRevenueGoal);
  const addPlanItem    = usePlanStore((state) => state.addPlanItem);
  const removePlanItem = usePlanStore((state) => state.removePlanItem);

  // ── No-goal modal ─────────────────────────────────────────────────────────
  const [showNoGoalModal, setShowNoGoalModal] = useState(false);
  // Stores the action to run once the user confirms / sets a goal
  const pendingAddRef = useRef<(() => void) | null>(null);

  /**
   * Wrap every "add to plan" call. If no revenue goal is set yet, show the
   * modal and queue the action. Otherwise fire immediately.
   */
  const guardedAdd = useCallback(
    (action: () => void) => {
      if (!revenueGoal) {
        pendingAddRef.current = action;
        setShowNoGoalModal(true);
      } else {
        action();
      }
    },
    [revenueGoal],
  );

  function handleUseOpportunity() {
    const goalStr = abbreviateRevenueGoalInput(filteredRevenueOpportunity);
    storeSetGoal(goalStr);
    setShowNoGoalModal(false);
    pendingAddRef.current?.();
    pendingAddRef.current = null;
  }

  function handleSetManually() {
    setShowNoGoalModal(false);
    pendingAddRef.current = null;
    // Scroll the revenue goal input into view so user can set it
    document.getElementById("revenue-goal-input")?.focus();
  }

  const plannedRevM = Object.values(planRevenues).reduce((a, b) => a + b, 0);
  const hasSavedGoal = revenueGoal.length > 0;
  const goalMillions = hasSavedGoal ? parseRevenueGoalToMillions(revenueGoal) : null;

  const revenuePlannedStr = plannedRevM > 0 ? `$${plannedRevM.toFixed(1)}M` : "$0M";
  const revenueGoalStr = hasSavedGoal && goalMillions
    ? formatRevenueGoalDisplay(revenueGoal)
    : "—";

  const plannedPct =
    hasSavedGoal && goalMillions && goalMillions > 0
      ? Math.min(Math.round((plannedRevM / goalMillions) * 100), 100)
      : 0;

  const plannedMessage = !hasSavedGoal
    ? "Set a revenue goal to track your plan progress"
    : plannedRevM === 0
      ? `You are ${formatRevenueGoalDisplay(revenueGoal)} away from completing your assortment plan`
      : goalMillions && plannedRevM >= goalMillions
        ? "Your assortment plan meets the revenue goal 🎉"
        : goalMillions
          ? `$${Math.max(goalMillions - plannedRevM, 0).toFixed(1)}M away from completing your assortment plan`
          : "";

  const { activeItems, gridConfig } = useMemo(() => {
    const raw = getTreemapLevelItems(treemapRoot, drillPath).map(nodeToTreemapItem);
    const filtered =
      drillPath.length > 0
        ? raw
        : raw.filter(
            (item) => !item.categoryId || selectedCategoryIds.includes(item.categoryId),
          );

    if (drillPath.length > 0) {
      return {
        activeItems: filtered,
        gridConfig: getTreemapGridConfig(treemapRoot, drillPath),
      };
    }

    if (filtered.length === treemapRoot.children.length) {
      return {
        activeItems: filtered,
        gridConfig: getTreemapGridConfig(treemapRoot, []),
      };
    }

    const laidOut = layoutTreemapItems(filtered);
    return {
      activeItems: laidOut.items,
      gridConfig: laidOut.gridConfig,
    };
  }, [treemapRoot, drillPath, selectedCategoryIds]);

  const breadcrumbLabels = useMemo(
    () => getTreemapBreadcrumbLabels(treemapRoot, drillPath),
    [treemapRoot, drillPath],
  );

  const drawerItems = useMemo(() => {
    if (!drawerCategory) return [];
    return getGapItemsByCategory(drawerCategory).map((item) => ({
      ...item,
      inPlan: planItems.includes(item.name),
    }));
  }, [drawerCategory, planItems]);

  function handleViewGapsFromTooltip(item: TreemapItem) {
    const category = item.opensDrawer ?? item.label;
    setDrawerCategory(category);
    setSelectedId(item.id);
  }

  function handleBeaconAddToPlan(items: Array<{ name: string; revenueM: number }>) {
    guardedAdd(() => {
      for (const { name, revenueM } of items) addPlanItem(name, revenueM);
    });
  }

  function handleTreemapSelect(item: TreemapItem) {
    if (item.opensDrawer && !(item.children?.length ?? 0)) {
      setDrawerCategory(item.opensDrawer);
      setSelectedId(item.id);
      return;
    }

    if ((item.children?.length ?? 0) > 0) {
      setDrillPath((prev) => [...prev, item.id]);
      setSelectedId(item.id);
      setDrawerCategory(null);
      return;
    }

    if (item.opensDrawer) {
      setDrawerCategory(item.opensDrawer);
      setSelectedId(item.id);
      return;
    }

    setSelectedId(selectedId === item.id ? null : item.id);
  }

  function handleBreadcrumbNavigate(index: number) {
    if (index < 0) {
      setDrillPath([]);
    } else {
      setDrillPath((prev) => prev.slice(0, index + 1));
    }
    setSelectedId(null);
    setDrawerCategory(null);
  }

  return (
    <>
      <PageHeader
        title="Assortment Gap Analysis"
        breadcrumbs={[
          { label: "Acquisition & Onboarding", href: "/dashboard" },
          { label: "Assortment Gap Analysis" },
        ]}
        actions={
          <>
            <CategoryMultiSelectFilter
              categories={categoryOptions}
              selectedIds={selectedCategoryIds}
              onChange={setSelectedCategoryIds}
              align="end"
              className="[&>button]:h-9 [&>button]:bg-[var(--color-card)] [&>button]:px-3"
            />
            <Button variant="secondary" size="icon" aria-label="Open assortment calendar" asChild>
              <Link href="/assortment/plan">
                <Calendar className="h-4 w-4" />
              </Link>
            </Button>
          </>
        }
      />

      <AssortmentAnalysisBanner lastUpdatedLabel={lastUpdatedLabel} />

      <RevenueGoalPanel
        revenueOpportunity={filteredRevenueOpportunity}
        planItemCount={planItems.length}
        planItemNames={planItems}
        onAddToPlan={handleBeaconAddToPlan}
        onRemoveFromPlan={(name) => removePlanItem(name)}
        onBeaconDrawerOpen={() => {
          setDrawerCategory(null);
          setSelectedId(null);
        }}
      />

      <CategoryTreemap
        items={activeItems}
        selectedId={selectedId}
        onSelect={handleTreemapSelect}
        onViewGaps={handleViewGapsFromTooltip}
        breadcrumbLabels={breadcrumbLabels}
        onBreadcrumbNavigate={handleBreadcrumbNavigate}
        gridConfig={gridConfig}
        competitors={competitors}
        className="mb-[var(--space-4)]"
      />

      <MissingProductsTable
        key={selectedCategoryIds.join(",")}
        products={filteredProducts}
        planItems={planItems}
        onAddToPlan={(name, revenueM) => guardedAdd(() => addPlanItem(name, revenueM))}
      />

      {showNoGoalModal && (
        <NoGoalModal
          revenueOpportunity={filteredRevenueOpportunity}
          onUseOpportunity={handleUseOpportunity}
          onSetManually={handleSetManually}
          onClose={() => { setShowNoGoalModal(false); pendingAddRef.current = null; }}
        />
      )}

      {drawerCategory && (
        <GapsDrawer
          category={drawerCategory}
          gapCount={drawerItems.length}
          items={drawerItems}
          revenueGoal={revenueGoalStr}
          revenuePlanned={revenuePlannedStr}
          revenuePlannedPercent={plannedPct}
          plannedMessage={plannedMessage}
          onClose={() => {
            setDrawerCategory(null);
            setSelectedId(null);
          }}
          onAddToPlan={(id) => {
            const item = drawerItems.find((g) => g.id === id);
            if (item) {
              const revM = parseFloat(item.estimatedRevenue.replace(/[^0-9.]/g, "")) || 0;
              guardedAdd(() => addPlanItem(item.name, revM));
            }
          }}
          onRemoveFromPlan={(id) => {
            const item = drawerItems.find((g) => g.id === id);
            if (item) removePlanItem(item.name);
          }}
        />
      )}
    </>
  );
}
