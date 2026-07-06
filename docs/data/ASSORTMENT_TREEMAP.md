# Assortment Treemap Hierarchy

Structured category tree used by the **Assortment Gap Analysis** treemap and the **Assortment Intelligence Agent**.

## Source file

`mock/business/treemap_hierarchy.json`

## Structure

```json
{
  "id": "root",
  "label": "All Categories",
  "gridConfig": { "columns": 5, "rowTemplate": "1.2fr 1fr 0.8fr" },
  "children": [
    {
      "id": "kitchen",
      "categoryId": "cat_kitchen_dining",
      "label": "Kitchen & Dining",
      "lag": "high",
      "revenue": "$22.8M",
      "gapPercent": "35%",
      "children": [ "...subcategories..." ]
    }
  ]
}
```

## Node fields

| Field | Purpose |
|-------|---------|
| `id` | Unique node id for drill-down navigation |
| `label` | Display name on treemap tile |
| `lag` | Color band: `high`, `medium-high`, `medium`, `low`, `par`, `ahead` |
| `gridArea` | CSS grid placement within the current level |
| `revenue` | Revenue opportunity shown in hover tooltip |
| `gapPercent` | Competitor lag vs Target |
| `competitorLeader` | Leading competitor for this node |
| `categoryId` | Links to `mock/target/categories.json` |
| `opensDrawer` | Opens item-type gaps drawer (e.g. Serveware) |
| `children` | Next drill-down level; empty/absent = leaf tile |
| `gridConfig` | Column count and row template for this level |

## Drill-down levels

1. **All Categories** — 7 top-level categories (Kitchen & Dining, Outdoor Living, Holiday, Lighting, Furniture, Party Supplies, Rugs)
2. **Category subcategories** — e.g. Kitchen & Dining → Serveware, Bakeware, Cookware, etc.
3. **Leaf tiles** — open gaps drawer when `opensDrawer` is set

## Breadcrumb format

`All Categories / {Selected Category}`

Example: `All Categories / Kitchen & Dining`

## Agent usage

- Load via `loadTreemapHierarchy()` in `src/lib/mock-data/treemap-hierarchy.ts`
- Summarize for Beacon with `buildTreemapAgentSummary(root, depth)`
- Cross-reference `categoryId` with `mock/target/categories.json` and `mock/target/item_types.json`

## Related mock data

- `mock/business/assortment_gap_analysis.json` — page summary, missing products, beacon recommendations
- `mock/target/categories.json` — category KPIs
- `mock/target/item_types.json` — item-type opportunities
