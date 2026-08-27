# engagementCore Contracts

## Core capability contract

- Status: implemented core contracts; public routes and domain behavior remain inactive.
- Owns: shared intake envelopes, lifecycle vocabulary, consent, assignment, audit, protection, form-definition contracts, and integration references.
- Prohibits: review, feedback, testimonial, contact, provider-delivery, workflow-runtime, media-binary, or generic publication behavior.
- Dependency boundary: Nodics Foundation contracts; it integrates with Process, Profile, Publish, WCMS/Media, Search, Cache, and Cron only through their owned boundaries.
- Archived sources are read-only migration evidence and never current authority.
- Later layers customize through governed configuration and loader-visible overrides without editing this framework package.
- Security, tenant isolation, audit, failure/recovery, and generated-artifact tests are mandatory when implementation begins.
- Every submission requires tenant, correlation, idempotency, type, and configured retention identity.
- Lifecycle mutation requires an allowed transition and expected revision. Consent retains purpose, policy version, evidence, and withdrawal state.
- Evidence is bounded and secret-like keys are redacted before persistence or emission.
- Process and publication adapters return references only; they do not duplicate workflow or nPublish lifecycle authority.
- Idempotency replay is accepted only when the stored request hash matches.
