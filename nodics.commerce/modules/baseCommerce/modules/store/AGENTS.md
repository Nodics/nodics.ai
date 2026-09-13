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

Store owns explicit store-reference validation through its existing context
service. Keep identity and operation context consistent; no policy-selected
fallback, fabricated record, second resolver authority or privileged read bypass.
Identifier validation and master Store/Channel validation have distinct contracts.

This capability declares an inert model-service inventory for [governed Local reset](../../../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.
