# localizationCore

Authority boundary for translation key/value/release records, ICU validation, contribution import/export, immutable release construction, and the localization adapter to generic `nPublish` lifecycle mechanics. Repository persistence remains provider-selected; this module never duplicates publication state or exposes generic schema CRUD.

The module provides operator projections for coverage, missing/fallback reconciliation, translation queues, side-by-side editing data, and audit analytics. Values resolve through `STANDARD -> PROJECT -> TENANT` precedence. Protected keys reject project/tenant overrides unless the caller has the configured protected-override group; a module may further narrow allowed scopes in its immutable key contribution.

Approved human translations can enter tenant-scoped translation memory. Machine translation is an optional configured service adapter and can return suggestions only; suggestions are never approved or published automatically. Runtime publication continues through `nPublish`, immutable releases, Online pointers, and content-free invalidation events.

Functional modules own their namespaces and contribute stable keys through layered `localizationContributions`. Localization validates and imports those contracts but cannot rename their semantics. CMS, Product, Communication templates, Process definitions, and other domains retain localized business-content ownership.

Use this README to understand what this module is for, which capability or composition boundary it owns, how it fits its parent hierarchy, and where developers or AI tools should continue reading.

For implementation rules, read this module `AGENTS.md` after the root-to-leaf ancestor `AGENTS.md` chain. For exact contracts and examples, read this module `llm/` guidance and the relevant global contracts under `modules/nSetup/llm`.
