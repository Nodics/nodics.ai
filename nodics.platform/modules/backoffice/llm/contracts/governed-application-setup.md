# Governed Application Setup

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
