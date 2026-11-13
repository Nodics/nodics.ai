# Governed Application Setup

## Project Context Ownership

BackOffice supplies project-context mechanics through its ordinary module-owned
`backofficeApplicationInitialization` defaults, independent of hosting role:
`projectCode` resolves the explicit `NODICS_PROJECT_CODE` override or nConfig's
trusted project-code context, and `projectRoot` resolves nConfig's trusted project
root. No sample identity, local directory or environment name is embedded.
Loading these bindings confers no functional ownership or caller permission.
Missing trusted path context fails
configuration resolution; do not invent a customer path to bypass that failure.

Customers retain application/documentation profiles, data-package selections,
connection names and deployment authority. These defaults install nothing and
do not activate a capability, enable reset, grant access or publish a release.
Later project/server/node overrides retain normal nConfig precedence. The owner
`test/applicationTargetDefaults.test.js` covers independent project contexts,
explicit overrides and missing context without live operations.

Authenticated bootstrap exposes `axisInitializationAdmission` only to employees
without detailed Axis initialization inspection rights. It reads the existing
initialization status owner with the original human request and returns only
`READY`, `NOT_READY`, or `UNAVAILABLE`. It never initializes, publishes, grants
permissions, or returns publication history. Only an explicit owner `READY`
admits the workspace; missing or failed observations remain blocked. Inspectors
retain the detailed status endpoint and existing governed setup workflow.

A required `GOVERNED_PUBLICATIONS` step declares an inert `publicationPlan` in
module-owned data, targeting COMMERCE_STAGED in AFTER_PUBLICATION. It is not a
CRUD import or publication authority. BackOffice forwards the original human
bearer to fixed nPublish setup routes, never the CMS service identity. Status
calls `/status`; initialize calls `/submit` once without transport retry.
Both calls use the resolved application `target.timeoutMs` (the existing
BackOffice default is 120000 ms), including later configuration/profile overrides.
Complete multi-root owner validation must not inherit the short generic module
transport timeout. This changes no permission, approval or readiness requirement.

Data-release validation and installation separately select
`backofficeApplicationInitialization.dataReleaseTimeoutMs` from current trusted
layered configuration immediately before target binding and transport. The
default is 120000 ms; only safe integers from 1000 through 600000 are accepted.
An invalid configured value fails with `ERR_BOF_00081` before any remote call.
For example, an approved deployment may select 360000 ms for a paced owner
installation. HTTP input, preparation groups and profile fields do not override
this setting. The policy stays outside resolved profiles and their sealed digests;
it changes neither release identity nor authorization, qualification, retry count
or recovery admission. A longer transport wait does not prove completion.

CMS READY, its Online publication and qualified Media are prerequisites. Every
declared root must then be CURRENT before operational owners are preflighted or
installed. Missing publications offer INITIALIZE to request ordinary approvals.
Pending approvals expose workflow references while blocking stock/coupon setup;
malformed evidence and FAILED publications require owner review.

After approval and activation, a subsequent INITIALIZE performs existing nImport
contributions and refreshes CMS, Media, publication and operational receipts.
Reconcile, rollback and retire do not submit intents or operational data. READY
never follows a representative Product receipt or stale installation response.
Public projections exclude plans and expose only publication/root/workflow
identities and status metadata, not source snapshots or provider diagnostics.
Failures remain VALIDATION_BLOCKED. Their existing `runtimeDiagnostic` projection
contains only a fixed phase (`configuration`, `targetBinding`, `authorization`,
`invocation` or `evidence`), the logical target module and a bounded owner/transport
failure code. Never forward exception messages, remote bodies, headers, endpoints
or the retained publication plan. A timeout is incomplete observation, not proof
of a missing or invalid publication; refresh status after owner/transport recovery
before authorizing any further setup action.

## Preparation Import Batch Boundaries

Adjacent required DATA_RELEASE steps with the same target server, runtime role
and data type normally share one nImport batch. nImport controls ordering inside
that batch; a preparation step's `order` alone does not order those imports.
When a release requires earlier preparation imports to have completed, declare
`batchBoundaryBefore: true` on the dependent step. BackOffice finishes the earlier
batch before dispatching the new batch through the existing owner operation.
Later compatible steps may join the new batch; this flag separates the preceding
work rather than imposing a singleton policy on every release.

