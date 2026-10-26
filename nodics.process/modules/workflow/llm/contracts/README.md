# Workflow AI Contracts

## Static Action Diagnostics

An action adapter may return an optional top-level `diagnosticCode`. The existing
`executeActionNode` audit copies it into `process.action.executed` metadata only
when it is a string of 1..64 characters starting with an uppercase ASCII letter
and containing only uppercase ASCII letters, digits or underscores.
Missing or invalid codes are omitted without changing the action result/status.
Whitespace, newlines, Unicode, free text and objects are refused by this projection.
Adapters own their fixed vocabulary; caller input, exception text and identifiers
must never supply it. Process validates only the generic static-code shape and
imports no domain module or domain-specific code list.

No output/result object, message, recipient/source/intent identifier, raw response
or error joins the existing audit fields. The adapter's existing return and failure
behavior is unchanged; a completion code is not business delivery acceptance.
Later lifecycle overrides preserve this ceiling. See the new
`test/processActionDiagnosticAudit.test.js` regression for valid boundary codes,
invalid values and getters proving private result fields are never read.

## Task Queue Pagination

`GET /nodics/process/v0/tasks?page=2&queue=actionable` reads one bounded page.
The existing secured route still requires `process.backoffice.view`; tenant,
authenticated enterprise and user context flow through the generated task service.
No service identity or new permission is introduced. `instanceCode`, `status` and
`assignee` retain their existing scalar filters. `queue=actionable` intersects
those filters with Process-owned OPEN, CLAIMED and ESCALATED states. Omitting
queue retains the general task list. Unsupported queue selectors are rejected.

The response keeps `data` as the current page of decision-projected tasks and
adds `pagination: {page, pageSize, total, hasNext, hasPrevious}`. Total is the
generated service's matching count under the same query and authorization;
never count an unscoped collection or filter a page after calculating totals.
Rows use ascending `dueAt`, then unique `code` ordering. Missing, failed or
malformed count/row envelopes fail closed, not as an empty queue. Existing
immutable decision identity and reviewer eligibility projection remain mandatory.

Workflow `config/properties.js` owns `process.taskQueue.defaultPageSize` (25) and
`maximumPageSize` (100). Later layers may intentionally override these values;
no Kickoff default, frontend copy or extra config authority belongs here.
Both must be positive integers, default no greater than maximum, and maximum
must respect the existing 100-task decision-projection bound. `page` defaults to
1 and `limit` defaults to the effective owner page size. Explicit values must be
positive safe integers; limit above maximum and unsafe offset arithmetic reject.
Requests do not silently clamp or accept malformed values. Clients omit limit
to inherit owner configuration and consume returned navigation flags.

Business users can traverse beyond the first 25 tasks and return to earlier
pages. The count includes visible actionable tasks, not only tasks the current
reader can approve; eligibility remains an independent decision gate. An empty
page beyond the current total remains navigable backwards. Offset pages are
fresh observations, not a snapshot: concurrent task transitions can move records
between pages. Refresh or return to page one to re-observe; completion still
rechecks current authorization and state. A failed read never authorizes a
cached decision or causes a command replay.

Operators must adopt backend and Axis sources together, backend first. No data
migration or task mutation is required. Partners customize bounded defaults or
the exported inspection members while preserving filtering, scope and decision
projection. Maintainers and AI tools run `processInspectionPagination.test.js`,
the Process suite and Axis Process tests. These isolated tests establish source
behavior; installed-runtime and browser acceptance remain separate evidence.

## Publication Definition Bootstrap

When the CMS approval definition is missing, select only
`cms:cmsPublicationApproval` from the existing init release catalogue, require one
versioned match, and pass its observed version as `expectedReleases` to nImport.
Do not pin a historical version in Process, duplicate CMS definition data, or
bypass immutable-release validation. A catalogue/execution drift rejects the start;
the existing publication owner can request approval again after inspection.
Already installed definitions and read-only diagnostics never invoke installation.
See `test/processPublicationApprovalService.test.js`.

## Native Publication Business Context

Native human `/instances` starts retain business `context.enterpriseCode`
independently of the original signed actor enterprise. Do not replace actor
credentials or transport enterprise headers with a publication's seller target.
Start replay remains bound to the original actor scope and exact input. The
current Pricing `policyReview` definition has no `actorPolicy`; Process must not
invent one or rewrite an installed version. An explicitly published actor policy
still enforces its enterprise and permission checks. Native route authorization,
task assignment and decision policies remain required.

