# WORKFLOWS.md

# Target Plus Marketplace
## Workflow Specification

## Purpose

This document describes the major end-to-end workflows in the Target Plus AI-Assisted Acquisition & Onboarding experience.

It explains how work moves from assortment planning through lead discovery, partner review, onboarding, and established partner management.

These workflows are the operational backbone of the product and should be used by Cursor to understand the sequence of business actions across the platform.

---

# 1. Assortment Planning Workflow

## Goal
Identify the categories and item types that Target should pursue next.

## Flow
Category analysis
→ competitor comparison
→ gap identification
→ item type recommendation
→ revenue opportunity review
→ launch timing
→ assortment plan creation

## Output
A structured assortment plan with prioritized item types, revenue opportunities, and timing guidance.

## Key actors
- Category Manager
- Assortment Intelligence Agent
- Beacon

## Business questions answered
- Which category has the highest opportunity?
- Which products are missing from Target's assortment?
- What revenue could be unlocked?
- When should the assortment launch?

## Exit condition
The assortment plan is approved and ready to drive lead discovery.

---

# 2. Lead Discovery Workflow

## Goal
Find sellers that can fulfill the planned assortment needs.

## Flow
Assortment plan approved
→ seller search
→ seller ranking
→ shortlist
→ contact seller
→ send application form

## Output
A ranked lead list with shortlisted sellers and outreach-ready communication.

## Key actors
- Acquisition Manager
- Discovery Agent
- Outreach Agent
- Beacon

## Business questions answered
- Which sellers best match the assortment plan?
- Who should be contacted first?
- Which seller is the strongest fit?
- Why is this seller worth pursuing?

## Exit condition
A seller submits the application form and enters the review pipeline.

---

# 3. Partner Review Workflow

## Goal
Assess whether a seller is credible, compliant, and ready to become a Target Plus partner.

## Flow
Application submitted
→ application enters queue
→ reviewer opens application
→ document verification
→ AI review summary
→ risk evaluation
→ review decision

## Possible outcomes
- Approved
- Rejected
- Future Interest

## Output
A decision-ready application with verified documents, risk summary, and review recommendation.

## Key actors
- Review Team
- Acquisition Manager
- Evaluation Agent
- Beacon

## Business questions answered
- Is this seller ready for onboarding?
- Are the documents valid?
- What risks are present?
- Should the seller be approved now?

## Exit condition
The seller is approved and ready to enter onboarding.

---

# 4. Onboarding Workflow

## Goal
Move an approved seller through the operational steps needed to become an active partner.

## Flow
Seller approved
→ onboarding tasks created
→ documents verified
→ payment / catalog / integration setup
→ blocker resolution
→ reminders sent
→ tasks completed
→ partner established

## Output
An onboarding-ready partner that progresses toward established status.

## Key actors
- Onboarding Manager
- Operations Team
- Onboarding Agent
- Outreach Agent
- Beacon

## Business questions answered
- What is blocking onboarding?
- Which task should happen next?
- Are any documents missing?
- How far along is the partner?

## Exit condition
All onboarding tasks are complete and the partner becomes established.

---

# 5. Established Partner Workflow

## Goal
Track successful activation and ensure visibility after onboarding is complete.

## Flow
Onboarding completed
→ partner becomes established
→ performance monitoring
→ activity tracking
→ follow-up support

## Output
An active Target Plus partner with ongoing visibility.

## Key actors
- Operations Team
- Onboarding Manager
- Beacon

## Business questions answered
- Is the partner live?
- Are there follow-up issues?
- What is the partner's current operational status?

## Exit condition
None. This is the final operating state for active partners.

---

# 6. Cross-Workflow Beacon Flow

Beacon is not a business stage. It is the intelligence layer that supports all stages.

## Beacon flow
User action or page context
→ Beacon receives intent
→ Beacon gathers workflow context
→ Beacon routes to the correct agent
→ Agent returns structured output
→ Beacon formats recommendation or summary
→ UI displays result

## Example
A Category Manager opens Assortment Planning.
Beacon uses the assortment context to ask the Assortment Intelligence Agent for opportunity analysis and recommended item types.

Another example:
An Acquisition Manager opens Lead Discovery.
Beacon sends assortment and seller context to the Discovery Agent to rank sellers and explain why they fit.

## Beacon responsibilities
- detect intent
- preserve context
- route to the right agent
- merge responses when needed
- keep AI explainable
- surface next actions

---

# 7. Workflow State Progression

## Lead states
Discovered
→ Shortlisted
→ Contacted
→ New
→ In Review
→ Approved
→ Onboarding
→ Established

## Review outcomes
- Approved
- Rejected
- Future Interest

## Partner states
- Approved
- Onboarding
- Established

## Workflow rules
- states cannot be skipped
- approved does not mean onboarding has started
- onboarding begins only when the first onboarding task starts
- established requires completion of all onboarding tasks
- rejected and future interest should be preserved for audit and future reference

---

# 8. Workflow Logging

Every major workflow action should generate an activity event.

Examples:
- seller discovered
- seller shortlisted
- email sent
- application submitted
- review started
- document verified
- seller approved
- onboarding started
- task completed
- partner established

Activity logging helps keep the system auditable and transparent.

---

# 9. Workflow Success Criteria

The workflows are successful when the user can:
- understand the current stage immediately
- know what happens next
- see why a recommendation was made
- trace every AI or human action
- move a seller from discovery to established without confusion

---

# 10. Future Workflow Enhancements

Potential future workflow improvements include:
- SLA tracking
- automated reminders
- escalation paths
- milestone alerts
- partner health scoring
- workflow analytics dashboards
