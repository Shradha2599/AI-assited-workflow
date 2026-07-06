import { AssortmentGapView } from "@/features/assortment-gap/components/assortment-gap-view";
import { getAssortmentGapAnalysis } from "@/lib/mock-data/assortment-gap";

export default async function AssortmentGapPage() {
  const analysis = await getAssortmentGapAnalysis();

  return (
    <AssortmentGapView
      lastUpdatedLabel={analysis.lastUpdatedLabel}
      revenueOpportunity={analysis.revenueOpportunity}
      selectedCategoryCount={analysis.selectedCategoryCount}
      competitors={analysis.competitors}
      treemapRoot={analysis.treemapRoot}
      products={analysis.missingProducts}
    />
  );
}
