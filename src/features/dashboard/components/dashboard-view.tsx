"use client";

import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";

import { DashboardKpiCard } from "@/components/data-display/dashboard-kpi-card";
import type { DashboardMetric } from "@/services/analytics.service";
import { DonutChart } from "@/components/data-display/donut-chart";
import { GapBarChart } from "@/components/data-display/gap-bar-chart";
import { HolidayBanner } from "@/components/data-display/holiday-banner";
import { PipelineHeatmap } from "@/components/data-display/pipeline-heatmap";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

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
            <Button variant="ghost" size="icon" aria-label="Open assortment calendar" asChild>
              <Link href="/assortment/plan">
                <Calendar className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/assortment/gap">
                Assortment Gap Analysis
                <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
            <Button variant="outline" size="sm">
              Lead Discovery
              <ArrowRight className="h-3 w-3" />
            </Button>
          </>
        }
      />

      <HolidayBanner />

      <section
        aria-label="Key metrics"
        className="mb-[var(--space-4)] grid gap-[var(--space-3)] sm:grid-cols-2 xl:grid-cols-4"
      >
        {metrics.map((metric) => (
          <DashboardKpiCard key={metric.label} metric={metric} />
        ))}
      </section>

      <section className="mb-[var(--space-4)] grid gap-[var(--space-4)] lg:grid-cols-2">
        <DonutChart title="Industry Sales & Contribution" total="$48B" segments={industrySegments} />
        <GapBarChart data={gapBarData} />
      </section>

      <PipelineHeatmap columns={pipeline.columns} rows={pipeline.rows} />
    </>
  );
}
