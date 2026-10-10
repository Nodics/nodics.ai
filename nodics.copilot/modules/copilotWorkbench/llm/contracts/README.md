# copilotWorkbench contracts

Collection-centre plans use canonical Location/Profile references, current
enterprise and complete nested field review. Waste retains validation and create
authority. Execution acknowledgements reject error envelopes even when they also
contain a success code or matching identity. See
[the operator and customization guide](../examples/collection-centres.md).

## Governed Synchronous Actions

`DefaultCopilotSchemaActionService` admits only exact configured source/schema
pairs already selected through Knowledge. It reuses the current native descriptor
and employee authority for one `GENERATED_CRUD` create, update, or delete. The
review binds every command leaf, source policy digest, module, schema, route,
method, and API version. Execution rechecks those values and dispatches once.
Business aggregate forms, wildcard allowlists, bulk operations, read-only/Online
authoring, credential-shaped keys, and caller-selected routing fail closed.
Original-result recovery reads the schema owner's private command receipt and
never replays the mutation. See the
[canonical guide](../../data/docs-v001/records/documentation/copilotWorkbenchDocumentationComponentData.js).

Fixed trigger create/update/archive/execute uses
`DefaultCopilotProcessTriggerActionService`, its independently disabled target,
explicit activation choices and original instance identity. Full inert leaf
review precedes the existing durable executor. Native Workflow owns lifecycle,
insert-only creation, exact conditional metadata transitions and original receipts.
No trigger command creates a Cron schedule or silently retries a workflow start.
See [trigger commands](../examples/process-triggers.md).

Fixed human task claim/assignment/completion/cancellation uses the same executor
with `DefaultCopilotProcessTaskActionService`. Native Workflow owns policy and
advancement. New writes require explicit target admission and native receipt
recording; original inspection never retries. Read [task commands](../examples/process-tasks.md).

`DefaultCopilotOrderNotificationActionService` owns only
`commerce.orderNotification.retry`. Preparation fetches the current Digital Core
workspace and binds its order revision plus the count and digest of every eligible
frozen intent. The caller may choose only the order code and PURCHASED/REFUNDED
kind; recipient, channel, template and intent identifiers are never accepted as
input. Execution reauthorizes the employee, rechecks the exact workspace and
intent set, then sends one confirmed retry request. Transport uncertainty invokes
one read-only native inspection and remains `UNCONFIRMED`; it never proves success
or authorizes replay. The target and recovery paths are independently disabled by
default. See the
[order-notification guide](../../data/docs-v001/records/documentation/copilotWorkbenchDocumentationComponentData.js)
and `test/copilotOrderNotificationAction.test.js`.

Original-result recovery is separately default-disabled. Native journals retain
insert-only command identity before dispatch and exact acknowledged completion.
Missing/STARTED receipts never authorize replay. Reconciliation preserves the
original actor, plan, target and native permissions, then CAS-transitions the
action. Only COMPLETED and NOT_STARTED rows permit a fresh confirmation; the
executor skips completed rows. See the
[step-by-step guide](../../data/docs-v001/records/documentation/copilotWorkbenchDocumentationComponentData.js).

`DefaultCopilotActionExecutionService` owns the bounded synchronous action claim
and row-outcome projection. It is not a workflow engine, transaction coordinator,
retry queue, compensation service, or replacement for the domain APIs.

- The action is private to its tenant, enterprise and employee.
- Approval version 2 binds primary rows, all related rows, preview and execution
  target. Approval, rejection and execution require the exact revision and digest.
- Each transition uses generated persistence with state and audit revision in the
  predicate. Only a positively acknowledged single match allows progress.
- Execution reauthorizes the current actor. Owning APIs receive the employee's
  bearer credential and enterprise header; internal service-token fallback is
  forbidden for this path.
- Domain rows are submitted in order, with a durable RUNNING marker before each
  call. Only a successful envelope containing exactly the requested record code
  proves completion. A transport failure, malformed response or unconfirmed write
  stops subsequent rows. No automatic retry or rollback occurs.
- Persistence failure after dispatch leaves the last durable state unresolved.
  EXECUTING/RUNNING is not evidence that a write failed. Do not reopen execution.
- Typed adapters support Product/PriceRow, Profile enterprise/invitations, Waste
  collection centres and sensitive Digital Core coupon fulfillment. Each retains
  its own stricter validation and target contract; the shared limit is 200 rows.
  This does not enable arbitrary Axis operations.
- Non-coupon original-result inspection ignores new-write admission flags only.
  Current native permissions, independent recovery admission, actor/enterprise
  binding and exact original routing are still required. Internal inspection
  selection cannot be supplied by the request. Fresh approval of unstarted rows
  is not authority to bypass disabled execution. Re-enablement, when appropriate,
  remains independently governed configuration, not part of reconciliation.
- Standalone `profile.enterprise.invite` and `commerce.price.create` reuse those
  owners without implicit enterprise/product creation. Admission flags default
  false, each batch is bounded to 20 rows, every executed field is reviewed, and
  native original-result inspection uses the existing invitation/price receipts.
  Invitation-only preparation needs assignment authority, not enterprise creation.
  Price creation never activates a price book or publishes customer prices.
- Coupon reconciliation inspects the original owner command/receipt and only then
  CAS-transitions an owned uncertain action. An expired approval may be inspected,
  never executed again. Missing or mismatched evidence leaves the outcome unknown.
  See [secure coupon fulfillment](../examples/secure-coupon-fulfillment.md).
- Coupon queue rows and both pending/completed receipt responses preserve the
  source-authored simulation triad only when all three own enumerable data fields
  are exact: `simulated: true`, `deliveryVerified: false`,
  `evidenceMode: LOCAL_SIMULATION`. Partial, contradictory, coerced or inherited
  tags fail before action reconciliation; accessors are not invoked. Absent tags
  remain absent and never imply verified delivery. Identity, environment and
  caller flags cannot supply missing owner tags. ITEM preparation/execution,
  including simulated ITEM plans, remain unsupported; the existing benefit
  parser supports only PRICED_CART. This projection adds no schema, provider,
  mutation, retry or qualification authority.
- The legacy pure workbench `execute` helper does not provide durable claim
  semantics. API mutations must use the action execution service through Core.

See [the operator guide](../examples/governed-actions.md) for business steps,
migration, investigation and extension boundaries. Tests are in
`../../test/copilotActionExecution.test.js`.
