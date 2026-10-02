# import AI Contracts

## Transport Domain Refusals

The import configuration contributes exact domain responses to the existing
nService circuit policy: logical `import`, `ERR_IMP_00003`/HTTP 400 (invalid or
unqualified import admission) and `ERR_IMP_00004`/HTTP 404 (selected release
unavailable). These are failed business requests, not proof of a transport
outage. Diagnostics still count them; they cannot open the shared import circuit
or authorize import retries. All destination, qualification and authorization
guards remain unchanged. A same-code 5xx/403 response, arbitrary 400/404, foreign
module or missing typed transport evidence retains its ordinary circuit penalty.
The generic default is empty; later layers may null a declaration to retain
penalties. See nService's `Capability-Owned Domain Refusals` contract and
`moduleDomainRefusalCircuitContract.test.js` for composition evidence. This
declaration does not alter the separate phased retry policy below or qualify
any runtime import.

## Phased Retry Admission

`DefaultImportRetryPolicyService` owns exported `shouldStop(request)` and
`canRetry(error)` decisions. The outer phase dispatcher uses the actual file
header and honours header/config `stopImportOnFailure`; logging suppression is
not retry authority. Unknown failures and uncertain write acknowledgements are
terminal. Credential ownership, authorization/forbidden placement, validation
and concurrency denials remain terminal through native `cause`, Nodics `causes`
and aggregate `errors`, even when another node declares a retry. Bounded error
graph traversal fails closed on cycles or excessive depth/size. No error text,
source-row flag, phase number or HTTP 500 alone authorizes replay.

A capability may declare `error.metadata.importRetry` with `kind: DEPENDENCY`
or `TRANSIENT` and `writeOutcome: NOT_APPLIED` only when it can prove no write
occurred. Every causal leaf must satisfy that contract. The actual macro lookup
owner declares this only for a confirmed empty reference read before dispatch;
missing write responses remain uncertain and terminal. Later-layer service
overrides must preserve denial precedence and write-outcome proof, not introduce
project/schema exceptions. A transient network failure after dispatch is not
safe merely because it is transient.

HTTP 400 alone remains terminal, except for the established aggregate container
or a leaf with an explicit `DEPENDENCY`/`NOT_APPLIED` owner declaration. This
does not allow a validation error code wholesale: malformed slots using the
same CMS status remain terminal without that declaration. Explicit coded
validation, authorization, credential and CAS denials still override declarations;
HTTP-400 transient or unknown-outcome declarations do not qualify. Dependency
owners must prove a successful fresh empty reference read, not a refusal envelope
with an empty result. Actual Axis slot/template sources, CMS validation and
outer/file phase composition are covered in the focused retry fixture.

Successful tenant/row processed keys remain retained across phases. Recovered
probes do not become permanent diagnostics; terminal failures are recorded on
their first phase and exhausted safe retries on their final phase. An uncertain
batch acknowledgement is not successful-row proof and cannot authorize batch
replay. This policy governs phases within one invocation, not operator approval
to replay an entire FAILED release or resume a RUNNING receipt.

Offline coverage: `test/importRetryClassification.test.js` composes actual
outer/file processors and diagnostics, substituting only capability dispatch
and archival boundaries. It covers denied/wrapped/mixed errors, fail-fast,
successful-row guards, dependency/transient recovery, exhaustion and uncertain
acknowledgements. It does not qualify live persistence or external providers.

## CMS Replacement Scope

Governed releases are not blanket CMS replacement authority. Local dispatch
first removes incoming CMS association/multi-match/array replacement flags and
grants them only when header module/schema resolve to the exact effective
`cms` registry schema. Profile staff, credentials and other reference data never
receive these flags merely because they came from a data release. Versioned
root import selection remains independent and never propagates into nested
children. nDatabase independently isolates child options and rejects broad
replacement selectors. No customer data or immutable manifest bytes change.
See the actual cross-owner regression in
`../../../../../nDatabase/database/test/nestedImportReplacementContract.test.js`.

This index routes developers to nImport's release, installation, immutable composition and media-backed import contracts.

nImport owns installation and receipts; Media owns bytes. Preserve authorization, checksums, explicit release selection and fail-closed preflight. Viewing a plan does not authorize installation.

Detailed material is preserved in the adjacent [contract guide](import-release-contracts.md). This README is the discovery index, not a replacement authority or evidence that runtime qualification passed.

Read [owner guidance](../../AGENTS.md) before changing behavior. Customize through the established later-loaded configuration, services, providers, schemas and runtime layers described in the guide; do not copy framework owners or bypass their invariants. Verification commands and their limits are retained in the guide. This documentation-only reorganization runs no behavioral tests or operations.

## Custom installer preflight

