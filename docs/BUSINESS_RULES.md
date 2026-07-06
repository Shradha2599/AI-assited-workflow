# BUSINESS_RULES.md

# Target Plus Marketplace

## Business Rules & Workflow Specification

**Version:** 1.0

---

# Purpose

This document defines the business rules, workflow transitions, lifecycle states, permissions, and operational constraints for the Target Plus AI-Assisted Acquisition & Onboarding platform.

These rules are the single source of truth for application behavior.

Every page, AI agent, workflow, component, and business action must follow the rules defined in this document.

---

# Business Workflow

The Target Plus acquisition process consists of three major phases.

```text
Assortment Planning
        │
        ▼
Lead Discovery
        │
        ▼
Potential Partner Review
        │
        ▼
Partner Onboarding
        │
        ▼
Established Partner
```

Every seller moves through this lifecycle.

---

# Lead Lifecycle

Every seller must belong to exactly one lifecycle stage.

```text
Discovered
      │
      ▼
Shortlisted
      │
      ▼
Contacted
      │
      ▼
New
      │
      ▼
In Review
      │
      ▼
Approved
      │
      ▼
Onboarding
      │
      ▼
Established
```

Lifecycle stages cannot be skipped.

---

# Lifecycle State Definitions

## Discovered

### Description

A seller has been identified through Lead Discovery but has not yet been shortlisted.

### Entry Criteria

* Discovery Agent identifies seller.
* Seller appears in discovery results.

### Exit Criteria

Acquisition Manager selects **Shortlist**.

### Available Actions

* View Profile
* Shortlist
* Ignore

### Owner

Acquisition Manager

---

## Shortlisted

### Description

Seller has been shortlisted as a strong match for the assortment plan.

### Entry Criteria

Seller is shortlisted by the Acquisition Manager.

### Exit Criteria

Introduction email is sent.

### Available Actions

* Remove from Shortlist
* Send Introduction Email
* View Seller Profile

### Owner

Acquisition Manager

---

## Contacted

### Description

Seller has received the Target Plus introduction email and Seller Application Form.

### Entry Criteria

Introduction email successfully sent.

### Exit Criteria

Seller submits application.

### Available Actions

* View Email History
* Send Reminder
* Track Application Status

### Owner

Acquisition Manager

---

## New

### Description

Seller has submitted the application and is automatically added to the Potential Partner database.

### Entry Criteria

Application successfully submitted.

### Exit Criteria

Reviewer opens the application.

### Available Actions

* View Application
* Begin Review

### Owner

Review Team

---

## In Review

### Description

A reviewer has started evaluating the submitted application.

The Evaluation Agent automatically generates:

* Application Summary
* Risk Assessment
* Document Validation
* Recommendation

### Entry Criteria

Application opened for review.

### Exit Criteria

Reviewer selects:

* Approve
* Reject
* Future Interest

### Available Actions

* Review Documents
* View AI Summary
* Approve
* Reject
* Future Interest
* Request Additional Information

### Owner

Acquisition Manager / Review Team

---

## Approved

### Description

Seller has been approved for Target Plus but has not yet started onboarding.

### Entry Criteria

Reviewer approves application.

### Exit Criteria

First onboarding task begins.

### Available Actions

* Start Onboarding
* Send Welcome Email
* Assign Onboarding Manager

### Owner

Onboarding Manager

---

## Onboarding

### Description

Seller has started at least one onboarding activity.

Examples:

* Business Profile
* Documentation
* Stripe Setup
* Catalog Upload
* Integration
* Item Listing

### Entry Criteria

First onboarding task starts.

### Exit Criteria

All onboarding tasks completed.

### Available Actions

* Continue Onboarding
* View Progress
* Resolve Blockers

### Owner

Onboarding Manager

---

## Established

### Description

Seller has successfully completed onboarding and is now an active Target Plus partner.

### Entry Criteria

All onboarding tasks completed.

### Exit Criteria

None.

### Available Actions

* View Partner Profile
* Monitor Performance

### Owner

Operations Team

---

# Review Outcomes

Review outcomes are independent of lifecycle states.

Possible outcomes are:

## Approved

Seller moves to onboarding.

