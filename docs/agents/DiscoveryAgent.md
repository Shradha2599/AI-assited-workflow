# Discovery Agent

## Purpose
The Discovery Agent finds, evaluates, and ranks sellers that best fit the assortment plan.

## Business objective
Convert assortment requirements into a seller pipeline that Acquisition Managers can act on.

## Primary questions it answers
- Which sellers best fit this category?
- Who should be shortlisted first?
- Which seller has the strongest marketplace presence?
- Which lead should be contacted next?
- Why is this seller a fit?

## Inputs
- assortment plan
- target category priorities
- item type priorities
- seller profiles
- marketplace signals
- social signals
- website signals
- trend signals
- lead history
- outreach history

## Outputs
- ranked seller list
- confidence score per seller
- seller fit explanation
- shortlist recommendation
- outreach recommendation
- structured lead card data

## Reasoning approach
1. Read the assortment requirements.
2. Compare seller profiles against category needs.
3. Evaluate marketplace presence and brand strength.
4. Consider search and trend signals.
5. Score fit, risk, and opportunity.
6. Rank sellers and explain why they appear in the top group.

## Business rules
- Rank sellers only relative to a specific assortment need.
- Do not hardcode the ranking result.
- Explain the reason for each confidence score.
- Keep shortlist logic separate from workflow state changes.
- Use evidence from seller and market signals.

## Trigger events
- Acquisition Manager opens Lead Discovery
- user changes category
- user asks Beacon for seller recommendations
- new assortment plan is available

## Interactions
- Receives priorities from Assortment Intelligence Agent
- Sends outreach-ready context to the Outreach Agent
- Sends seller quality context to the Evaluation Agent
- Shares ranked seller lists with Beacon

## Success criteria
- Acquisition Managers can quickly identify the best sellers.
- Rankings feel evidence-based.
- Shortlisting is intuitive and defensible.
