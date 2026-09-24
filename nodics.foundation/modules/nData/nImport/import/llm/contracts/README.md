# import AI Contracts

This folder contains module-specific AI/developer contracts for `nodics.foundation/modules/nData/nImport/import`.

Use these files for rules that are more specific than root `AGENTS.md` and the module `AGENTS.md`, especially extension boundaries, override expectations, testing rules, security constraints, and generated-artifact responsibilities.

## Managed technical counters in module data

- For effective schemas explicitly declaring managed concurrency, support
  `saveAll` through the existing generated service. Reject other operations;
  do not translate broad delete/update imports to unlocked mutations.
- Read original tokens using the owning generated service, tenant and import
  authorization. Ignore legacy source technical counters, including `revision: 1`.
- Cache original snapshots for retries of the same model-import request. Never
  fetch a newer token to hide a failed compare-and-set. This cache is not durable
  run state and does not make partially completed files atomic.
- New runs can read new snapshots under existing import/release policy. Keep
  business versions, `versionId` reconciliation, immutable release identity,
  checksum validation, source ownership, and publication authority unchanged.
- Preserve generated defaults and actual persisted counters. An unchanged
  `saveAll` row is a no-op, not a reason to increment or reset its counter.

## Guided initialization

- Guided profiles are layered runtime configuration owned and executed by
  nImport. Axis may render, validate, and invoke a profile but must not discover
  releases, decide their order, or bypass the immutable release service.
- Profile installation retains the historical Core administrator route for
  bootstrap compatibility, while nImport also requires every type-specific
  execution permission represented by the resolved profile. Catalogue and
  validation retain separate read and validate permissions.

## Versioned content packs

- Reuse `DefaultContentPackService` and `DefaultImportService`; never add a
  client, CMS, BackOffice, Wiki, or project-specific parallel importer.
- Keep content packs disabled by default and enable them through later-layer
  `data.contentPacks` configuration.
- Validate immutable version, contract version, every generated-file checksum,
  aggregate release checksum, contained paths, tenant scope and update policy.
- Include content-pack code, immutable version, and release checksum in import
  duplicate fingerprints so update releases remain distinct and retry-safe.
- Copy local releases into server-owned staging before local import because
  that lifecycle moves files.
- Treat committed content-pack data and its manifest as the distribution
  artifact. Consumer builds, `.work` copies, and caller-selected filesystem
  paths are outside the governed installation contract.
- System owns secured HTTP exposure; nImport owns execution and run history;
  Axis owns only status/action presentation.
- Stable-code `saveAll` imports create and update records. Do not claim physical
  removal, catalog activation or publication until composed through CMS,
  Workflow and nPublish authorities.

## Module release manifests

- Module release authoring is folder and header driven. Developers create
  `data/init-v001`, `data/core-v001`, or `data/sample-v001` folders with
  `headers`, `records`, and optional `assets`.
- Headers are the executable routing contract. They declare target module,
  schema or index, operation, query, and `dataFilePrefix`.
- `data/manifest.json` is generated evidence. It may provide lifecycle,
  destination, display, publication-review, grouping, and checksum metadata,
  but it is not the place where developers maintain file membership by hand.
- Runtime discovery must compute the current file map from disk, expand
  selected headers to matching record files, include referenced media assets,
  and calculate the release checksum from that current state.
- A missing manifest must not hide conventional active-module release folders.
  A stale generated checksum map must not make a release invalid by itself.
- Stable installed releases still require version discipline. If the computed
  checksum changes for a non-development installed version, block execution
  unless the release version changes or an explicit later-layer policy permits
  the change.
- Release catalogue readiness blockers must use the shared BackOffice/Axis
  capability-readiness vocabulary. Emit stable `blockerCode`, `code`,
  `owner`, `ownerType`, `source`, `message`, `action`, `disabledReason`,
  sanitized `technicalStatus`, optional target evidence, and severity values
  from `INFO`, `WARNING`, `BLOCKED`, or `REPAIR_REQUIRED`. Do not reintroduce
  legacy `ACTION` or `BLOCKER` severities as the primary contract.
  `dataRelease.install` repair metadata may guide authorized
  install/update/retry actions, but Axis still invokes the existing nImport
  execution route with immutable release selections. Invalid manifests are
  source repair guidance, not an automatic browser repair.
- Optional `release.descriptor.json` files may supply business grouping hints
  such as release code, capability code, inherited capability, release type,
  and short business outcome when framework/tooling cannot derive them from the
  owning module and generated manifest. They are source-side hints only. They
  must not be required for every release, must not replace the generated
  manifest, and must not contain environment values, secrets, runtime URLs, or
  operator credentials.
- Pipeline and tooling hooks own manifest refresh, checksum calculation,
  descriptor validation, and repair diagnostics. Axis and custom projects must
  not hand-maintain checksum maps or source repair state. A corrupted release
  must report what is wrong, which owner must repair it, whether a generated
  command can refresh evidence, and why browser repair is unavailable when the
  source package itself is invalid.
- nImport owns the data-release readiness repair provider. The provider may
  execute `dataRelease.install` actions (`PREPARE_CAPABILITY`,
  `UPDATE_RELEASE`, `RETRY_FAILED_IMPORT`) and validation-only
  `dataRelease.status` refresh by delegating to `DefaultDataReleaseService`.
  BackOffice remains the orchestrator for provider discovery, capability
  checks, target locks, receipts, audit and refresh events. Axis must only call
  the BackOffice repair endpoint and render the returned contract.

