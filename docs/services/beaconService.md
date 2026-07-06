# beaconService

## Purpose
Coordinate contextual AI requests and merge outputs from the autonomous agents into a single intelligent layer for the UI.

## Responsibilities
- Build context for the correct agent based on the current page and entity.
- Route requests to the appropriate agent.
- Merge multiple agent outputs when a request spans multiple workflows.
- Return a business-friendly response structure for the UI.
- Preserve traceability for AI recommendations.

## Inputs
- current page
- current user role
- selected entity
- workflow state
- assortment context
- lead context
- application context
- onboarding context
- conversation history

## Outputs
- structured AI response
- summary
- recommendations
- confidence
- supporting evidence
- next actions
- agent trace metadata

## Key operations
- buildBeaconContext()
- routeToAgent(intent)
- callSingleAgent(agentName, context)
- callMultiAgentWorkflow(intent, context)
- combineAgentResponses(responses)
- formatBeaconResponse(output)
- storeAgentTrace()

## Business rules
- Beacon does not make business decisions.
- Beacon only orchestrates and summarizes.
- Beacon must keep recommendations explainable.
- Beacon must not bypass workflow rules.
- Beacon should use page context to reduce irrelevant outputs.

## Dependencies
- all domain services
- all autonomous agents
- workflowService

## Success criteria
- The user receives relevant, contextual AI assistance.
- The UI can show concise recommendations and evidence.
- The system can trace which agent produced which insight.
