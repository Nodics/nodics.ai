# Product contracts

- Product, Category, and Variant/SKU have one shared tenant-scoped commercial identity.
- Localized text, SEO, display attributes, classification values, and media text use separate owner-plus-locale records.
- Price, tax, inventory, fulfillment, and Media asset lifecycle never enter Product localization records or projections.
- Publication requires every configured mandatory locale and field to be `READY`.
- Preview is read-only; stage records evidence; publish synchronizes locale projections; rollback appends evidence and restores snapshots.
- Projection/index/cache identity includes tenant, Product, Store, and locale. Provider choice remains with nSearch/nCache adapters.
- Bulk file transport remains with nImport/nExport; Product owns validation and schema semantics.
- Later layers customize configuration and services without weakening tenant isolation, evidence, compensation, or rollback behavior.

## Source authoring APIs

The owning schemas select the existing `schemaOperations` router group; no
module-specific duplicate routes are maintained. Effective metadata permits
search/read/create/update for the source record, with Staged required for writes.
Delete/bulk remain rejected by source policy. Other read-only projections retain
their own policy; ingestion and publication stay domain-owned.

Schema Utility projects actual paths, methods, versions and activation. Consumers
use the advertised or standard canonical resource once; no error triggers another
transport. Shared `schemaApi.readPermission/writePermission` defaults use
`system.schema.view/manage` with exposure category `schemaApi`, in addition to
schema/property/tenant/ownership checks. No obsolete owner-specific authoring
permission defaults remain. Update grants through their existing authority.

Preserve generated raw-model PUT and query/model PATCH contracts, original
revisions, persisted responses, Staged enforcement and domain publication.
Source/prepared tests do not establish live authentication or persisted grants.
