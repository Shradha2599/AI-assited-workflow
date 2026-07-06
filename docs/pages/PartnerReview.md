# Partner Review

## Purpose
Help internal reviewers assess seller applications and decide whether to approve, reject, or mark for future interest.

## Primary users
- Acquisition Manager
- Review Team
- Onboarding Manager

## Business objective
Turn application submissions into trusted partner decisions with AI-supported review and document validation.

## What should be visible
- application queue
- application summary
- seller profile
- document verification panel
- risk analysis
- AI summary
- review decision controls
- comments
- activity timeline

## Key sections
### Review queue
Show applications waiting for review.

### Application summary
Show seller name, company details, categories, fulfillment setup, and submission date.

### Document panel
Show each uploaded document and its verification status.

### Risk panel
Show the AI risk summary, missing information, and compliance notes.

### Decision area
Allow the reviewer to choose approve, reject, or future interest.

## Data needed
- applications
- documents
- verification source
- seller profiles
- review notes
- comments
- activity log
- evaluation agent output

## Actions
- open application
- inspect documents
- review AI summary
- approve seller
- reject seller
- mark future interest
- request more information
- add internal note

## AI behavior
The Evaluation Agent should summarize the application, validate documents, identify risk, and recommend a decision.

## States
- loading: show review skeleton
- empty: show no applications message
- error: show verification data unavailable message

## Success criteria
The reviewer can make a confident decision with clear evidence and traceable review logic.
