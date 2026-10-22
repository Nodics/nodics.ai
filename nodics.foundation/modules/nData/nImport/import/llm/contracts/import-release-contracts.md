# import AI Contracts

## Tenant startup receipts

`dataInstallation` and `importRun` models are prepared in every active tenant,
including tenants created after startup. Release planning, fenced installation
claims and history use the original request tenant and its own database models;
never fall back to the default tenant to conceal a missing model. The
`importDefinition` catalogue retains its explicit default-tenant restriction.
This model availability neither grants import permission nor broadens header
tenant selection. Enterprise preparation must await model construction before
Init planning and retain existing receipts on partial preparation failures.

## Custom installer preflight

The existing secured `/init/validate` controller/facade path calls
`DefaultDataReleaseService.preflight`. For every selected custom release,
including CURRENT receipts, `preflightContributions` resolves the installer from
`data.dataReleases.installers` and calls its read-only `preflightContribution`
with the nImport-qualified descriptor and original authorized principal/tenant.
Missing hooks or malformed results fail closed. Neither request bodies nor
HTTP clients select a provider or supply trusted contribution provenance.
The hook must never install, write receipts, acquire elevated auth or change
configuration. Normal release discovery, destination and checksum guards run first.

Results appear in `data.contributionPlans`; `data.validation.ready` is true only
when every selected custom installer returns `ready: true`. Standard releases
retain their existing metadata/composition preflight. Release-level dry-run counts
and CURRENT receipts do not override a blocked owner plan. Process supplies
verified immutable evidence before transition approval, with a blocker instead
of an authorized plan; exact transition configuration remains its only authority.
Corrupt evidence and unexpected read failures reject preflight. Installation
continues through the existing `/init/install` authority and rechecks owner policy.
No new endpoint, acceptance installer or runtime service dispatcher is introduced.
`test/dataReleaseContributionPreflight.test.js` exercises the actual controller,
facade, release discovery and Process planner with isolated generated read ports;
it does not claim live HTTP authorization or installation acceptance.

## Custom contribution payloads

`await DefaultDataReleaseService.readContributionPayload(contribution,
installerCode, payloadName)` returns fresh detached JSON for one explicitly
declared payload in a custom DATA_RELEASE. The owning installer supplies fixed
installer and `.json` basename arguments. HTTP request paths and file lists
never establish authority. The contribution must exactly match the currently
discovered release code, module, section, type, source root, version, checksum,
installer, destination, environment scope, lifecycle, selection policy and owning
domain. Existing discovery selectors,
type policy, lifecycle validation and destination APIs remain authoritative.

The reader checks canonical owner/data/source containment before discovery,
rejects symlinks, nonregular files, traversal, missing declarations and ambiguous
payload basenames, then rechecks selected file membership, manifest bytes and every
declared file's aggregate SHA-256 checksum before JSON parsing. Parser and
filesystem failures return bounded `ERR_IMP_00003` text without paths or payload
fragments. The JSON payload is never required as executable code. No importer,
receipt or registry is created. Owner services retain instruction limits and all
business validation.

`data.dataReleases.maximumContributionPayloadBytes` defaults to 1048576 bytes
per selected file, including metadata; `maximumContributionBytes` defaults to
8388608 bytes for the selected declared files plus their identity manifest.
Unrelated source-root files and assets are not snapshotted or charged to either
limit. Later layers may change these positive integer bounds. File count uses
the existing `maximumFilesPerRelease`; selected paths have bounded depth.
Independent partner coverage lives in `test/dataReleaseContributionPayload.test.js`,
including a 200 KB payload, forged metadata, changed non-payload bytes, symlinks,
drift, malformed JSON and tightened/extended limits. These are offline source
tests, not live import or provider acceptance.

## Strict installed migration evidence

The [installed migration journal contract](installed-migration-journal.md)
defines the internal fail-closed `importRun` extension, immutable aggregate plans,
atomic checkpoint API, stopped-worker recovery and offline provider binding.
Ordinary `recordRun` remains best-effort and cannot write the reserved namespace.

