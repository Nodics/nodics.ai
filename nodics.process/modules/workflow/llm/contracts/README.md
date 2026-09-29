# workflow AI Contracts

This folder contains workflow capability contracts inside `nodics.process`.

## Contribution provenance and adoption

Domain modules author generic definitions; Workflow installs them through
`DefaultProcessDefinitionContributionService` and the existing definition
lifecycle. nImport remains the release qualification, selection and installation
authority. Never edit an already released payload or its manifest to transfer
ownership. A release checksum identifies the source bytes; each published
Process version separately records its effective graph and source provenance.

`planContribution(request)` is a read-only internal service operation on an
nImport-qualified `request.contribution`. It returns CREATE, CURRENT, RETAIN,
UPDATE or FORWARD per definition. It neither approves nor installs a release.
`installContribution` preflights the complete release and rechecks each definition
before mutation. This is not a cross-definition transaction; use nImport's
serialized installation/recovery path, not concurrent direct installer calls.

### Operator inspection and execution

The supported remote read/plan path is the existing secured
`POST /nodics/import/v0/init/validate`, selecting exact `releaseCodes`.
nImport calls the configured installer's read-only `preflightContribution` with
its qualified descriptor and the authorized tenant/principal. Process returns
`data.contributionPlans[].evidence` plus either `ready: true` and `plan`, or
`ready: false` and `blocker`. Missing transition authority is a blocked plan with
evidence available for review; corrupt immutable evidence and service failures
remain errors. Require `data.validation.ready === true` before execution.
An HTTP success or a CURRENT release receipt alone is not adoption approval.
All selected custom releases are checked, including CURRENT receipts.
No body field supplies transition authority, installer selection or provenance.

The loader-visible `DefaultProcessDefinitionContributionService.inspectRelease`
and `planRelease` methods accept the normal scoped request plus
`releaseRequest: { dataType: 'init', releaseCodes: ['owner:section'] }`.
Both resolve the descriptor through `DefaultDataReleaseService.preparePlan`,
preserving nImport discovery, destination, version and installation qualification.
They reject implicit/module-wide selections and non-Process installers. A supplied
`request.contribution` is ignored by these operator methods.

Inspection is read-only and does not require or manufacture transition approval.
For each definition it returns installed/target provenance, current version,
verified immutable `publishedChecksum`, effective `targetExecutionChecksum` and
graph-plus-policy `equivalent`. Unpublished, foreign-domain or inconsistent
installed evidence fails closed. Missing definitions have no installed evidence
and are not equivalent. Inspection does not certify a live pending-task inventory.
`planRelease` then enforces the existing configured transitions; inspection output
alone cannot authorize installation. These are internal services, not new HTTP
routes; callers must retain their authorized tenant/principal context and must not
expose them through an unrestricted generic service dispatcher.

Operator sequence in the selected Process runtime:

1. Read `GET /nodics/process/v0/definitions/:definitionCode` and
   `GET /nodics/process/v0/definitions/:definitionCode/versions` with the existing
   `process.definition.read` permission. The first returns source provenance;
   match `currentVersion` to the immutable version's `checksum` in the second.
   Inventory pending instances/tasks through Process's existing inspection APIs
   or `DefaultProcessOperationsInspectionService`, preserving pagination and
   recording each instance's pinned version and task assignment.
2. POST the exact release selection to `/nodics/import/v0/init/validate`. Review
   `data.contributionPlans[].evidence` for exact source,
   target, published checksum and effective equivalence against the API evidence.
   Configure only approved exact transition entries in the customer layer;
   retain an empty transition list until that evidence is available.
3. Repeat `/init/validate` after the approved configuration is loaded and require
   `validation.ready: true` plus the expected `contributionPlans[].plan`.
   Stop on unexpected CREATE/UPDATE/FORWARD or an error. A RETAIN plan means no
   Process aggregate/version/task/instance writes, not zero nImport receipt writes.
4. For approved execution POST `/nodics/import/v0/init/install` with
   the same explicit release selection. Never call `installContribution` directly
   as an operator, reuse a stale prepared plan, or install through acceptance.
   nImport requalifies and invokes Process with its scoped request and receipt flow.
   In-process callers may use `DefaultDataReleaseService.execute(request)`.
