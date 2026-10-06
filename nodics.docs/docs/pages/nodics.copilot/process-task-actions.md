# Process Task Actions in Copilot

## Purpose and Ownership

Employees can prepare, review and confirm four existing Workflow operations:
claim a task, assign a task, complete a task and cancel a task. Copilot does not
execute a workflow itself. Workflow owns current task state, actor policy,
assignee checks, decision validation, transitions, domain callbacks and audit.

This is a bounded integration, not coverage of every Process operation. It does
not author definitions, publish graphs, start instances, retry failed actions,
compensate workflows or manage triggers. Task cancellation does not cancel an
instance, withdraw a domain review or reverse a completed decision.

## Employee Journey

For a beginner business user, a task is one pending unit of human work inside
a workflow instance. Claiming takes responsibility; completion records a decision.
Neither is interchangeable with approval of the Copilot proposal itself.

The existing screen flow is **AI Copilot > Conversation > Review > Approve >
Execute > Result**. No new task-management screen or separate approval system
is required. Use Process inspection or the native Process page to identify the
exact task first. Copilot does not resolve task names or guess identifiers.

1. Open the intended enterprise and a conversation under your employee account.
2. Enter an exact command from the examples below.
3. Supply any requested missing identifier, assignee, reason or decision.
4. Read the review. It lists the operation, task, executing employee and every
   supplied command field. Preparation has not modified a task and does not
   establish that the task exists or that Workflow will allow the transition.
5. Approve the current review, then explicitly execute that approved revision.
   Editing the proposal or changing enterprise requires a new review.
6. Check the command result. For completion, also inspect the native instance:
   a completed human task does not prove downstream domain actions succeeded.
7. If the result is uncertain, inspect the original result. Do not repeat the
   task command or manufacture a replacement action to work around uncertainty.

| Intent | Example | Native effect |
| --- | --- | --- |
| Claim | `claim task review-42` | Claims the open task for the current employee. |
| Assign | `assign task review-42 to reviewer-login` | Reassigns an eligible task through native administrator policy. |
| Complete | Typed decision below | Completes the task and invokes native workflow advancement. |
| Cancel | `cancel task review-42 because Duplicate request` | Cancels the eligible task only. Domain-owned review cancellation may be refused. |

```json
{
  "operation": "process.task.complete",
  "taskCode": "review-42",
  "decision": {
    "approved": false,
    "reason": "Required evidence is missing"
  }
}
```

Typed operations accept exactly `operation`, `taskCode` and the operation-specific
field: `assignee`, `decision` or `reason`. Claim has no extra input. Supported
decision fields are `approved` (boolean), `reason`, `outcome`, `transitionCode`
and `targetNodeCode`. Workflow still decides whether those fields are valid for
the pinned graph and current actor. Emergency override, caller-supplied approval
lists, arbitrary nested decision data, endpoints and credentials are not accepted
by this adapter. Use the native governed journey when a policy requires another
shape; do not encode it inside a reason.

One plan contains one task command. Identifiers are bounded to 128 characters;
reasons and other decision text to 1,000 characters. Unknown fields and malformed
values are rejected. Missing values produce clarification rather than defaults.
Task commands and results are excluded from later provider conversation context.
Configured activity recording remains independent of provider-context eligibility.

## Optional Natural Language

The exact short forms above do not call a model. With the existing accounted
intent planner enabled, a sentence such as the following may also prepare a review:

> Please complete task review-42 with approved false and reason Required evidence is missing

The model only extracts a proposal. Backend checks require literal identifiers
and text, the requested command verb, and an explicit `approved true` or
`approved false` for a proposed boolean decision. "Complete this task" is not
authority to invent approval. Unrecognized or unsupported output asks for
clarification. Provider failure or budget exhaustion cannot bypass review or use
an unaccounted fallback. The preparation call consumes the existing token budget;
typed preparation and native command execution do not require a model.

## Administrator Setup

An administrator or operator should qualify a synthetic workflow with the actual
employee roles before enabling task commands for business users.

Use the existing layered `config/properties.js` in the owning deployment. Select
an already configured nService alias and its actual runtime authority. Do not put
URLs, service credentials or a second runtime registry in Copilot properties.

```js
module.exports = {
  copilot: {
    workbench: {
      processTaskTarget: {
        enabled: true,
        moduleName: "workflow",
        connectionName: "process",
        targetAuthority: { runtimeRole: "PROCESS" }
      },
      receiptRecovery: { enabled: true }
    },
    core: { intentPlanning: { enabled: true } }
  },
  commandReceipts: { enabled: true, owners: { workflow: true } }
};
```

This example assumes that the deployment already owns a `process` alias with
`PROCESS` authority. It does not create that connection or enable the Copilot API.
Apply Workflow receipt settings to its runtime, not just the Copilot runtime.
New Copilot task commands and original-result recovery are default-disabled.

