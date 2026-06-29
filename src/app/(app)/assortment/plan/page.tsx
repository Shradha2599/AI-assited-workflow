import { AssortmentPlanView } from "@/features/assortment-plan/components/assortment-plan-view";
import { getPlanItemTypes } from "@/services/analytics.service";

export default async function AssortmentPlanPage() {
  const defaultItemTypes = await getPlanItemTypes();
  return <AssortmentPlanView defaultItemTypes={defaultItemTypes} />;
}
