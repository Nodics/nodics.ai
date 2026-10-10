# media Contracts

## Setup Metadata Observation

`DefaultMediaReadinessService.read` retains its existing human upload-operator
guard. Its pure `inspect` helper is also used by the disabled nPublish exact-plan
observer after deployment/plan authorization, with a private canonical owner
persistence context. Exact descriptors, CURRENT versioned metadata and enterprise
scope remain mandatory. This is not provider-byte, upload or Online proof and
must not invoke mutation, publication, repair or financial action methods.

## Canonical Preparation Suite

`acceptance:media-seed` is a protected capability-owned command, not a customer
acceptance implementation. Applications retain asset files, business purpose,
existing `MEDIA_ASSET_MANIFEST` descriptors and module-selection aliases. Effective
Platform profiles and existing module discovery are the only selection sources.
There is no new manifest/configuration authority. Empty selection, conflicting
codes, ambiguous owners and path/symlink escape fail before authentication.

Explicit `--execute` authorizes Staged upload only. Human authority, tenant context
and Media router policy remain mandatory. A successful upload must return the
selected code and matching SHA-256 integrity evidence. Duplicate error text is
not idempotency evidence. Partial uploads remain governed Media records and may
be retried through the same save API after resolving the failure. The suite never
requests service credentials, imports Online assets or approves publications;
use normal CMS/nPublish governance for deployment. The command does not certify
Online readiness, product release qualification or production approval.

This folder keeps AI/developer contract reminders for the Media module. Public, business, operator, and full implementation documentation belongs in `nodics.docs`.

## Contract Boundary

`POST /photos/encoded` supports bounded customer-authenticated JSON intake for
domain orchestration that validates an image before persistence. It accepts
only image bytes, MIME type, original filename and an idempotency key. Media
selects the owner, folder, storage key and generated identity. Replay is scoped
to the resolved customer and checks the original content checksum. The route
uses an explicit bounded JSON limit; storage still goes through the existing
customer upload and provider services. No domain analysis or approval is owned
by Media, and a failed domain analysis must not call this endpoint.

Media owns asset metadata, source context, provider configuration, storage root resolution, generated storage keys, delivery access policy, publication transfer, reference lookup, and media-set contracts.

## AI Guidance

- Treat media codes as governed references, not physical file paths.
- Keep provider secrets, root paths, and private storage keys out of generated documentation.
- Preserve source context so imports, WCMS components, product galleries, and exports can explain why a media record exists.
- Do not let consuming modules mutate media relationships they do not own.

## Documentation

Deep documentation lives in:

- `nodics.wcms/modules/media/data/docs-v001/records/documentation/mediaDocumentationComponentData.js`
- `nodics.foundation/modules/nData/nImport/import/data/docs-v001/records/documentation/importDocumentationComponentData.js`
- `nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js`

## Verification

Run media contract tests and documentation validation after changing this contract:

```bash
npm --prefix nodics.docs test
npm run quality:docs
```

Internal evidence reads accept customer originals after domain authorization.
They may also read non-customer PUBLIC media with an allowed
`media.evidenceRead.publicPreviewMimeTypes` MIME type, returning bounded inline
bytes and `previewType: PUBLIC_MEDIA`. This does not grant customer-photo routes
access to application/private assets. Storage keys stay internal; callers
render public SVG only as an image, never injected markup.

Customer photo operations preserve the authenticated customer bearer header when
resolving the canonical owner through Profile. Missing credentials or a tenant
mismatch are rejected; request-body credentials are never trusted. Runtime
service credentials must not substitute for the customer session in this lookup.

## Retained Publication

### Ownership And Readiness

The implementation adds no schema family, journal, publication lifecycle or
storage registry. `DefaultMediaRetainedPublicationService` captures exact
versioned `media` metadata and pins bytes through the existing storage registry.
The existing `mediaTransferManifest` contains path-free projected metadata and
backend-only retained storage evidence. Its digest includes the exact metadata
version, all projected fields and the byte checksum. No caller-selected path or
mutable latest-record query can stand in for that source identity.

`DefaultMediaPublicationTargetService` owns hidden preparation, the active
`mediaPlacement`, and `mediaPublicationReceipt`. Placement plus receipt commit
in the existing nDatabase transaction authority. These three existing evidence
schemas are explicitly non-versioned, uncached, side-effect-free transaction
participants and generic read-only authoring surfaces; source `media` versioning
is **not** enabled by this change. Existing legacy transfer writers still work,
but their best-effort evidence is not qualified activation evidence.