## Retained source roots

Aggregate contract 2 optionally declares `retainedRoots[sourceRoot] = { files,
sections }`. `files` is the complete original tree's SHA-256 map relative to
`data/`, including `release.descriptor.json`; `sections` preserves each original
DATA_RELEASE or CONTENT_PACK section under its unchanged section code. This is historical source
evidence inside the existing manifest, never an executable release registry.

Before discovery, `validateRetainedRoots(dataRoot, manifest)` verifies canonical
contained roots, regular files without symlinks, exact tree membership/hashes,
section ownership and a newer active successor under every original section code.
CONTENT_PACK snapshots retain their native `contentPath`, `pack`, `generatedHashes`
and `releaseChecksum`; validation reuses the content-pack checksum authority and
requires unchanged pack identity plus a higher version and source sequence.
Missing/altered historical files or conflicting declarations invalidate discovery
without conventional fallback. With retention enabled, active CONTENT_PACK roots
also remain outside conventional DATA_RELEASE discovery.

Optional `scope: "SECTIONS"` changes `files` to exactly the union of the retained
sections' payload claims. Disjoint active sibling sections may remain in that
root and their development payloads may evolve. Retired files are excluded before
active header-prefix expansion, so an active sibling cannot implicitly replay
them. Overlapping explicit claims reject. Other files are not frozen by section
retention, including shared descriptor metadata. Without scope, the entire tree
including its descriptor is frozen and all payload files must belong to retained
or active sections. `sourceRootFiles` provides the shared non-executing tree hash
interface; `retainedSectionSource` validates either native metadata variant.

Only valid retained roots are suppressed from conventional discovery. Omission
preserves existing discovery and development-baseline defaults. A successor keeps
the module/section release code and installation key; existing receipts are read
unchanged and project UPDATE_AVAILABLE until an authorized upgrade. Retention
does not authorize imports, publication, rollback, receipt rewrites or deletion.
Restore historical bytes to recover from drift; never rehash altered history.
Independent coverage: `test/dataReleaseRetention.test.js`.

## Explicit release selection

Optional operational Init releases may declare `selectionPolicy: "EXPLICIT"`
in their DATA_RELEASE section. nImport validates this metadata independently of
publication policy; only `DEFAULT` and `EXPLICIT` are accepted. Omission retains
the existing default installation behavior. Non-publishable releases still use
`initialPublicationPolicy: "NONE"`; do not substitute publication semantics for
installation selection.

An EXPLICIT release remains discoverable and its selection policy is included
in the catalogue. It is excluded from ordinary startup root selection, implicit
initialization profile steps, unqualified plans and legacy module-wide selection.
Operators must name its exact `releaseCodes` entry, directly or in a selected
initialization profile, unless a selected release pins it as a prerequisite below.
That selection still requires the existing role, environment, tenant,
permission, checksum, version and lifecycle checks. Discovery or selection does
not confer contribution migration authority.

The implementing nImport module defines an inert
`data.dataReleases.types.init.startupProfileSelections` default. A project module
may contribute bounded selections containing an exact `environmentCode`,
`runtimeRole` and non-empty `profileCodes` list when a reviewed Init-only authority
pack must exist before that runtime can obtain its first internal credential on
an empty schema. Coordinates must be unique. nImport resolves only the exact
selected deployment through the same profile validator, admits only `init` steps,
and then runs the exact release codes through normal startup planning,
prerequisites, destination checks, create-preserve operations and durable receipts.
This is a deployment selection, not a reusable default, permission grant,
configuration-synthesized record or license for mixed Core/Sample startup.
Existing narrowed, inactive or revoked records remain governed by the selected
release's owner operation.

An Init header may invoke Profile's `adoptRuntimeServiceScopesAll` only for the
authority-partition Employee schema and only while the privately bound release
operation is active. This is not general Employee import authority: the Profile
owner validates exact expected and desired permission lists and performs the
generated credential update. Customer projects own only their reviewed release
records and exact startup-profile selection.

