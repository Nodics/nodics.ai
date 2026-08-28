# Localization Contribution Contract

This contract governs how framework, functional, domain, customer, and user-interface modules participate in internationalisation without creating parallel translation authorities.

## Ownership

- `nLocalization` owns stateless locale canonicalization, immutable context, scope identities, and the provider-neutral client port.
- `localizationCore` owns future persisted locale policy, translation values, resolution, audit, import/export, and the localization adapter to `nPublish`.
- `localizationApi` owns future audience-specific runtime and management projections.
- Domain modules retain their localized business data. CMS components, product/catalog items, communications, and other aggregates must not be copied into generic UI bundles.
- Axis and storefront applications consume authorized APIs. They do not become sources of truth.
- `nPublish` owns generic draft, approval, release, rollback, and activation mechanics; Localization supplies only its domain adapter.

## Stable Keys and Values

Code-owning modules own stable semantic message keys, default/development wording, parameter names, and exposure classification. Deployed wording and translations are runtime-managed localization data so ordinary wording changes do not require application builds.

Keys must be namespaced by owner and intent, remain stable across wording changes, and never contain tenant or user data. Parameters must be named, documented, escaped by the rendering audience, and must not permit executable markup by default.

Contributors use the versioned format demonstrated by `localizationCore/data/core-v001/source/localization/common.json`: `formatVersion`, `ownerModule`, and an `entries` array containing namespace, key, defaultMessage, exact parameter names, and exposure. Import must pass the Localization contribution service; arbitrary translation folders and direct database loaders remain unsupported. Duplicate identities in one contribution fail, and cross-module collisions must be rejected by the durable repository unless the existing owner is unchanged.

## Locale and Resolution Rules

- Locale identifiers use canonical BCP 47 tags.
- Tenant, enterprise, site, channel, and subject preference are trusted server-resolved scope; browser input is only a preference signal.
- Resolution and fallback must be deterministic, bounded, observable, and constrained to the authorized supported-locale policy.
- Every cache or published artifact identity includes tenant, effective scope, channel, locale, namespace set, and release version.
- Missing authority, invalid scope, unsafe parameters, or ambiguous publication state fails closed with stable status definitions.

During compatible API migration, the existing `message` remains available.
Definitions may add a stable dotted `messageKey`, exact scalar parameters, and
an exposure classification. Response handlers project only definition-declared
parameters and permitted exposures. Browser clients localize only that
structured metadata and use the compatible message or safe transport fallback
when bundles or metadata are unavailable.

## Change and Verification

Adding or changing localization behavior requires ownership documentation, configuration defaults, stable status definitions, unit/contract tests, a customer-provider customization test, tenant-isolation coverage where data exists, generated context refresh, and normal repository validation.

Persisted records, APIs, Axis management, CMS/Product migrations, bulk import/export, publication, and operational rollout require their separately approved implementation phases. Metadata scaffolding does not authorize those behaviors.
