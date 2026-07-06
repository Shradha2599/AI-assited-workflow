# ARCHITECTURE.md

# Target Plus Marketplace

## System Architecture

**Version:** 1.0

---

# Purpose

This document defines the technical architecture of the Target Plus AI-Assisted Acquisition & Onboarding platform.

The goal is to provide a scalable, modular, and enterprise-grade application architecture that separates presentation, business logic, AI orchestration, and data.

The application should behave like a real internal Target product while using structured mock data during development.

---

# Technology Stack

The application should be built using modern web technologies.

## Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* shadcn/ui
* React Router

---

## AI

* OpenAI GPT-5.5 (or latest available model)
* Beacon Orchestrator
* Autonomous AI Agents

---

## State Management

* React Context
* Zustand (preferred)
* React Query (for asynchronous data)

---

## Data

During development, use:

* JSON files
* Mock repositories
* Service layer

The architecture should make it easy to replace mock services with real APIs in the future.

---

# System Architecture

The application follows a layered architecture.

```text
                   User
                     │
                     ▼
              Presentation Layer
                     │
                     ▼
              Feature Layer
                     │
                     ▼
              Service Layer
                     │
          ┌──────────┴──────────┐
          ▼                     ▼
     Agent Layer          Mock Data Layer
          │                     │
          └──────────┬──────────┘
                     ▼
               Beacon + LLM
```

Each layer has a clearly defined responsibility.

---

# Architecture Principles

The architecture should follow these principles.

## Separation of Concerns

Each layer should have one responsibility.

UI should never contain business logic.

Business logic should never live inside components.

AI reasoning should never be embedded inside UI.

---

## Modularity

Every feature should be independently maintainable.

Features should not directly depend on one another.

Reusable components should be shared.

---

## Scalability

The architecture should allow:

* new AI agents
* new pages
* new workflows
* new APIs
* new business modules

without major refactoring.

---

## Reusability

Components, services, hooks, and utilities should be reusable across modules.

---

# Folder Structure

```text
src/

├── app/
│
├── assets/
│
├── components/
│   ├── common/
│   ├── charts/
│   ├── forms/
│   ├── tables/
│   ├── layout/
│   ├── beacon/
│   └── ai/
│
├── pages/
│   ├── Dashboard/
│   ├── AssortmentPlanning/
│   ├── LeadDiscovery/
│   ├── PotentialPartners/
│   ├── PartnerDetails/
│   ├── Onboarding/
│   └── Settings/
│
├── features/
│   ├── assortment/
│   ├── discovery/
│   ├── evaluation/
│   ├── outreach/
│   └── onboarding/
│
├── agents/
│   ├── beacon/
│   ├── assortment/
│   ├── discovery/
│   ├── outreach/
│   ├── evaluation/
│   └── onboarding/
│
├── services/
│
├── mock/
│
├── hooks/
│
├── contexts/
│
├── types/
│
├── utils/
│
└── constants/
```

---

# Application Modules

The application consists of six major modules.

## Dashboard

Displays:

* KPIs
* Pipeline
* Calendar
* AI Recommendations
* Recent Activity

---

## Assortment Planning

Responsible for:

* Gap Analysis
* Revenue Planning
* Category Planning
* Calendar Planning

Uses:

Assortment Intelligence Agent

---

## Lead Discovery

Responsible for:

* Seller Search
* Lead Discovery
* Seller Ranking
* Confidence Scores
* Shortlisting

Uses:

Discovery Agent

---

## Potential Partner Review

Responsible for:

* Application Review
* AI Summary
* Document Verification
* Risk Analysis

Uses:

Evaluation Agent

---

## Partner Onboarding

Responsible for:

* Checklist
* Documents
* Progress
* Blockers
* Task Tracking

Uses:

Onboarding Agent

---

## Beacon

Accessible from every page.

Provides:

* contextual chat
* recommendations
* explanations
* summaries
* task assistance

---

# Layer Responsibilities

## Presentation Layer

Responsible for:

* UI
* Layout
* Navigation
* User Interaction

Should never contain business logic.

