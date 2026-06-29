import { AssortmentGapView } from "@/features/assortment-gap/components/assortment-gap-view";
import {
  getKitchenSubcategories,
  getMissingProducts,
  getServewareGapItems,
  getTreemapItems,
} from "@/services/analytics.service";

export default async function AssortmentGapPage() {
  const [treemapItems, kitchenSubcategories, servewareGapItems, products] =
    await Promise.all([
      getTreemapItems(),
      getKitchenSubcategories(),
      getServewareGapItems(),
      getMissingProducts(),
    ]);

  return (
    <AssortmentGapView
      treemapItems={treemapItems}
      kitchenSubcategories={kitchenSubcategories}
      servewareGapItems={servewareGapItems}
      products={products}
    />
  );
}
