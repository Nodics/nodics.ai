# customerReview

Customer review, rating, moderation, response, and aggregate capability.

Use this README to understand what this module is for, which capability or composition boundary it owns, how it fits its parent hierarchy, and where developers or AI tools should continue reading.

For implementation rules, read this module `AGENTS.md` after the root-to-leaf ancestor `AGENTS.md` chain. For exact contracts and examples, read this module `llm/` guidance and the relevant global contracts under `modules/nSetup/llm`.

## Phase 8 status

The review foundation, public shopper evidence, and governed acquisition programme are implemented. Public projections are immutable-version based, sanitized, disclosure-aware, and visible only while published. Rating aggregates are deterministic, versioned, rebuildable, and reconciled from published projections. Solicitation is fulfillment/service-timed, opt-out and quiet-period aware, and prohibited from sentiment selection. Import and syndication are disabled by default and require origin, license, disclosure, target mapping, moderation, idempotency, and reconciliation evidence.

## Ownership

It owns customer reviews, rating dimensions, moderation evidence, business responses, abuse reports, authenticity evidence, migration evidence, helpfulness evidence, rating aggregates, and sanitized public projections.

It must not own generic contact, feedback, testimonial, workflow-runtime, media-binary, communication-delivery, or publication-engine behavior.

## Dependencies and extension

This capability depends on engagementCore and the provider-neutral engagementComms bridge; public APIs remain engagementApi-owned. Customer and project customization belongs in later-loaded modules and layered configuration; archived CRES or gNotify files are reference evidence only.

## Verification

Run the boundary and Phase 6/7 contracts, regenerate the engagement-server schemas, and validate Engagement API, permission, Kickoff, Axis, ownership, documentation, and LLM contracts.
