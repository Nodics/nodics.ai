# Media Management

Media owns governed asset records, folders, formats, storage providers, upload, download, delivery, publication transfer, references, and media sets.

Service-authenticated retained status supports bounded unique pointer batches
through its existing read-only API. Exact retained byte checks also use a bounded
ordered batch on the existing reconcile route, without repair or deletion.
Approval and activation remain separate owner checks; see the
[publication contract](llm/contracts/media-library-publication.md#read-only-pointer-batches).

## Governed Library

The unreleased approval contribution is `media:mediaPublicationWorkflow` at
`0.0.1` in `init-v001`. Explicit installation uses the init catalogue's observed
version and existing nImport drift checks. Process graph version numbers are
separate; repair guidance must not pin historical data release versions.

Axis Media Library and All Media use the existing backend-operations workspace,
not generated schema CRUD. Media supplies scoped, permission-checked metadata
reads, current exact versions where CURRENT versioned storage is installed, and
an explicit version/reference form for requesting existing nPublish approval.
No paths, provider locators or bytes enter library DTOs. Unversioned metadata
remains readable but does not acquire an invented publication version.
Publication defaults remain off; the library does not grant approval or Online
activation. See [the library contract](llm/contracts/media-library-publication.md)
for APIs, permissions, customization and installed acceptance requirements.
An authorized requester may approve its own publication in Axis. Approval is
permission-based, not dependent on a different login; native actor provenance,
tenant/enterprise scope and retained-version activation remain mandatory.

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
- An explicit unknown folder fails policy validation. Omitting the folder uses the configured default. Staged content requires authenticated preview. Anonymous published delivery resolves through the Online owner.
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

- `nodics.wcms/modules/media/data/docs-v001/records/documentation/mediaDocumentationRelease002ComponentData.js`
- `nodics.wcms/modules/media/data/docs-v001/records/documentation/mediaDocumentationRelease002ComponentData.js`
- `nodics.wcms/modules/media/data/docs-v001/records/documentation/mediaDocumentationRelease002ComponentData.js`

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

Process prerequisite diagnostics consume nService’s preserved response-owned code and HTTP status. A confirmed missing Media definition names its explicit workflow release; transport or authorization uncertainty stays blocked.

Media Publication opens at the existing governed library picker. Choosing Inspect publication supplies the asset identity and opens the request tab for a fresh exact-version read; direct inspection handoffs use the same form. A tab choice never initiates publication.

Media reference lookup declares nImport's bounded pre-write dependency retry only for an affirmative generated empty eligible-record read with the exact code/status query. Later phases may hydrate the Media row before CMS bindings run again. Ambiguous records, denied/provider reads, contradictory counts and malformed envelopes remain terminal; lookup never authorizes or applies the caller's write.

After Request Approval succeeds, Axis retains the approval reference, request state, asset and exact version. Review this approval opens the returned Process instance when that destination is authorized. Background metadata refresh keeps the submitted command held; use explicit fresh inspection for another intent. Approval and Online activation still follow Process and nPublish.

Physical artifacts, placements, transfer manifests, publication receipts, replication queue and cleanup candidates are operational evidence. Their effective schemas permit only search/read through generic administration and reject generated HTTP create/update/delete in every runtime. Existing Media provider, publication, replication and cleanup operations retain their own secured service writes. Schema metadata never supplies a manual way to invent checksum, approval or audit evidence.


## Exact retained review evidence

Media exposes two read-only Staged endpoints for a publication's captured source:
`GET /library/publications/:publicationCode/review?localeCode=en|ar` and
`GET /library/publications/:publicationCode/review/image`. Both require human
access tokens, the existing nPublish read access groups, `media.storage.policy.view`
and `publish.lifecycle.view`; image bytes additionally require `media.content.read`.
These are intersections of existing rights, not new grants or public delivery.
The module retains `mediaManagement` exposure and independent API authorization.
Unselected retained publication or Online source roles reject before inspection.

The owner reads the exact nPublish Media root/source and uncached retained manifest,
checks its full digest, tenant and existing library enterprise scope before provider
IO, and projects only captured name, actual metadata version, MIME, byte count and
SHA-256. It never reads current Media to stand in for an older reviewed source.
Provider locators, filenames, URLs, private context and credentials do not enter
this DTO. Metadata reads perform no provider IO and do not prove byte availability.
`previewAvailable` reflects only configured bounds/type and the current permission;
opening the image independently verifies exact retained bytes and checksum.

Preview accepts only bounded PNG/JPEG/WebP/GIF, with no-store, nosniff, restrictive
CSP and no public fallback. Unsupported types, excessive sizes or denied rights
retain useful metadata without enabling inline preview. Storage reads preserve the
original tenant/authentication context and narrow the provider read to that asset's
exact byte count. Review does not create or update assets, approve a task, activate
Online content or make a historical request current.

Customize `media.library.review` inert EN/AR presentation, a narrower raster type
subset and `maximumPreviewBytes` within the publication maximum. Media's provider,
retained manifest and scope checks remain authoritative. Optional working-asset
handoffs reuse the existing Media capability and frontend catalogue admission;
opening them performs fresh current inspection and sends no publication command.
The frontend correlates task publication/root/source identity, hashes preview bytes,
retires old actor/source responses and revokes image URLs. Process's existing pinned
review context and decision policy remain unchanged. Completed detail tasks already
carry that bounded context; no workflow history or actor policy is rewritten.

`mediaPublicationReviewContract.test.js` composes actual owner inspection, controller,
facade and content handler with isolated generated-service/provider ports. It covers
positive/negative acknowledgements, no current-row fallback, scope and permission
denial before bytes, malformed identities, corrupt bytes, preview bounds and safe
customization. Native roles, private-provider storage and deployment readiness remain
separate acceptance gates; isolated checks do not certify a customer environment.

Documentation provenance release 0.0.2 preserves article bodies and stable routes while correcting source integrity/navigation metadata. The [manifest](data/manifest.json) selects it; prior exact bytes remain in test fixtures. Source validation does not install, approve or publish this release.

## Cross-owner retained image qualification

`DefaultMediaDependencyReadinessService.inspectAssets` is the read-only owner contract for exact retained image metadata, physical byte integrity and an unchanged activated publication pointer. CMS retains responsibility for selecting assets from its sealed bundle; Editorial retains responsibility for its saved featured-image reference. Both reuse this Media service and the existing inert Media review handoff. Inspection never approves, repairs, activates or releases legal hold. Missing or contradictory evidence remains unqualified.

Folder allowedExtensions and allowedMimeTypes are native arrays, matching the storage-policy owner normalization and upload eligibility checks. They remain optional, owner-validated upload policy; saving them grants no public delivery or publication. Existing non-array installed values require explicit owner review before adoption; the Local acceptance baseline contained no folder rows before its disposable fixture.
New retained uploads record the authenticated creator in the existing audit
field. Re-uploads preserve the original creator and the existing version check.
