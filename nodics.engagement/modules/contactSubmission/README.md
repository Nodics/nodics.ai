# contactSubmission

Customer contact and enquiry intake, routing, SLA, and resolution capability.

Use this README to understand what this module is for, which capability or composition boundary it owns, how it fits its parent hierarchy, and where developers or AI tools should continue reading.

For implementation rules, read this module `AGENTS.md` after the root-to-leaf ancestor `AGENTS.md` chain. For exact contracts and examples, read this module `llm/` guidance and the relevant global contracts under `modules/nSetup/llm`.

## Capability status

The backend vertical slice is implemented: contact intake, guest identity/verification state, routing fallback, SLA, correspondence visibility, attempts, resolution, operator transitions, and content-free external handoffs. Engagement API owns HTTP exposure and Engagement Core owns shared intake governance.

## Ownership

It owns contact forms, enquiries, callbacks, routing, assignment, SLA references, correspondence records, external handoff references, and resolution semantics.

It must not own generic workflow runtime, CRM case authority by default, provider delivery, review ratings, feedback insights, or testimonial publication.

## Dependencies and extension

This capability depends on engagementCore and engagementComms; Process orchestrates tasks and engagementApi exposes approved routes. Customer and project customization belongs in later-loaded modules and layered configuration; archived CRES or gNotify files are reference evidence only.

## Verification

Verification covers accepted and rejected intake, malicious extra-field removal, idempotent replay/conflict, tenant ownership through Engagement API, routing fallback, SLA, Process outage/retry, internal-note filtering, lifecycle concurrency, and later-layer routing policy.