Working mode: authorized framework implementation, Media-only scope. Studied
owners: nSetup customization rules, nPublish authority/provider contract,
nDatabase transaction/persistence, Media upload/storage/transfer and CMS target
transport. The business outcome is exact reviewed asset delivery and reversible
metadata/byte activation, not a second approval engine. Tenant, access policy,
backend storage locations and immutable version identities remain authoritative.

### Internal Service Contract

1. On a qualified Staged runtime, call `capture({code, versionId}, context)`.
   A nonnegative integer metadata version is mandatory. Source must be active
   and READY with SHA-256 metadata matching the bytes. The returned manifest
   code becomes nPublish `sourceVersion`, and its asset code is `rootCode`.
2. The Media version provider `getVersion` loads that manifest. `activate` uses
   nPublish's persisted `activationOperation.key` and
   `activationOperation.previousOnlineVersion`, not a new read or caller guess.
   It opts into `targetReceiptContract: 'v1'` and returns target evidence with
   operation/publication/source/target/prior-version identity.
3. `exportPackage` supplies `{code, asset, contentBase64}` from retained bytes,
   never current source storage. Only the approved projected metadata travels;
   provider locators do not. Metadata changes with identical bytes produce a
   different manifest and are not silently reused by checksum alone.
4. Target `deploy({manifest, prepareOnly:true}, context)` validates and retains
   a package but does not write a logical `media` row or active placement.
   Normal deployment additionally requires `publicationCode`, `operationKey`
   and `expectedVersion` (explicit null for no current version).
5. Target activation checks the expected version, CAS-updates the placement's
   owner revision, and commits its result receipt in the same transaction.
   Receipt failure aborts the pointer. Replay checks both input fingerprint
   and current operation ownership; superseded receipts cannot reactivate data.
6. `rollback({mediaCode, manifestCode, expectedVersion, publicationCode,
   operationKey}, context)` uses retained target metadata and bytes only.
   The current placement must belong to that publication. Rollback retries use
   a stable source/target-derived operation key; they never refresh expectations
   or rebase onto another release.
7. `getStatus({mediaCode}, context)` reports content-free active version/revision.
   Qualified ONLINE delivery resolves only the active placement and retained
   manifest. It reuses Media access checks and the existing response handler,
   returning verified bytes with `no-store`. Missing/unactivated content fails
   closed; there is no mutable media fallback in this mode.

### Retained Bytes And Recovery

CMS site publication and retained Media publication are currently separate
governed lifecycles. CMS target deployment calls the legacy
`DefaultMediaPublicationTransferService.importReferenced` for its `mediaAssets`;
that writes logical Media/physical-transfer evidence, not the retained active
pointer used by `DefaultMediaPublicationTargetService.resolveDelivery`.
CMS approval and CMS `ONLINE` therefore do not authorize retained Media
activation or prove that referenced images are deliverable. In particular,
PUBLIC/READY metadata, matching transferred bytes and legacy placement receipts
must not be treated as retained activation evidence.

When retained Online delivery is selected, an authorized operator must create
each exact-version Media publication through
`POST /nodics/media/v0/publication/requests` with `publicationCode`, `mediaCode`
and current integer `versionId`, then complete the resulting normal Process
approval. The owner callback and nPublish activate only the approved immutable
package through scoped transport. Direct target deployment, emergency approval,
mutable-row fallback and a public-access policy bypass are not substitutes.

A site-level READY projection must distinguish CMS state from Media delivery
qualification. End-to-end composition still needs an owner-published binding
between the reviewed CMS release and exact retained Media manifests, independent
approval evidence, target status checks and operator task navigation. Existing
CMS baseline readiness derives READY from CMS `ONLINE` alone; it is not evidence
that this composition exists. Do not auto-activate separate Media publications
to hide this gap or claim that a site retry repairs it.

`storeRetained` is an explicit provider capability with no fallback to ordinary
mutable `store`/`transfer`. The local provider uses a backend UUID, the reserved
`mediaPublicationRetention` key segment, exclusive creation, and read-only file
mode, then syncs the file and its directory before acknowledging it. Ordinary
local overwrite/copy-to/delete reject that namespace. A custom
key strategy omitting the reserved segment rejects. NAS/cloud retention is not
implicitly qualified; providers must implement and test the contract themselves.
This is provider immutability, not protection against an operating-system admin.

