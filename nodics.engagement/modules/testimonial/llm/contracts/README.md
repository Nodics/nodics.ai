# testimonial Contracts

## Phase 5 contract

- Status: implemented; consent-controlled editorial and publication behavior is active only when the project capability flag is enabled.
- Owns: testimonial sources, attributable consent, editorial versions, approval eligibility, withdrawal, and domain publication projections.
- Prohibits: generic publication runtime, WCMS placement, media binaries, review aggregates, contact handling, or communication delivery.
- Dependency boundary: engagementCore, nPublish through an adapter, WCMS placement references, Media codes, and engagementComms.
- Archived sources are read-only migration evidence and never current authority.
- Original source wording is immutable; every editorial change is a new version and public DTOs never expose source evidence or owner identifiers.
- Publication requires an approved version and active channel/region consent. Media references additionally require media rights.
- Consent withdrawal and emergency hide synchronously remove every active domain projection; recovery reconciles drift and expiry.
- nPublish owns generic publication state, WCMS owns placement, and Media owns binaries; this module stores references only.
- Later layers customize through governed configuration and loader-visible overrides without editing this framework package.
- Security, tenant isolation, audit, failure/recovery, and generated-artifact tests are mandatory when implementation begins.
