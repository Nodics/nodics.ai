# Product Agent Contract

- Follow `../../../../../AGENTS.md` and `../../../../../nodics.foundation/modules/nSetup/llm/ai-enablement-index.md`.
- Follow ancestor contracts and read local guidance.

Product owns shared Product, Category, Variant/SKU identity, localized catalogue records,
publication evidence, and Product search projections. It must not absorb Pricing, Tax,
Inventory, Fulfillment, Media asset lifecycle, nImport/nExport transport, nSearch provider,
or nCache provider authority.

Preserve tenant/Product/Store/locale isolation, mandatory-locale readiness, deterministic
projection evidence, compensation on partial indexing failure, auditable rollback, bounded
bulk validation, and generation discipline. Axis may preview and operate these contracts but
must not reproduce publication rules or persist catalogue truth in the browser.

- Use the existing `schemaOperations` router group and shared `schemaApi` policy;
  do not duplicate schema route declarations in this module. Preserve effective
  source search/read/create/update limits, Staged-only writes and domain publishing.
- Keep generic delete/bulk blocked by the source schema policy. Verify compiled
  transport, grant denial, writable fields and the owning publication tests.

This capability declares an inert model-service inventory for [governed Local reset](../../../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.

Route-category defaults belong to this capability; deployments supply only intentional overrides.
Preserve nRouter enforcement and independent route authorization. See [exposure ownership](../../../../../nodics.foundation/modules/nRouter/llm/contracts/README.md#capability-owned-exposure-defaults).
