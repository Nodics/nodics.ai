# Publication Authority Contract

Generic authoring does not confer publication authority. Effective source schemas
declare `backoffice.mutationPolicy.publishRequired` and generic mutation APIs
require the existing runtime's STAGED publication role. Projection/pointer/receipt
schemas declare read-only generic authoring. This is enforced by nDatabase and
nController, without changing trusted nPublish provider writes. Online source
collections are not an active Published view: consumers must inspect the owning
domain's authoritative projection and activation evidence.

`nPublish` is the sole generic authority for Staged/Online lifecycle states,
transition validation, publication requests, publication audit, activation and
rollback orchestration. Domain modules contribute adapters; versioned database
variants contribute persistence; workflow contributes approval; event, cache,
and search modules consume completion hooks.

Never reproduce publication states, scheduling, audit, activation, or rollback
inside CMS, WCMS, catalog, commerce, or project modules. Domain fields such as
CMS pages belong in adapter payloads and dependency references, not generic
publication schemas.

Module adapters must not update generic publication state directly. They
provide `resolveDependencies`, `validate`, `afterActivate`, or `afterRollback`
hooks. Version providers supply `getVersion`, `getOnlineVersion`, `activate`,
and `rollback`. Repository providers preserve tenant isolation, optimistic
revision checks, idempotent creation, and immutable transition audits.

Version providers may be selected per domain through
`publish.providers.versionProviders`; the single `versionProvider` remains a
default only. Domain modules own their provider contribution and nPublish must
not embed domain-specific version or Online-pointer behavior.

Approval providers may be selected per domain through
`publish.providers.workflowProviders`. An absent domain entry retains the
existing `publish.providers.workflowProvider` fallback. An explicit entry that
cannot resolve a provider implementing `requestApproval` must fail before any
publication transition; it must not silently use another workflow or bypass
approval. Selection belongs to layered configuration, not request payloads or
domain-name branches in nPublish.

This selection is an extension of the existing provider contract, not a new
approval engine. Process remains the workflow/task/decision authority; nPublish
retains the publication lifecycle, revision and audit authority. Domain owners
contribute reusable workflow bindings and validation. Customer projects may
select supported policies and deployment bindings but must not duplicate the
approval engine or weaken its tenant, permission, replay and evidence checks.
Existing CMS behavior remains on its current provider unless explicitly
configured otherwise. A new integration must reuse the existing Process
runtime authorization and claimed-action protocol rather than trust a decision
supplied in a callback payload.

The publication request owns the authoritative transition journal. Repository
providers must update lifecycle state, optimistic revision, and the new journal
entry in one compare-and-set write. The `publicationAudit` collection is a
query projection and may be reconciled from that journal; projection failure
must never discard authoritative audit evidence or roll lifecycle state forward
without evidence.

Projection reconciliation must read journals through the configured repository,
remain tenant-scoped and bounded, and insert only missing deterministic audit
identities. It must not modify publication state, revision, or journal entries.
Scheduling belongs to the existing cronjob authority, and any administrative API
must use the BackOffice administrative security boundary.

## Qualified Target Receipts And Recovery

When legacy `publishEnabled` is false, HTTP lifecycle administration may proceed
only on `runtimeRole.publication: 'STAGED'` for a domain explicitly registered in
all three existing maps: `domainAdapters`, `versionProviders`, `workflowProviders`.
Each must resolve a usable provider; global fallbacks and null registrations do
not qualify. Existing publications derive domain from the authenticated,
tenant-scoped stored record, never a body override. Creation uses its requested
domain under the same registration checks. Operator operations must identify one
stored publication; unscoped diagnostics/reconciliation remain disabled here.
Online and unspecified roles remain denied. Existing true/unspecified global
behavior and legacy CMS global-workflow selection are unchanged. Route permission,
token type, revision checks, provider qualification and approval still apply;
this exception neither enables a domain nor starts a runtime.

A version provider may opt in by declaring `targetReceiptContract: 'v1'` on its
service implementation (not the request). Its `activate(publication, request)`
returns `{ version, receipt: { operationKey, publicationCode, sourceVersion,
targetVersion, previousOnlineVersion } }`. All identity fields must match the
publication and returned version; `previousOnlineVersion` is a nonempty retained
version string or explicit `null` for no predecessor. Missing or mismatched
evidence rejects Online completion. Providers without this declaration retain
the existing contract, including CMS. Unknown declared contracts fail closed.

nPublish persists `activationOperation: { key, previousOnlineVersion }` in the
ACTIVATING transition before target work. When `getOnlineVersion` returns a
`revision`, the same operation retains it as `previousOnlineRevision`, including
zero for a provider's absent-pointer token. A supplied revision must be a
nonnegative safe integer; invalid values reject before transition or target work.
An omitted revision stays omitted for legacy providers such as CMS. Replay uses
the retained token without refreshing it from the live target. Historical
operations without a token are not assigned a fabricated one; a provider that
requires revision CAS must reject them or reconcile its own durable receipt.
This token is distinct from the publication revision. The key is
`publication.code + ':activate:' + publication.revision` at ACTIVATING. Providers
must use that retained key for durable target idempotency and return the original
receipt on replay. Historical ACTIVATING requests without this field receive the
same revision-derived key, but an unknown predecessor is never inferred from a
fresh Online read. Qualified receipt lineage takes precedence over the observed
predecessor; legacy providers may return `previousOnlineVersion` directly.

