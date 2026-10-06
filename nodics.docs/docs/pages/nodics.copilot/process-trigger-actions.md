# Process Trigger Actions in Copilot

## Purpose and Ownership

A Workflow trigger is a relationship to a process definition. An authorized
employee can create or update that relationship, archive it, or explicitly
execute it to start a workflow instance. A trigger is not a Cron job: creating
trigger metadata does not install a schedule, and archival does not delete an
existing Cron job or cancel instances already started.

Workflow owns trigger state, definition resolution, instance creation, domain
callbacks and audit. Copilot owns clarification, full-field review and the
approved command envelope. Axis renders the existing confirmation controls.
No provider receives transport authority, and no customer-project implementation
is required for the reusable capability.

## Business User Journey

For a beginner, start with a MANUAL, DRAFT, inactive trigger against a synthetic
published definition. Check that creation changes only metadata before trying
an explicitly approved execution. A trigger identifies what can start; an
instance is the actual run. They have different identifiers and lifecycles.

1. Sign in to Axis and select the intended enterprise. Open AI Copilot, then
   Conversation. Use the native Process workspace to identify the definition
   and trigger; the assistant does not invent identifiers from similar names.
2. Submit an exact command below. Missing references or activation choices
   produce clarification without making a business change.
3. Inspect the review: operation, trigger, executing employee and every supplied
   native field, including nested schedule or context values.
4. Approve the current review. Approval alone does not dispatch the command.
5. Execute the approved revision. A changed plan or stale revision is rejected.
6. Check the result in Process. For execution, inspect the instance and its
   tasks/incidents; a successful start acknowledgement is not a guarantee that
   later workflow or domain actions completed.
7. After an uncertain result, select **Inspect original business results**.
   Do not resend the command, change the instance identifier or create a new
   confirmation to work around the uncertainty.

The source-backed screen flow is:

| Screen state | User action | Business effect |
| --- | --- | --- |
| Conversation | Submit exact command | Validates input and builds a review only |
| Review pending | Inspect every field, approve or reject | Records intent only |
| Approved | Execute current revision | Claims one durable action, then calls Workflow once |
| Consumed | Inspect native Process state | No further execution of that confirmation |
| Outcome unknown | Inspect original result | Reads the original native receipt, never repeats the command |
| Receipt still unknown | Investigate native owner evidence | Remains unresolved; no automatic replay |

## Create a Trigger

```json
{
  "operation": "process.trigger.create",
  "triggerCode": "monthly-review",
  "definitionCode": "review-process",
  "name": "Monthly review",
  "triggerType": "MANUAL",
  "status": "DRAFT",
  "active": false
}
```

`triggerCode`, `definitionCode`, `name`, `triggerType`, `status` and `active`
are required. The adapter never silently chooses ACTIVE or assumes that the
trigger should be enabled. Types are MANUAL, CRON or EVENT; supported initial
states are DRAFT, ACTIVE or PAUSED. The owner module is fixed to `nodics.process`
and included in the review. Optional fields are positive integer `version`,
`cronJobCode` and `schedule` metadata. An omitted version uses native Workflow's
version resolution at execution; it is not a pinned-version guarantee.

Creation is insert-only. An existing trigger cannot be overwritten by another
create request, including a concurrent request with the same code.

## Update a Trigger

```json
{
  "operation": "process.trigger.update",
  "triggerCode": "monthly-review",
  "status": "ACTIVE",
  "active": true
}
```

At least one changed field is required. Allowed fields are `name`, `version`,
`triggerType`, `cronJobCode`, `status`, `schedule` and `active`. Changing the
definition or metadata owner is not supported by this update contract.
Workflow refuses archived triggers. Its update binds the state read immediately
before the write, requires an acknowledged single match and checks fresh native
readback before reporting success. This is execution-time concurrency protection,
not a claim that preview took a lock or captured a record revision.

With the existing intent planner enabled, the following requests a review:

> Please update trigger monthly-review with status ACTIVE and active true

The model must supply literal identifiers and explicit numeric/boolean choices.
Unknown fields, invented activation choices and unsupported output require
clarification or rejection. The planner consumes the normal accounted model
budget; it has no fallback execution path when the provider or budget is unavailable.

## Execute a Trigger

```json
{
  "operation": "process.trigger.execute",
  "triggerCode": "monthly-review",
  "instanceCode": "monthly-review-october",
  "context": {}
}
```

The new instance identifier and context object must be explicit. Empty context
means an explicitly supplied `{}`, not inferred business values. Optional fields
are `correlationId` and positive integer `version`. Workflow must find an active
trigger, resolve an admissible published definition, pass operational admission
and apply its normal start/lifecycle and domain policies. The new instance can
execute downstream domain actions immediately; review the definition first.

The short form `execute trigger monthly-review` asks for the missing instance
and context. It does not execute with invented values. Typed commands and exact
short forms do not call an LLM. Trigger exchanges are excluded from subsequent
provider history; configured activity recording is a separate concern.

## Archive a Trigger

Enter `archive trigger monthly-review`, or submit:

```json
{
  "operation": "process.trigger.archive",
  "triggerCode": "monthly-review"
}
```

Workflow sets the trigger inactive and ARCHIVED after acknowledged conditional
persistence. It retains the relationship and original evidence. This command
does not remove a scheduler definition, withdraw a domain review or compensate
work already performed.

## Administrator Setup

An operator should first qualify the original employee's native permissions and
the target connection in a disposable local runtime. Do not enable a production
target solely because the synthetic acceptance suite passes.

Use an existing deployment-owned nService alias and actual runtime authority.
Configure the Copilot target and native Workflow receipt owner in their respective
runtimes through normal layered `config/properties.js`:

