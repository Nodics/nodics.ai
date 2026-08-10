# localizationCore contracts

- Key identity is `namespace:key`; the owning module controls its default message, exact parameters, and exposure.
- Contributions use format version 1 and must pass collision, namespace, key, exposure, size, ICU syntax, and exact-parameter validation before repository import.
- Translation values move through repository-governed draft/review/approved state. Only approved values enter immutable releases.
- Releases are tenant, scope, channel, locale, namespace, version, and checksum bound.
- `nPublish` remains lifecycle authority. This module contributes the `localization` adapter and version provider only.
- Activation and rollback update tenant-scoped Online pointers through repository CAS/idempotency contracts and emit content-free invalidation events.
- Repository providers must enforce tenant isolation, optimistic revisions, immutable releases, audit evidence, and unique key/value/pointer indexes.
