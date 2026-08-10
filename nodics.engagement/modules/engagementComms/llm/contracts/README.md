# engagementComms Contracts

## Phase 1C contract

- Status: active provider-neutral bridge.
- Owns: Engagement communication scenarios, declared variables, safe context builders, provider-neutral intent translation, idempotency mapping, and content-free outcome correlation.
- Prohibits: templates, provider accounts, credentials, transport, retry/fallback, generic preferences, OTP mechanics, inbox persistence, or another domain's state.
- Dependency boundary: consumes validated `nodics.communication`; Communication never depends on Engagement, and outage must defer without domain data loss.
- Archived sources are read-only migration evidence and never current authority.
- Later layers customize through governed configuration and loader-visible overrides without editing this framework package.
- Security, tenant isolation, audit, failure/recovery, and generated-artifact tests are mandatory when implementation begins.
