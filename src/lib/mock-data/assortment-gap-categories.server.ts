import fs from "fs";
import path from "path";

import type { AssortmentGapCategory } from "@/lib/mock-data/assortment-gap-categories";

export function loadAssortmentGapCategories(): AssortmentGapCategory[] {
  const filePath = path.join(process.cwd(), "mock/business/assortment_gap_categories.json");
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as AssortmentGapCategory[];
}
