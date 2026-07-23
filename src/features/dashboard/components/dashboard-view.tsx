"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { DashboardKpiStrip } from "@/components/data-display/dashboard-kpi-card";
import type { DashboardMetric } from "@/services/analytics.service";
import { DonutChart } from "@/components/data-display/donut-chart";
import { GapBarChart } from "@/components/data-display/gap-bar-chart";
import { HolidayBanner } from "@/components/data-display/holiday-banner";
import { PipelineHeatmapSynced } from "@/components/data-display/pipeline-heatmap-synced";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { SvgIcon } from "@/components/ui/svg-icon";

interface DashboardViewProps {
  metrics: DashboardMetric[];
  industrySegments: Awaited<ReturnType<typeof import("@/services/analytics.service").getIndustrySegments>>;
  gapBarData: Awaited<ReturnType<typeof import("@/services/analytics.service").getGapBarData>>;
  pipeline: Awaited<ReturnType<typeof import("@/services/analytics.service").getPipelineData>>;
}

export function DashboardView({
  metrics,
  industrySegments,
  gapBarData,
  pipeline,
}: DashboardViewProps) {
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
            <Button variant="outline" size="sm" asChild>
              <Link href="/assortment/gap">
                Assortment Gap Analysis
                <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/sellers/discovery">
                Lead Discovery
                <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </>
        }
      />

      <HolidayBanner />

      <section aria-label="Key metrics" className="mb-[var(--space-4)]">
        <DashboardKpiStrip metrics={metrics} />
      </section>

      <section className="mb-[var(--space-4)] grid min-w-0 items-stretch gap-[var(--space-4)] lg:grid-cols-2 lg:min-h-[320px]">
        <DonutChart
          title="Industry Sales & Contribution"
          total="$48B"
          segments={industrySegments}
          filterLabel="Categories (1)"
          className="h-full"
        />
        <GapBarChart data={gapBarData} filterLabel="Categories (1)" className="h-full" />
      </section>

      <PipelineHeatmapSynced
        baseline={pipeline}
        categoryFilterLabel="Categories (1)"
      />
    </>
  );
}
