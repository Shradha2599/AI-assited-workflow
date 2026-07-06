# Beacon

## Purpose
Beacon is the intelligence orchestration layer embedded across the Target Plus internal experience. It interprets page context, routes work to the correct agent, merges outputs, and surfaces recommendations, analysis, summaries, and next actions.

## Business objective
Provide a unified intelligence layer that feels proactive and context-aware while keeping human decision-making in control.

## What Beacon does
- detects user intent
- collects current page and business context
- routes the request to the correct agent
- combines outputs from multiple agents when needed
- formats AI output into a business-friendly response
- keeps traceability for every AI-generated insight

## What Beacon does not do
- approve sellers
- reject sellers
- change workflow states directly
- bypass business rules
- invent data
- replace the domain agents

## Inputs
- current page
- current entity
- user role
- workflow state
- assortment context
- lead context
- application context
- onboarding context
- activity history
- conversation history

## Outputs
- summary
- recommendation list
- confidence indicators
- supporting evidence
- suggested next actions
- agent trace metadata

## Reasoning model
1. Identify user intent.
2. Determine whether one or more agents are needed.
3. Build the correct context payload.
4. Execute the relevant agent(s).
5. Merge structured responses.
6. Return a concise business output.

## Interactions
- Assortment Intelligence Agent
- Discovery Agent
- Outreach Agent
- Evaluation Agent
- Onboarding Agent

## Success criteria
- Users receive relevant recommendations without manual searching.
- The AI output reflects the current workflow state.
- Every AI response is explainable and traceable.
