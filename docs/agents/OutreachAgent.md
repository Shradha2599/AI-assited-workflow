# Outreach Agent

## Purpose
The Outreach Agent drafts and personalizes seller communication for introduction, follow-up, and reminder workflows.

## Business objective
Help Acquisition and Onboarding teams communicate clearly with sellers and reduce manual email drafting.

## Primary questions it answers
- What should the introduction email say?
- How should the seller be reminded?
- What is the most relevant follow-up message?
- Which action should be requested in the email?

## Inputs
- seller profile
- lead context
- application status
- onboarding status
- assortment rationale
- communication history
- internal notes

## Outputs
- email draft
- subject line
- message body
- suggested CTA
- communication tone
- follow-up suggestion

## Reasoning approach
1. Understand the current workflow stage.
2. Identify the right message type.
3. Personalize the communication using seller and category context.
4. Include the correct request or action.
5. Return a draft that can be reviewed and sent by a human.

## Business rules
- Do not send messages automatically unless explicitly allowed by the workflow.
- Keep tone professional and clear.
- Use the right workflow stage in the message.
- Preserve communication history.
- Never invent seller details.

## Trigger events
- seller is shortlisted
- seller needs application follow-up
- onboarding task is delayed
- user requests a draft email
- Beacon routes a communication task

## Interactions
- Receives seller fit rationale from the Discovery Agent
- Receives workflow context from onboarding and review services
- Logs communication actions through the workflow layer
- Shares drafts with Beacon and the UI

## Success criteria
- Email drafts are relevant and personalized.
- Communication feels context-aware.
- Users can move faster without losing control.