nService projects EXPLICIT releases as `required: false`, `trigger: "USER"`.
Other required Init/Core packages keep their existing activation contract. The
metadata does not reroute an optional package to another runtime: use the
destination owner's explicit nImport selection. `test/dataReleaseSelectionPolicy.test.js`
covers these contracts using isolated persistence ports and the actual discovery,
plan, startup and profile builders, including explicit runtime startup selection.
It performs no installed-data mutation.

## Exact release prerequisites

The existing `DefaultDataReleaseService` owns dependency planning and execution;
there is no identity loader, startup script, direct persistence adapter or second
receipt journal. An aggregate DATA_RELEASE section may declare `prerequisites`:

```json
{
  "prerequisites": [{
    "moduleName": "exampleCapability",
    "sectionCode": "permissionCatalogue",
    "version": "0.0.1",
    "checksum": "<exact 64-character lowercase SHA-256 from release discovery>"
  }]
}
```

Each edge has these four required fields and optionally `partition: "DEFAULT"`.
No arbitrary partition identifier is accepted. Stable versions (not `0.0.0`) and exact
checksums are mandatory. Missing owners/sections, malformed references, duplicate
edges, conflicting pins, cycles, changed sources, incompatible destinations and
graphs exceeding `maximumModulesPerRun` reject before any receipt or row write.
Dependencies must have the same data type as the parent. Thus Init can never
pull Core, Sample or documentation into startup. HTTP bodies cannot declare
dependencies. Existing route permissions and owner-side row authorization apply.

An exact reference resolves the installed module descriptor through
`NODICS.getRawModule`, falling back when absent to nConfig's synchronous
`UTILS.resolveInstalledSourceDescriptor(moduleName)`, then the existing aggregate
manifest inspector. The fallback applies only to explicit prerequisite edges,
not catalogue-wide discovery or caller-provided paths. It supports restricted
runtime roots without expanding the active or raw module registries. Missing,
ambiguous or malformed installed metadata fails closed through nConfig.

An absent owner's exact version/checksum-qualified release receives a private
source binding. nImport preserves that binding through planned releases,
source-only composition and import request projections, rechecking canonical
metadata and bytes before target validation, headers, file filtering and dispatch.
Copies or serialized descriptors cannot recover source authority, and unavailable
governed sources fail rather than silently dropping files. This binding is not
installation authority: existing destination, partition, receipt, target admission
and row-operation checks still apply. Lower source-only composition supplies
inherited fields but only selected delta keys reach persistence. No caller path,
configuration or schema activation is accepted by this resolution path.

Only the named section is selected. Runtime code is not activated and sibling
sections are not selected. Inactive custom installers
retain their existing explicit contribution qualification; dependencies do not
grant custom installer authority. Standard headers may target the active
authority owner, such as Profile, while their data remains capability-owned.

The prerequisite list is normalized in field order `moduleName`, `sectionCode`,
`version`, `checksum`, and `partition` last when present, preserving list order. Nonempty lists extend the existing
file-map checksum input with `|prerequisites:` plus that canonical JSON. Releases
without dependencies retain their original checksum algorithm and receipt keys.
Manifest generation must resolve leaves before parents; do not hand-edit hashes
or change installed release bytes. Changed dependency graphs need successors.

Planning topologically orders dependencies before dependents, deduplicating shared
dependencies by resolved partition plus release identity. Preflight validates the full graph, header target admission and
source composition without calling row import operations. In particular, Profile
permission/group/role reference validation belongs to its row operations, after
the prerequisite rows have persisted, not to a preflight fallback that permits
unknown permissions. An identity graph should encode catalogue dependencies,
then base/parent groups, then domain groups and enterprise roles explicitly.

An omitted partition inherits the dependent node's partition. `DEFAULT` resolves
only through the effective framework `defaultTenant`. When this is the requested
tenant, ordinary ordered installation remains unchanged. Otherwise the dependency
and its transitive closure are read-only references: every node requires an exact
CURRENT receipt in its resolved partition and the current environment. No foreign
import, receipt claim, copied receipt, zero-work success or repair is permitted.
Its unqualified group dependencies therefore reference default-partition groups;
the same group release may independently execute for the business tenant through
an inherited edge. Both nodes count toward the bounded graph limit.

