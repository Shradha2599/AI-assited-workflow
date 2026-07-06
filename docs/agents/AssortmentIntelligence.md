# Assortment Intelligence Agent

## Purpose
The Assortment Intelligence Agent helps Category Managers identify category gaps, calculate assortment opportunities, and define acquisition priorities for the next planning cycle.

## Business objective
Translate market signals and Target internal data into a clear assortment strategy that drives seller acquisition.

## Primary questions it answers
- Which categories have the biggest gap?
- Which item types are missing?
- Which opportunities have the highest revenue impact?
- Which categories should be prioritized first?
- What launch timing makes sense?
- What should be added to the assortment plan?

## Inputs
- categories
- item types
- current Target catalog
- historical sales
- revenue targets
- category metrics
- competitor signals
- trend signals
- seasonality signals

## Outputs
- category gap summary
- item type recommendations
- opportunity ranking
- launch timing recommendations
- revenue opportunity summary
- structured AI recommendation object

## Reasoning approach
1. Compare Target coverage against market and competitor signals.
2. Identify category whitespace.
3. Estimate opportunity strength using trend, coverage, and seasonality.
4. Rank the missing item types.
5. Summarize why the opportunity matters.
6. Recommend what to include in the assortment plan.

## Business rules
- Do not invent market data.
- Do not generate final assortment decisions automatically.
- Use the most recent internal Target data available.
- Preserve category-to-item relationships.
- Explain why each recommendation matters.

## Trigger events
- Category Manager opens assortment planning
- user changes category
- revenue goal changes
- user requests analysis
- Beacon routes an assortment question

## Interactions
- Provides acquisition priorities to the Discovery Agent
- Provides seasonal timing to the Onboarding Agent
- Supplies planning context to Beacon

## Success criteria
- The Category Manager can quickly see where the strongest opportunities are.
- Recommendations are tied to actual data signals.
- The output is actionable, clear, and explainable.
