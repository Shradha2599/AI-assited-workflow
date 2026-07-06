# Dashboard

## Purpose
Provide a single place to understand acquisition and onboarding health across the program.

## Primary users
- Category Manager
- Acquisition Manager
- Onboarding Manager

## Business objective
Summarize the state of the full workflow so the user can quickly understand what is happening and what needs attention.

## What should be visible
- KPI cards
- pipeline snapshot
- assortment summary
- recent activity
- AI recommendations
- Beacon insights
- shortcut links to the main workflow areas

## Key sections
### KPI overview
Show totals for discovered leads, shortlisted leads, contacted leads, applications in review, approved partners, onboarding partners, and established partners.

### Assortment snapshot
Show the highest opportunity categories, top missing item types, and launch timing.

### Pipeline snapshot
Show the health of the lead, review, and onboarding stages.

### Activity timeline
Show recent events such as seller discovered, email sent, application submitted, document verified, and onboarding started.

### AI insights
Show what Beacon recommends next and why.

## Data needed
- category metrics
- assortment plans
- leads
- applications
- partners
- onboarding tasks
- activity log
- AI output
- workflow status

## Actions
- open a workflow area
- inspect a recommendation
- drill into an activity item
- filter by category or stage

## AI behavior
Beacon should summarize the state of the program, surface blockers, and suggest the next best action.

## States
- loading: use skeleton cards
- empty: show a start-here message
- error: show a clear data-unavailable message

## Success criteria
The user can answer in seconds:
- what is happening?
- what needs attention?
- what should happen next?