The observed predecessor is not a target lock. Domain providers still own hidden
preparation, immutable retention, tenant/root/source binding, target pointer CAS,
atomic receipt persistence and exact replay conflict checks. Shape validation
does not prove these guarantees, and absent providers confer no target CAS.
Rollback uses the retained predecessor through the existing provider interface;
providers must reject unavailable history and changes to intervening activations.

Operations reconciliation also invokes the owning provider for retained activation
operations and historical ACTIVATING records without a targetVersion. Providers
inspect the exact operation key and retained source, not mutable latest content.
This does not automatically approve or promote a publication. FAILED recovery
uses operation-qualified retry as described below; REJECTED, WITHDRAWN and
ROLLED_BACK use explicit resubmit and renewed approval.
Target failures retain operation identity for inspection; operators reconcile an
uncertain commit before a new approval attempt. No generic target store or
automatic compensation is introduced.

An explicit operations `publicationCode` scopes audit, target and CMS outbox
reconciliation to that exact publication within the existing tenant authority.
Malformed or empty supplied codes reject before effects; they must not become an
unscoped request through controller normalization. An omitted code retains the
authorized bounded batch operation. A selected non-CMS publication must never
drain unrelated CMS events. Later-layer reconcilers preserve this scope contract.

For validation/activation failures, FAILED retry, revalidation and renewed approval retain the original activation
operation, including its predecessor version and optional target revision.
Activation must replay that same key through the provider, which reconciles its
durable receipt; it must not read current Online to manufacture a new operation
after a lost response or failed completion hook. A rejected renewed approval does
not resolve an uncertain commit and must not clear that identity either. Only a
completed Online refresh or resubmission after completed rollback/withdrawal
clears the previous operation at the validation boundary for a new cycle.
Legacy providers retain their existing response shape and idempotency obligations.

The repository stores absent optional typed fields by using the generated update
service's atomic `$set`/`$unset` contract, not by writing BSON null into a string
or object field. Explicit null `previousOnlineVersion` evidence remains in the
retained target receipt/journal; the top-level field is absent. Clearing a completed
`activationOperation` likewise unsets it. State, revision, journal and removal
remain one tenant-scoped compare-and-set. This requires no validator relaxation.
After target commit followed by persistence failure, retain the failed operation
and replay through governed retry/approval after coordinated source deployment;
never synthesize a predecessor from the now-current target or edit live records.

Focused lifecycle and operations tests cover retained identity before target work,
response loss, receipt mismatch, explicit absence of predecessor, replay lineage
and terminal recovery. CMS manifest and Process bridge tests preserve compatibility;
these isolated tests do not establish deployed target atomicity or live acceptance.

All lifecycle mutations require the caller's expected publication revision.
Activation and rollback providers must be idempotent because infrastructure can
fail after external work succeeds but before the local response is observed.

## Immutable Source And Installed Compatibility

Reuse the owning versioned database/service providers for immutable authoring
versions. Select them through existing schema policies and explicit publication context bindings
where supported; do not add a parallel snapshot store or copy persistence into
domain adapters. A broad tenant-owned policy must not accidentally version
operational balances, reservations or transactions along with publication sources.

Before enabling versioning on an installed collection, qualify existing records,
version identity, unique indexes and the owner-supported migration path. Automatic
orphan-index cleanup, sample replay or a clean-install test is not installed-data
migration evidence. Inspect and change records/indexes only through their owning
services and provider boundaries, with explicit scope and retained provenance.

Publication capture, approval validation and activation must resolve the exact
immutable source version, never a mutable latest-record query. Authoring readers
must retain their single-current-record contract when version history is enabled.
Existing export/restore or Media transfer can supply transport mechanics, but do
not confer approval or active-target authority. Domain providers must prove target
application, retry/reconciliation and rollback through the existing nPublish
lifecycle before registration is enabled. Project acceptance remains a consumer
of this evidence, never its producer or a substitute migration implementation.

## Publication Scope And Operational State

Governed Commerce publication and rollback cover catalogue, policy and
configuration only. Stock balances, reservations, allocations, coupon redemption
state and consumed budgets remain live operational authority. Capturing or
restoring those values as part of a release is forbidden. Mixed records require
an owner-defined separation before a publication provider can be enabled;
reverting policy must never revert usage or restore spending capacity.

Product owns the complete catalogue dependency closure and version-qualified
search projections. Pricing and Tax own exact policy versions. Promotion must
separate policy from live consumption using its existing operational authorities.
Inventory publishes warehouse configuration, not stock. Media must retain both
exact metadata and immutable referenced bytes; metadata history alone is not a
rollback guarantee. Existing import/export/restore commands are transport or
administration capabilities, not automatically qualified publication providers.

