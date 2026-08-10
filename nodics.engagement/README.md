# Customer Engagement

Nodics customer engagement functional module group.

Use this README to understand what this module is for, which capability or composition boundary it owns, how it fits its parent hierarchy, and where developers or AI tools should continue reading.

For implementation rules, read this module `AGENTS.md` after the root-to-leaf ancestor `AGENTS.md` chain. For exact contracts and examples, read this module `llm/` guidance and the relevant global contracts under `modules/nSetup/llm`.

## What this group provides

Customer Engagement is the governed framework boundary for customer contact submissions, reviews and ratings, feedback, testimonials, shared engagement governance, communication intents, and secured APIs. Phases 1 through 6 implement Core, API, contact, testimonial, and review foundations including governed CRES cutover. Domain capabilities remain disabled at framework level until a deployment or tenant layer explicitly enables them.

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

`nodics.communication` is a separate planned functional module. Until it is implemented and validated, `engagementComms` must remain dormant and fail or defer safely without losing accepted Engagement data.

## Customization

Customer projects extend the relevant child capability through later-loaded modules and layered configuration. They must preserve the standard `nodics.engagement` functional identity and must not copy archived CRES/gNotify source or generated Core residue.

## Current verification

Run structure audit, metadata validation, group and implemented-child contracts, then regenerate and validate module context. Core and domain schemas remain internal. Dedicated APIs expose contact intake and sanitized published testimonials; customer consent withdrawal and operator recovery stay secured. Axis renders backend-published contact and testimonial workspaces.
