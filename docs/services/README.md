# Services Folder Specification

This folder defines the business service layer for the Target Plus AI-Assisted Acquisition & Onboarding application.

The service layer sits between:
- UI pages and components
- repositories that read mock data
- autonomous AI agents

Services should:
- load and combine data
- prepare page-ready business objects
- call agents when needed
- calculate derived metrics
- enforce workflow-aware data shaping
- keep React components thin

Services should NOT:
- render UI
- store raw data directly
- contain AI prompts
- duplicate repository logic
- hardcode AI outputs that should be generated at runtime
