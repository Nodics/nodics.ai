# import AI Contracts

## Run History Ordering

`DefaultImportRunHistoryService` uses the inherited `created` timestamp and `code`
tie-breaker for newest-first history. `creationTime` is not a persisted import-run
field. Map public `limit`/`skip` filters into generated-owner page size/number;
do not pass adapter-only limit/skip that the owner will replace. Merge default
options with explicit internal overrides, including an empty options object.
Preserve tenant/query scoping, read-only behavior and immutable original receipts.

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

## Generated Update Dispatch

An import header selecting generated `update` dispatches exactly one normalized
record as `request.model`, resolving `$property` header selectors against that
record and retaining tenant, access groups and owner validators. Reject empty or
unresolved selectors and zero or multiple models before dispatch;
never silently select the first record. `saveAll` retains `request.models`.
Updates request returned models and unwrap the generated owner's
`{ matchedCount, modifiedCount, models }` receipt. An unchanged matched row is
valid; an unmatched or missing receipt is not successful import evidence.
Partial repairs must not be converted into saves that require or rewrite
credentials. Managed-counter schemas still require their existing `saveAll`
revision contract. Later-layer dispatch overrides preserve these guarantees.
# Manifest Path Discovery

Collect each qualified release's declared header and record paths before
basename grouping. Broad recursive scans can collapse same-named files in
sibling sections before the manifest allowlist is applied. Preserve selected
release order, containment, exact source qualification and legacy discovery for
non-release callers. Never qualify `NO_DATA` or explicit zero-success imports as
installed. A historical false-current standard release can recover only in
Local through an explicitly requested `forceCurrent` operation, with unchanged
version and checksum, its exact durable `NO_DATA` run and all six record counters
explicitly zero. Bind this private qualification to the receipt's original run
and revision before the normal fenced claim. Custom installers, ambiguous or
incomplete history, non-Local deployments and any prior record work are excluded;
never edit receipts or replay financial contributions. Ordinary immutable
current releases remain non-replayable.

## Offline Source Inspection

`DefaultDataReleaseService.inspectSourceManifest` verifies an aggregate section's
nonempty declared file map against contained source bytes and reuses canonical
lifecycle, capability, publication-review and prerequisite validation. It never
evaluates headers or records, so it needs no bootstrap credentials or runtime
authentication globals. Its checksum describes only the declared source snapshot;
it is not installation qualification. Runtime discovery retains reference
expansion and must independently qualify releases before execution.

## Validation and operational safeguards

The optional [incremental acceptance contract](incremental-acceptance.md)
provides test-owned disabled-record fixtures and explicit owner-client phases
for predecessor upgrade, edited-record conflict and partial FAILED-release retry.
CURRENT replay requires the owner's `ERR_IMP_00003` duplicate rejection and
unchanged source identity, complete fixture records and run history; it does not
expect a successful install/skip response.
Payloads live only in `test/fixtures/incrementalAcceptance/data`; the coordinator
lives in `test/helpers`. They are absent from the shipping release catalogue.
Tests use disposable module roots and canonical release discovery/validation.
The explicit isolated harness uses a distinct test module and private providers;
it never targets a customer database or grants deployment authority. Execution
requires approval and normal deployment admission. Offline tests start no runtime.
Execution retains provider state and stops owned children; offline cleanup refuses
provider directories. See the contract for the command and prerequisites.

`nodics project:run acceptance:staged-sample-data --target-role=<ROLE_STAGED> --release-modules=<module,...>`
checks the secured sample catalogue and validation APIs using employee authority.
Start the selected Platform and Staged runtimes through the project's topology
tooling first. The suite never starts or stops servers. `--help` is inert.
Application `dataPackages` in effective Platform profiles select the releases;
the module allowlist ignores inactive applications but fails when nothing matches.
Application data and fixture selections remain with their owners.

The default is validation-only. `--execute-install` explicitly permits installation;
the historical storefront-specific environment flag has no effect. Versions come
from the catalogue, never a guessed fallback. Duplicate/missing identities, wrong
destinations, changed versions and validation responses claiming execution fail.
Current releases are skipped; after installation the catalogue must report the
same selected versions as `CURRENT`. Import errors, including immutable-release
errors, are not success evidence. Partial installation is not automatically rolled
back; resolve the failure and retry through nImport. No reset, Online publication,
permission mutation or approval is performed by this suite.

