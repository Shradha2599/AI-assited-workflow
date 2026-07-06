# AI_AGENTS.md

# Target Plus Marketplace

## AI Architecture & Multi-Agent System

**Version:** 1.0

---

# Purpose

The Target Plus AI-Assisted Acquisition & Onboarding platform is built around a **multi-agent architecture** that augments internal Target team members throughout the seller acquisition and onboarding lifecycle.

Rather than relying on a single AI assistant, the platform consists of multiple autonomous AI agents, each specializing in a specific business domain such as assortment planning, seller discovery, partner evaluation, outreach, and onboarding.

These agents collaborate through **Beacon**, a conversational AI interface that orchestrates requests, shares business context, and delivers a seamless experience to Target Members.

The objective of this architecture is to:

* Reduce manual effort
* Improve operational efficiency
* Accelerate seller acquisition
* Increase onboarding visibility
* Provide explainable recommendations
* Keep business-critical decisions under human control

---

# AI Design Principles

The AI ecosystem follows six core principles.

## 1. Context Awareness

Every AI recommendation must understand the current business context before generating a response.

Context includes:

* Current user
* User role
* Current module
* Current page
* Workflow stage
* Selected category
* Selected seller
* Revenue goals
* Assortment plan
* Business metrics
* Previous conversation
* Historical activity

Agents should never generate recommendations without contextual information.

---

## 2. Domain Specialization

Each AI agent owns one business capability.

Agents are specialists rather than generalists.

This improves:

* reasoning quality
* maintainability
* scalability
* explainability

---

## 3. Human-in-the-Loop

AI assists.

Target Members decide.

Autonomous agents should **never**:

* approve sellers
* reject sellers
* modify business records
* change workflow stages
* finalize onboarding
* submit contracts

Agents recommend actions.

Users perform business decisions.

---

## 4. Explainability

Every recommendation must include:

* reasoning
* confidence score
* supporting evidence
* expected impact
* suggested next action

Users should always understand why the AI produced an answer.

---

## 5. Transparency

Every AI execution should be traceable.

Each AI recommendation should include:

* source agent
* execution timestamp
* confidence score
* reasoning
* supporting data

All AI actions should be recorded in the Activity Timeline.

---

## 6. Collaboration

Agents work together as a team.

Beacon coordinates the collaboration.

Agents exchange structured business information rather than natural language.

---

# Multi-Agent Architecture

The platform uses a centralized orchestration model.

```text
                        User
                          │
                          ▼
                    Beacon Interface
                          │
                 Intent Classification
                          │
                          ▼
                 Beacon Orchestrator
                          │
      ┌──────────┬──────────┬──────────┬──────────┬──────────┐
      ▼          ▼          ▼          ▼          ▼
 Assortment   Discovery   Outreach  Evaluation  Onboarding
 Intelligence    Agent       Agent      Agent       Agent
     Agent
      │          │          │          │          │
      └──────────┴──────────┴──────────┴──────────┘
                          │
                          ▼
               Structured Business Response
                          │
                          ▼
                     Target Member
```

---

# Beacon

Beacon is the conversational interface for the AI platform.

Beacon is **not** a business reasoning agent.

Its role is to:

* understand user intent
* collect business context
* determine which agent should respond
* coordinate multiple agents
* merge responses
* present conversational results

Beacon serves as the single point of interaction between Target Members and the autonomous AI ecosystem.

---

# Shared Business Context

All AI agents share the same business context.

They never maintain independent business data.

Shared context includes:

* Categories
* Item Types
* Assortment Plans
* Leads
* Seller Profiles
* Applications
* Partners
* Documents
* Activity Timeline
* Comments
* Onboarding Tasks
* Revenue Goals
* Dashboard Metrics
* AI Recommendations

All business entities are defined in **DATA_SCHEMA.md**.

---

# Intent Routing

Before invoking an agent, Beacon classifies the user's intent.

Examples:

| User Request                   | Responsible Agent             |
| ------------------------------ | ----------------------------- |
| Build an assortment plan       | Assortment Intelligence Agent |
| Find sellers for Lighting      | Discovery Agent               |
| Generate an introduction email | Outreach Agent                |
| Explain seller risk            | Evaluation Agent              |
| Show onboarding blockers       | Onboarding Agent              |

If a request spans multiple business domains, Beacon invokes multiple agents and combines their outputs into a unified response.

---

# Standard Agent Lifecycle

Every autonomous agent follows the same execution model.

```text
Trigger Event
      │
      ▼
Receive Business Context
      │
      ▼
Analyze Business Data
      │
      ▼
Reason
      │
      ▼
Generate Structured Output
      │
      ▼
Return Response to Beacon
      │
      ▼
Log Activity Event
```

This execution lifecycle remains consistent across all agents.

---

# Agent Communication

Agents communicate using structured business objects.

No agent communicates directly through conversational text.

Each response should contain:

* Summary
* Recommendations
* Confidence Score
* Supporting Evidence
* Suggested Next Actions

Beacon transforms these structured outputs into conversational responses.

---

# Shared Memory Strategy

Agents do not maintain independent memories.

Beacon injects relevant context into every execution.

This includes:

* Current page
* Current workflow
* Business entities
* Previous AI responses
* Historical activity
* User conversation history

This approach ensures every agent reasons from the latest state of the application.

---

# AI Governance

The platform follows strict governance principles.

## AI May

* Analyze data
* Generate summaries
* Draft emails
* Recommend actions
* Rank sellers
* Predict opportunities
* Detect blockers
* Explain business insights

## AI May Not

* Approve partners
* Reject partners
* Change workflow status
* Modify revenue goals
* Complete onboarding
* Delete records

Business decisions always require user confirmation.

---

# Agent Catalog

The platform currently consists of five autonomous agents.

| Agent                         | Business Capability                                                              |
| ----------------------------- | -------------------------------------------------------------------------------- |
| Assortment Intelligence Agent | Assortment planning, competitor analysis, revenue opportunity, calendar planning |
| Discovery Agent               | Seller discovery, matching, confidence scoring, ranking                          |
| Outreach Agent                | Email generation, reminders, communication assistance                            |
| Evaluation Agent              | Application review, document validation, risk assessment                         |
| Onboarding Agent              | Progress tracking, blocker detection, onboarding guidance                        |

Each agent is documented separately within the **`docs/agents/`** directory.

---

# Agent Documentation Structure

Each agent follows the same documentation template.

Every agent document contains:

* Purpose
* Business Objectives
* Responsibilities
* Trigger Events
* Inputs
* Outputs
* Tools
* Reasoning Workflow
* Prompt Template
* JSON Response Schema
* Failure Handling
* Human-in-the-loop Rules
* Success Metrics
* Interaction with Other Agents

This standardized structure ensures consistency across the AI ecosystem and makes future expansion easier.

---

# Future Expansion

The architecture is intentionally modular.

New agents can be added without modifying existing agents.

Examples of future agents include:

* Analytics Agent
* Pricing Intelligence Agent
* Marketplace Health Agent
* Performance Monitoring Agent
* Supplier Risk Agent
* Operations Assistant

Each new agent should integrate through Beacon and follow the same execution lifecycle defined in this document.

---

# Conclusion

The Target Plus Marketplace AI ecosystem is designed as a collaborative team of specialized AI agents coordinated through Beacon.

This architecture enables scalable, explainable, and context-aware AI assistance while preserving human ownership of critical business decisions.

Detailed implementation specifications for individual agents are maintained as separate documents inside the **`docs/agents/`** directory.
