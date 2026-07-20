import {
  buildBeaconCatalogByCategory,
  selectBeaconPlanItems,
} from "@/lib/mock-data/beacon-plan-catalog";
import { loadTreemapHierarchy } from "@/lib/mock-data/treemap-hierarchy.server";

export async function POST(req: Request) {
  const body = (await req.json()) as {
    revenueGoal: string;
    existingPlanItems?: string[];
    categories?: string[] | null;
  };

  const { revenueGoal, existingPlanItems = [], categories = null } = body;

  const goalMatch = revenueGoal.match(/\$?([\d.]+)([MK]?)/i);
  const goalMillions = goalMatch
    ? goalMatch[2]?.toUpperCase() === "K"
      ? parseFloat(goalMatch[1]) / 1000
      : parseFloat(goalMatch[1])
    : 0;

  if (goalMillions <= 0) {
    return Response.json([], { status: 200 });
  }

  let availableCats = buildBeaconCatalogByCategory(loadTreemapHierarchy());

  if (Array.isArray(categories)) {
    if (categories.length === 0) {
      return Response.json([], { status: 200 });
    }
    const allowed = new Set(categories);
    availableCats = availableCats.filter(({ cat }) => allowed.has(cat));
  }

  if (availableCats.length === 0) {
    return Response.json([], { status: 200 });
  }

  const selected = selectBeaconPlanItems(availableCats, goalMillions, existingPlanItems);
  return Response.json(selected);
}