---

## Feature Layer

Responsible for:

* Page-specific workflows
* Feature composition
* Business interactions

Each feature owns its own components.

---

## Service Layer

Responsible for:

* Reading mock data
* Writing mock data
* Calling AI
* Data transformation

The UI communicates only with services.

---

## Agent Layer

Responsible for:

* AI reasoning
* Recommendations
* Summaries
* Email generation
* Risk analysis
* Workflow assistance

Each agent is isolated.

---

## Data Layer

Stores:

* JSON
* Mock repositories
* Static datasets

Can later be replaced by APIs.

---

# Navigation Structure

```text
Dashboard

↓

Assortment Planning

↓

Lead Discovery

↓

Potential Partners

↓

Partner Details

↓

Onboarding
```

Beacon is persistent and available throughout the application.

---

# Page Composition

Every page follows the same structure.

```text
Header

↓

Page Summary

↓

Primary Content

↓

Secondary Panels

↓

Beacon Panel
```

The user should never lose context when navigating.

---

# Data Flow

The application follows a unidirectional data flow.

```text
User Action

↓

Feature

↓

Service

↓

Agent (if required)

↓

Mock Data / LLM

↓

Structured Response

↓

Feature

↓

UI Update
```

---

# Agent Flow

```text
User

↓

Beacon

↓

Intent Detection

↓

Correct Agent

↓

Business Reasoning

↓

JSON Response

↓

Beacon

↓

UI
```

Agents never communicate directly with UI components.

---

# State Management

Application state should be separated into:

## Global State

* User
* Theme
* Navigation
* Notifications

---

## Business State

* Assortment Plans
* Leads
* Partners
* Tasks
* Documents
* Activity

---

## AI State

* Current Conversation
* AI Recommendations
* Agent Status
* Pending Requests

---

# Component Guidelines

Components should be:

* Small
* Reusable
* Typed
* Stateless whenever possible

Avoid components larger than 300 lines.

Extract business logic into hooks or services.

---

# Naming Conventions

Pages

PascalCase

Example:

LeadDiscoveryPage

---

Components

PascalCase

Example:

LeadTable

---

Hooks

camelCase

Example:

useLeadDiscovery()

---

Services

camelCase

Example:

leadDiscoveryService.ts

---

Types

PascalCase

Example:

SellerProfile

---

# Mock Data Strategy

Store data inside:

```text
src/mock/

categories.json

assortmentPlans.json

leads.json

sellerProfiles.json

applications.json

partners.json

documents.json

tasks.json

emails.json

activities.json

recommendations.json
```

Services should read from these files rather than directly from components.

---

# Error Handling

Every feature should gracefully handle:

* Missing data
* AI failures
* Empty states
* Loading states
* Invalid transitions

Errors should always provide clear user feedback.

---

# Performance

The application should:

* Lazy-load routes
* Memoize expensive components
* Avoid unnecessary renders
* Keep AI requests asynchronous
* Cache mock data where appropriate

---

# Security Considerations

Although the application uses mock data, architecture should assume enterprise standards.

Future integrations should support:

* Authentication
* Authorization
* Audit logging
* Role-based access control

---

# Future Scalability

The architecture should allow future additions such as:

* Analytics Agent
* Pricing Intelligence
* Supplier Risk Monitoring
* Performance Dashboards
* Real API integrations
* Authentication services

without requiring architectural changes.

---

# Development Principles

* Follow the business rules defined in **BUSINESS_RULES.md**.
* Follow entity definitions in **DATA_SCHEMA.md**.
* Follow AI orchestration defined in **AI_AGENTS.md**.
* Keep features independent.
* Prefer composition over duplication.
* Build reusable enterprise-grade components.
* Design for maintainability and scalability.

---

# Conclusion

The architecture is designed to support a modular, AI-native enterprise application for Target Marketplace.

Every layer has a single responsibility, every feature is isolated, and AI capabilities are orchestrated through Beacon while remaining independent of the user interface.

This architecture ensures the application remains scalable, maintainable, and extensible as new business capabilities and AI agents are introduced.
