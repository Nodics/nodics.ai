# testimonial

Consent-governed customer testimonial curation and publication capability.

Use this README to understand what this module is for, which capability or composition boundary it owns, how it fits its parent hierarchy, and where developers or AI tools should continue reading.

For implementation rules, read this module `AGENTS.md` after the root-to-leaf ancestor `AGENTS.md` chain. For exact contracts and examples, read this module `llm/` guidance and the relevant global contracts under `modules/nSetup/llm`.

## Capability status

The testimonial vertical is implemented with provenance-safe candidates, immutable editorial versions, scoped consent and rights, customer confirmation, approval eligibility, sanitized projections, nPublish handoff, emergency hide, withdrawal, expiry, and reconciliation. Generated schema routers remain disabled; dedicated public, customer, and operator operations are owned by `engagementApi`.

## Ownership

It owns testimonial sources, attributable consent, editorial versions, approval eligibility, withdrawal, and domain publication projections.

It must not own generic publication runtime, WCMS placement, media binaries, review aggregates, contact handling, or communication delivery.

## Dependencies and extension

This capability depends on engagementCore, nPublish through an adapter, WCMS placement references, Media codes, and engagementComms. Customer and project customization belongs in later-loaded modules and layered configuration; archived CRES or gNotify files are reference evidence only.

## Verification

Run `node test/testimonialBoundaryContract.test.js` and `node test/testimonialLifecycleContract.test.js`; the target build also generates four schema contracts. Release qualification additionally covers Engagement API, permission, Axis metadata, Kickoff runtime, LLM, and live acceptance checks.
