# Onboarding

## Purpose
Help Onboarding Managers guide approved sellers through the tasks required to become established partners.

## Primary users
- Onboarding Manager
- Operations Team
- Finance / Catalog / Integration stakeholders

## Business objective
Move approved sellers from onboarding-ready status to established partner status with clear task tracking and blocker management.

## What should be visible
- partner list
- onboarding progress
- checklist
- blocker cards
- document status
- reminder actions
- email history
- activity timeline
- Beacon guidance

## Key sections
### Partner overview
Show partners that are approved or in onboarding and show their progress.

### Onboarding checklist
Show tasks such as seller profile completion, document verification, payment setup, catalog upload, integration mapping, and item listing.

### Blockers
Highlight incomplete or delayed tasks.

### Document section
Show required documents and whether they are verified.

### Reminder actions
Allow the user to send or schedule reminder emails.

## Data needed
- partners
- onboarding tasks
- task dependencies
- documents
- email history
- activity log
- onboarding agent output
- workflow status

## Actions
- open partner profile
- mark task complete
- assign owner
- send reminder
- request missing document
- review blocker
- update progress

## AI behavior
The Onboarding Agent should identify blockers, summarize progress, and recommend the next step.

## States
- loading: show progress skeleton
- empty: show no partners onboarding message
- error: show task data unavailable message

## Success criteria
The user can clearly see progress, blockers, and what must happen next to reach established status.
