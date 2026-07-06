# DATA_SCHEMA.md

# Target Plus AI-Assisted Acquisition & Onboarding
## Business Data Schema

## Purpose

This document defines the logical business entities used across the Target Plus AI-Assisted Acquisition & Onboarding platform. The application uses structured mock data to power UI screens, autonomous AI agents, workflow transitions, dashboards, and Beacon.

---

# Entity Relationship Overview

Category
→ Item Types
→ Assortment Plan
→ Lead
→ Seller Profile
→ Seller Application
→ Partner
→ Documents / Onboarding Tasks / Activity Events / Email History / Notes / AI Recommendations

---

# 1. Category
Fields:
- id
- name
- businessUnit
- annualRevenue
- growthRate
- assortmentGapScore
- priority
- seasonality
- categoryManager

# 2. Item Type
Fields:
- id
- categoryId
- name
- trendScore
- competitorCoverage
- targetCoverage
- opportunityScore
- estimatedRevenue
- recommendedLaunchQuarter

# 3. Assortment Plan
Fields:
- id
- title
- categoryId
- revenueGoal
- plannedRevenue
- launchSeason
- launchQuarter
- itemTypes
- createdBy
- createdDate
- status

Status:
- Draft
- In Review
- Approved

# 4. Lead
Fields:
- id
- sellerId
- companyName
- categories
- businessType
- headquarters
- estimatedGMV
- confidenceScore
- assortmentMatchScore
- trendScore
- riskScore
- status
- reviewOutcome
- assignedTo
- discoveredDate

Lifecycle Status:
- Discovered
- Shortlisted
- Contacted
- New
- In Review
- Approved
- Onboarding
- Established

Review Outcome:
- Pending
- Approved
- Rejected
- Future Interest

# 5. Seller Profile
Fields:
- sellerId
- companyName
- description
- foundedYear
- headquarters
- employeeCount
- annualRevenue
- primaryCategories
- marketplaces
- website
- marketplaceRatings
- fulfillmentCapabilities
- legalStatus
- socialPresence

# 6. Seller Application
Fields:
- applicationId
- sellerId
- submissionDate
- businessInformation
- assortmentDetails
- logisticsDetails
- uploadedDocuments
- currentStatus
- reviewedBy
- reviewDate

# 7. Partner
Fields:
- partnerId
- sellerId
- onboardingOwner
- onboardingStatus
- onboardingProgress
- activationDate
- integrationStatus
- stripeStatus
- performanceTier

# 8. Onboarding Task
Fields:
- id
- partnerId
- title
- description
- owner
- priority
- dueDate
- dependencies
- status
- completionDate

Task Status:
- Not Started
- In Progress
- Blocked
- Completed

# 9. Documents
Fields:
- id
- partnerId
- applicationId
- documentName
- documentType
- uploadedDate
- uploadedBy
- verificationStatus
- verificationSource
- verifiedBy
- verificationDate
- expiryDate
- remarks

Verification Status:
- Pending
- In Verification
- Verified
- Rejected
- Expired

Verification Source:
- AI OCR Validation
- Government Registry API
- Business Registration Database
- Tax Authority Database
- Banking Verification
- Manual Review
- Third-Party Verification Service
- Seller Provided Evidence

Business Rules:
- Every uploaded document must have a verification status.
- Every verified document must have a verification source.
- AI may perform preliminary verification.
- Compliance-sensitive documents require human confirmation.

# 10. Email Draft
Fields:
- id
- sellerId
- subject
- body
- generatedBy
- createdDate
- sentDate
- status

Status:
- Draft
- Ready
- Sent

# 11. Activity Event
Fields:
- id
- entityType
- entityId
- actor
- action
- timestamp
- description

# 12. Notes
Fields:
- id
- entityId
- author
- visibility
- content
- createdDate

# 13. Beacon Recommendation
Fields:
- id
- sourceAgent
- entityId
- recommendation
- reason
- confidence
- expectedImpact
- suggestedAction
- generatedDate

# 14. Agent Execution
Fields:
- id
- agentName
- trigger
- inputContext
- outputSummary
- executionTime
- status

Business Relationships:
- One Category → Many Item Types
- One Category → Many Assortment Plans
- One Assortment Plan → Many Leads
- One Lead → One Seller Profile
- One Seller → One Seller Application
- One Approved Application → One Partner
- One Partner → Many Documents
- One Partner → Many Onboarding Tasks
- One Partner → Many Activity Events
- One Partner → Many Notes
- One Partner → Many Emails
- One Partner → Many AI Recommendations

Workflow:
Discovered → Shortlisted → Contacted → New → In Review → Approved → Onboarding → Established
