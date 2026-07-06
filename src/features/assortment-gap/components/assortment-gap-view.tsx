"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Calendar } from "lucide-react";

import { AssortmentAnalysisBanner } from "@/components/data-display/assortment-analysis-banner";
import {
  CategoryTreemap,
  type TreemapItem,
} from "@/components/data-display/category-treemap";
import { GapsDrawer, type GapItem } from "@/components/data-display/gaps-drawer";
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

interface AssortmentGapViewProps {
  lastUpdatedLabel: string;
  revenueOpportunity: string;
  selectedCategoryCount: number;
  competitors: string[];
  treemapRoot: TreemapHierarchyRoot;
  servewareGapItems: GapItem[];
  beaconRecommendedItems: GapItem[];
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
  servewareGapItems,
  beaconRecommendedItems,
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

  const drawerItems = useMemo(
    () =>
      servewareGapItems.map((item) => ({
        ...item,
        inPlan: planItems.includes(item.name),
      })),
    [servewareGapItems, planItems],
  );

  const revenuePlannedPercent = Math.min(planItems.length * 2, 100);
  const plannedRevenue = planItems.length > 0 ? `$${(planItems.length * 1.6).toFixed(1)}M` : "$0M";

  function handleViewGapsFromTooltip(item: TreemapItem) {
    const category = item.opensDrawer ?? item.label;
    setDrawerCategory(category);
    setSelectedId(item.id);
  }

  function handleBeaconAddToPlan(itemIds: string[], items: GapItem[]) {
    for (const id of itemIds) {
      const entry = items.find((item) => item.id === id);
      if (entry) addPlanItem(entry.name);
    }
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
        revenuePlannedPercent={revenuePlannedPercent}
        plannedMessage={
          planItems.length > 0
            ? `You are $${(50 - planItems.length * 1.6).toFixed(1)}M away from completing your assortment plan`
            : "You are $50.0M away from completing your assortment plan"
        }
        beaconRecommendedItems={beaconRecommendedItems}
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
          gapCount={23}
          items={drawerItems}
          revenueGoal="$50.0M"
          revenuePlanned={plannedRevenue}
          revenuePlannedPercent={revenuePlannedPercent}
          plannedMessage={
            planItems.length > 0
              ? `You are $${(50 - planItems.length * 1.6).toFixed(1)}M away from completing your assortment plan`
              : "You are $50.0M away from completing your assortment plan"
          }
          onClose={() => {
            setDrawerCategory(null);
            setSelectedId(null);
          }}
          onAddToPlan={(id) => {
            const item = servewareGapItems.find((g) => g.id === id);
            if (item) addPlanItem(item.name);
          }}
          onRemoveFromPlan={(id) => {
            const item = servewareGapItems.find((g) => g.id === id);
            if (item) removePlanItem(item.name);
          }}
        />
      )}
    </>
  );
}