Byte length and SHA-256 are checked at capture, preparation, export, delivery
and rollback. Metadata integrity is also checked each time. Corrupt/missing
retained bytes cause failure rather than fallback. Retained files are not
ordinary upload records and are never handed to legacy expiry cleanup.

File allocation precedes transactional manifest persistence, so a failed or
concurrent capture can leave an inaccessible retained file. No automatic
deletion is performed: reference-aware retained-byte reconciliation/GC remains
required before production enablement. It must protect active and rollback
versions through existing cleanup ownership, not create another lifecycle.

### Enablement And Shared Integration Gaps

Defaults remain `versionProviderEnabled:false`, empty runtime role and empty
transport selection. No `publish.providers.versionProviders.media` registration
is added. Owner properties declare the fixed Media approval policy/action and
an EXPLICIT Process release, but do not install it or select workflow providers.
The existing CMS mutable media transfer is
not silently replaced. The following remain blocking:

- Qualify installed exact source versioning and evidence uniqueness indexes,
  generated read/write authorization and tenant isolation. A source row merely
  containing a `versionId` is not migration evidence.
- Qualify multi-record transactions with propagated contexts in the actual
  target database and retained-storage crash durability on the selected filesystem.
  Unit test transaction doubles do not prove server atomicity.
- Configure the implemented `DefaultMediaPublicationModuleTransportService`
  against a distinct Online Media nService connection and qualify its routes
  with real scoped credentials. Keep all existing `schemaMaintenance` denials
  and runtime-role boundaries unchanged. Source defaults select no transport.
- Select the Media provider's `resolveDependencies`/`validate` hooks as the
  domain adapter and the shared `DefaultPublicationApprovalWorkflowService`
  as the workflow provider only after qualification. Domain and root type must
  be `media`; the callback scope cannot be selected by request data.
- Complete live nPublish receipt/recovery, callback/retry and rollback acceptance.
  Manifest-based retained-file integrity reconciliation is implemented read-only;
  unreachable orphan-file discovery and safe purge remain open.
- Qualify payload limits across transport/body parsers and delivery memory
  limits. The implementation retains one bounded asset per manifest, not a
  multi-asset atomic publication. Multi-asset graph composition remains with
  its owning publication domain and requires explicit integration evidence.
- Register the focused owner tests in shared nTooling suites and regenerate
  documentation/context through their owning generators outside this scope.

Maintainers/QA run `node --test nodics.wcms/modules/media/test/mediaRetainedPublicationContract.test.js
nodics.wcms/modules/media/test/mediaRetainedStorageContract.test.js` from the
framework root (one command). Tests cover exact version selection, metadata-only
changes, mutable-source independence, preparation invisibility, access/tenant
denials, receipt failure, replay conflicts, retained rollback, default gating,
custom provider dispatch and real isolated local-file exclusive creation.
They do not run application databases or live Process approval. Also run
`mediaPublicationIntegrationContract.test.js` for route, transport, scoped-token,
Process graph checksum, fixed callback and manifest reconciliation contracts.

### Authenticated Integration

The existing Media storage controller/facade expose POST target operations at
`/publication/target/deploy`, `/publication/target/status`,
`/publication/target/rollback` and `/publication/target/reconcile`. All require
service tokens, the existing internal-route permission and moduleInternal
exposure. The facade requires a router-verified Media runtime principal through
nAuth, preserving its exact tenant/runtime/capability scope. Body-supplied tenant,
authentication and transaction context never replace trusted request context.
The target still enforces the qualified ONLINE role and transaction capabilities.

The transport uses nService with `local:false`, fixed Media ownership and
`WCMS_ONLINE` target authority. Only explicit non-default connection bindings
are accepted. Credentials come from the source runtime's existing internal
token authority, never incoming body credentials. Response validation requires
exact version and receipt evidence for activation/rollback; empty success is
not acknowledgement. Existing nService retry policy receives the stable key.

`/workflow/actions/applyPublicationDecision` delegates to the shared nPublish
claimed-action callback using fixed `{domain:'media',
actionKey:'media.applyPublicationDecision'}`. The bridge authenticates Workflow,
claims its execution, checks completed-task/source/revision evidence, and owns
the publication decision. The request cannot supply a decision or another domain.
Both approval and rejection from the TASK pass through that same claimed action.

