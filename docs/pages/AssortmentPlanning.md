# Assortment Planning

## Purpose
Help Category Managers identify assortment gaps, prioritize item types, and turn market signals into a plan.

## Primary users
- Category Manager

## Business objective
Convert market evidence into a clear assortment strategy that drives acquisition priorities.

## What should be visible
- category selection
- gap analysis summary
- competitor comparison
- missing item type recommendations
- revenue opportunity
- seasonal launch timing
- plan summary
- Beacon recommendations

## Key sections
### Category gap summary
Show categories with the biggest opportunity and explain why.

### Missing item types
Show item types that should be added to the assortment plan.

### Competitor comparison
Show how Target compares with competitors by category depth and coverage.

### Revenue opportunity
Show projected revenue impact from closing the gap.

### Seasonal planning
Show the best launch quarter and kickoff timing.

### Plan summary
Show the draft assortment plan with priority item types and launch windows.

## Data needed
- target categories
- item types
- current catalog
- historical sales
- revenue targets
- category metrics
- source intelligence
- AI gap analysis
- AI calendar output
- **treemap hierarchy** — `mock/business/treemap_hierarchy.json` (see `docs/data/ASSORTMENT_TREEMAP.md`)

## Actions
- select a category
- inspect gap details
- add item type to plan
- remove item type from plan
- update revenue goal
- generate calendar
- save or share the plan

## AI behavior
The Assortment Intelligence Agent should compare market signals, identify whitespace, recommend item types, and explain the reasoning.

## States
- loading: show analysis skeletons
- empty: prompt the user to choose a category
- error: show source-data unavailable message

## Success criteria
The user can clearly see:
- which category has the highest opportunity
- which item types matter most
- what launch timing makes sense