The Framework owns the definition, strict boolean validation and false baseline
in `backofficeApplicationInitialization.preparationStepDefaults.batchBoundaryBefore`.
A project selects a true value only on its actual dependency boundary. For example,
an operations step at order 90 and a dependent assignment step at order 100 can
keep their same server, runtime role, data type and original human authority while
the assignment step starts a separate batch. Separated groups receive stable,
distinct idempotency keys; replay does not create a replacement release identity.

The flag is invalid for non-DATA_RELEASE steps. It grants no permissions, imports
no data by itself and supplies no operator Enterprise. Existing complete preflight,
owner authorization, required-stage readiness, failure short-circuiting and later
publication gates remain mandatory. Invalid values refuse before owner dispatch;
an earlier failed batch leaves dependent groups unattempted. Recheck owner receipts
before retrying; never report readiness from grouping alone. Unselected/default
steps retain normal batching. The focused grouping and sequential execution tests
are in `test/applicationPreparationOrder.test.js`.

## Explicit Signed Operator Stages

A profile opts into scoped AFTER_PUBLICATION orchestration by declaring
`operatorEnterpriseCode` on a required AFTER_PUBLICATION step. Every required
AFTER_PUBLICATION step in that profile must then declare it, with unique release
codes and at most 256 required stages. The enterprise code is a bounded exact
identifier, not an authentication override, Profile scope or permission grant.
BEFORE_PUBLICATION steps cannot declare it. Legacy unscoped profiles retain
their existing orchestration; do not migrate a multi-enterprise profile by simply
replacing its publication payload and leaving a bulk initialize action.

The existing `POST /applications/:profileCode/initialization/initiate` accepts
one optional `afterPublicationStepCode`, using the existing release-code syntax:

```json
{
  "afterPublicationStepCode": "partner:issuerBudget",
  "reason": "Reviewed original issuer budget",
  "correlationId": "original-issuer-budget-request"
}
```

The selector must name exactly one configured required AFTER_PUBLICATION stage.
Arrays, unknown/optional/BEFORE stages, duplicate descriptors, mixed scoped and
unscoped required stages, or foreign selections fail before any owner call.
Selection on prepare, content-pack install, reconcile, rollback or retire rejects.
No request field may supply a different enterprise, bearer, plan, target, release
version or qualification. Controller projection forwards only the selector and
the pre-existing reason/correlation/force-refresh inputs. A selected AFTER action
ignores force-refresh for CMS and only reads its existing baseline.

Dispatch requires the current original human access-token context: signed tenant
must match the routed tenant, signed enterprise must exactly match the stage,
all supplied tenant/enterprise aliases must agree, and the original bounded
Bearer must be present. Customer, refresh, service and system principals refuse.
The orchestration detaches these request fields before awaited owner calls.
nPublish/nImport still verify their current permissions, Profile scope and domain
prerequisites; descriptor matching does not replace that admission. Later layers
may narrow the exported operator predicate, not widen its authority guarantees.

Without explicit selection, initialization of a scoped profile never submits or
installs AFTER_PUBLICATION stages. Normal BEFORE/CMS preparation retains its
existing lifecycle. A selected AFTER request cannot prepare BEFORE data, request
another CMS approval or upload Media. It requires current BEFORE preparation,
CMS READY/Online and qualified Media before any AFTER owner call.

Only the existing initiate route additionally admits the Profile-owned
`commerceSetupPublisherUserGroup` and `commerceCouponIssuerUserGroup`; it retains
`backoffice.application.initialization.initiate` and access-token authentication.
`assertInitiationScope` resolves inherited groups through nRouter before any
owner call. A caller admitted through either narrow group must supply a required
scoped AFTER selector with matching signed human operator, including for a legacy
profile or a fresh/pending CMS baseline. Omitting selection refuses before normal
BEFORE/CMS bootstrap. Independently held `runtimeConfigAdminUserGroup` authority
retains its existing orchestration; the new groups never confer it. Group
resolution failure refuses. Other mutation routes keep their existing groups.
The initiate API schema declares the same bounded selector accepted by the
controller. Owner publication/import/domain grants remain independently required;
neither narrow group by itself grants budget, consent, issuance or publication
actions. Profile owns the explicit group/role release and canonical assignment.