`data/manifest.json` declares `mediaPublicationWorkflow` as EXPLICIT,
PROCESS-destined `PROCESS_DEFINITION` data. Its immutable graph is
START -> mediaReview TASK -> claimed Media ACTION -> END. Existing Process
reviewer-assignment policy supplies assignees; publication never auto-installs a
missing graph. The Process runtime must receive the owner action contribution
and an explicit `process.remoteActions.targets.media` Staged connection through
normal configuration composition, not copied source or a second registry.

### Installed Release And Qualification Checks

The workflow is an explicit `media:mediaPublicationWorkflow` contribution in the
unreleased `0.0.1` baseline, with its payload under `init-v001`. It does not replace
Cron job releases: each manifest section retains its own identity and checksum.
Select its current version from the existing init catalogue. Numeric published
Process graph versions are separate from executable data release versions.
Future changes after installation require a higher version of the same release
identity and a new source root; never edit installed graph bytes/checksums.

`test/mediaWorkflowReleaseUpgradeContract.test.js` uses the real nImport planner
and Process contribution installer with in-memory lifecycle ports. It checks
exact release selection, wrong-destination denial, preservation of prior
installation records, forward draft/publication from an earlier installed
version, idempotent replay, and same-version/downgrade rejection. This is an
offline installed-state simulation, not evidence of a live upgrade.

Concrete enablement requirements and test paths (relative to framework root):

- **Transactions:** `databaseTransactions.enabled:true`, `failClosed:true`,
  positive safe-integer `maximumCommitTimeMs`; the selected `media` tenant
  database must report atomic multi-record transactions with context propagation.
  MongoDB must support logical sessions and be a replica set or sharded cluster;
  a standalone topology rejects. The manifest, placement and receipt must share
  the same database transaction and eligible non-versioned, uncached,
  event-disabled schemas. Test:
  `nodics.foundation/modules/nDatabase/database/test/databaseTransactionContract.test.js`,
  `nodics.foundation/modules/nDatabase/database/test/schemaTransactionGovernanceContract.test.js`,
  `nodics.foundation/modules/nDatabase/mongodb/test/mongodbTransactionContract.test.js`.
  These are offline contracts. The opt-in real-database fixture below additionally
  qualifies owner commit, CAS, transaction abort and lost-caller-response replay;
  installed application qualification is still required.
- **Staged -> Online:** bind `media.publication.target.connectionName` to a
  non-default Media connection resolving `WCMS_ONLINE`; select the implemented
  transport only after qualification. Its internal token must contain the correct
  tenant, enterprise, service ID, runtime instance and matching runtimeScope
  project/environment/server/assignment, with `media` in its capability modules.
  The target must permit the existing internal-route permission and moduleInternal
  exposure; no schemaMaintenance override is needed or allowed.
- **Staged -> Process:** bind `publish.approvalWorkflow.target` to an explicit
  PROCESS connection. Starting approval forwards the authenticated human bearer
  and enterprise scope; it must not substitute an internal token for the starter.
- **Online -> Staged authorization:** bind `media.publication.source` to an
  explicit non-default `WCMS_STAGED` Media connection. The existing module
  transport calls secured `/publication/authorize-target` with the Online runtime
  token. Before target preparation, activation or rollback, the facade requires
  a matching authorization fingerprint from Staged. Staged reads the existing
  nPublish lifecycle repository and validates Media domain/root, exact source and
  target manifest, current ACTIVATING or ROLLING_BACK state, stored activation
  key (or canonical rollback key) and expected predecessor. A valid runtime token
  alone cannot authorize an invented publication or operation. No new approval
  store or token authority is introduced. Missing reverse binding fails closed.
- **Process -> Staged and claim return:** the Process runtime must load the
  owner action contribution and bind `process.remoteActions.targets.media` to
  Staged. Its callback token must be a scoped Workflow runtime principal; the
  Media runtime's claim call must own `media`. Install the explicit definition
  through nImport and assign its reviewer through existing Process policy.
  Test `nodics.process/modules/workflow/test/processRemoteActionAdapter.test.js`
  and `nodics.foundation/modules/nPublish/test/publicationApprovalBridge.test.js`.
  Media-specific route/token/context and response checks are in
  `nodics.wcms/modules/media/test/mediaPublicationIntegrationContract.test.js`.
