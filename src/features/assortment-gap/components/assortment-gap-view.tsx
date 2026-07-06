"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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
import { usePlanStore } from "@/features/assortment-plan/store/plan-store";
import {
  getTreemapBreadcrumbLabels,
  getTreemapGridConfig,
  getTreemapLevelItems,
  type TreemapHierarchyRoot,
  type TreemapNode,
} from "@/lib/mock-data/treemap-hierarchy";
import { getGapItemsByCategory } from "@/lib/mock-data/gap-items-catalog";

interface AssortmentGapViewProps {
  lastUpdatedLabel: string;
  revenueOpportunity: string;
  selectedCategoryCount: number;
  competitors: string[];
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
    opensDrawer: node.opensDrawer,
    children: node.children,
  };
}

export function AssortmentGapView({
  lastUpdatedLabel,
  revenueOpportunity,
  selectedCategoryCount,
  competitors,
  treemapRoot,
  products,
}: AssortmentGapViewProps) {
  const [drillPath, setDrillPath] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawerCategory, setDrawerCategory] = useState<string | null>(null);

  const planItems = usePlanStore((state) => state.planItems);
  const addPlanItem = usePlanStore((state) => state.addPlanItem);
  const removePlanItem = usePlanStore((state) => state.removePlanItem);

  const activeItems = useMemo(
    () => getTreemapLevelItems(treemapRoot, drillPath).map(nodeToTreemapItem),
    [treemapRoot, drillPath],
  );

  const gridConfig = useMemo(
    () => getTreemapGridConfig(treemapRoot, drillPath),
    [treemapRoot, drillPath],
  );

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
    for (const { name, revenueM } of items) addPlanItem(name, revenueM);
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
          <Button variant="secondary" size="icon" aria-label="Open assortment calendar" asChild>
            <Link href="/assortment/plan">
              <Calendar className="h-4 w-4" />
            </Link>
          </Button>
        }
      />

      <AssortmentAnalysisBanner lastUpdatedLabel={lastUpdatedLabel} />

      <RevenueGoalPanel
        revenueOpportunity={revenueOpportunity}
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
        selectedCategoryCount={selectedCategoryCount}
        competitors={competitors}
        className="mb-[var(--space-4)]"
      />

      <MissingProductsTable
        products={products}
        totalCount={products.length}
        onAddToPlan={(name) => addPlanItem(name)}
      />

      {drawerCategory && (
        <GapsDrawer
          category={drawerCategory}
          gapCount={drawerItems.length}
          items={drawerItems}
          revenueGoal="$50.0M"
          revenuePlanned="$0M"
          revenuePlannedPercent={0}
          plannedMessage=""
          onClose={() => {
            setDrawerCategory(null);
            setSelectedId(null);
          }}
          onAddToPlan={(id) => {
            const item = drawerItems.find((g) => g.id === id);
            if (item) {
              const revM = parseFloat(item.estimatedRevenue.replace(/[^0-9.]/g, "")) || 0;
              addPlanItem(item.name, revM);
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
