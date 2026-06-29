# PROJECT_MEMORY.md

## Project Name

AI Assisted Workflow

---

# Mission

Build a production-grade enterprise web application for Marketplace Acquisition & Onboarding.

The application helps business users:

* Discover assortment gaps
* Analyze competitors
* Plan assortment strategy
* Generate onboarding calendars
* Onboard sellers
* Verify sellers using AI
* Track onboarding progress
* Interact with an AI assistant (Beacon)

This is not a prototype.

Everything should be implemented as if it will be used in production.

---

# Primary Goal

The application should closely match the Figma designs while remaining maintainable.

Pixel-perfect consistency is preferred over rapid implementation.

Whenever there is uncertainty, prefer consistency with the existing design system over inventing a new UI.

---

# Development Philosophy

Documentation First.

The documentation inside `/docs` is the source of truth.

Never assume design decisions.

Never invent components.

If something is missing:

1. Reuse an existing component.
2. Extend an existing component.
3. Create a new reusable component only if absolutely necessary.

---

# Design Philosophy

The UI is an enterprise analytics application.

Characteristics:

* clean
* spacious
* modern
* minimal
* data-heavy
* professional
* card-based

The application should feel similar to enterprise products from Microsoft, Atlassian, Linear, Salesforce, or modern analytics dashboards.

---

# Layout Philosophy

Every page should use the same application shell.

AppShell

* Sidebar
* Top Navigation
* Main Content
* Right AI Panel (Beacon)

Do not redesign the shell between pages.

---

# Component Philosophy

Everything should be reusable.

Never duplicate components.

Pages should be compositions of reusable components.

Examples:

MetricCard

TaskCard

ChartCard

DataTable

Timeline

Calendar

Drawer

Modal

Badge

Button

Search

Tabs

Breadcrumb

Beacon Panel

---

# Design Tokens

Never hardcode values.

Always use design tokens.

Spacing

8-point grid.

Colors

Use semantic color tokens.

Typography

Use typography tokens.

Radius

Use radius tokens.

Shadow

Use elevation tokens.

---

# AI Philosophy

AI is a workflow assistant.

AI is not the application.

The user should always remain in control.

AI should:

recommend

summarize

validate

highlight risks

suggest actions

generate insights

AI should never perform destructive actions without user confirmation.

---

# Seller Verification Philosophy

Seller verification is an AI workflow.

Not a chatbot.

Pipeline:

Seller submits form

↓

Documents uploaded

↓

OCR

↓

Field extraction

↓

Business rule validation

↓

Risk analysis

↓

AI reasoning

↓

Approval

or

Human review

Everything should be auditable.

Every AI decision should have an explanation.

Confidence scores should be visible.

---

# Documentation Philosophy

Whenever implementation changes:

Update documentation first.

Code follows documentation.

Not the other way around.

---

# Cursor Workflow

When building a page:

Read the page documentation.

Read component documentation.

Reuse existing components.

Follow design tokens.

Follow layout system.

Implement.

Review.

Refactor.

---

# Code Philosophy

Readable over clever.

Composition over inheritance.

Strict typing.

Small components.

Reusable hooks.

Reusable utilities.

Avoid duplication.

Prefer maintainability.

---

# Performance Philosophy

Avoid unnecessary rendering.

Lazy load large charts.

Split large pages.

Prefer server rendering when appropriate.

Keep bundle size reasonable.

---

# Accessibility

Keyboard navigation.

Proper semantics.

ARIA where needed.

Visible focus.

Color should never be the only indicator.

---

# Current Project Status

Version 0.1

Completed

* Documentation structure
* Dashboard analysis
* Assortment Gap analysis
* Planning flow analysis

Pending

* Seller onboarding
* Seller verification
* Admin
* Settings
* Remaining Figma pages

This document should evolve throughout the project as additional Figma designs and business requirements are added.
