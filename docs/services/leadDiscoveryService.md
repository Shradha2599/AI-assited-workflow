# leadDiscoveryService

## Purpose
Prepare seller discovery data for Acquisition Managers and coordinate lead ranking and shortlist preparation.

## Responsibilities
- Load leads, seller profiles, outreach history, and assortment plans.
- Match sellers against assortment requirements.
- Prepare lead-ranking inputs for the Discovery Agent.
- Build shortlist-ready seller objects.
- Prepare outreach-ready communication context.
- Supply page data for tables, drawers, and filters.

## Inputs
- leads
- seller profiles
- assortment plan context
- source intelligence
- communication history
- comments
- activity log
- search and filter criteria

## Outputs
- ranked lead list
- shortlist list
- seller detail bundle
- outreach context bundle
- AI context payload
- filterable table data

## Key operations
- getLeadDiscoveryOverview()
- getRankedLeads()
- getLeadById(leadId)
- filterLeads(filters)
- shortlistLead(leadId)
- removeFromShortlist(leadId)
- buildDiscoveryAgentContext(planId)
- buildOutreachContext(leadId)
- prepareLeadDrawerData(leadId)

## Business rules
- A lead can only be ranked relative to a current assortment requirement.
- Shortlisting should update workflow state only through the workflow service.
- Outreach-ready data should include company summary, fit rationale, and contact context.
- Do not hardcode confidence scores in the service if the agent is responsible for generating them.

## Dependencies
- repositories for leads and seller profiles
- assortmentService
- Discovery Agent
- Outreach Agent
- workflowService

## Success criteria
- The Acquisition Manager can identify good sellers quickly.
- The UI can show ranked leads and seller details.
- Beacon can explain why a seller is recommended.