Publication selection calls only the selected stage's existing nPublish submit;
other same-operator publication stages are status-only. Foreign stages are not
queried or submitted. Each scoped nImport stage is a singleton in validation and
execution, so adjacent budget and issuance instructions never share a batch.
Scoped import idempotency keys include the selected stage code even when two
requests reuse a correlation id; singleton and full status grouping stay aligned.
Only the explicitly selected DATA_RELEASE may install, using its current owner
preflight and expected release version. All required publication steps belonging
to the original signed operator must have fresh CURRENT owner evidence before
that operator's operational validation or installation. Foreign publication
AUTHORITY_PENDING is not CURRENT proof, but does not deny this local admission.
Consent remains a separate Promotion operation between budget and issuance;
this selector cannot supply or approve it. Installation refreshes CMS/Media and
owner status without retrying a write; failure retains the original group receipt
and operation diagnostic. AFTER SOURCE_READY is not installed CURRENT.

All required stages remain in `preparation.steps`. A foreign or unavailable signed
operator projects `AUTHORITY_PENDING`, never CURRENT, absent, optional or failed
import. Before AFTER admission (including blocked/incomplete BEFORE preparation,
failed ordinary preparation, CMS pending/non-Online or unqualified Media), the
response exposes `preparation.selectionRequired: false` and
`preparation.selectableStepCodes: []`. Required AFTER steps remain visible, but
this metadata must not prevent normal BEFORE/CMS INITIALIZE without a selector.
Once fresh BEFORE/CMS/Media gates admit deferred observation, the response exposes
`preparation.selectionRequired: true` and bounded `preparation.selectableStepCodes`
for currently actionable same-operator stages. This can be an empty list when
owner evidence refuses or no stage is actionable; it never authorizes a bulk write.
Direct selected requests retain all admission and signed-operator guards even
when the projected selection requirement is false.
`INITIALIZE` may therefore be offered while aggregate readiness remains BLOCKED;
it requires one explicit selector and is not permission for bulk execution.

There is deliberately no cross-operator receipt registry, remembered browser
result or service/admin inspection override. With multiple signed enterprises,
foreign publication evidence remains AUTHORITY_PENDING on each operator's view,
even if that operator says it completed earlier. The aggregate cannot become
READY until authorized fresh evidence exists for every required stage. This is
separate from the local admission above: one explicitly selected own operational
stage can execute while foreign stages keep the aggregate BLOCKED. This change
does not solve cross-enterprise aggregate inspection or qualify installed business
flows, and never infers foreign proof from local success.

## Aggregate Read Authority Boundary

Cross-operator aggregate proof has a separate disabled-by-default
[exact-plan service observation contract](../../../../../nodics.foundation/modules/nPublish/llm/contracts/setup-observation.md).
It does not reuse or widen the human setup routes:

- nPublish `/publications/setup/status` is access-token-only and independently
  requires the original human, enterprise and existing domain publication grant.
- Scoped BackOffice nImport preflight requires a singleton owned by that same
  signed operator. nImport `preflightContributions` passes that request to each
  installer even when the durable installation receipt is CURRENT. A tenant-level
  release catalogue is therefore insufficient proof of foreign budget/issuance
  source, authority and installed business state.
- `DefaultServiceTokenService.requireRuntimePrincipal` verifies runtime identity,
  tenant, deployment coordinates and module scope. Profile's existing
  `RUNTIME_DEPLOYMENT` authorization resolves approved module/permission grants;
  it provides no application-plan/revision/foreign-stage observation binding.
- Domain publication target authorization covers an exact stored activation or
  reconciliation operation. It does not grant unrelated aggregate observation.

The observation proposal preserves these obligations; enabling it still requires
reviewed concrete deployment/plan adoption and native owner-read qualification:

