import { DashboardView } from "@/features/dashboard/components/dashboard-view";
import {
  getGapBarData,
  getIndustrySegments,
  getPipelineData,
} from "@/services/analytics.service";
import { getAssortmentGapAnalysis } from "@/lib/mock-data/assortment-gap";
import { getTreemapBackedCategoryIds } from "@/lib/mock-data/assortment-gap-categories";

export default async function DashboardPage() {
  const [industrySegments, gapBarData, pipeline, analysis] = await Promise.all([
    getIndustrySegments(),
    getGapBarData(),
    getPipelineData(),
    getAssortmentGapAnalysis(),
  ]);

  const categoryOptions = analysis.categories;
  const treemapCategoryIds = getTreemapBackedCategoryIds(categoryOptions);

  return (
    <DashboardView
      industrySegments={industrySegments}
      gapBarData={gapBarData}
      pipeline={pipeline}
      treemapRoot={analysis.treemapRoot}
      categoryOptions={categoryOptions}
      defaultCategoryIds={analysis.defaultCategoryIds}
      allTaxonomyIds={analysis.allTaxonomyIds}
      taxonomyCategoryCount={analysis.taxonomyCategoryCount}
      treemapCategoryIds={treemapCategoryIds}
    />
  );
}