| Setting or grant | Responsibility |
| --- | --- |
| `copilot.workbench.processTaskTarget` | Explicit write admission and pinned native target, separate from read-inspection configuration. |
| `commandReceipts.enabled`, `owners.workflow` | Native private original-command recording before any keyed task mutation. |
| `copilot.mutation.prepare` | Prepare an employee-owned review. |
| `copilot.mutation.execute` | Execute an approved current revision. |
| `process.task.claim/assign/complete/cancel` | Independent native grant matching the command. Native route access groups still apply. |
| `copilot.mutation.reconcile` | Independently inspect original action outcomes. |
| `process.backoffice.view` | Required by the native original task receipt inspection route. |
| `copilot.workbench.receiptRecovery.enabled` | Enable original-result inspection, not replay. |

Employee access tokens and the enterprise header are forwarded unchanged. No
service-token fallback exists. Workflow's record access, tenant isolation,
reviewer policy and lifecycle validation remain mandatory even when Copilot grants
are present. Permission and target changes invalidate pending execution.

## Execution and Original Results

The sequence is: private Copilot approval and row claim, private Workflow original
command claim, native task operation, native acknowledgement validation, original
receipt completion, then Copilot result persistence. These are not a distributed
transaction. Failures between stages may legitimately leave an unknown outcome.

Workflow stores `processCommandReceipt` through the existing nDatabase private
journal protocol. It has no generic CRUD, BackOffice, event or cache exposure.
Receipt identity binds tenant, enterprise, employee, command kind and original
key; its digest binds the exact task identifier and body. A receipt records the
original acknowledgement, not a guess based on a task that now looks completed.

Native original evidence is read through
`POST /nodics/process/v0/tasks/:taskCode/commands/:command/receipt/query` with
`{ "idempotencyKey": "original-key", "command": { ...originalBody } }`.
`:command` is only `claim`, `assign`, `complete` or `cancel`. The route requires
employee authentication, Process view permission and the original native command
permission. Copilot uses its existing **Inspect original business results** action;
business users need not construct this request.

Missing or STARTED evidence stays unknown. A positively verified COMPLETED receipt
can close an uncertain Copilot action without repeating the task operation.
Disabling new writes preserves authorized original-result inspection. Changing
the target, employee, enterprise or reviewed payload cannot adopt another receipt.
Historical unkeyed native commands have no backfilled receipt. Native calls with
no key preserve their existing behavior; a present but malformed key is rejected,
never silently treated as an unkeyed command.

| Problem | Meaning | Next step |
| --- | --- | --- |
| Clarification | Required input was not supplied. | Supply explicit values and review again. |
| Permission denied | Copilot or native employee authority is absent. | Ask the appropriate administrator; do not switch to service credentials. |
| Approval revision conflict | The displayed proof is stale. | Reload the existing action. |
| Outcome unknown | Native dispatch or acknowledgement is uncertain. | Inspect the original receipt; do not retry the mutation. |
| Task completed but instance failed | Decision and downstream execution have different outcomes. | Inspect Process incidents and use native recovery policy. |
| Native review cancellation refused | Generic cancellation cannot implement the domain withdrawal contract. | Follow the owning domain's withdrawal journey. |

## Customize and Extend Safely

Developers must extend the owning service through standard Nodics layering rather
than replacing employee authorization with a frontend check.

For a partner deployment, routing and admission overrides belong in its existing
environment/server `config/properties.js`. For example, replacing only
`copilot.workbench.processTaskTarget.connectionName` with `automationPeer` selects
that existing alias; retain the true target authority. An empty or invalid alias
must reject preparation. A later module may override the exported adapter
`input` method to reject `targetNodeCode` for a stricter deployment, using the
standard service layering contract. It must not broaden fixed routes or suppress
the complete review, current grants, native policy, CAS or receipt checks.

Workflow extensions belong in the existing Workflow lifecycle/policy services.
Domain side effects stay in their native owners. Do not copy workflow execution
into Copilot, Axis or a customer startup module. Runtime tests must qualify the
effective later-layer implementation, not just its source declaration.

## Common Mistakes

- Treating a task name as a stable task identifier can target the wrong work.
  Inspect the task and review its exact code before approval.
- Treating a completed task as a successful end-to-end workflow hides downstream
  incidents. Inspect the native instance and its activity after completion.
- Sending another command after a timeout can repeat business effects. Inspect
  the original result first; missing evidence is not permission to retry.
- Enabling Copilot routing without native receipt recording does not make a
  keyed task command executable. Qualify both runtime configurations.

## Verification and Evidence Limits

Focused tests exercise review, approval, actor/enterprise/target drift, rejected
inputs, native receipt binding, lost replies, duplicate dispatch prevention and
configuration shutdown. Workflow tests cover exact assignment CAS/readback and
existing completion/retirement/actor-policy boundaries. The opt-in
`copilotProcessTaskRuntime.live.test.js` uses actual employee authentication,
native task persistence, a local Ollama preparation, denial and restart inspection
in disposable runtime storage. It does not certify every deployed Process graph,
all policy decision shapes or customer domain callbacks. Screenshots and broad
signed-in Axis acceptance are separate evidence, not implied by API tests.