Target preparation must remain hidden until owner activation succeeds. Customer
reads must use the activated version consistently, with live operational checks
preserved. Require durable target evidence, optimistic activation checks,
idempotent retry and retained-version rollback before registration. Reuse nPublish,
Process, nService and owning persistence/storage/search facilities; do not create
another lifecycle or customer-project enforcement implementation. These are
qualification requirements, not a declaration that every domain implements them.


Repeated creation of the same publication code must preserve the exact source and
any explicitly supplied target scope. A conflicting target requires a new
request. A provider may qualify the current Online target before offering and
starting rollback. Target owners still enforce that condition during mutation.

## Original rollback and withdrawal recovery

A provider may separately declare `targetCommandReceiptContract: 'v1'`. This is
independent of activation's `targetReceiptContract`. Before the first target
effect, nPublish captures the original command in the existing atomic transition
journal's `details.targetCommandOperation`. It binds operation, original key,
publication/domain/root/source, activation key, original transient revision and a
SHA-256 hash of the exact target version. The hash preserves long multilingual
version identity without weakening generic evidence redaction or string limits.
There is no new journal, collection or caller-controlled top-level descriptor.

FAILED recovery classifies only the current exact authoritative journal entry.
Validation/activation failures retain revalidation and approval semantics plus the
original activation identity. A qualified failed rollback or withdrawal resumes
its own operation through a contiguous, matching journal chain. The provider sees
the actual advancing lifecycle revision and the same original target key, never
a fabricated revision or fresh predecessor. Missing, changed, gapped or legacy
command evidence remains held. Non-opted-in providers retain ordinary command
behavior but cannot silently recover these failures through activation.

The qualified provider returns a positive `receipt` with exact operation/key,
publication/root/source, target version and nonnegative integer `affected`.
Negative or contradictory receipts fail before completion hooks and terminal
state. Domains retain atomic target persistence, immutable receipt replay,
complete-set validation and intervening-publication fences; nPublish receipt
shape checks do not establish target atomicity. In-flight commands require the
caller's current expected revision before provider I/O. Operator recovery also
requires that revision, without replacing a missing or stale value. A completed
identical command is read-only; inspect uncertain completion before explicitly
resubmitting a terminal request for a new approval cycle.

The composed Editorial tests exercise actual lifecycle, version/source/target
services and managed persistence owners through isolated repository/provider
ports, including concurrent recovery, response/hook/terminal-ack loss, repeated
failure and contradictory receipts. They are not native approval evidence.


## Business inspection and explicit operator controls

The existing human publication GET invokes `inspect`, which reads through `get`
and returns a copy with nonpersistent `operatorOperations` and
`operatorGuidance`. Internal lifecycle/domain reads still use the exact stored
record through `get`. Inspection does not append audit, change state, create
permissions or confer activation authority. FAILED eligibility uses the current
exact journal classification; original rollback/withdrawal proof and qualified
provider methods are required. Terminal states offer no implicit resubmission.
For a qualified Online rollback, inspect the actual current target version before
offering the operation. Different, absent, negative or unavailable current target
evidence holds rollback while retaining readable request history. Execution
independently rechecks CAS, journal, retained target and intervening publications.
Read eligibility is neither a target lock nor proof of public access.

The existing request navigation declares permission-qualified retry/rollback and
original in-flight withdrawal transports through `lifecycleActions`. BackOffice
filters permissions/availability; Axis intersects those declarations with the
fresh owner eligibility. No new route, group, grant, token type, approval or
exposure default is introduced. The existing human `runtimeConfigAdminUserGroup`
route admission and granular permissions remain independently enforced; service
approval/activation routes remain service-only. Metadata is not authentication.

Axis first reads the exact originating runtime/request, requires unchanged
root/source/state/revision and permitted operation, then asks for explicit
confirmation. The POST contains the inspected publication concurrency revision,
not the source version. A positive acknowledgement must match original
publication/domain/root/source, advance the revision and reach the operation's
expected state. Retry may revalidate or finish its original qualified command;
revalidation still requires normal review/approval before activation. Unknown or
contradictory responses are held, with no automatic read-as-write retry. A later
fresh inspection is required before another explicit preparation. Actor/source
retirement and permission changes discard prepared or delayed private evidence.
The original command journal remains the owner recovery route after navigation
or response loss; browser state is not another lifecycle store.


A provider may admit retry of a failed legacy rollback only through canRetryRejectedRollback returning exactly true after fresh owner checks. CMS admits only its transaction-scoped ERR_CMS_00116 rejection, a contiguous Online to Rolling Back to Failed journal, unchanged activation/predecessor identities and the same current Online pointer. Retry appends audit evidence and uses current pointer fencing; it never rewrites the old journal or activates a new revision. Timeouts, response loss, incomplete history and other failures remain blocked unless the existing qualified command receipt contract proves recovery.