---

## Rejected

Seller exits the active acquisition pipeline.

The seller record is retained for audit purposes.

---

## Future Interest

Seller remains in the database but is not actively pursued.

The seller may be reconsidered for future assortment plans.

---

# Workflow Rules

The following rules are mandatory.

* A seller cannot move directly from **Discovered** to **Approved**.
* A seller cannot enter onboarding without being **Approved**.
* The **New** state is assigned automatically after the Seller Application Form is submitted.
* **In Review** begins when a reviewer opens the application.
* **Approved** means the seller is accepted but has not yet started onboarding.
* **Onboarding** begins when the first onboarding task starts.
* **Established** is reached only after every onboarding task is complete.
* **Rejected** sellers leave the active pipeline.
* **Future Interest** sellers remain searchable but inactive.

---

# Ownership Matrix

| Stage               | Owner               |
| ------------------- | ------------------- |
| Assortment Planning | Category Manager    |
| Lead Discovery      | Acquisition Manager |
| Shortlisting        | Acquisition Manager |
| Outreach            | Acquisition Manager |
| Review              | Review Team         |
| Approval            | Acquisition Manager |
| Onboarding          | Onboarding Manager  |
| Established Partner | Operations Team     |

---

# AI Agent Triggers

| Event                     | Agent Triggered  |
| ------------------------- | ---------------- |
| Assortment Plan Approved  | Discovery Agent  |
| Lead Discovered           | Discovery Agent  |
| Lead Shortlisted          | Outreach Agent   |
| Outreach Email Sent       | Outreach Agent   |
| Application Submitted     | Evaluation Agent |
| Review Started            | Evaluation Agent |
| Seller Approved           | Onboarding Agent |
| Onboarding Started        | Onboarding Agent |
| Onboarding Task Completed | Onboarding Agent |

---

# Activity Timeline

Every significant business action must create an activity log.

Examples:

* Seller Discovered
* Seller Shortlisted
* Outreach Email Sent
* Application Submitted
* Review Started
* Seller Approved
* Welcome Email Sent
* Onboarding Started
* Document Verified
* Task Completed
* Partner Established

Each activity should include:

* Timestamp
* User or Agent
* Entity
* Action
* Description

---

# Permission Rules

### Category Manager

Can:

* Build Assortment Plans
* Edit Categories
* Generate Calendars

Cannot:

* Approve Sellers
* Start Onboarding

---

### Acquisition Manager

Can:

* Discover Sellers
* Shortlist Sellers
* Send Outreach
* Review Applications
* Approve Sellers

Cannot:

* Complete Onboarding

---

### Onboarding Manager

Can:

* Assign Tasks
* Track Progress
* Verify Documents
* Complete Onboarding

Cannot:

* Modify Assortment Plans

---

# AI Governance

AI Agents may:

* Analyze data
* Generate summaries
* Recommend actions
* Draft emails
* Detect blockers
* Validate documents
* Calculate confidence scores

AI Agents may not:

* Approve sellers
* Reject sellers
* Change workflow stages
* Modify business records
* Complete onboarding automatically

Every recommendation requires user confirmation before execution.

---

# Status Badges

The UI should consistently use the following lifecycle statuses:

* Discovered
* Shortlisted
* Contacted
* New
* In Review
* Approved
* Onboarding
* Established

Review outcomes should use:

* Pending
* Approved
* Rejected
* Future Interest

No additional status labels should be introduced.

---

# Error Handling Rules

The application must prevent invalid state transitions.

Examples:

* Cannot approve without an application.
* Cannot onboard without approval.
* Cannot complete onboarding with pending mandatory tasks.
* Cannot mark a partner as Established until all onboarding tasks are complete.

Whenever an invalid action is attempted, the user should receive a clear explanation and guidance on the required prerequisite.

---

# Success Criteria

The platform is considered successful when it enables Target teams to:

* Identify assortment opportunities.
* Discover and evaluate qualified sellers.
* Convert sellers into potential partners.
* Onboard approved partners efficiently.
* Track the complete acquisition journey.
* Make faster, data-driven decisions with AI assistance.

All workflows, AI agents, and application features should conform to the business rules defined in this document.