Preflight and every subsequent dependent claim check the entire foreign receipt
closure. Missing, RUNNING, FAILED, version-drifted or checksum-drifted receipts
stop execution. An operator must separately complete the default-partition graph;
`forceCurrent` cannot execute a reference. Existing default receipts remain
unchanged. Canonical source/pin validation covers both executable and reference
nodes, while target admission and import composition apply only to executable
nodes. Responses expose foreign nodes separately as `referenceReleases` with
`tenant`, `referenceOnly: true` and `status: "CURRENT"`; these are not installations
performed by the operation. Public request fields cannot select partitions or
declare dependencies. Adding partition metadata changes the parent's checksum
and must follow existing immutable successor rules.

Startup's existing awaited `installStartupReleases` path selects default Init
roots and resolves their exact dependencies. Only a fresh owner installation may
bootstrap a new graph automatically. An existing Init receipt for a dependent
owner with a changed parent or unmet dependency fails closed for operator-selected
migration. It does not rewrite old receipts, infer that deleted authority needs
repair, or recreate missing assignments. A CURRENT graph skips execution. A new
parent does not force replay of CURRENT dependencies, even with `forceCurrent`.

### Existing-installation maintenance sequence

An existing installation stays held at startup until the operator-selected
successor migration completes (for the Profile authority transition, select
`profile:init-v001` version `0.0.2`). To load the new owner code for that migration,
use the existing configuration hierarchy to make the bounded maintenance selection
`data.dataReleases.types.init.startupExecution = false`. Keep
`data.dataReleases.types.init.enabled = true`; disabling the type also disables
manual preflight/execution and is not this maintenance procedure. Record the
previous effective startup selection and limit the override to the affected
deployment and maintenance interval. Do not introduce a new mode or loader.

1. Start the affected runtime with automatic Init execution suppressed. This
   suppresses all startup Init imports in that scope, not owner validation,
   authentication, authorization or readiness safeguards. It is not evidence
   that the deployment is ready for business traffic.
2. Through the existing authorized operator route, explicitly select and preflight
   the exact successor graph in the configured authority default partition first.
   Review versions, pins and existing receipts; retain the existing
   `operatorExecution` policy and route permissions. Execute only the reviewed
   graph through the same release owner and confirm its CURRENT receipts.
3. Preflight and execute each intended tenant migration separately. Its global
   dependencies must already have exact CURRENT default-partition receipts;
   tenant-local groups and Init records execute only in that tenant. Do not
   replay or reconstruct deleted authority or alter historical payloads/receipts.
4. After the selected migrations succeed, remove the temporary override or
   restore the previous effective startup setting. For normally enabled startup,
   confirm the resulting CURRENT graphs skip imports on subsequent startup.

If preflight or execution fails, retain the bounded maintenance hold while the
owning operator resolves the failure. Do not use `forceCurrent`, a permission
bypass, a fabricated receipt or a direct row write to escape it. Existing receipt
fencing, failed-attempt handling and owner create-or-preserve semantics still
apply. The offline maintenance regression proves no startup import and governed
manual admission/denial, authority-first ordering and restoration; it does not
qualify actual native bootstrap, signed-in Axis UI or deployment readiness.

### Execution and recovery

Execution requalifies the complete graph before its first write, then uses the
existing durable, fenced receipt claims and import pipeline sequentially. Each
dependent rechecks exact CURRENT prerequisite receipts in the resolved partition and
environment before its own claim. Standard imports within a dependency plan must
report a completed run with positive successful records and no failed records or
diagnostics; missing acknowledgement, partial failure and zero work fail the
claimed attempt and never unlock dependents. Successful predecessor receipts are
retained after failure. No automatic rollback, running-attempt takeover or
unstarted-release failure receipt is introduced. Owners retain create-or-preserve
semantics and governed retirement; nImport never interprets missing business rows
as permission to reconstruct them.

