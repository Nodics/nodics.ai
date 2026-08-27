# customerReview Contracts

## Review capability contract

- Status: implemented; the review foundation and governed CRES cutover boundary are active only when explicitly enabled.
- Owns: customer reviews, rating dimensions, moderation evidence, business responses, helpfulness, abuse reports, authenticity evidence, and rating aggregates.
- Prohibits: generic contact, feedback, testimonial, workflow-runtime, media-binary, communication-delivery, or publication-engine behavior.
- Dependency boundary: engagementCore and the provider-neutral engagementComms bridge; public APIs remain engagementApi-owned.
- Generated schema routers remain disabled; customer and operator use cases are exposed only through `engagementApi`.
- Restrictive moderation requires a policy reason and negative sentiment alone is prohibited as a rejection, hiding, or quarantine reason.
- Incentive, sampling, insider/material relationship, guest, purchase, imported, and AI-assistance evidence remains explicit and versioned.
- Archived CRES sources are read-only migration evidence. Mapping is dry-run/cutover, idempotent, hash-checked, reconcilable, and rollback-evidenced; dual-write defaults off.
- Aggregates, helpfulness, public review projections, solicitation, and syndication remain later-phase behavior.
- Later layers customize through governed configuration and loader-visible overrides without editing this framework package.
- Security, tenant isolation, audit, failure/recovery, and generated-artifact tests are mandatory when implementation begins.
