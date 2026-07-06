import fs from "fs";
import path from "path";

import type { TreemapHierarchyRoot } from "@/lib/mock-data/treemap-hierarchy";

const DEFAULT_ROOT: TreemapHierarchyRoot = {
  id: "root",
  label: "All Categories",
  gridConfig: { columns: 5, rowTemplate: "1.2fr 1fr 0.8fr" },
  children: [],
};

export function loadTreemapHierarchy(): TreemapHierarchyRoot {
  const filePath = path.join(process.cwd(), "mock/business/treemap_hierarchy.json");
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8")) as TreemapHierarchyRoot;
  } catch {
    return DEFAULT_ROOT;
  }
}