Partners extend this contract through owner data/manifests and existing later-layer
destination and size policies, not environment-name branches. Axis receives
`prerequisites` in release projections and the expanded ordered plan from the
existing validation endpoint. Administrators review and select successor releases
through that same governed workflow. Tests in `dataReleasePrerequisites.test.js`
cover 54 inactive permission owners, multi-level groups/roles, failure isolation,
immutable pins, tenant/environment separation, current receipts and migration
holds using offline ports. These checks are not live bootstrap acceptance.

### Private identity seed execution

`isIdentityAuthorityReleaseExecution(tenant, schemaName?, operation?)` is a
read-only check of private, awaited operation provenance. It is not the broad
startup context. The existing release executor creates the enclosing scope only
after a successful fenced installation claim. The system initializer binds the
exact import-run object; the existing model dispatcher then admits only the
matching source-qualified Profile header and registered schema service while
awaiting that operation. Both explicit operator Init migrations and startup use
this path. Validation-only calls, direct system calls, forged request flags,
copied runs, wrong tenants/services, unrelated imports and Core/Sample imports
cannot mint authority. Row completion, rejection and release completion revoke
it, including for detached asynchronous continuations.

Eligible immutable Init headers are Profile `permission`, `userGroup` and
`enterpriseRole` with `ensureReferenceAll`, or `employee`, `customer`, `address`,
`contact`, `enterprise` and `tenant` with `ensureBootstrapAll`. No update/delete
or generic save operation is admitted. Permission and enterprise-role operations
are restricted to `CONFIG.get("defaultTenant")`; tenant-local user groups can
use their exact requested partition. Header tenant restrictions still apply.
This context never routes another partition's rows or imports shared catalogues
into tenant databases: Profile and its owner packs retain partition/read ownership.

Profile's seed guards consume this check (prefer the exact schema and operation
arguments) in addition to their insert-only, reference, identity and partition
validation. A startup boolean or `authData.isSystem` is not a substitute.
`identityAuthorityReleaseExecution.test.js` covers operator/startup execution,
nondefault group admission, shared-catalogue denial and private lifetime bounds.

## Offline execution test ownership

`test/dataReleaseService.test.js` owns independent preflight/no-import,
CURRENT receipt, repeat-current error, batch plan/count and throwing destination
contracts. Destination probes must assert `ERR_IMP_00004` and the runtime or
environment message; an `isDestinationCompatible` boolean is not equivalent.
Repeat execution must retain `ERR_IMP_00003` without another import.
Reuse `test/helpers/releaseExecution.js` for in-memory receipt/import ports.
Customer tests supply real module roots, release selections and plan/file
expectations; they must not copy the stubs or synthetic rejection matrix.
These ports never run an importer, database or runtime. They do not replace
the separate durable receipt concurrency tests or live acceptance.

## Canonical Staged Sample Acceptance

The protected `acceptance:staged-sample-data` suite belongs to nImport even when
a Commerce application invokes it. Generic release/catalogue/validation rules
are not customer or Commerce policy. Applications contribute existing effective
Platform profile `dataPackages`, module selections and a Staged target role.
No additional manifest registry, raw project configuration reader or importer is
allowed. The CLI does not manage runtime lifecycle; topology tooling owns servers.

Validation is the default; only `--execute-install` enables installation. Retain
employee and enterprise context on all requests. Catalogue identity and version
must be unambiguous, sample-qualified and destination-matched. Never guess missing
versions. Validate the selected plan before any install. Skip CURRENT releases,
propagate all failed API requests, and verify the final catalogue retains the
expected versions and CURRENT status. Error text, empty results and HTTP success
alone cannot prove installation. Partial failure does not authorize rollback,
reset, direct persistence, Online publication or permission changes.

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
- Place declared headers directly under the selected `headers` directory with
  a `Header` or `Headers` filename suffix before the extension. The existing
  local initializer is nonrecursive for headers. Staging rejects nested or
  misnamed header entries and compositions with no discoverable header before
  dispatch, so ignored files cannot yield a misleading completion receipt.
