import fs from "fs";
import path from "path";

export interface TargetCategory {
  id: string;
  name: string;
  businessUnit: string;
  annualRevenue: number;
  growthRate: number;
  assortmentGapScore: number;
  priority: "High" | "Medium" | "Low";
  seasonality: string;
  categoryManager: string;
}

export function loadTargetCategories(): TargetCategory[] {
  const filePath = path.join(process.cwd(), "mock/target/categories.json");
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as TargetCategory[];
}