```js
module.exports = {
  copilot: {
    workbench: {
      processTriggerTarget: {
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

The example does not create the connection, activate modules, enable the Copilot
API, or grant an employee any permission. Never add URLs or service credentials
to the command. A default connection is not an admissible trigger target.

| Boundary | Required authority |
| --- | --- |
| Prepare any trigger command | EMPLOYEE actor, tenant and enterprise; `copilot.mutation.prepare` plus native command grant |
| Create/update/archive | `process.trigger.manage`; native route access-group and exposure policy also apply |
| Execute trigger | `process.trigger.execute`; native route access-group, activation and domain policy also apply |
| Execute approved Copilot plan | Current `copilot.mutation.execute`, original actor/scope, exact revision/digest and unchanged qualified target |
| Inspect original result | `copilot.mutation.reconcile`, prepare/execute grants, current native command grant and `process.backoffice.view` |
| Write original native receipts | Native `commandReceipts.enabled` and `owners.workflow` |

Both trigger writes and receipt recovery are default-disabled. Disabling new
writes does not erase original evidence or permit replay. Authorized original
inspection remains possible with recording disabled; routing and current
permissions must still match.

## Recovery and Troubleshooting

Original evidence uses the existing private `processCommandReceipt` model and
shared native receipt protocol. The native inspection endpoint is:

`POST /nodics/process/v0/triggers/{triggerCode}/commands/{kind}/receipt/query`

Its exact body is `{ "command": originalNativeBody, "idempotencyKey": originalKey }`.
The original body includes `code` and fixed `ownerModule` for creation. Normal
users should use the confirmation's inspection button rather than reconstructing
this input. Current record existence is never substituted for an original receipt.

| Symptom | Meaning and next step |
| --- | --- |
| Configuration required | Qualify the existing owner alias, authority and enablement; do not select another owner as fallback |
| Permission denied | Review the employee's effective native and Copilot permissions; an administrator title alone is insufficient |
| Missing fields | Supply the named values and submit a new review; no mutation occurred during preparation |
| Archived/inactive trigger | Review native state; execution must not silently reactivate it |
| Stale revision | Reload the original confirmation; never substitute another revision by guessing |
| Failed or ambiguous native write | The action remains unknown; inspect original evidence before any further action |
| STARTED or missing receipt | Completion is unproven; no retry or success claim is permitted |
| Completed start, later incident | Inspect the native instance; start acknowledgement is not full workflow success |

## Customize and Extend Safely

A developer extends the existing module through the normal later-layer contract;
frontend rendering does not confer backend authority.

Partners change only their project-owned later layer. For example,
`<project>/modules/<overlay>/config/properties.js` may override:

```js
module.exports = {
  copilot: { workbench: {
    processTriggerTimeoutMs: 12000,
    processTriggerPresentation: {
      title: "Workflow trigger review",
      summary: "Review every proposed field before starting workflow activity."
    }
  } }
};
```

All other framework defaults remain inherited. The transport timeout must be an
integer from 1,000 to 120,000 milliseconds; retries remain fixed at one attempt.
Presentation overrides cannot add commands or weaken authorization.

Inputs allow safe identifiers up to 128 characters, leaf text up to 1,000
characters, nesting depth five, at most 40 entries per object/array and 100
reviewed leaves, and a native body at most 12,000 characters. Credential-like
keys, executable objects, arbitrary endpoints and unknown top-level fields are
rejected. Supply no secrets in context or metadata. Broader domain-specific
payload shapes require an owner-reviewed adapter, not a copied generic executor.

Review sections contain at most 20 fields each and preserve every leaf; long
reviews are split, not truncated. Labels must fit the existing 128-character
Axis contract. Excessively long nested paths are rejected before a plan is saved.

Workflow service overlays can tighten trigger lifecycle validation through normal
service layering. Preserve insert-only creation, conditional writes, fresh
acknowledged readback, exact employee/scope/input receipt binding and inspection
without replay. Cron remains the only scheduler owner.

## Verification and Evidence Boundary

`copilotProcessTriggerAction.test.js` composes real Core, approval, executor,
recovery, native metadata lifecycle and shared receipt logic using isolated stores.
It checks all four commands, denied/drifted scope, stale/duplicate execution,
write failure, malformed receipts, input bounds and later-layer presentation.

`copilotProcessTriggerRuntime.live.test.js` separately enables real disposable
Profile, Copilot, Workflow, MongoDB and local Ollama. It exercises all four
commands, persisted native state, denied roles, restart and original receipts.
Its response-loss case loses the reply only after the native trigger starts the
instance, then reconciles after restart without a second start.

Axis's confirmation tests cover the four explicit recovery identities. The
`process-task-review.visual.html?mode=trigger` fixture renders the actual shared
component with synthetic state for desktop/mobile review and unknown-outcome
inspection. It is not evidence of a signed-in full Axis deployment. These checks
qualify the bounded trigger adapter, not every Workflow operation or domain graph.

## Common Mistakes

- Treating CRON trigger metadata as an installed schedule. Configure scheduling
  through Cron's own governed journey and verify its separate lifecycle.
- Treating ACTIVE status as sufficient when `active` is false. Both native
  execution prerequisites must hold; neither is silently repaired by Copilot.
- Reusing an instance identifier to conceal an uncertain execution. Inspect the
  original action and receipt; do not attempt another trigger command as a probe.
- Treating confirmation as permission. Native employee grants, current routing,
  lifecycle and domain rules are rechecked at execution.
- Copying framework configuration defaults into a customer project. Override
  only the deployment choice or intentional presentation/timeout difference.
