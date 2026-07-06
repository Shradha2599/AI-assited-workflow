# onboardingService

## Purpose
Prepare partner onboarding data and support task management, progress tracking, blocker detection, and reminders.

## Responsibilities
- Load partner records, onboarding tasks, documents, emails, and comments.
- Build onboarding progress summaries.
- Identify blockers and overdue tasks.
- Prepare reminder email inputs.
- Prepare AI context for the Onboarding Agent.
- Keep partner state aligned with onboarding lifecycle rules.

## Inputs
- partners
- onboarding tasks
- documents
- email history
- comments
- activity log
- workflow status

## Outputs
- partner list data
- onboarding progress summaries
- blocker lists
- task detail bundles
- reminder email context
- AI context payload

## Key operations
- getOnboardingOverview()
- getPartnerById(partnerId)
- getPartnerProgress(partnerId)
- getTaskList(partnerId)
- getBlockedTasks(partnerId)
- completeTask(taskId)
- assignTaskOwner(taskId, owner)
- buildOnboardingAgentContext(partnerId)
- prepareReminderEmail(partnerId)

## Business rules
- A partner enters onboarding only after approval.
- Onboarding begins when the first onboarding task starts.
- Established status is reached only when all tasks are complete.
- Blockers must be visible.
- Reminder actions should log activity.

## Dependencies
- repositories for partners, tasks, documents, emails, and activities
- Onboarding Agent
- workflowService

## Success criteria
- The user can see progress clearly.
- Blockers are obvious.
- Reminders are easy to generate.
- The agent can recommend next steps accurately.