5. Repeat inspection/planning and the approved nImport selection. Verify unchanged
   immutable history, instance versions and task assignments. CURRENT nImport
   receipts may skip installer execution; the Process plan still rechecks policy.
   RETAIN keeps old provenance, so keep its approved transition for future plans.
   After FORWARD the target plan is CURRENT and old-source selection must stop.

Source tests prove isolated owner behavior only. The operator must separately
record installed-state evidence and live execution results, including pending
decision completion and any failure/recovery. No inspection or plan claims a
cross-process transaction or bypasses the existing deployment execution controls.

An existing definition must retain its domain `ownerModule`. Same-source replay
requires matching contribution owner, code, version, checksum, graph and policy.
Changing customer policy also needs a new qualified release version. Unowned
legacy definitions cannot be silently claimed.

Cross-source compatibility is disabled unless later-layer
`process.definitionContributions.ownershipTransitions` explicitly selects an
entry with `definitionCode`, `source`, `target`, `publishedChecksum` and `mode`.
Workflow's `config/properties.js` declares this namespace with the neutral
`ownershipTransitions: []` default. An empty array grants no adoption or forward
migration authority. Customer reviewer configuration never enables a transition.
Each source/target contains exactly `moduleName`, `releaseCode`, `version` and
`checksum`. Request-body entries are not authority. Evidence must match the
installed aggregate and its latest immutable published version, including graph,
policy, provenance, version number and checksum. No wildcard owner or inferred
checksum is supported. Domain ownership cannot change through this mechanism.

- `RETAIN`: equivalent execution returns CURRENT with `retained: true` and the
  original installed provenance. No aggregate, version, task or instance writes
  occur. Replays of either source remain idempotent. This acknowledges adoption
  of authoring authority without relabeling historical installation evidence.
- `FORWARD`: equivalent execution still retains provenance. Changed execution
  prepares and publishes a new immutable version using the target provenance.
  Previous version identities/checksums remain unchanged; pending instances keep
  their original version and task policy. `targetExecutionChecksum` must also
  match `executionChecksum` of the complete effective target graph and policy,
  so changing the customer adapter cannot reuse old migration approval evidence.
  This digest uses JSON serialization of `{ graph, policy }` (empty policy by
  default); obtain it from the owner service rather than reconstructing it.
  Old-source installation now conflicts,
  so operators must exclude it from later installation selections while retaining
  its files and release history. A failed prepared draft can resume only while
  its graph/policy and original provenance still match the qualified source.

`customizeDefinition` receives a detached payload definition and qualified
contribution. Its default implementation reads
`process.definitionContributions.reviewerAssignments`, declared as `{}` in
Workflow properties. Customer modules contribute entries keyed by definition
code, with exactly `ownerModule`, `contributionOwner` and `nodeAssignees`:

```js
reviewerAssignments: {
    documentReview: {
        ownerModule: 'documents',
        contributionOwner: 'documents',
        nodeAssignees: { review: 'customerReviewers' }
    }
}
```

The domain and contribution owner must both match. Each mapped node must already
exist exactly once and have type TASK; each assignee is a nonblank, trimmed string
of at most 128 characters. Unknown policy fields, graph/identity replacements,
non-TASK nodes, missing nodes and malformed assignments fail before writes.
Configuration changes only node `assignee` fields. No server service overlay is
needed. Service customization still cannot change definition identity, and the
resulting graph is validated. Changed effective policy requires a new release
version or exact forward-migration evidence, as above.

The immutable source payload must never import mutable service code or customer
policy. Reviewer mappings grant no task, decision, domain callback, publication
or contribution-ownership permission.

Before selecting a transition, operators must obtain the source aggregate,
published version, nImport source/target release checksums, effective customer
policy, pending-instance inventory and scoped principal evidence through owning
APIs/services. Confirm the plan before approved installation. Source tests do
not establish these facts for a retained deployment. Tests in
`processContributionAdoption.test.js` and `processRemoteActionAdapter.test.js`
cover isolated lifecycle migration, no-write retention, retry and secured pending
decisions; distributed/database concurrency and live migration remain separate
acceptance gates.

Use it for rules that coordinate workflow schemas, services, APIs, ownership boundaries, compatibility requirements, and migration decisions from the archived workflow family.

