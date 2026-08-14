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
