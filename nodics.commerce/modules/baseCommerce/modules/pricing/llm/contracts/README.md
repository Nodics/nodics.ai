# Pricing contracts

Pricing selects only active tenant/currency books and effective product rows, chooses the highest applicable quantity tier deterministically, reports same-tier conflicts, and produces exact immutable decision evidence. Browser code and archived gComm are not pricing authorities.

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
