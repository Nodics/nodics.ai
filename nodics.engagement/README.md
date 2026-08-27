# Customer Engagement

Nodics customer engagement functional module group.

Use this README to understand what this module is for, which capability or composition boundary it owns, how it fits its parent hierarchy, and where developers or AI tools should continue reading.

For implementation rules, read this module `AGENTS.md` after the root-to-leaf ancestor `AGENTS.md` chain. For exact contracts and examples, read this module `llm/` guidance and the relevant global contracts under `modules/nSetup/llm`.

## What this group provides

Customer Engagement is the governed framework boundary for customer contact submissions, reviews and ratings, feedback, testimonials, shared engagement governance, communication intents, and secured APIs. The current implementation covers Core, API, contact, testimonial, review, feedback, unified operations, governed automation, and provider-neutral resilience foundations including governed CRES cutover. Domain capabilities remain disabled at framework level until a deployment or tenant layer explicitly enables them.

## Package map

| Package | Responsibility |
| --- | --- |
| `engagementCore` | Shared intake, lifecycle, consent, assignment, protection, audit, and scoped form contracts |
| `customerReview` | Reviews, ratings, moderation, responses, authenticity, abuse, and aggregates |
| `customerFeedback` | Feedback, complaints, surveys, follow-up, resolution, and insights |
| `testimonial` | Consent-controlled testimonial editing, eligibility, and domain projections |
| `contactSubmission` | Contact/enquiry intake, routing, SLA, correspondence, handoff, and resolution |
| `engagementComms` | Safe Engagement context and provider-neutral Communication intents/outcomes |
| `engagementApi` | Public, customer, operator, projection, and integration API boundaries |

## Activation and ownership

Activating `nodics.engagement` requires all seven children in the declared order. Layered feature policy controls whether an experience is available; it does not remove packages from the graph. The group owns composition, shared configuration, tests, and guidance only—never domain schemas, routes, services, controllers, facades, or data.

`nodics.communication` is a separate implemented functional module.
`engagementComms` remains a one-way bridge: Engagement requests delivery but
does not own templates, channel policy, provider execution, callbacks, or inbox
records. External providers remain disabled until deployment qualification;
the deterministic local provider supports development and contract acceptance.

## Customization

Customer projects extend the relevant child capability through later-loaded modules and layered configuration. They must preserve the standard `nodics.engagement` functional identity and must not copy archived CRES/gNotify source or generated Core residue.

## Current verification

Run structure audit, metadata validation, group and implemented-child contracts,
then regenerate and validate module context. Core and domain schemas remain
internal. Dedicated APIs expose governed intake, sanitized public projections,
operator lifecycle actions, unified read projections, and non-executable
preview operations. Customer consent withdrawal, publication removal, recovery,
and repair stay secured. Axis renders only backend-published Engagement domains,
workspaces, permissions, and lifecycle actions.