| Boundary | Required owner contract |
| --- | --- |
| Viewer | Retain the original authenticated human and `backoffice.application.initialization.view` gate. Foreign operational and financial action grants are not prerequisites for a minimal aggregate observation and must not be added to the viewer. |
| Observer | Use nAuth's verified, revocable, short-lived service principal, with exact tenant and approved project/environment/server/instance/assignment plus destination module. A service identity authenticates the caller; it does not impersonate the foreign human. |
| Authorization | Platform checks the full current effective profile and every required descriptor before and after dispatch. The destination resolves the disabled `publish.setup.observation` policy, exact signed caller and checksummed module-confined plan for tenant, enterprise, required stage and canonical server/role. A remote partial/missing profile is irrelevant. Request data, a generic view grant or runtime assignment alone is insufficient. No default grant or human-identity substitution occurs. |
| Plan | Bind all roots by domain, rootType, rootCode, sourceVersion and owner-qualified source membership/revisions. Bind installed stages by module/release code, exact version, immutable payload/composition identity, target runtime and operator enterprise. Reject different, extra, missing or duplicate members before reading private state. Define canonical digest/revision semantics with the existing plan/source owners; do not invent a parallel registry. |
| Publication proof | nPublish owns the fresh authoritative request/revision, approved Online state, exact retained source, current target and committed activation operation/receipt. After exact admission, fixed read-only owner methods receive a private canonical persistence child context; original external claims are unchanged. TARGET uses explicitly selected `targetObservers`, without copying source adapters/workflows to Online. Body-selected enterprise or rewritten human auth is not admission. |
| Installation proof | nImport owns fresh exact installation receipts and current declared source bytes/checksum/version. The minimal installed-release proof is not current financial/business qualification: local selected installer preflight still enforces all action prerequisites, consent, budgets and issuance. No installer execution or financial preparation occurs during observation. |
| Response | Return only request-bound stage identity, exact plan/revision binding, observed owner revision/version and minimal status. Observation failures may expose an allowlisted `reasonCode`; unknown errors map to `ERR_BOF_00083`, never messages or remote metadata. No source snapshots, plan payload, credentials, private endpoints, financial records or raw owner errors. Missing, denied, malformed, ambiguous, changed or failed evidence remains non-CURRENT. A minimal observation is not a persisted activation receipt. |
| Freshness | Every aggregate request performs fresh publication/source/target and installation/source-byte reads. No remembered browser/operator result or cross-request CURRENT cache. Final lifecycle pins are optional; derive actual owner revisions/operations, cross-check source/target/source and reject changed plan/policy. Sequential reads are not a global transaction. |
| Execution isolation | Aggregate evidence affects aggregate readiness only. Unselected initialization still never submits/installs AFTER stages. Selected local actions retain their current signed-human predicate, singleton, explicit selector, owner grants and fresh local publication admission. Observation cannot authorize foreign actions or financial mutations. |

The service-only observer and recognized `publish.setup.observe` permission are
implemented but no assignment, grant, token claim, provider selection or enabled
policy is installed. Generated schema-owner reads use canonical internal authority
only inside those fixed admitted methods, not grants added to the service claims. Broadening
human `/status`, adding global import/core/CMS or financial action grants, or
rewriting authentication is not adoption of this contract.

When explicitly enabled for a profile, shared required BEFORE installation/Media
reads use that exact reviewed service authority, and selected scoped CMS reads use
the canonical baseline observation. No AFTER publication needs to exist first.
Failed shared proof blocks admission. The plan must derive all current prerequisites
(including later additions), not a hardcoded count. Unselected AFTER remains
read-only; selected local write authority and owner preflight are unchanged.

Shared BEFORE status observations use the validated framework-owner setting
`backofficeApplicationInitialization.readinessWorkers`, default 4 in
`config/properties.js`, allowing integers 1–16 through layered configuration.
`applicationReadinessWork` resolves and validates it before dispatch. Each stage still calls the existing
observer with the original request and validates the current plan before and
after its owner read. No proof, rejection or plan is cached across stages or
requests. Optional stages do not dispatch. All required reads settle, including
synchronous failures, and results retain input order before functional-module
readiness is appended. A failed stage remains blocked with its existing bounded
reason code. No import, approval or other mutation is parallelized by this path.

The bound is per composition, not global. The exact-request profile reader also
queues documentation reads; nested BEFORE observations stay serial, with the
private scheduling marker inherited through owner request clones. Direct profile
reads use the stage budget. Separate HTTP requests and internal owner work can
still exceed it. No marker contains authority evidence. This removes serial transport wait between
independent reads but does not establish a registry-heartbeat latency guarantee.
`test/sharedPreparationObservationConcurrency.test.js` proves 12 gated owner
reads settle in three waves, with peak concurrency four, ordered results,
failure isolation and fresh observations after authority changes. Overrides and
invalid values are covered. A 74-profile, six-stage composition performs 444
reads with peak owner concurrency equal to the budget (1, 2 or 4), not its square.
These controlled regressions establish scheduling, not a live bottleneck. Runtime
latency and heartbeat recovery require separate coordinated live verification.

