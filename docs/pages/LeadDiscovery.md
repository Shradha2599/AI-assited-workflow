# Lead Discovery

## Purpose
Help Acquisition Managers find, rank, shortlist, and contact sellers that match the assortment plan.

## Primary users
- Acquisition Manager

## Business objective
Turn assortment requirements into a qualified seller pipeline.

## What should be visible
- lead table
- search and filters
- seller ranking
- confidence score
- seller detail drawer
- shortlist actions
- contact actions
- outreach history
- Beacon recommendations

## Key sections
### Lead table
Show company name, category fit, confidence, GMV, trend score, risk score, status, and owner.

### Filters
Filter by category, status, confidence, revenue potential, risk level, and owner.

### Seller detail drawer
Show company summary, marketplaces, website, ratings, social signals, and notes.

### Shortlist area
Show sellers that have been shortlisted and their current state.

### Outreach area
Show communication history and the ability to generate or send an introduction email.

## Data needed
- leads
- seller profiles
- assortment plans
- source signals
- AI seller ranking
- email drafts
- comments
- activity log

## Actions
- search leads
- filter leads
- open seller profile
- shortlist seller
- remove from shortlist
- contact seller
- generate outreach email
- add a note

## AI behavior
The Discovery Agent should rank sellers against the assortment plan, calculate confidence, explain fit, and suggest next actions.

## States
- loading: show ranked-table skeleton
- empty: explain that no leads match the filters
- error: show seller data unavailable message

## Success criteria
The user can quickly identify the best sellers and move them into outreach.
