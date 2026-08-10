# nodics.localization contracts

- Stable keys and parameters are module-owned contracts; localized values are governed data.
- Localization owns lifecycle, release, override, reporting, memory, and provider ports, not domain business content.
- Override precedence is STANDARD, then PROJECT, then TENANT; protected keys fail closed.
- Draft, review, approval, release build, nPublish activation, and rollback preserve tenant scope and audit evidence.
- Machine providers return non-publishing suggestions only; human review remains mandatory.
- Axis consumes secured operations and published bundles without storing a parallel catalogue.

The root owns only group identity, child composition, configuration, and guidance. `localizationCore` will own persisted localization authority; `localizationApi` will project authorized audiences. Both are foundation-only in Phase 1.

Domain-localized records remain in their domain. Runtime UI messages may later be contributed by stable keys and published through localization, but arbitrary module JSON folders are not a supported contract.