- Preserve the enclosing `data/<release>` convention in staging using the
  run-local `input/data/content-pack` root. Header finalization must resolve
  relative Media asset pointers there, not from finalized output records or
  source-controlled module directories.
- Stage only manifest-declared files inside the selected content root, including
  binary Media assets. Recheck checksums before dispatch and clean up incomplete
  staging on failure. Reject empty maps, sibling paths and symlink escapes; never
  copy the whole source folder as execution authority.
- Documentation uses a separately selectable `data/docs-v001` CONTENT_PACK.
  Conventional Init/Core/Sample fallback discovery excludes roots represented
  by content-pack sections even when no retained-root metadata is present.
  Documentation is not a fourth generic import data type and references never
  authorize implicit installation.
- Treat committed content-pack data and its manifest as the distribution
  artifact. Consumer builds, `.work` copies, and caller-selected filesystem
  paths are outside the governed installation contract.
- System owns secured HTTP exposure; nImport owns execution and run history;
  Axis owns only status/action presentation.
- Stable-code `saveAll` imports create and update records. Do not claim physical
  removal, catalog activation or publication until composed through CMS,
  Workflow and nPublish authorities.
- For governed versioned records, pin the current owner revision before save.
  nImport strips caller-supplied version-import admission and sets the internal
  `governedVersionedImport` option only after immutable release governance and
  effective versioned-schema ownership succeed. The generated save query and
  versioned provider must recheck that exact revision, return an identical replay
  unchanged, or append one successor for changed content. The option never flows
  to nested writes. A partial-run retry must not create another version for records
  already committed by the same immutable source, and concurrent advancement must
  fail rather than be silently retargeted.

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

Release plans order conventional logical sections (`init-vNNN`, `core-vNNN`,
`sample-vNNN`) by their section sequence, then module indexes before later
layers. A forward immutable successor retains its logical initialization
position even when its physical source root moves to a later directory. Named
sections without a conventional sequence retain source-root ordering. This
does not change checksum validation, receipt identity, or layer authority.
A current lower JS release
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

Startup Init execution exposes only the content-free
`isStartupReleaseExecution(tenant)` query to capability hooks. Its private async
context exists only while `installStartupReleases` awaits the prepared plan and
is revoked on completion or failure, including detached descendants. Caller
options and ordinary/manual import requests cannot mint this context. Profile
uses it solely to defer the default-tenant Enterprise seed's activation event
until the canonical coordinator reconciles identity and discovers enterprises;
it does not suppress import errors, credential guards or installation receipts.

See [governance defaults and selected owner templates](inherited-governance.md).

## Content-pack defaults and manifest paths

`CONTENT_PACK.includes` explicitly composes other content-pack sections through
`{manifestPack, source}` descriptors using the existing source resolver. Included
sources are never inferred from business releases or module activation. Each
source retains identity, contract, containment and byte-hash validation. Cycles,
missing sections, conflicting staged files and compositions beyond 256 sources
fail before dispatch. The effective checksum binds local bytes and included pack
identities, versions and checksums. Staging visits a source once and copies only
declared files; it rechecks bytes before the existing local importer runs.

Module documentation can explicitly include a shared foundation without importing
other capability articles. A full library explicitly includes the desired module
packs. Neither selection imports adjacent Init/Core/Sample data. Publication,
tenant authorization and import-history ownership remain unchanged. A framework
repository source may name the package owning the Foundation directory's parent;
it remains a bounded configured repository, not an arbitrary filesystem root.

Inherit nImport defaults and derive content paths from the selected manifest. Preserve per-pack overrides, disabled import gates and validation. See [the detailed contract](inherited-governance.md#content-pack-defaults-and-manifest-paths).

Sample releases are available to authorized manual operators by default, with optional deployment restriction. Only Init can auto-run at startup. Environment scope reads the effective `environment.class` projected by nConfig from the selected environment module metadata; never author it in environment properties or derive it from the selected environment name or another capability policy. Permissions, roles, tenant isolation, release checksums and durable receipts remain mandatory.
