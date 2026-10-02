# workflow AI Contracts

## Completed Decision Action Recovery

Local adapters selected with `requiresCompletedTask: true` recover their execution
through `completedDecisionExecution`. CMS's existing publication callback selects
this contract. Both first delivery and explicit incident retry read the original
completed task, rather than trusting the transient completion/retry body.
Fresh acknowledged instance/task reads, the pinned definition/version and a unique
TASK predecessor through DECISION-only edges are mandatory. The stored decision
must actually select the failed ACTION. Missing, ambiguous, cancelled, malformed
or wrong-instance task evidence rejects; historical tasks are not selected by age.
The original decision actor/time and saved instance context remain separate from
the currently authenticated recovery operator. No old bearer is persisted or
impersonated, no new approval is issued, and retry never overwrites the task.
Later-layer adapters preserve this evidence contract and existing permission,
allowlist, incident-attempt CAS and domain revision/idempotency checks. This fixes
decision transport recovery, not cross-record retry atomicity or target activation.

Legacy completed approval tasks may retain a descriptive `outcome` string
(nonblank, at most 256 characters), including the existing documentation
dashboard decision shape. It is read only from the original completed task,
never the retry body. `approved`, reason, actor/time and pinned graph-path proof
remain mandatory; outcome alone cannot authorize a callback. Unknown fields,
malformed or oversized outcomes refuse. Published typed approval contracts remain
approved/reason-only and do not admit this legacy field. The CMS callback forwards
only its existing approved/reason and source-binding DTO, not outcome metadata.
`processCompletedDecisionRetry.test.js` composes first task completion, action
registry and callback as well as retained incident recovery with the immutable
stored decision; isolated owner records are not live publication evidence.

## Confirmed Task Transitions And Governed Cancellation

Completion and cancellation require a SUC\_ generated envelope with no explicit
error/failure, acknowledged:true and exactly one affected task. Fresh readback
uses the existing task owner with item caching disabled and rejects failed,
missing or multiple records. Completion compares stored decision, actor, timestamp,
status, assignee and instance/node before audit and advancement. Cancellation CAS
includes inspected status, assignee and instance/node, then confirms the stored
actor/reason/timestamp before audit. The returned task is the saved owner record.
Claim also uses the fresh readback helper. An uncertain response requires explicit
inspection; no mutation or advancement is automatically replayed.

Generic task cancellation rejects any retained published actorPolicy; generic
instance cancellation rejects actor policies anywhere in the pinned version.
Review permission is not application-withdrawal or cancellation authority. A domain
cancellation/expiry/resubmission contract must coordinate source decisions and
Process execution first. Other instance cancellation retains its existing partial
cleanup limitations; these guards do not certify instance/task atomicity, prevent
every completion/cancellation race or implement a new domain lifecycle.

Customize exported transition/readback methods through the existing Workflow
module hierarchy, retaining exact owner acknowledgements, original tenant/caller,
fresh reads and governed-cancellation refusal. No Process engine goes into Kickoff.
`processTaskTransitionAcknowledgement.test.js` is authored for the joint session;
it is not installed provider, recovery or cross-owner acceptance evidence.

## Conditional Human Task Claims

Claim resolves the stored definition/version/node and published actor policy before
writing. Governed reviewer tasks enforce enterprise/permission/no-self-review and
cannot claim for another assignee; use the separate assignment operation where
permitted. Claim CAS includes original status, instance, node and assignee, requires
one acknowledged write, then rereads stored claim before audit/success. Completion
also binds inspected assignee/instance/node. A failed claim cannot return a locally
fabricated claimed task. This is not atomic instance cancellation/task completion;
that cross-record lifecycle remains unqualified. Existing Axis Process task consumers
continue through owning APIs. New fixture is authored, not executed acceptance.

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

### Service-owned starts and human review

`POST /internal/instances` is a service-only `moduleInternal` capability, separate
from the employee-only `POST /instances`. `process.runtime.internalStarts` is
disabled by default. Deployment opt-in selects exact `allowedDefinitions`, the
explicit `permission` and a bounded `maximumContextBytes`; it does not grant a
service principal permissions or install/publish a definition.

