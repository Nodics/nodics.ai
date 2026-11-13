# Workflow

## Documentation

The selected [Workflow CMS guides](data/docs-v001/records/documentation/workflowDocumentationRelease002ComponentData.js)
cover business tasks, scheduled automation, runtime operations and safe extension.

Axis help routes and fragments are declared by this capability and refer to
selected canonical Workflow CMS articles. Human task help opens the end-to-end
task example; trigger help opens scheduled automation. The source regression
checks every declared route and heading anchor. Runtime installation, approval,
access filtering and Online publication remain separate prerequisites; valid
source links alone do not prove that an employee can read them.

Documentation release 0.0.2 corrects the first human task guide to rights-based
review and adds the original-command recovery journey to scheduled automation.
Only those two article bodies change; existing identities, routes, anchors and
the other thirteen bodies are retained. The successor selects one canonical
record family in `docs-v001`, with superseded 0.0.1 bytes preserved under test
fixtures. Its nineteen changed page/search review targets are Staged with no
new approval or Online evidence. Install and publish through the normal owners;
the previously published guide remains independent until that succeeds.

The private read-only `/operations/capabilities` API projects current native
trigger command admission, original-receipt inspection admission and the existing
opt-in recording policy. It reuses effective router security and exposure guards;
unavailable evidence never grants an action. See
[command capability projection](llm/contracts/README.md#native-command-capability-projection).

Human task lists support owner pagination and an actionable queue through the
existing secured task API. See [task queue pagination](llm/contracts/README.md#task-queue-pagination)
for filters, configuration, concurrency limits and operator recovery.

Missing CMS approval definitions install through the governed nImport catalogue
and executor using the observed contribution version. Existing definitions remain
untouched, and release drift fails closed rather than forcing a replay.

Legacy publication decisions may retain `action: APPROVE|REJECT` when it agrees
with the stored approval boolean. Recovery validates the original completed task,
actor and pinned graph; the label never reaches the domain callback. Typed
approval contracts remain approved/reason-only. See the runtime governance
contract and `test/processCompletedDecisionRetry.test.js`.

Trigger create/update/archive/execute commands can record original acknowledgements
through the same opt-in private journal as tasks. Metadata writes are insert-only
or exact conditional transitions with acknowledged fresh readback. Original
receipt inspection never executes the trigger again. See
[trigger command receipts](llm/contracts/README.md#trigger-command-receipts).

Human task commands carrying an idempotency key use the existing native receipt
protocol when explicitly enabled for Workflow. The private original receipt is
inspectable without replay and remains separate from current task state. See
[task command receipts](llm/contracts/README.md#human-task-command-receipts).
Assignment also requires exact task CAS and uncached, acknowledged readback.

Create-only Process starts use a dedicated preSave retirement guard. It rejects
existing identities and private retirement markers while retaining exact scalar
insert constraints. Update/remove guards keep their atomic retirement predicate;
an `insertOnly` request option cannot select the save-hook behavior.

Approval eligibility is access-rights based: a requesting user with the required
permissions may also approve. There is no automatic same-user exclusion and no
login-name-based admin bypass. Human identity, tenant/enterprise scope, workflow
state, decision validity and actor audit remain enforced for every user.

Human task claims now use stored reviewer policy plus conditional write/readback;
completion binds the inspected assignee and instance/node. Only the current assignee may complete a claimed task. Existing Axis consumers
retain Process ownership. See the local contract for concurrency and cancellation
limits; the authored claim fixture is not installed-runtime acceptance.

Task completion/cancellation reject failed or non-acknowledged single-write
envelopes and require fresh generated-owner readback before audit or advancement.
Cancellation binds the inspected status/assignee/instance/node. Generic task and
instance cancellation reject published governed actor policies until a domain
cancellation contract exists. This safety restriction is not application withdrawal,
resubmission, expiry or a cross-owner transaction.

Source-owned retirement has a separate default-disabled internal route. It binds
the signed domain, saved context and exact closure, cancels one waiting governed
task before its instance, and permits same-command recovery. Completed decisions
and claimed remote actions are not stolen. Private mutation hooks protect
retirement evidence; see the owner contract. Fixtures are authored, not executed
installed-runtime acceptance.

Workflow is the first capability inside the `nodics.process` functional module group. It owns schemas, engine services, and APIs for governed business process definitions, publication, execution, and inspection.

Explicit instance-code retries preserve the original start identity and pinned
version. Completed starts return existing state; conflicting or interrupted
starts fail closed instead of executing nodes again. See the
[runtime authority contract](llm/contracts/README.md#remote-action-authority)
for recovery limits and focused tests.

Service-owned starts and immutable human-review actor policy use the same
lifecycle. They are opt-in and preserve domain ownership; see the
[service admission contract](llm/contracts/README.md#service-owned-starts-and-human-review).

Runtime ownership is organized internally without nested runtime modules:

- `src/schemas` owns workflow persistence models.
- `src/utils` owns lifecycle status vocabulary.
- `src/service` owns graph validation, lifecycle rules, and execution-ready process services.
- `src/router`, `src/controller`, and `src/facade` own secured HTTP routes and API projection.

Axis can render workflow screens from BackOffice capability metadata, but the backend remains the authority for process definitions, validation, versioning, and runtime behavior.

This capability declares an inert model-service inventory for [governed Local reset](../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.

Starting a new process instance requires the existing registration agent's fresh
workflow activation state and validated local runtime identity. Preserve the
caller's authorization/audit context. Existing instances retain their completion,
cancellation and recovery contract after business deactivation; definition and
incident management do not silently start new instances.

Route-category defaults belong to this capability; deployments supply only intentional overrides.
Preserve nRouter enforcement and independent route authorization. See [exposure ownership](../../../nodics.foundation/modules/nRouter/llm/contracts/README.md#capability-owned-exposure-defaults).

Remote actions use the existing allowlist and nService with scoped runtime identity. Process persists an expiring single-claim execution in its instance; the target claims authoritative context before mutation. Optional private attempt recording retains each execution across later actions and published versions, with strict acknowledgement and no uncertain replay. Completed task decisions and immutable versions are read-only through generic APIs. See `llm/contracts/README.md`; no domain HTTP implementation or new identity authority belongs in Process.

Cross-enterprise remote actions are default-disabled. A deployment may select a
bounded `process.remoteActions.runtimeEnterpriseScope.enterpriseCodes` list only
when the authenticated human enterprise and immutable instance context contain the
same selected code. The Process service credential keeps its original deployment
enterprise; the target owner independently admits any business-enterprise action.

## Module and publication routing

Remote declarations select `moduleName`, the existing exact `apiName`, a deployment
connection alias in `target`, and `targetAuthority: { publication: "STAGED" }`
for publication decisions or `OPERATIONAL` for business commands. Optional exact
`server` and `environment` strings live in `targetAuthority`. Only STAGED, ONLINE
and OPERATIONAL are valid publication contexts; physical role codes do not grant
ownership. Retired `remote.runtimeRole`, unknown fields and absent/malformed
publication selectors reject before credential lookup or execution-handle creation.
Declared actions remain inert until explicitly allowlisted; discovery does not
activate a module or select an action.

Dispatch uses existing nService/DMS module ownership resolution. It preserves the
exact POST API, single attempt, scoped runtime bearer, tenant and signed enterprise.
The current allowlist's module/API/target/publication selector is rechecked before
creating an expiring handle. Callbacks receive only instanceCode/executionCode;
claims still bind the stored action, source instance, deployment, completed task,
actor and decision. Claim CAS and terminal handle retirement remain mandatory.
No retries, automatic migrations or rewritten signed identity are introduced.

The separate CMS `publicationDecisionCallback.target` uses the same explicit
STAGED selector and fixed CMS API `/publication/process/decision`; its existing
payload contract remains unchanged. It is not the opaque remote-action protocol.
It has no WCMS_STAGED fallback. Missing explicit connection or wrong publication
fails before dispatch. Configure the existing target's `targetAuthority`, never a
new role profile. Connection defaults do not enable an action or import a graph.

Trigger relationship inspection uses the shared Operations inspection owner.
Paging controls such as `limit` never become trigger-record predicates; only
allowlisted text filters reach the generated service with the original human
scope and native page bounds. Missing, negative or contradictory owner evidence
fails inspection instead of becoming an empty relationship list. See
`test/processInspectionPagination.test.js`; trigger creation and activation remain
separate commands and do not schedule Cron work.

Documentation 0.0.3 aligns thirteen Page search lifecycle fields with their Staged pages. Article bodies, PageMetadata, routes and navigation remain exact 0.0.2 bytes. The prior source selection is preserved under test fixtures; normal import and publication are required.

CMS approval diagnostics distinguish a recorded decision from its acknowledged callback, including completed rejection workflows. See [callback qualification](llm/contracts/workflow-runtime-governance.md#cms-decision-callback-qualification).

Rules review tasks may project `rulesReviewContext` version 1 from the stored instance and its pinned published Rules action. It contains only `owner: rulesApi`, `ruleSetCode` and numeric `draftRevision`. Persisted or caller-supplied descriptors are removed. Review content stays with Rules; task authority and decisions stay with Process. A successor contribution does not upgrade existing tasks.

Standard workflow copy belongs to this module in `src/service/localization/workflowMessages.json`. Its contribution exposes stable public-safe UI labels only, never records, permissions or internal errors. English definitions and Arabic reference values use the Localization contribution, draft, review, approval and release APIs; loading the module does not approve or publish translations. Later project layers may supply intentional scoped translations through the same owner workflow. Preserve exact message parameters, authorization and uncertainty guidance.