- **Remaining installed evidence:** unique evidence identities/indexes, immutable
  source-version migration, retained-filesystem durability, actual route/token
  denial checks, completed-task callback and lost-response retries. The provider
  remains unregistered/disabled until these pass. Isolated database qualification
  does not prove installed schemas, runtime authorization or credential bindings;
  missing bindings are not filled with invented environment endpoints or copied
  credentials.

### Local qualification handoff

Finalize active module composition before planning/backfilling the Staged
`media` metadata schema. Load `vDatabase`, `vService`, and the selected MongoDB
adapter `vMongodb`; verify installed `mediaModel.versioned`, its CURRENT read
mode and version-aware read/write methods. `package.json.requiredModules` only
validates dependencies and ordering; it does not activate them. Media therefore
does not require version modules unconditionally for ordinary unversioned
upload/import runtimes. Activate them explicitly for this migration. This API
handoff does not change raw schemas or versioning policy defaults.

After approved metadata backfill/index qualification, Staged selects the
metadata-only policy documented below. Evidence collections remain unversioned
and must retain their unique identities, transaction participation and disabled
cache/events. Both runtimes require qualified transactions and local retained
storage; verify generated service writes under actual scoped identities without
relaxing `schemaMaintenance`.

For the controlled qualification configuration only:

- Staged: `media.publication.versionProviderEnabled:true`, `runtimeRole:'STAGED'`,
  `targetTransportProvider:'DefaultMediaPublicationModuleTransportService'`,
  explicit `target.connectionName` resolving WCMS_ONLINE and
  `target.connectionType:'abstract'`.
- Online: `media.publication.versionProviderEnabled:true`, `runtimeRole:'ONLINE'`,
  explicit `source.connectionName` resolving WCMS_STAGED and
  `source.connectionType:'abstract'`. Do not enable Online publication administration
  or source metadata versioning merely to serve retained target bytes.
- Staged `publish.providers.versionProviders.media` and
  `publish.providers.domainAdapters.media` select
  `DefaultMediaPublicationVersionProviderService`;
  `publish.providers.workflowProviders.media` selects
  `DefaultPublicationApprovalWorkflowService`. Reuse the existing qualified
  nPublish repository provider; do not replace its journal.
- Staged `publish.approvalWorkflow.target` needs explicit Process connection,
  connection type and `runtimeRole:'PROCESS'`. The human starter bearer and
  enterprise scope must remain valid at Process. The Process runtime must load
  the Media action contribution and bind `process.remoteActions.targets.media`
  to Staged. Its runtime token must authorize Workflow; the Media claim-return
  token and both Media transport directions need Media capability grants and
  matching tenant/enterprise/project/environment/server/assignment scope.
- Preserve moduleInternal exposure and internal-token permissions on target,
  reverse authorization and callback routes. The new operator entry requires
  access token, matching authenticated tenant, runtimeConfigAdminUserGroup,
  `publish.lifecycle.create` and owner-declared mediaManagement exposure. Process claim
  and completion retain existing reviewer assignment and permissions.

API sequence (use actual configured authorities, never guessed ports):

1. On Process, explicitly plan/validate/install nImport init release
   `media:mediaPublicationWorkflow` using
   `releaseCodes:['media:mediaPublicationWorkflow']` and its observed catalogue
   version as `expectedReleases`. The unreleased owner manifest selects `0.0.1`
   under `init-v001`; never edit or force-reinstall installed releases. Confirm
   published definition `mediaPublicationApproval` and reviewer assignment.
2. On Staged, obtain the exact installed Media `code`/`versionId`, then POST
   `/nodics/media/v0/publication/requests` with
   `{publicationCode:'media-proof-a',mediaCode:'<code>',versionId:0}` using the
   operator bearer. This captures metadata/bytes and calls existing nPublish
   create, validate and requestApproval. Caller-supplied domain/sourceVersion
   cannot select authority. Retrying the same identity reuses its retained
   manifest and existing publication; conflicting identity rejects.
3. Read `/nodics/publish/v0/publications/<publicationCode>`. In Process find the
   linked task, claim it and complete it through the existing task APIs. The
   completed-task action invokes the fixed Media callback; do not call approve
   or activate directly with operator-supplied decisions. Confirm ONLINE and
   matching sourceVersion/targetVersion, durable receipt and predecessor.
