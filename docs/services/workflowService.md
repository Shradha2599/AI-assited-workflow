# workflowService

## Purpose
Own the lifecycle rules, status transitions, and activity logging for the Target Plus workflow.

## Responsibilities
- Enforce allowed transitions for leads, applications, and partners.
- Map business actions to workflow status changes.
- Log activities for all major events.
- Maintain a consistent source of truth for state changes.
- Provide status helpers to pages and services.

## Inputs
- entity type
- entity id
- current status
- requested action
- actor
- timestamp

## Outputs
- updated status
- transition result
- validation message
- activity log entry
- state summary

## Key operations
- canTransition(fromStatus, toStatus)
- getNextAllowedActions(entityType, status)
- transitionLeadStatus(leadId, action)
- transitionApplicationStatus(applicationId, action)
- transitionPartnerStatus(partnerId, action)
- logActivity(event)
- getStatusLabel(entityType, status)
- getWorkflowSummary()

## Allowed lifecycle
Lead:
Discovered → Shortlisted → Contacted → New → In Review → Approved → Onboarding → Established

Review outcomes:
Approved / Rejected / Future Interest

## Business rules
- Do not allow invalid transitions.
- Do not skip lifecycle states.
- Approved means onboarding-ready, not yet started.
- Onboarding begins only when the first onboarding task starts.
- Established requires all onboarding tasks to be complete.
- Every significant action should create an activity record.

## Dependencies
- repositories for workflow and activity data
- all domain services that trigger state changes

## Success criteria
- The app always reflects valid states.
- Users never see impossible transitions.
- The timeline remains accurate and auditable.
