# contactSubmission Contracts

## Email presentation

This module owns `src/templates/email/contact-acknowledgement`: a parameterized
HTML/text/subject resource, not delivery logic or configuration content. It requires
explicit selection or optional sample-v002 adoption; file discovery alone never
enables sending. Later customer modules and runtime scopes may override individual
files using the [Communication resource contract](../../../../../nodics.communication/modules/commsCore/llm/contracts/template-resources.md).
Keep source ownership, required parameters and optional activation invariant.
Communication renders and transports; this domain retains business decisions.

## Contact capability contract

- Status: backend vertical slice implemented; Axis workspace and live-provider evidence remain separate deliverables.
- Owns: contact forms, enquiries, callbacks, routing, assignment, SLA references, correspondence records, external handoff references, and resolution semantics.
- Prohibits: generic workflow runtime, CRM case authority by default, provider delivery, review ratings, feedback insights, or testimonial publication.
- Dependency boundary: engagementCore and engagementComms; Process orchestrates tasks and engagementApi exposes approved routes.
- Archived sources are read-only migration evidence and never current authority.
- Later layers customize through governed configuration and loader-visible overrides without editing this framework package.
- Security, tenant isolation, audit, failure/recovery, and generated-artifact tests are mandatory when implementation begins.
- Contact records link to, but never replace, their Engagement Core submission.
- Anonymous submission requires tenant, correlation, and idempotency context resolved by the API/runtime boundary.
- Only allow-listed contact fields survive validation. Guest owner references are irreversible email digests; raw credentials and unknown fields are never persisted.
- Internal correspondence is excluded from customer views. Operator mutation requires tenant scope, permission, and expected revision.
- Process, Communication, CRM/helpdesk, and calendar outcomes are content-free references; missing providers defer and failures enter retry state without losing the contact.
- The group `engagement.capabilities.contactSubmission` flag remains false by default; every contact API operation fails closed until a deployment or tenant layer enables it.
