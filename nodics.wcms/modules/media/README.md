# Media Management

Media owns governed asset records, folders, formats, storage providers, upload, download, delivery, publication transfer, references, and media sets.

## Governed Library

Axis Media Library and All Media use the existing backend-operations workspace,
not generated schema CRUD. Media supplies scoped, permission-checked metadata
reads, current exact versions where CURRENT versioned storage is installed, and
an explicit version/reference form for requesting existing nPublish approval.
No paths, provider locators or bytes enter library DTOs. Unversioned metadata
remains readable but does not acquire an invented publication version.
Publication defaults remain off; the library does not grant approval or Online
activation. See [the library contract](llm/contracts/media-library-publication.md)
for APIs, permissions, customization and installed acceptance requirements.

## Canonical Staged Media Preparation

Run `nodics project:run acceptance:media-seed --manifest-modules=<module,...> --execute`
from the selected customer project/environment. Without `--execute`, mutation is
rejected; `--help` performs no configuration discovery or network operations.
The module list is an allowlist intersected with effective Platform application
profiles. Inactive selections are ignored; no matching assets is an error.
Existing `MEDIA_ASSET_MANIFEST` descriptors supply paths and business purpose.
Customer assets stay customer-owned; reusable accelerator assets stay with their
accelerator. No copied upload suite or parallel manifest registry is needed.

The command validates all paths and duplicate codes before network access, then
uses employee-authorized Media uploads on the selected `WCMS_STAGED` runtime.
Each response must prove the media code and SHA-256 checksum. Denials, malformed
responses and duplicate errors fail, rather than becoming a false success.
Repeat preparation uses the same Media save API; partial failures are not rolled
back automatically. Reconcile the cause before retrying. Online publication,
service credentials and approval decisions are not part of this command.

## Responsibility

Routine setup reads can use the [persisted readiness aggregate](llm/contracts/media-lifecycle-contracts.md#persisted-readiness-aggregate)
to inspect up to 100 CURRENT metadata descriptors in one authorized request.
This is not provider-byte verification or Online publication proof; explicit
preparation and publication retain their existing integrity checks.

This module manages media metadata and storage policy. Product, CMS, engagement, and import/export modules own their domain relationship to a media code.

## Developer Notes

- Store physical artifacts through provider contracts and generated storage keys.
- Keep folder, format, source context, delivery policy, and access decisions explicit.
- Do not expose local storage roots or private provider paths through public documentation or APIs.
- Use project-layer provider configuration for local, NAS, S3, Azure, or Google Cloud style deployments.
- Customer photo orchestration may use bounded encoded intake after its own
  analysis succeeds. Media retains upload policy, original filename, private
  storage, owner identity and checksum-checked idempotent replay.

## Retained Publication (Gated)

Media now has owner-local exact-version capture, hidden target preparation and
transactional placement/receipt methods for the existing nPublish provider
contract, authenticated target routes/transport, and a fixed Process callback
binding with an explicit Media-owned workflow release. Publication providers
are **not registered or enabled**. Existing CMS transfer remains
unchanged and does not gain these guarantees automatically.

Developers and maintainers: start with [the retained publication contract](llm/contracts/README.md#retained-publication).
It defines the service interfaces, required shared integration, migration and
acceptance gates. Operators must not enable `media.publication.versionProviderEnabled`
until those gates pass. Business users continue using the existing governed
publication workflow; there is no new approval UI or public route in this batch.

Qualified Staged operators can submit an exact metadata version through secured
`POST /nodics/media/v0/publication/requests`; it captures retained content and
delegates validation and approval to nPublish. See the
[local qualification handoff](llm/contracts/README.md#local-qualification-handoff)
for composition, connection and API prerequisites.

## Documentation

Deep documentation lives in:

- `nodics.docs/docs/pages/nodics.wcms/media-management.md`
- `nodics.docs/docs/pages/nodics.wcms/publishing-lifecycle.md`
- `nodics.docs/docs/pages/nodics.foundation/data-import-export-migration.md`

## Verification

Run media lifecycle, transfer, delivery, reference, and provider tests when behavior changes, then run:

```bash
npm --prefix nodics.docs test
npm run quality:docs
```

This capability declares an inert model-service inventory for [governed Local reset](../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.

Route-category defaults belong to this capability; deployments supply only intentional overrides.
Preserve nRouter enforcement and independent route authorization. See [exposure ownership](../../../nodics.foundation/modules/nRouter/llm/contracts/README.md#capability-owned-exposure-defaults).

Customer photo operations preserve the authenticated customer bearer header when
resolving the canonical owner through Profile. Missing credentials or a tenant
mismatch are rejected; request-body credentials are never trusted. Runtime
service credentials must not substitute for the customer session in this lookup.
