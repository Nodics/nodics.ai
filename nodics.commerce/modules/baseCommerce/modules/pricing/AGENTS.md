# Pricing Agent Contract

- Follow `../../../../../AGENTS.md` and `../../../../../nodics.foundation/modules/nSetup/llm/ai-enablement-index.md`.
- Follow ancestor contracts and read local guidance.

Preserve Commerce ownership, tenant security, exact evidence, idempotency, audit, and generation discipline. Implementations are active; read the current owning contracts before changes.

- Use the existing `schemaOperations` router group and shared `schemaApi` policy;
  do not duplicate schema route declarations in this module. Preserve effective
  source search/read/create/update limits, Staged-only writes and domain publishing.
- Keep generic delete/bulk blocked by the source schema policy. Verify compiled
  transport, grant denial, writable fields and the owning publication tests.

This capability declares an inert model-service inventory for [governed Local reset](../../../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.

Route-category defaults belong to this capability; deployments supply only intentional overrides.
Preserve nRouter enforcement and independent route authorization. See [exposure ownership](../../../../../nodics.foundation/modules/nRouter/llm/contracts/README.md#capability-owned-exposure-defaults).