Remote actions retain the stored business context and completed-task actor while
using the qualified Process runtime principal. This separation does not grant
domain publication authority: Pricing must independently validate its native
administrator proof and target. `processStartReplay.test.js` uses the actual
Pricing definition; `processRemoteActionAdapter.test.js` exercises decision and
claim propagation with the existing isolated Editorial target. These are owner
regressions, not live Pricing publication or HTTP authentication evidence.

## Trigger Command Receipts

`DefaultProcessTriggerCommandReceiptService` wraps only create, update, archive
and execute through the existing trigger facade and private `processCommandReceipt`
journal. Native `process.trigger.manage` or `process.trigger.execute` is rechecked
on every shared receipt boundary. The receipt input binds exact trigger code,
copied native body, employee, tenant, enterprise and original key. Keyed writes
require native recording; present invalid keys must never silently downgrade.

POST `/triggers/:triggerCode/commands/:command/receipt/query` requires native
BackOffice inspection and the original command grant. It accepts only
`command` and `idempotencyKey`, reads original evidence and never executes a
trigger. Missing/STARTED evidence remains unknown even when a current instance
exists. New-write shutdown does not disable otherwise authorized inspection.

Trigger creation is insert-only. Update/archive bind all mutable observed
metadata in the native CAS, require an acknowledged single match, then read
fresh persisted state before success/audit. A failed envelope, zero match,
foreign readback or duplicate creation cannot become a successful receipt.
Scheduling remains in Cron. Executing an active trigger delegates to the
existing Workflow start authority; start acknowledgement is not downstream
business completion. See the [Copilot trigger guide](../../data/docs-v001/records/documentation/workflowDocumentationComponentData.js)
and the composed/native-live trigger tests in copilotWorkbench.

## Human Task Command Receipts

`DefaultProcessTaskCommandReceiptService` wraps the existing task facade for
claim, assign, complete and cancel. It delegates the unchanged domain lifecycle;
the shared nDatabase receipt protocol owns private insert-only command identity
and acknowledged completion. Enable `commandReceipts.enabled` and
`commandReceipts.owners.workflow` explicitly before keyed commands. A missing key
preserves the existing native API; a present invalid key must reject, not silently
downgrade to unjournaled execution. The body executed is the exact copied input
whose digest was claimed. No new workflow engine or retry authority is introduced.

`processCommandReceipt` inherits the existing private journal schema. The secured
POST `/tasks/:taskCode/commands/:command/receipt/query` accepts only the original
key and command body. It requires Process view and original command grants, the
original human/tenant/enterprise scope and exact input digest. The four command
suffixes are fixed. New-write shutdown does not disable independently authorized
inspection. COMPLETED means the original full native method returned a validated
acknowledgement; it does not prove all downstream workflow effects succeeded.
Missing or STARTED receipts cannot authorize another dispatch. Native task state
is not a replacement receipt. Retired and actor-policy governed tasks retain
their existing native fences.

Assignment now matches inspected status, instance, node and prior assignee;
zero-match, failed/unacknowledged persistence and readback drift cannot produce
success or assignment audit. Transition readback uses generated pageSize/pageNumber,
not raw limit. Run task transition tests plus Copilot Process action/native runtime
tests. See the [full usage and customization guide](../../data/docs-v001/records/documentation/workflowDocumentationComponentData.js).

## Inspection Pagination

Process operational inspection and definition-version reads pass `pageSize` and
`pageNumber: 1` to generated services. The generated get initializer overwrites
raw `limit` with its page-size default; supplying `limit` is not a bound. Preserve
native filters, actor context, sort order and single-record identity checks when
customizing these readers. `test/processInspectionPagination.test.js` protects
these request shapes; Copilot's native Process test proves an actual limit-one
activity read over multiple events. Bounded inspection is never execution or
retry authority.

This is the module-local contract index. The full existing contractual text is
retained in [Workflow lifecycle and runtime governance](workflow-runtime-governance.md).
Read the owning module AGENTS.md and root contracts before implementation.
Source availability does not establish qualification or live acceptance.

## Dedicated Contracts

