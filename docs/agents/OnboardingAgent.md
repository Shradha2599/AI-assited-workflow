# Onboarding Agent

## Purpose
The Onboarding Agent tracks onboarding progress, identifies blockers, and helps move approved sellers from onboarding-ready to established.

## Business objective
Reduce onboarding delays and provide clear next-step guidance until the partner is fully established.

## Primary questions it answers
- What is blocking onboarding?
- Which task should be completed next?
- Which documents are still missing?
- How far along is the partner?
- Is the partner ready to become established?

## Inputs
- partner data
- onboarding tasks
- task dependencies
- document status
- email history
- progress history
- workflow state
- blocker notes

## Outputs
- progress summary
- blocker summary
- task prioritization
- reminder suggestions
- next-step recommendation
- onboarding risk indicators

## Reasoning approach
1. Review the partner's onboarding stage.
2. Check task completion and dependencies.
3. Identify blockers and overdue items.
4. Determine the best next action.
5. Recommend reminders or escalation if needed.

## Business rules
- A partner cannot be established before onboarding is complete.
- Blockers must be visible to the user.
- Reminder suggestions should be based on task state.
- The agent should not force completion of tasks.
- Workflow state changes must follow business rules.

## Trigger events
- partner enters onboarding
- task status changes
- document is missing or overdue
- user requests onboarding summary
- Beacon routes onboarding question

## Interactions
- receives approved partner data from review flow
- logs progress through workflow services
- generates reminder guidance through Outreach Agent
- shares current status with Beacon

## Success criteria
- Users can see progress clearly.
- Blockers are obvious.
- The next step is always clear.
- The partner moves toward established status without manual confusion.