## Remote action authority

Instance starts use the existing generated create-only save and tenant-local
unique primary key. An explicit instance code is bound to a Process-owned hash
of the original input, authenticated enterprise and pinned definition version.
Exact completed-start retries return the existing instance without re-entering
nodes or creating tasks. Changed input and historical instances without that
evidence reject. An interrupted initial execution rejects with
`ERR_PROCESS_00027`; inspect the existing instance and use its applicable
recovery/cancellation APIs instead of replaying potentially completed effects.
Admission and endpoint permission checks still apply to every start call.
Start replay is not a distributed transaction across tasks, audits and domain
effects. The immutable fingerprint is separate from mutable runtime context.
See `test/processStartReplay.test.js` for isolated concurrency and failure tests;
live provider/index verification remains a distinct acceptance gate.

The existing `DefaultProcessRemoteActionAdapterService` persists the current
remote action in `processInstance.activeRemoteAction`. It is Process runtime
state, not a second queue, credential store or configuration registry. The
published definition, selected action allowlist and stored instance determine
the target and context. Decision protocols marked `requiresCompletedTask` read
the completed task's decision and actor; callback/request bodies cannot replace
that evidence. Task completion uses an atomic status precondition before advancing.

The adapter validates its current nAuth service credential and instance binding,
then sends only `{ instanceCode, executionCode }`. Existing nService transport
keeps explicit connection selection, remote-only dispatch and one attempt.
`process.remoteActions.maximumExecutionAgeMs` defaults to 30 seconds; target
connections and timeouts remain later-layer configuration.

`POST /instances/:instanceCode/actions/claim` is an internal Workflow capability
operation under `moduleInternal`, service-token authentication and the existing
internal route permission. Its body identifies `executionCode`, `actionKey` and
`sourceRuntimeInstanceId`. The target runtime must own the target module in the
same tenant, enterprise, project and environment. The instance must still be
running/waiting and the exact execution READY and unexpired. An atomic
READY-to-CLAIMED update grants it once and returns stored context, decision,
node, task and actor, together with the stored instance definition code and
immutable version. These identities never come from callback input. Identifiers
alone never grant execution.

Completion/failure retires the handle. Concurrent claims, wrong runtime/tenant,
wrong operation, expired handles and repeats fail. An interrupted attempt stays
bounded by expiry and follows existing Process incident/retry operations; it is
not silently reissued. A governed retry creates a fresh handle. Domains retain
idempotency against their own committed effects when a response is lost.
Process instance/task and immutable version schemas expose generic read/search
only; owning lifecycle and publication services retain their internal writes.

The focused `test/processRemoteActionAdapter.test.js` invokes the real lifecycle,
claim boundary and Editorial decision service over isolated persistence. It
covers task-policy denial, stored-decision precedence, scope failures, forged and
expired handles, concurrent task/claim races, source correlation and response
loss before retry. Actual distributed provider/HTTP acceptance is separate.
# Explicit Owner Action Contributions

Process consumes domain remote action declarations without activating domain
runtimes. `process.actionAdapters.allowedActions` remains the explicit execution
allowlist. For a string key missing from effective `definitions`, the existing
action registry reads only that key from the discovered owner's
`config/properties.js` at `process.actionAdapters.definitions`. Owner discovery
uses `NODICS.getRawModule`; missing discovery or declaration fails closed.
This is a bounded declared contribution, not a merge of inactive module settings.
Configuration files must remain side-effect-free data exports. No domain services,
schemas, startup hooks or application defaults are loaded by this lookup.

Only owner-matching remote declarations can use this fallback. Effective later
definitions take precedence, including explicit null denial. The returned owner
declaration is detached from its module export. Unselected actions are not read
or allowed. Existing CMS/Editorial declarations and direct-object selections
retain their current behavior. Customers select action keys and remote target
connections; they do not copy the domain definitions. Process runtime credentials
must independently permit the remote module. Installing workflow contributions,
selecting actions and granting remote capabilities remain separate operations.

`processRemoteActionAdapter.test.js` covers six real owner exports with no active
domain runtime, override/denial, missing owner/action, detached results and empty
selection. It also retains existing scoped claim and Editorial integration tests.