Create-only saves must pass through the trusted preSave wrapper. After the
ordinary marker/identity checks and an empty scoped lookup, retain the exact
`code` query and explicit `options.insertOnly: true`. The native unique identity
and atomic insertion refuse competing records. Never append an update-only
`domainRetirement: { $exists: false }` predicate to insert constraints. Generic
update/remove hooks must retain that predicate regardless of request options.
Run `processOwnedRetirement.test.js`, `processStartReplay.test.js` and the opt-in
Copilot four-runtime initialization test for this interaction.

- [Source-owned review retirement](source-owned-review-retirement.md)

## Documentation

The detailed guide preserves the original contract text and relative links.
The sections below retain existing README anchors and point to their full rules.

## Confirmed Task Transitions And Governed Cancellation

Read [Confirmed Task Transitions And Governed Cancellation](workflow-runtime-governance.md#confirmed-task-transitions-and-governed-cancellation).

## Conditional Human Task Claims

Read [Conditional Human Task Claims](workflow-runtime-governance.md#conditional-human-task-claims).

## Contribution provenance and adoption

Read [Contribution provenance and adoption](workflow-runtime-governance.md#contribution-provenance-and-adoption).

### Operator inspection and execution

Read [Operator inspection and execution](workflow-runtime-governance.md#operator-inspection-and-execution).

## Remote action authority

Read [Remote action authority](workflow-runtime-governance.md#remote-action-authority).

### Service-owned starts and human review

Read [Service-owned starts and human review](workflow-runtime-governance.md#service-owned-starts-and-human-review).

### Public task decision projection

Read [Public task decision projection](workflow-runtime-governance.md#public-task-decision-projection)
for the pinned actor or owner-declared decision-policy approval DTO, legacy
omission, independent reviewer authority and fail-closed read evidence.

## Explicit Owner Action Contributions

Read [Explicit Owner Action Contributions](workflow-runtime-governance.md#explicit-owner-action-contributions).
## Target Runtime History Inspection

`POST /actions/history/query` uses module-internal service authorization. It
verifies the admitted target module and exact authenticated tenant, enterprise,
project and environment before reading Process-owned evidence. One bounded
scalar context equality narrows the fixed action/definition query. Rows
are rechecked and projected without actor, decision, claim or retry authority.
Only the verified target receives its action context; consuming owners must
minimize again before exposing it to employees. Legacy contract version 1 reads
the latest matching action per instance for one exact published version.
`historyMode: ATTEMPTS` selects contract version 2 (`PROCESS_ACTION_ATTEMPTS`)
from private `processActionAttemptRecord` generated persistence; `version: null`
reads across published versions of the selected definition. It does not combine
other definitions or fabricate records for actions executed before recording.
Generated-service
paging and scoped count determine navigation. An absent storage acknowledgement
is failure, never a successful empty history. Copilot adds no separate job store.

### Recorded Action Lifecycle

An explicitly selected remote declaration may require `recordAttempts: true`.
Deploy its private schema before enabling the declaration. Generic routes, search,
event publication and cache are disabled for this schema; it is evidence, not an
alternative execution authority. Context remains private to the authorized target.

1. Process CAS-claims the instance and saves exact READY attempt evidence before
   callback dispatch. Missing acknowledgement prevents dispatch.
2. The target claims once. Process CAS-transitions the instance and requires an
   acknowledged READY-to-CLAIMED attempt update before returning authority.
3. After the callback, Process persists the instance outcome, then the attempt's
   terminal status and completion timestamp. Missing acknowledgement cannot return
   success. No cross-store atomicity or exactly-once execution is claimed.
4. Expired READY/CLAIMED handles cannot be overwritten. Recorded FAILED or
   COMPLETED actions of the same action key cannot be sent again on that instance,
   including after loss of the final history acknowledgement. A different action
   may follow confirmed completion; every earlier attempt remains inspectable.
   Use a new dedicated instance for each scheduled refresh, not a same-action loop.
5. Inspect the instance, private attempt, domain receipt and index owner when they
   disagree. History inspection cannot claim, reconcile or replay work. Missing
   attempt records are not backfilled automatically. Repair remains owner-governed.

Non-recorded domain adapters retain their existing owner-idempotent retry contract
after a terminal failure. Do not turn this into a blanket remote replay policy.
Run both `processRemoteActionAdapter.test.js` and
`processRemoteActionInspection.test.js`, including lost create/claim/terminal
acknowledgements, foreign scope, multiple attempts and historical versions.
