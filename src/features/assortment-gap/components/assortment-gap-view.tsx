"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { Calendar } from "lucide-react";

import {
  CategoryTreemap,
  TreemapTooltip,
  type TreemapItem,
} from "@/components/data-display/category-treemap";
import { GapsDrawer, type GapItem } from "@/components/data-display/gaps-drawer";
import { MissingProductsTable, type MissingProduct } from "@/components/data-display/missing-products-table";
import { RevenueGoalPanel } from "@/components/data-display/revenue-goal-panel";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { usePlanStore } from "@/features/assortment-plan/store/plan-store";

interface AssortmentGapViewProps {
  treemapItems: TreemapItem[];
  kitchenSubcategories: TreemapItem[];
  servewareGapItems: GapItem[];
  products: MissingProduct[];
}

export function AssortmentGapView({
  treemapItems,
  kitchenSubcategories,
  servewareGapItems,
  products,
}: AssortmentGapViewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<import("@/components/data-display/category-treemap").TreemapItem | null>(null);
  const [drillDown, setDrillDown] = useState(false);
  const [drawerCategory, setDrawerCategory] = useState<string | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const planItems = usePlanStore((state) => state.planItems);
  const addPlanItem = usePlanStore((state) => state.addPlanItem);
  const removePlanItem = usePlanStore((state) => state.removePlanItem);

  const activeItems = drillDown ? kitchenSubcategories : treemapItems;
  const selectedItem = activeItems.find((item) => item.id === selectedId) ?? null;

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

  function cancelHide() {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }

  function scheduleHide() {
    hideTimerRef.current = setTimeout(() => setHoveredItem(null), 200);
  }

  function handleTileHover(item: TreemapItem | null) {
    if (item) {
      cancelHide();
      setHoveredItem(item);
    } else {
      scheduleHide();
    }
  }

  function handleTreemapSelect(item: TreemapItem) {
    if (item.opensDrawer) {
      setDrawerCategory(item.opensDrawer);
      setSelectedId(item.id);
      return;
    }
    if (item.drillDown) {
      setDrillDown(true);
      setSelectedId(item.id);
      return;
    }
    setSelectedId(selectedId === item.id ? null : item.id);
  }

  function handleViewGaps() {
    const target = hoveredItem ?? selectedItem;
    if (!target) return;
    const category = target.opensDrawer ?? target.label;
    setDrawerCategory(category);
    setHoveredItem(null);
  }

  function handleBack() {
    setDrillDown(false);
    setSelectedId(null);
    setHoveredItem(null);
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
          <Button variant="ghost" size="icon" aria-label="Open assortment calendar" asChild>
            <Link href="/assortment/plan">
              <Calendar className="h-4 w-4" />
            </Link>
          </Button>
        }
      />

      <RevenueGoalPanel
        revenueOpportunity="$52.8M"
        revenueGoal="$50.0M"
        revenuePlannedPercent={revenuePlannedPercent}
        plannedMessage={
          planItems.length > 0
            ? `You are $${(50 - planItems.length * 1.6).toFixed(1)}M away from completing your assortment plan`
            : "You are $50.0M away from completing your assortment plan"
        }
        assortmentPlanMessage={
          planItems.length > 0
            ? undefined
            : "You haven't added any item types to your assortment plan"
        }
        planItems={planItems}
        showCreatePlan={planItems.length === 0}
        showGenerateCalendar={planItems.length > 0}
      />

      <div className="relative mb-[var(--space-4)]">
        <CategoryTreemap
          items={activeItems}
          selectedId={selectedId}
          hoveredId={hoveredItem?.id ?? null}
          onSelect={handleTreemapSelect}
          onHover={handleTileHover}
          breadcrumb={drillDown ? "Kitchen & Dining" : undefined}
          onBack={drillDown ? handleBack : undefined}
        />
        {hoveredItem?.revenue && !drawerCategory && (
          <TreemapTooltip
            item={hoveredItem}
            onViewGaps={handleViewGaps}
            onMouseEnter={cancelHide}
            onMouseLeave={scheduleHide}
          />
        )}
      </div>

      <MissingProductsTable
        products={products}
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