A valid reviewed foreign observation with `ready: false` and typed `NOT_CURRENT`
means work remains with that enterprise's operator: project `AUTHORITY_PENDING`,
not a validation refusal. Installation requires the explicit status; publication
requires exactly the intended members with only CURRENT/NOT_CURRENT statuses and
at least one NOT_CURRENT. Target absence still requires the source recheck to
remain stable. Refused, missing or contradictory readiness stays
`VALIDATION_BLOCKED`; observation exceptions retain their bounded reason code.
Neither pending nor blocked foreign evidence is selectable or executable, and
neither establishes aggregate READY. Local owner preflight refusals remain blocked.
Aggregate blockers preserve `AUTHORITY_PENDING` instead of converting it to
`READINESS_UNKNOWN`. Their next action directs an authorized human operator to
sign in to the owning enterprise and select its stage. The diagnostic repair
`REVIEW_SETUP_AUTHORITY` is unavailable and carries no operation; refreshing a
default-admin session cannot grant foreign execution. Axis consumes this existing
diagnostic-only contract and keeps the stage selector disabled without eligible
local stages. This is application-preparation evidence, not an import refusal.
The contribution-readiness regressions cover this distinction, source drift and
rejected foreign selection; Media projection is independently covered by
`test/backofficeApplicationMediaRetryContract.test.js`.

Required acceptance includes wrong tenant, principal/service assignment,
foreign enterprise/source, application/stage/target, plan membership/digest and
source/installation revision; stale prior CURRENT; revocation/expiry; ambiguous
or unavailable owners; no implicit writes; and a second request observing changed
owner state. Local regressions also exercise a positive aggregate, shared BEFORE
refusal and foreign source/target operation drift. They do not qualify native
signed deployment admission, generated schema access or live financial behavior.

Source regression coverage lives in `test/applicationContributionReadiness.test.js`
alongside the existing preparation-order, receipt and readiness suites. No live
identity, credentials, publication approval or owner qualification follows from
these fixtures.
# Retained Publication Approval Recovery

`POST /applications/:profileCode/initialization/reconcile-approval` retains its
existing human administrator admission and dedicated reconciliation permission.
For `TASK_REFERENCE_MISSING`, the owner projects `RECONCILE_APPROVAL_TASK` as an
available explicit repair even when the publication retains a workflow reference.
A workflow reference alone is neither actionable task evidence nor repair success.

BackOffice reads the target's current publication identity and sends its bounded
`approvalRepairBinding` to CMS baseline `reconcile-approval`, never `initiate`.
No forced baseline refresh, source installation or AFTER-publication stage is
part of this command. Failed/missing identity reads stop dispatch. CMS rechecks
the retained pending identity and Process diagnosis before requesting its existing
workflow owner to recover. Fresh `WAITING_REVIEWER` confirms repair; a reference
without that diagnostic remains `NEEDS_PROCESS_REVIEW`. Normal approval remains
a separate explicit Process decision. Startup/prerequisite unavailability is not
proof of a missing task and must be refreshed before deciding on recovery.

### Physical target publication binding

Application initialization resolves each declared connection alias to one exact
server, verifies alias and canonical endpoint equality, and reads that server's
publication context through nConfig's `readRuntimeProperty`. Transport authority
contains the exact server and publication, never a caller-supplied physical role.
Missing or invalid publication context refuses routing. This does not change
human authorization, selected release scope, installation or publication approval.

The shared application initialization target declares `publication: STAGED`.
`resolveProfile` rejects a legacy `target.runtimeRole` or a non-STAGED baseline
selection. Application artwork and runtime dependencies expose publication context
rather than a physical runtime-role label. Customer connection aliases remain
explicit overrides; do not repeat the inherited publication default.
## Documentation Install-Only Handoff

For a documentation profile, content-pack status stays a read-only System query.
Install-only delegates to the configured CMS Staged baseline's
`/publication/baselines/:baselineCode/content-pack/imports` command. Preserve the
original human requester and correlation identity, fixed profile target and
single dispatch; no browser pack/path/runtime selector is forwarded. CMS verifies
the BackOffice runtime principal and its configured release before invoking
nImport with target-local authority. Installation never requests approval or
publishes Online. Ordinary System/nImport caller authorization is unchanged.