`DefaultProcessRuntimeLifecycleService.startOwnedInstance` validates runtime
scope for both Workflow and `sourceModule`, explicit permission, exact active
published owner/version records, and the immutable version's `contextAllowlist`.
The DTO contains only sourceModule, definitionCode, version, instanceCode and
context. A context enterprise, when present, must match the signed enterprise.
The existing `startInstance` still checks operational admission and owns replay,
task, instance and audit writes. Never manufacture a human token for this path.
Malformed policy/input or unavailable evidence raises `ERR_PROCESS_00028`.

Published task policy may contain exactly `actorPolicy: { permission,
enterpriseContextField, requesterContextField }`. Completion requires a current
human access principal in the instance enterprise, the named permission and a
different login from the recorded requester. Decisions accept Boolean `approved`
and an optional bounded reason; rejection requires a nonblank reason. Invalid
authority or decision raises `ERR_PROCESS_00029` before completion writes. Omitted
actorPolicy preserves existing task behavior; callers cannot replace pinned policy.

Domain owners, including Profile, retain application data, role policy, decision
effects and their contributed definition. Process provides only generic admission
and orchestration. Customer reviewer mappings use the existing contribution
customization contract above; changed execution policy needs a new qualified
published version, not edits to an in-flight task.

### Public task decision projection

Tasks with a pinned `actorPolicy` additionally project
`reviewerEligibility:{eligible,reasonCode,message}` from the exact existing
completion actor check. Reasons are `ELIGIBLE`, `DIFFERENT_REVIEWER_REQUIRED`,
`REVIEWER_NOT_AUTHORISED`, `TASK_NOT_ACTIONABLE` and `INSTANCE_NOT_ACTIONABLE`.
Only RUNNING/WAITING instances can project positive eligibility, matching the
existing completion gate even when a task itself remains OPEN.
This is advisory current-read
evidence, never a permission, claim or completion receipt. Clients disable
decision controls when false and show the safe owner message; every submission
still rechecks authority. Requesters require a different authorised reviewer.
Legacy policies without actor admission omit this field rather than claiming
eligibility. Stored/forged presentation fields are discarded.

Bounded publication tasks may also project
`reviewContext:{contractVersion:1,owner,publicationCode,rootType,rootCode,sourceVersion}`.
Only the stored instance's matching definition/workflow identity and a matching
pinned owner `applyPublicationDecision` action admit this context; opaque task
names never select an owner. Values are bounded identifiers, never the complete
instance context. Published version records do not contain `ownerModule`;
bind `context.ownerModule` to exactly one matching ACTION in the pinned graph,
not to a nonexistent version field or a mutable current definition.
These reads also work for already-pending tasks without rewriting their context.
The projection excludes
requester, contact or credentials. For Media, `rootCode` is
the asset code and `sourceVersion` is the immutable retained manifest version,
not numeric metadata `versionId`. Historical tasks lacking numeric versions must
not fabricate one or query mutable CURRENT metadata as a substitute.

`GET /tasks`, `GET /tasks/:taskCode` and the task array in instance detail
project `task.decisionContract` through the exported
`DefaultProcessRuntimeLifecycleService.projectTaskDecisions(request, tasks)`.
The owning stored task binds `instanceCode` and `nodeCode`; fresh generated-owner
reads resolve that instance's exact `definitionCode` and positive integer
`version`. The version must be published and contain exactly one matching TASK
node. Use `policyOf(version, node)` so node policy takes precedence over version
policy. Never select the current definition version instead of the pinned one.

The effective policy must contain the complete valid three-field `actorPolicy`
described above or an owner-declared `policy.decisionContract`. A permission,
task name, code prefix, assignee, request field or persisted task presentation
cannot declare approval. The approved owner declaration has exactly these seven
fields; no purpose or category field is accepted:

