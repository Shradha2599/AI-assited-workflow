# sharedServices

## Purpose
Provide reusable helpers that are used across multiple services.

## Typical responsibilities
- format dates
- format currency
- map status labels
- calculate percentages
- normalize confidence values
- build table-safe objects
- convert raw repository data into UI-ready data

## Useful operations
- formatCurrency()
- formatPercentage()
- formatDate()
- getStatusBadgeVariant()
- normalizeConfidence()
- computeProgress()
- computeOpportunityScore()
- mapWorkflowStatus()

## Business rules
- Keep helpers deterministic.
- Do not call AI from shared helpers.
- Do not access UI state directly.
- Keep logic reusable and small.

## Dependencies
- none or very few
