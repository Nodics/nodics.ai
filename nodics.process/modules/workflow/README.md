# Workflow

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
completion binds the inspected assignee and instance/node. Existing Axis consumers
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
