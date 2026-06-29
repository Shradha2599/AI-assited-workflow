import { DashboardView } from "@/features/dashboard/components/dashboard-view";
import {
  getDashboardMetrics,
  getGapBarData,
  getIndustrySegments,
  getPipelineData,
} from "@/services/analytics.service";

export default async function DashboardPage() {
  const [metrics, industrySegments, gapBarData, pipeline] = await Promise.all([
    getDashboardMetrics(),
    getIndustrySegments(),
    getGapBarData(),
    getPipelineData(),
  ]);

  return (
    <DashboardView
      metrics={metrics}
      industrySegments={industrySegments}
      gapBarData={gapBarData}
      pipeline={pipeline}
    />
  );
}