4. Read `/nodics/media/v0/content/<mediaCode>` on Online, respecting PUBLIC or
   authenticated access policy, and compare exact bytes/checksum. Prepare a
   second metadata revision and repeat as a distinct publication; initial
   publication has no prior version and cannot prove retained rollback.
5. POST `/nodics/publish/v0/publications/<secondPublication>/rollback` with the
   current `expectedRevision`. Confirm ROLLED_BACK and exact first metadata/bytes
   through Online. Exercise wrong tenant, wrong runtime capability and invented
   operation denial; reconcile a lost response through existing publication
   operations and verify exact receipt/pointer agreement.

Source schema/data migration, role bindings, deployment grants and live Process
installation are main/runtime-owner work, not performed by this framework change.

### Source metadata migration policy

Only the `media` metadata schema selects the owner policy
`schemaPolicies.media.publicationVersioned`, whose default is
`{ isVersionedEnabled: false }`. This also leaves Staged disabled by default;
there is no implicit runtime-role opt-in. After an approved backfill, index and
writer qualification, a later configuration layer may select
`{ isVersionedEnabled: true, versionedReadMode: 'CURRENT' }`. This is a schema
composition option, not a migration implementation or evidence that an installed
database is ready. Placement, transfer manifest, artifact, receipt and other
operational schemas do not select this policy. Provider registration remains off.

Before exact source lookup, `capture` resolves the installed model using
`NODICS.getModels('media', tenant)` and the canonical Media model name. It rejects
unless `model.versioned === true` and
`model.rawSchema.versionedReadMode === 'CURRENT'`. Caller flags, supplied
`versionId`, configured publication enablement and policy declarations alone are
not evidence of immutable installed storage. Tests simulate qualified model
installation; they do not perform or certify a source backfill.

Writer adaptations implemented and isolated-replica-set tested (all paths relative to this owner):

- `src/service/storage/defaultMediaUploadService.js`, `upload`: versioned uploads
  use the existing provider's exclusive retained storage, preserving historical
  bytes. New identities save explicit version zero. Re-upload requires the current
  numeric `versionId`, rejects current legal hold, and appends through generated
  update with exact successor readback. Conflicts can leave protected inaccessible
  files; unsafe orphan deletion is not attempted.
- `src/service/storage/defaultMediaLifecycleCoordinationService.js`, `bind`,
  `setLegalHold`: installed CURRENT mode selects exact `versionId` updates with
  plain fields (not MongoDB `$set`, which the versioned adapter does not apply).
  Existing generated persistence rejects stale predecessors; exact successor
  readback checks every supplied field. Unversioned behavior remains unchanged.
  `deleteExpired` rejects before any physical or metadata mutation for versioned
  metadata or retained publication runtimes.
- `src/service/storage/defaultMediaCleanupLifecycleService.js`,
  `markPassive`: rereads current legal hold and appends a checked RETIRED
  successor before marking the candidate passive. Retries of an already-retired
  record do not append duplicate revisions. `runRetentionCleanup` and publication
  `collectGarbage` reject before any work when versioned metadata or retained
  publication is enabled. Physical history/orphan purge remains unqualified and
  disabled using these existing mode settings; no cleanup bypass is introduced.
- Generated Media CRUD and imports remain writers and must pass the existing
  versioned save/update pipeline and schema-maintenance policy. The generated
  nDatabase pipelines own router/item-cache invalidation and event publication;
  do not introduce owner cache manipulation. Qualify exact-version versus
  current-read cache behavior, failed writes and lifecycle events with the
  installed vService/vMongodb composition.
- `src/service/storage/defaultMediaDeliveryService.js` returns `no-store` for
  versioned metadata delivery as well as retained Online delivery. Current-record
  filtering precedes status/access checks; an older READY record is not fallback
  content. Existing external caches still require rollout invalidation if prior
  responses were cacheable.

The real MongoDB fixture covers current reads, immutable successors, a competing
write winner, stale rejection, legal-hold retirement denial, idempotent retirement,
preserved metadata/history bytes, re-upload conflict and physical-cleanup denial.
It adapts generated service envelopes, so installed API authorization and full
cache/event pipeline acceptance remain runtime qualification, not fixture claims.
The controlled Kickoff Staged/Online opt-ins are local qualification settings,
not framework defaults or production readiness. No raw schema changed in this
writer adaptation; migration hashes need not change for these service edits.