See [Custom installer preflight](import-release-contracts.md#custom-installer-preflight).

## Strict installed migration evidence

See [Strict installed migration evidence](import-release-contracts.md#strict-installed-migration-evidence).

## Retained source roots

See [Retained source roots](import-release-contracts.md#retained-source-roots).

## Explicit release selection

See [Explicit release selection](import-release-contracts.md#explicit-release-selection).

## Offline execution test ownership

See [Offline execution test ownership](import-release-contracts.md#offline-execution-test-ownership).

## Canonical Staged Sample Acceptance

See [Canonical Staged Sample Acceptance](import-release-contracts.md#canonical-staged-sample-acceptance).

## Managed technical counters in module data

See [Managed technical counters in module data](import-release-contracts.md#managed-technical-counters-in-module-data).

## Guided initialization

See [Guided initialization](import-release-contracts.md#guided-initialization).

## Versioned content packs

See [Versioned content packs](import-release-contracts.md#versioned-content-packs).

## Module release manifests

See [Module release manifests](import-release-contracts.md#module-release-manifests).

## Media-backed file import

See [Media-backed file import](import-release-contracts.md#media-backed-file-import).

## Layered immutable source composition

See [Layered immutable source composition](import-release-contracts.md#layered-immutable-source-composition).

## Concurrent release execution

See [Concurrent release execution](import-release-contracts.md#concurrent-release-execution).

## Inherited governance and selected profiles

See [Inherited governance and selected profiles](import-release-contracts.md#inherited-governance-and-selected-profiles).

## Content-pack defaults and manifest paths

See [Content-pack defaults and manifest paths](import-release-contracts.md#content-pack-defaults-and-manifest-paths).
## Explicit Enterprise Placement

Developer-authored release headers may declare `options.enterpriseCode` as an
explicit bounded enterprise code. This is placement, never importer identity or
an eligibility/consent grant. The release must match fresh canonical discovery
(release identity, semantic version, source root, declared files and checksum).
Reference data retains `versioningPolicy: NONE`; checksummed stable source
immutability does not require artificial business versioning.

`data.dataReleases.targetValidators.<module>` selects the owning exported
`validateImportTarget(metadata)` operation. Explicit placement requires an
available owner returning exactly `true`, in release preflight and again before
the generated write. Missing, undefined, negative and throwing owners refuse.
For Profile Customer `signUpAll`, Profile validates fresh active enterprise and
active tenant matching the exact import tenant. Unplaced, unrelated imports
retain existing owner admission.

Owner errors are normalized to `ERR_IMP_00003`. Only reviewed
`ERR_PROFILE_MEMBERSHIP_UNAVAILABLE`, `ERR_PROFILE_MEMBERSHIP_FORBIDDEN` and
the existing `ERR_PROFILE_ELIGIBILITY_` OWNER, CONFIGURATION, COLLABORATORS,
POLICY, REGISTRY and AUDIT codes survive as `metadata.targetReadinessCode`,
with fixed importer-owned copy.
Unknown codes use generic refusal. Raw owner text, stack, evidence and metadata
are never copied. Customer preparation is blocked until the selected Profile
eligibility owner confirms qualified collaborators and an approved published
policy; placement is not readiness and must not prompt blind retries.

nImport privately binds only release-created requests to their original live
`importRun`, then admits the exact generated service request while its promise
is awaited. `DefaultModelImportProcessService.readAdmittedOperationMetadata`
returns undefined or frozen `{moduleName,schemaName,operation,tenant,
enterpriseCode}`. Copies, JSON, body markers, caller identities and run receipts
cannot manufacture admission. Cleanup executes on success or failure. No proof
crosses remote transport; placement-bearing remote writes remain unqualified.

Profile selects this owner using
`identityGovernance.customerRegistration.importPlacement.metadataOwnerService`.
Profile owns fresh placement revalidation and private awaited per-record child
bindings. Existing credential, native eligibility, consent and qualification
checks still apply. Browser/media imports and public trusted mappers acquire no
new placement authority from this source-header contract.

## Release Target Admission And Partial Recovery

Automatic Init discovery must respect the effective runtime role's explicit
`allowedDestinationRoles`, including an empty list, as well as exact destination
and environment ownership. Folder-based synthetic releases do not override an
Online runtime's no-import policy. An omitted allowance retains the existing
current-role default; a declared empty allowance admits nothing automatically.
Explicit manual selectors still pass throwing destination validation and must
refuse excluded releases, never silently skip them. No source bytes, manifest,
publication boundary or permission is changed by automatic selection. The
actual WCMS/nConfig composition is covered by
`test/startupDestinationOwnership.test.js`.

The manifest's destination applies to every included header target, not merely
the release label. Before planning and again before executing a prepared plan,
`DefaultDataReleaseService.validateReleaseTargets` invokes the configured
capability owner in `data.dataReleases.targetValidators` using only trusted
header metadata. A selected owner must be available and return exactly `true`.
Owner exceptions become `ERR_IMP_00003` without forwarding arbitrary exception
content. Disabled headers are excluded. This read-only contract does not skip
rows, redirect writes, alter manifests, authorize publication, or replace
generated service mutation guards. Other modules can contribute their own
validator through ordinary layered configuration and mergeable exports.

For a failed partial run, read its secured `dataReleases` metadata and the
corresponding catalogue/installation receipt. Require exact releaseCode,
version/checksum, tenant/environment/destination and attempt status; record
counts and archive files alone are not immutable installation proof. Preserve
all successful writes and retained receipts. Never reset, roll back, force a
CURRENT release, or rewrite old stable release bytes/checksums. Issue forward
owner releases when splitting policy and operational data. Retry is an explicit
operator action through nImport only after source correction and read-only
reconciliation; it may re-evaluate successful rows inside the same FAILED
release and therefore needs existing generated revision/owner idempotency
qualification, not a promise of record-level resume. CURRENT releases are
skipped; RUNNING receipts cannot be taken over on a timeout. A rejected plan
does not prove anything about earlier imports or constitute a migration.