Run import-focused contract tests when behavior changes, then run:

```bash
npm --prefix nodics.docs test
npm run quality:docs
```

Release composition uses target-qualified headers and current lower JS sources;
only executing-delta keys reach persistence. Evaluate Init deltas on every boot,
skip current receipts, and reject running or same-version edited Init releases.
See [layered composition](README.md#layered-immutable-source-composition).

This capability declares an inert model-service inventory for [governed Local reset](../../../../../nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.

Release execution claims durable installation receipts through the existing
managed-counter database contract. Require matching attempt identity for
completion; never fail unstarted releases or take over a running attempt on a
timeout. See [concurrent release execution](README.md#concurrent-release-execution).

Route-category defaults belong to this capability; deployments supply only intentional overrides.
Preserve nRouter enforcement and independent route authorization. See [exposure ownership](../../../../../nRouter/llm/contracts/README.md#capability-owned-exposure-defaults).

Own release safeguards and inert initialization profile templates. Deployment selection and exact-release permissions remain mandatory; see the local contract.

Content-pack defaults belong to `data.contentPacks.defaults` in this capability. Selected packs inherit source conventions, update policy and complete presentation fields; partner contributions override only intentional differences. Resolve omitted content paths from the selected manifest section, preserving explicit path overrides and all import authorization/checksum/staging guards. See `llm/contracts/README.md#content-pack-defaults-and-manifest-paths`.

Content-pack staging retains a server-owned `input/data/content-pack` release root.
Declared headers must be direct `headers/*Header.js` or `*Headers.js` files.
Nested headers and headerless selections fail before dispatch, not after a
zero-work import is recorded as complete.
Finalized Media headers resolve their relative asset pointers from that root,
including composed packs; source-controlled assets are never moved by import.

Standard release discovery collects exact declared paths before grouping file
basenames, so independently selected sibling sections cannot hide one another.
Zero-work runs do not qualify installation. Historical false-current standard
releases have a Local-only, exact-zero-write recovery through the existing
explicit `forceCurrent` operation and fenced receipt claim; ordinary immutable
replays and custom installer replays remain prohibited. See the local contract.

Sample releases are available to authorized manual operators by default, with optional deployment restriction. Only Init can auto-run at startup. Environment scope reads the effective `environment.class` projected by nConfig from the selected environment module metadata; never author it in environment properties or derive it from the selected environment name or another capability policy. Permissions, roles, tenant isolation, release checksums and durable receipts remain mandatory.

Explicit enterprise placement belongs in a checksummed developer release header,
not imported rows or operator claims. nImport delegates fresh validation through
`data.dataReleases.targetValidators` and exposes only transient exact-request
metadata to the owning generated operation. Read the
[placement contract](README.md#explicit-enterprise-placement).

Release destination admission follows the selected header module/schema owner and
explicit publication context. Runtime role labels and role profiles cannot select
imports. Publishable sources require STAGED and the effective schema's authoring
policy; missing owners fail before claims. Runtime-local receipts/history stay local.
See [destination ownership and adoption](import-release-contracts.md#selected-destination-ownership-and-startup-selection)
for retired selector rejection, explicit startup coordinates and offline evidence.

Publishable sample source manifests must declare `selectionPolicy: EXPLICIT` to satisfy the existing Staged source admission check. Source packaging regression covers Nexus, CMS and Product sample manifests; runtime admission is unchanged.

Historical documentation provenance release 0.0.2 preserved article bodies and stable routes while correcting source integrity/navigation metadata. The [manifest](../../data/manifest.json) now selects its forward successor; prior exact bytes remain in test fixtures. Source validation does not install, approve or publish this release.

Public catalogue action eligibility is actor-bound through existing command routes; see [the release contract](import-release-contracts.md#actor-bound-catalogue-action-eligibility). Empty or omitted actions mean read-only review, not initialization authority.
Generic Media-backed file imports preserve every source row until validation.
Repeated identities and owner-managed fields are reported by row. Direct
installation applies the same validation before any record dispatch.