### Isolated native transaction qualification

From the framework root, run:

```sh
NODICS_MEDIA_REPLICA_SET_TEST=1 node --test nodics.wcms/modules/media/test/mediaRetainedTargetReplicaSet.test.js
```

The fixture requires the existing writable local replica set at `127.0.0.1:27017`.
It never starts/reconfigures MongoDB, uses Docker, accepts an application database
name, or changes application configuration. Every run creates a UUID-named
`nodics_media_fixture_*` database and temporary retained-file directory, removing
both in `finally`. Without explicit opt-in it skips. Connection/topology failure
with opt-in is a test failure, not a silent qualification skip.

The fixture passed against `nodicsLocal` on 2026-09-28. Local standalone topology
is not a current blocker. It uses the real nDatabase transaction authority,
MongoDB session adapter, MongoDB model CAS and Media local retained-file provider.
Only generated service envelopes and fixture path/configuration bindings are
adapted; the generated authorization pipeline and installed index/schema rollout
are not exercised. Tests cover hidden preparation, failure before and after a
receipt write with atomic abort, concurrent expected-version CAS, committed
activation with a lost caller response, durable receipt replay, foreign rollback
denial, rollback abort, rollback response loss and exact retained metadata/bytes.
Caller response loss is injected after commit; this does not simulate server
failover or an unknown MongoDB commit outcome. Those recovery scenarios and the
actual authenticated runtime transport remain installed qualification work.

Operation reconciliation uses the persisted `activationOperation` even when
`targetVersion` is absent after a lost response. It queries the exact operation
receipt and active pointer in one nDatabase snapshot transaction. `ACTIVE`
requires matching fingerprint, publication, manifest and operation plus intact
retained bytes; `NOT_COMMITTED` means no matching receipt; `CONFLICT` includes
superseded operations and inconsistent receipt/pointer evidence. Same manifest
bytes alone are not proof of the same operation. Reconciliation never creates
receipts, repairs pointers or transitions the source lifecycle. Existing nPublish
remains the only source state authority.

The real replica-set fixture also rejects invented publication/key/predecessor
and pending-approval mutations, including hidden preparation. Its source intent
repository is a fixture-only collection and its reverse transport is an in-process
port invoking the real source authorization method with isolated Staged bindings.
Actual HTTP authentication, installed nPublish journal/schema and reverse runtime
connection qualification remain separate gates.

Reconciliation accepts one exact media/manifest identity, validates its retained
bytes through existing storage and returns only integrity/protection/active
facts. It does not repair pointers, manufacture receipts, list provider paths,
or delete files. An old inactive manifest remains protected for rollback.
Orphan purge cannot safely be inferred from one failed manifest lookup and is
not implemented; ordinary local cleanup continues to reject retained keys.

The evidence-preview test now supplies the required service `tokenType` and
rejects a group/principal-only imitation. No preview authorization rule was
weakened to make this fixture pass.

Administrators/operators must keep the gate closed until the canonical audit
records these prerequisites. Developers customize provider/transport selection
through existing layered properties and mergeable owner services. Business
users/evaluators should treat this as gated implementation, not released UI or
operational publication capability. AI tools must preserve those evidence limits.

## Media Readiness Diagnostics

Media owns the readiness facts for media object metadata, physical artifact
availability, media references, and cleanup candidates. BackOffice and Axis may
display these facts, but must not infer storage health, reference correctness,
or retention state from customer/project-level configuration.

The owner readiness contract reports:

- media object provider availability and bounded media counts;
- missing required media metadata;
- missing physical storage, URL, or inline content evidence;
- broken or inactive consuming media references;
- cleanup candidate counts for retention/operator review;
- governed repair operation metadata for object repair, physical reconciliation,
  reference reconciliation, and cleanup review.

Readiness scans are read-only. Physical movement, media object creation,
reference updates, and cleanup remain separate governed owner operations.

## Application Preparation Upload Inspection

`POST /nodics/media/v0/storage/upload/inspect` is a read-only Media-owned
operation under the same `media.upload.create` permission, access groups and
`mediaManagement` exposure as upload. It is not generated CRUD, a publication
operation, or authority to bypass an upload conflict. The controller preserves
the trusted tenant and authenticated principal over body selectors.

