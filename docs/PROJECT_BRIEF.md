# Target Plus Internal Member Experience — Project Brief for Cursor

## 1) Project Summary
Build a realistic, AI-powered internal web application for Target Plus focused on the internal Target member experience across **Assortment Planning, Lead Discovery, and Partner Onboarding**. The product should feel like a believable enterprise tool used by internal Target teams, not a simple prototype.

The experience should support three internal personas:
- **Category Manager**: identifies assortment gaps and creates acquisition requirements.
- **Acquisition Manager**: discovers, evaluates, shortlists, and contacts sellers.
- **Onboarding Manager**: manages approved sellers through onboarding and activation.

The app should use **mock data**, but behave like a real product. Beacon should be backed by an **actual LLM**, and the system should include **autonomous agents** that coordinate tasks and generate recommendations, messages, summaries, and next-step actions.

## 2) Product Goal
Reduce manual effort and context switching in the Target Plus internal workflow by creating a connected AI-native workspace that:
- turns assortment gaps into acquisition requirements,
- helps acquisition managers find and evaluate sellers,
- converts shortlisted leads into potential partners through email outreach and seller application forms,
- moves approved sellers into onboarding,
- provides visibility, automation, and intelligent assistance at every stage.

## 3) Lead Discovery Flow (Core Workflow)
This flow is the most important part of the product.

### Stage A — Assortment Plan Completed
- Category Manager finalizes the assortment plan.
- The plan contains item types, categories, target revenue, and seasonal timing.
- This becomes the source of truth for acquisition.

### Stage B — Requirement Understanding
- Acquisition Manager reviews the assortment plan and understands the required item types and category targets.
- Beacon summarizes what needs to be sourced, what is urgent, and what seasonal windows matter most.

### Stage C — Lead Discovery
- Acquisition Manager searches and discovers potential sellers that fit the plan.
- Leads should be ranked using a confidence score based on:
  - category fit,
  - marketplace presence,
  - GMV potential,
  - ratings / reputation,
  - operational readiness,
  - viral/trendy fit,
  - multi-marketplace presence.

### Stage D — Shortlisting
- Acquisition Manager reviews discovered leads and shortlists the best matches.
- Shortlisted leads should move into a clean list with status tracking.
- Beacon can recommend which leads to shortlist and why.

### Stage E — Outreach Email
- Shortlisted leads are contacted by email.
- The email introduces Target Plus and requests the seller to complete the application form.
- Beacon should generate this email content dynamically using lead context.

### Stage F — Seller Application Form
- When the lead fills the form, they are added to the **Potential Partner** database.
- Their status should be tagged as **New**.
- The form should capture business identity, category alignment, assortment details, and supporting documents.

### Stage G — Review / Approval
- Internal reviewers evaluate the submitted application.
- Lead can be approved, rejected, or held for future interest.
- Approved leads move into onboarding.

### Stage H — Onboarding Handoff
- Once approved, the partner transitions into the onboarding module.
- Their status changes from lead / potential partner to onboarding.
- Onboarding checklist and activation progress begin.

## 4) Functional Requirements

### Assortment Planning
- View categories and item types.
- See revenue opportunity and assortment gaps.
- Set revenue goal.
- Build seasonal assortment calendar.
- Generate plan with Beacon.
- Save and share the final assortment plan.

### Lead Discovery
- Discover leads from mock seller data.
- Filter by category, location, business type, marketplace presence, confidence score, GMV potential, viral/trendy signal, and seller rating.
- Shortlist leads.
- View detailed seller profiles.
- Send outreach email.
- Track discovered vs shortlisted vs contacted vs accepted leads.

### Partner Onboarding
- Track onboarding status and checklist.
- Show onboarding tasks and missing documents.
- Move approved sellers into onboarding.
- Send onboarding emails.
- Track progress across profile, assortment curation, documentation, integrations, item listing, and Stripe setup.

### Beacon AI
Beacon should work as an actual AI assistant with contextual awareness. It should:
- answer questions based on the current page and data,
- explain recommendations,
- draft emails,
- summarize sellers,
- suggest next actions,
- detect risks and blockers,
- help prioritize leads and onboarding tasks.

## 5) Autonomous Agent Architecture
The app should include real agent behavior, not just a single chat prompt. Suggested agents:

### Assortment Agent
- analyzes category gaps,
- identifies item types to prioritize,
- suggests seasonal opportunities.

### Discovery Agent
- searches and ranks sellers from mock data,
- calculates confidence scores,
- proposes best-fit leads.

### Outreach Agent
- drafts introduction emails,
- personalizes outreach based on seller profile and assortment needs.

### Evaluation Agent
- summarizes seller credibility,
- evaluates risks,
- recommends accept / reject / future interest.

### Onboarding Agent
- tracks onboarding checklist,
- identifies blockers,
- generates reminders and next-step guidance.

### Beacon Orchestrator
- routes user questions to the right agent,
- consolidates outputs,
- presents a single coherent response in the UI.

## 6) Data Model (Mock Data)
Use structured mock JSON datasets for:
- categories and item types,
- assortment plans,
- discovered leads,
- shortlisted leads,
- potential partners,
- onboarding tasks,
- seller applications,
- email drafts,
- agent recommendations,
- activity logs.

Suggested entities:
- `Category`
- `ItemType`
- `AssortmentPlan`
- `Lead`
- `SellerProfile`
- `ApplicationForm`
- `Partner`
- `OnboardingTask`
- `EmailDraft`
- `BeaconRecommendation`
- `ActivityEvent`

## 7) Key UX Principles
- Enterprise-grade, clean, and trustworthy.
- Real workflow states, not placeholder screens.
- Clear hierarchy: summary at top, details below, AI side panel on the right.
- Every AI suggestion should feel actionable.
- Preserve context between screens.
- Reduce clutter and ensure the UI supports fast internal decision-making.

## 8) Suggested App Structure
- **Dashboard**
- **Assortment Gap Analysis**
- **Assortment Plan**
- **Lead Discovery**
- **Seller Profile**
- **Potential Partner Review**
- **Partner Onboarding**
- **Beacon AI Panel**
- **Agent Activity / Audit Trail**

## 9) Expected Behaviors
- Clicking a category should reveal relevant product gaps.
- Clicking a lead should open seller details.
- Shortlisting should update the lead status.
- Sending an email should create a draft in activity history.
- Filling the application should create a potential partner record.
- Approving a partner should move them into onboarding.
- Beacon should use page context and entity state to respond intelligently.

## 10) Build Approach in Cursor
Build this as a production-quality mock application with:
- a modern React frontend,
- state-driven flows,
- mock data services,
- LLM integration for Beacon,
- agent orchestration logic,
- realistic enterprise UI patterns,
- reusable components.

Prefer a modular architecture so each flow can be expanded independently.

## 11) Primary Success Criteria
The app should make an internal Target team member feel that they can:
- identify assortment gaps,
- find and shortlist sellers,
- contact them through email,
- convert them into potential partners,
- approve them for onboarding,
- and monitor the entire journey with AI support.

The experience should feel believable, connected, and operationally useful.

## 12) Scope for First Build
Start with:
1. Assortment planning view
2. Lead discovery table and seller detail drawer
3. Outreach email generation
4. Application form capture
5. Potential partner database view
6. Onboarding handoff state
7. Beacon chat with LLM support
8. Agent orchestration layer

---

## Final Product Direction
This is a **Target Plus internal acquisition and onboarding workspace** powered by an LLM-based Beacon assistant and multiple autonomous agents, designed to help internal teams move from assortment planning to seller activation with less manual work and better visibility.

