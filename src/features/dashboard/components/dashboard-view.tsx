"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { DashboardKpiStrip } from "@/components/data-display/dashboard-kpi-card";
import { DonutChart } from "@/components/data-display/donut-chart";
import { GapBarChart } from "@/components/data-display/gap-bar-chart";
import { HolidayBanner } from "@/components/data-display/holiday-banner";
import { PipelineHeatmapSynced } from "@/components/data-display/pipeline-heatmap-synced";
import { CategoryMultiSelectFilter } from "@/components/data-display/category-multi-select-filter";
import { FiscalYearSelector } from "@/components/data-display/fiscal-year-selector";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { SvgIcon } from "@/components/ui/svg-icon";
import { usePlanStore } from "@/features/assortment-plan/store/plan-store";
import {
  buildDashboardMetrics,
  filterGapBarData,
  filterIndustrySegments,
  filterPipelineData,
} from "@/features/dashboard/lib/filter-dashboard-data";
import type { GapCategoryFilterOption } from "@/lib/mock-data/assortment-gap-categories";
import type { TreemapHierarchyRoot } from "@/lib/mock-data/treemap-hierarchy";

interface DashboardViewProps {
  industrySegments: Awaited<ReturnType<typeof import("@/services/analytics.service").getIndustrySegments>>;
  gapBarData: Awaited<ReturnType<typeof import("@/services/analytics.service").getGapBarData>>;
  pipeline: Awaited<ReturnType<typeof import("@/services/analytics.service").getPipelineData>>;
  treemapRoot: TreemapHierarchyRoot;
  categoryOptions: GapCategoryFilterOption[];
  defaultCategoryIds: string[];
  allTaxonomyIds: string[];
  taxonomyCategoryCount: number;
  treemapCategoryIds: string[];
}

export function DashboardView({
  industrySegments,
  gapBarData,
  pipeline,
  treemapRoot,
  categoryOptions,
  defaultCategoryIds,
  allTaxonomyIds,
  taxonomyCategoryCount,
  treemapCategoryIds,
}: DashboardViewProps) {
  const fiscalYear = usePlanStore((s) => s.fiscalYear);
  const planItems = usePlanStore((s) => s.planItems);
  const baselinePlanItems = usePlanStore((s) => s.baselinePlanItems);
  const revenueGoal = usePlanStore((s) => s.revenueGoal);

  const [appliedCategoryIds, setAppliedCategoryIds] = useState(defaultCategoryIds);

  const metrics = useMemo(
    () =>
      buildDashboardMetrics({
        fiscalYear,
        planItemCount: planItems.length,
        baselinePlanItemCount: baselinePlanItems.length,
        revenueGoal,
        selectedCategoryIds: appliedCategoryIds,
        categoryOptions,
        treemapRoot,
      }),
    [fiscalYear, planItems.length, baselinePlanItems.length, revenueGoal, appliedCategoryIds, categoryOptions, treemapRoot],
  );

  const industry = useMemo(
    () =>
      filterIndustrySegments(
        industrySegments,
        fiscalYear,
        appliedCategoryIds,
        categoryOptions,
        treemapRoot,
      ),
    [industrySegments, fiscalYear, appliedCategoryIds, categoryOptions, treemapRoot],
  );

  const gapData = useMemo(
    () =>
      filterGapBarData(
        gapBarData,
        treemapRoot,
        fiscalYear,
        appliedCategoryIds,
        categoryOptions,
      ),
    [gapBarData, treemapRoot, fiscalYear, appliedCategoryIds, categoryOptions],
  );

  const filteredPipeline = useMemo(
    () =>
      filterPipelineData(pipeline, treemapRoot, appliedCategoryIds, categoryOptions),
    [pipeline, treemapRoot, appliedCategoryIds, categoryOptions],
  );

  return (
    <>
      <PageHeader
        title="Acquisition & Onboarding Dashboard"
        breadcrumbs={[
          { label: "Acquisition & Onboarding", href: "/dashboard" },
          { label: "Dashboard" },
        ]}
        actions={
          <>
            <Button variant="outline" size="sm" className="h-7 w-7 px-0" aria-label="Open assortment calendar" asChild>
              <Link href="/assortment/plan">
                <SvgIcon name="calendar" size={16} className="icon-tint-primary" />
              </Link>
            </Button>
            <FiscalYearSelector />
            <CategoryMultiSelectFilter
              categories={categoryOptions}
              selectedIds={appliedCategoryIds}
              onApply={setAppliedCategoryIds}
              allTaxonomyIds={allTaxonomyIds}
              taxonomyCategoryCount={taxonomyCategoryCount}
              treemapCategoryIds={treemapCategoryIds}
              align="end"
            />
          </>
        }
      />

      <HolidayBanner />

      <section aria-label="Key metrics" className="mb-[var(--space-4)]">
        <DashboardKpiStrip metrics={metrics} />
      </section>

      <section aria-label="Pipeline" className="mb-[var(--space-4)]">
        <PipelineHeatmapSynced baseline={filteredPipeline} showHeaderFilters={false} />
      </section>

      <section className="mb-[var(--space-4)] grid min-w-0 items-stretch gap-[var(--space-4)] lg:grid-cols-2 lg:min-h-[320px]">
        <DonutChart
          title="Industry Sales & Contribution"
          total={industry.total}
          segments={industry.segments}
          showFilter={false}
          className="h-full"
        />
        <GapBarChart data={gapData} showFilter={false} className="h-full" />
      </section>
    </>
  );
}