Input is the desired upload descriptor: `mediaCode`, lowercase SHA-256
`checksum`, positive safe-integer `sizeBytes`, `originalFileName`, `mimeType`,
`folderCode`, `formatCode`, `name`, `description`, `businessPurpose`, `ownerType`
and `ownerReference`. Existing layered folder, format, MIME and size policies
apply. The response envelope `data` contains `contractVersion: 1`, `mediaCode`,
boolean `versioned`, `exists`, `unchanged`, and current `versionId` only when an
existing versioned record was read. No provider locator or file content is
returned. Missing and denied reads are distinct; malformed or ambiguous reads
fail closed.

`unchanged: true` requires current versioned READY/active metadata, matching
descriptor fields and SHA-256, provider-owned bounded reads of matching bytes,
and a second scoped read confirming the same current revision. Legacy
nonversioned records are never declared verified reusable by this contract.
Provider read failures stop inspection; they do not imply missing Media or
authorize an upload. Changed assets return the inspected current revision for
one subsequent multipart upload. Media's existing CAS and legal-hold guards
remain mandatory. Concurrent changes may still reject the upload; callers must
not refresh and silently retry. Inspection is not a lock or a durable receipt.

Later-layer Media services may decorate inspection while preserving scoped
reads, bounded byte verification, path-free replies and CAS enforcement.
Publication qualification and Online activation remain separate gates.
# Persisted Readiness Aggregate

`POST /nodics/media/v0/storage/readiness` is a secured, read-only operation under
the same `media.upload.create` permission and `mediaManagement` exposure as upload
inspection, restricted to authenticated access tokens. It does not upload,
activate, grant, inspect provider bytes or request publication. The existing
controller -> storage facade -> `DefaultMediaReadinessService` hierarchy owns it.

The body contains only `assets`, an array of 1–100 unique confined-source
descriptors: `mediaCode`, `checksum`, `sizeBytes`, `originalFileName`, `mimeType`,
`folderCode`, `formatCode`, `name`, `description`, `businessPurpose`, `ownerType`,
`ownerReference`, and fixed `moduleName:media` / `schemaName:media`.
Unknown fields, expressions and caller-supplied tenant/provider authority reject.
Signed tenant and enterprise context determine scope. The owner requires CURRENT
selection for versioned storage and performs one fresh, cache-skipping bounded
metadata read using the generated pipeline's `options.skipItemCache:true`.
Only a positive `SUC_FIND_00000` acknowledgement without failure/error evidence
can support readiness, even if a failed envelope contains matching rows.
Duplicate, out-of-scope, extra or malformed rows reject rather than
silently truncating the aggregate.

The response envelope's `data` has `contractVersion:1`, `owner:media`,
`evidenceKind:PERSISTED_CURRENT_METADATA`, `checkedAt` and complete input-ordered
`items`. Each item returns only `mediaCode`, the requested checksum, current
`versionId` (or null), `exists`, `metadataMatched`, and
`storedBytesVerified:false`. A positive match requires exact descriptor/checksum,
active READY metadata and an immutable CURRENT version. No paths, provider keys,
URLs, bytes or private errors are projected. Missing records are not successful
preparation. Metadata matches are not current physical-integrity or Online proof.

BackOffice accepts only a complete, exact identity/checksum response dated within
its current request (one-second clock allowance). A clock-skewed, failed, denied
or incompatible owner read remains unavailable. No response is persisted as an
alternate readiness authority. Explicit prepare/repair continues using the
existing byte-verifying upload inspection and CAS contract; subsequent publication
retains its own exact retained-byte and decision checks.

Later layers may customize the exported read/projection methods or narrow scope,
not broaden privileges or reinterpret metadata as byte proof. Independent fixtures
in `test/mediaReadinessAggregateContract.test.js` compose actual controller,
facade, scope/permission/CURRENT checks and the aggregate service with inert
generated-owner mocks and the actual generated item-cache admission step.
Both this fixture and BackOffice's `backofficeStatusReadFanoutContract.test.js`
are registered in nTooling's existing `enterprise-lifecycle` suite through the
installed Mocha CLI, not bare Node execution of Mocha globals.
They cover positive, missing/drifted/retired, denied,
ambiguous, malformed, tenant/token and bounded-input cases with no runtime writes.