```json
{
  "contractVersion": 1,
  "kind": "APPROVAL",
  "approveLabel": "Approve",
  "rejectLabel": "Reject",
  "reasonLabel": "Reason",
  "rejectionReasonRequired": true,
  "maximumReasonLength": 1000
}
```

This describes completion payload semantics, not new decision authority.
The descriptor alone grants no reviewer permission, enterprise admission or
maker-checker protection. Where declared, `actorPolicy` independently checks the
current human principal, tenant, enterprise, permission and no-self-review.
Existing task admission, state and transition checks remain independent.
The decision payload remains only `{ approved: boolean, reason?: string }`;
rejection requires a nonblank reason and any provided reason is at most 1000
characters. The DTO reveals no actor-policy selectors, requester or full instance
context. Only the bounded publication identity above may be projected.
It adds no persisted field, route, gate or Profile metadata.

Fresh instance/version reads retain tenant and actor, bypass item caching and
require one successful record. Failed, missing, ambiguous or mismatched evidence
rejects the read with existing Process errors; it never advertises an approval
fallback. Malformed actor or decision policy raises `ERR_PROCESS_00029`. Legacy
pinned policy with neither declaration omits decisionContract, including any
forged stored value. Completion also uses the pinned decision declaration rather
than one supplied in stored task approval metadata.
Projection accepts at most 100 tasks and deduplicates instance/version reads
within that call only. There is no global policy cache or registry.

Later layers may override exported presentation helpers, preserving the exact
version/source derivation and independent completion authority. Labels remain
nonblank strings of at most 200 characters for the current Axis consumer.
Do not weaken rejection or reason limits by overriding presentation. The exported
`assertTaskDecisionContract` requires contract version 1, kind APPROVAL, required
rejection reasons and maximum length exactly 1000. Domain owners declare it in
the effective published policy using qualified contribution/version handling,
not edits to released data or repinning in-flight tasks.

For a same-owner, same-release forward contribution, the canonical installer
prepares and publishes the next immutable version under the existing definition
code. Existing instances retain their exact version. Moving waiting legacy work
requires separately governed cancellation, confirmed old task/instance state,
then a fresh domain request against the selected successor. Do not rewrite the
old instance, borrow another domain's definition, complete it generically or
retry an uncertain transition automatically. The generic cancellation path is
not evidence of qualified migration: actor-policy reviews require their domain
retirement contract, and that contract does not admit undeclared legacy tasks.
This projection change neither implements nor executes that migration.

Requester identifiers must share the namespace used by `assertTaskActor`
(`auth.loginId`). Owners must prove native authenticated requester provenance;
copying an identifier selected from principalId/code/loginId without alignment,
or accepting a browser requester field, does not qualify maker-checker.

`modules/workflow/test/processTaskDecisionContract.test.js` contains twelve isolated
fixtures for the exact DTO, legacy omission, node precedence, malformed policy,
failed evidence, version/node mismatch, bounded reads, exported customization,
owner declarations, strict typed payloads and unchanged legacy pins.
Focused Process inspection/runtime/actor/transition/remote-action tests pass
locally; this is not installed-provider or browser approval acceptance.

For later-layer service customization, override exported helpers on the effective
`DefaultProcessRuntimeLifecycleService` receiver, preserving source/scope checks.
For example, an owner may narrow `readOwnedStartRecord` evidence checks and
delegate to its inherited implementation; do not introduce a second start engine.
`processOwnedStart.test.js` covers normal admission, disabled/unauthorized starts,
malformed/bounded context, owner/version mismatch, reviewer denial and unchanged
legacy task policy. `processStartReplay.test.js` covers completed and interrupted
start recovery. These are isolated source tests, not distributed live acceptance.

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
The deployment's existing `runtimeModuleRoots` metadata must include the selected
owner group even when that owner remains inactive. A remote identity grant or
action allowlist does not add a discovery root. Validate the prepared runtime's
complete selected action inventory before launching approval journeys, and prove
that discovering the remote owner did not activate its services or data.
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

See [source-owned review retirement](source-owned-review-retirement.md) for signed
closure admission, staged CAS/recovery and private persistence guards.
