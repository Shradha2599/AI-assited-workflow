# assortmentService

## Purpose
Prepare assortment planning data for the UI and the Assortment Intelligence Agent.

## Responsibilities
- Load target categories, item types, current catalog, historical sales, revenue targets, and category metrics.
- Combine Target internal data with source intelligence from external market datasets.
- Build category summaries and gap-analysis inputs.
- Prepare the context needed for the Assortment Intelligence Agent.
- Return page-ready outputs for cards, charts, tables, and calendar views.

## Inputs
- categories
- item types
- current catalog
- historical sales
- revenue targets
- category metrics
- competitor/source signals
- selected category
- selected revenue goal

## Outputs
- category summary objects
- item type opportunity lists
- gap-analysis input bundle
- launch-planning input bundle
- AI context payload
- planning summary for the page

## Key operations
- getAssortmentOverview()
- getCategoryGapSummary(categoryId)
- getItemTypeOpportunities(categoryId)
- getPlanningCalendarInput(planId)
- buildAssortmentAgentContext(categoryId)
- calculateOpportunitySignals()
- prepareAssortmentDashboardData()

## Business rules
- Use the latest category and item-type datasets as source of truth.
- Do not invent revenue numbers or gap scores in the service layer if the agent should derive them.
- Always preserve category-to-item relationships.
- Always return data in a format the page can render directly.

## Dependencies
- repositories for category, item type, catalog, and revenue datasets
- Assortment Intelligence Agent
- shared formatters and metric helpers

## Success criteria
- The user can view a clear assortment summary.
- The AI agent receives complete context.
- The UI can render planning cards, tables, and comparisons without extra transformation logic.