## Media-backed file import

- Axis and other frontend clients must upload files through `nodics.wcms/media`
  before starting a browser-facing file import. This is the reusable import
  intake path; do not add an nImport-specific multipart upload route.
- The frontend may pass `source.type = MEDIA` and `source.mediaCode` to the
  import capability. It must not pass raw local paths, temporary folders, cloud
  object keys, NAS paths, bucket names, provider URLs, or credentials.
- `media` owns media upload semantics, storage provider selection, storage
  keys, checksum, media lifecycle, and backend-only storage descriptors. The
  route/body-parser extension point remains framework-owned and must not be
  duplicated inside nImport.
- `nImport` owns generic media import target acceptance, optional import
  templates, media-source acceptance, import-run staging, format parsing,
  finalization, target dispatch, diagnostics, and run history.
- Import run history may be filtered by `mediaCode`; this is translated to the
  sanitized source name `media:{mediaCode}` and must stay read-only for
  BackOffice/Axis media-linkage views.
- The secured media-backed import route is
  `POST /nodics/import/v0/media`. It accepts `mediaCode` plus either a
  generic `moduleName`/`schemaName` target or an optional future
  `definitionCode` template, and optional `options.validateOnly`.
- Generic media import is schema-first: Axis may select an authorized target
  model from Workbench metadata, but nImport generates the runtime header and
  executes validation/dispatch.
- Import templates may later map recurring business import choices to module
  name, schema or index target, operation, tenant scope, data-file prefix, query
  mapping, optional macros, options, and allowed file extensions. Templates are
  conveniences over the same route, not a required authority for generic file
  import.
- Media import execution generates a run-local header from the generic target
  or optional template. The generated header is temporary runtime material, not
  source authority.
- A media-backed import implementation must stage the media into an
  import-run-owned workspace before invoking existing local file import
  pipelines, because local import processing can move processed files.
- Validation-only media import may resolve media, validate definition policy,
  generate the temporary header, stage the source file, run the standard local
  initializer, parse rows, and prepare finalized records inside the run
  workspace. It must stop before `processDataImportPipeline`; it must not
  dispatch schema/search writes or mark the import installed.
- `DefaultMediaImportSourceStagingService` is the import-owned staging
  primitive. It may call media-owned source resolution, but it must not inspect
  provider configuration directly or expose backend source paths in public
  projections.
- Public API responses and Axis state must not expose provider secrets, local
  absolute paths, object-store keys, signed URLs, or storage implementation
  details.
- Project customization should add headers, processors, optional import templates,
  media folder policy, provider services, or remote adapters through later
  layers. Do not create a parallel upload table, parser, importer, or direct
  persistence path.

## Layered immutable source composition

System headers use target-module-qualified identities and select files only from
contributing release roots. The same basename/key in unrelated targets cannot
merge. Include an explicit matching header in each source contribution; changing
an inherited dataset's schema/index target is rejected. Header arrays replace.

Release plans execute version directories before later versions, and module
indexes before later layers within each directory. A current lower JS release
with the same source root, logical filename and explicit header target supplies
source-only inherited fields. Apply only keys authored by the executing delta;
never replay its baseline's other records. Validate baseline destination,
installation state and immutable checksum. Missing or running baselines block
execution; a selected predecessor may satisfy preflight once it is installed.
Custom installers and non-JS formats do not receive JS source-key semantics.

Startup evaluates Init deltas on each boot through this release authority,
skips current receipts, and refuses same-version edited Init content rather
than silently replaying it. Startup and operator triggers are separate type
policy fields. Running receipts are not completion or safe retry proof; the
in-process guard is supplemented by the durable claim contract below.

## Concurrent release execution

Installation receipts use the database owner's managed `revision` counter. Each
execution claims a release as `RUNNING` with a unique `executionId`; first creation
uses atomic insert and subsequent claims use compare-and-set. Completion/failure
requires the same running attempt and its current revision. Missing storage,
failed reads, conflicting claims and stale completion fail closed. This reuses
`DefaultModelConcurrencyService` through generated services, with no parallel
lock store or background renewal loop. Providers must support its atomic contract.

Only the claimed release can become `FAILED`; later unstarted releases remain
unchanged. Previously completed deltas remain current. A crashed attempt stays
`RUNNING` until governed recovery establishes that the previous importer has
stopped. There is no timeout takeover: a receipt counter fences receipt writes,
not arbitrary business writes already in flight. Never clear a running receipt
while its worker might still be writing. This mechanism does not make a sequence
of business writes transactional or prove automatic crash-safe replay.

Verification includes independent executors racing absent and existing receipts,
stale completion, partial-plan failure and missing/failed storage. Provider and
live multi-process behavior still require deployment qualification.

## Inherited governance and selected profiles

See [governance defaults and selected owner templates](inherited-governance.md).

## Content-pack defaults and manifest paths

Inherit nImport defaults and derive content paths from the selected manifest. Preserve per-pack overrides, disabled import gates and validation. See [the detailed contract](inherited-governance.md#content-pack-defaults-and-manifest-paths).

Sample releases are available to authorized manual operators by default, with optional deployment restriction. Only Init can auto-run at startup. Environment scope reads the effective `environment.class` projected by nConfig from the selected environment module metadata; never author it in environment properties or derive it from the selected environment name or another capability policy. Permissions, roles, tenant isolation, release checksums and durable receipts remain mandatory.
