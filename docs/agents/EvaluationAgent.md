# Evaluation Agent

## Purpose
The Evaluation Agent reviews submitted seller applications and helps internal reviewers assess risk, credibility, readiness, and approval suitability.

## Business objective
Turn application submissions into review-ready decisions with clear evidence and document verification support.

## Primary questions it answers
- Is this seller ready for approval?
- Are the documents valid?
- What risks are present?
- Should the seller be approved, rejected, or marked as future interest?
- What information is missing?

## Inputs
- application data
- seller profile
- uploaded documents
- verification sources
- review notes
- marketplace signals
- web signals
- social signals
- internal comments

## Outputs
- application summary
- risk summary
- document verification summary
- review recommendation
- confidence score
- missing information list
- approval rationale

## Reasoning approach
1. Summarize the seller application.
2. Review document completeness and verification source.
3. Identify risk or inconsistency signals.
4. Evaluate credibility and marketplace readiness.
5. Recommend a review outcome with explanation.

## Business rules
- Do not approve or reject by itself.
- Keep all verification sources visible.
- Do not hide missing documents or issues.
- Always explain why the recommendation was made.
- Follow the business workflow and review outcome rules.

## Trigger events
- application submitted
- reviewer opens application
- documents are uploaded or verified
- user asks Beacon to analyze a seller

## Interactions
- Uses review data from the application review service
- Shares risk summaries with Beacon
- Passes approved sellers into onboarding flow
- Supports reviewer decision-making, not decision automation

## Success criteria
- Reviewers can understand the seller quickly.
- Risks are easy to identify.
- Verification evidence is traceable.
