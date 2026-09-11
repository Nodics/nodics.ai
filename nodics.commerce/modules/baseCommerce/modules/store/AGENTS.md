# Store Agent Contract

- Store, Sales Channel and Point of Service use generated managed concurrency.
  Do not calculate their next `revision` in domain services or data files. Keep
  the original read token on updates and use the persisted response afterwards.

- Follow `../../../../../AGENTS.md` and `../../../../../nodics.foundation/modules/nSetup/llm/ai-enablement-index.md`.
- Follow ancestor contracts and read local guidance.

Preserve Commerce ownership, tenant security, exact evidence, idempotency, audit,
and generation discipline. Store owns the implemented store, sales-channel, and
point-of-service schemas and services.

Keep general Point of Service location association optional: online service
points must work without Location. Enforce genuine physical-location requirements
in the owning operation or later-loaded project schema. Retain reference metadata;
never fabricate a location or weaken tenant/security validation to import data.
