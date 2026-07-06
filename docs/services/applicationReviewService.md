# applicationReviewService

## Purpose
Prepare submitted application data for the review process and support AI-assisted evaluation.

## Responsibilities
- Load seller applications, seller profiles, documents, review notes, and comments.
- Prepare review queue data.
- Build document verification bundles.
- Build risk-analysis inputs.
- Summarize application readiness.
- Create AI context for the Evaluation Agent.
- Support approve / reject / future interest workflows.

## Inputs
- applications
- documents
- seller profiles
- comments
- activity log
- verification sources
- review state

## Outputs
- review queue items
- application summary objects
- document-status bundles
- risk-analysis input bundles
- AI summary payload
- decision-ready review state

## Key operations
- getReviewQueue()
- getApplicationById(applicationId)
- getApplicationSummary(applicationId)
- getDocumentStatus(applicationId)
- getVerificationDetails(documentId)
- getRiskInputBundle(applicationId)
- buildEvaluationAgentContext(applicationId)
- prepareReviewDecision(applicationId)

## Business rules
- Do not allow a review decision without an application.
- Document verification source must be preserved and visible.
- Review decisions must be logged in the activity timeline.
- AI may recommend a decision, but a human makes the final decision.
- Application status should move through the business lifecycle correctly.

## Dependencies
- repositories for applications, documents, seller profiles, and comments
- Evaluation Agent
- workflowService

## Success criteria
- The reviewer can understand the application at a glance.
- Document verification is visible and traceable.
- The AI can surface risks and summarize the seller clearly.
