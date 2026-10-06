# copilotCapability contracts

Trigger create/update/archive/execute descriptors are inert implementation
metadata, not execution permission. Create/update/archive require native
`process.trigger.manage`; execute requires `process.trigger.execute`; all need
independent Copilot preparation. The Workbench owner rechecks the employee,
qualified target and original review at execution. No descriptor creates a
schedule, broadens a native grant or proves deployment readiness.

The inert descriptor catalogue includes the four fixed `process.task` commands
implemented by Workbench. Each requires the same native task grant and independent
Copilot preparation permission. IMPLEMENTED describes source capability, not
enabled configuration or authority over a specific task. Native Workflow policy,
confirmation, original receipts and target admission remain mandatory.

`DefaultCopilotProcessInspectionService` owns eight fixed Workflow metadata GETs.
Admission is default-disabled and requires one exact tenant/enterprise/environment
scope, an admitted code for the relevant record kind, `copilot.data.query` and
the native Process grant. Lists require an admitted instance and are not global
inventory access. The original employee bearer is the only execution credential.
Recheck admission and immutable identity/transport after awaiting native data.
Validate every identity before display truncation, including omitted rows; exclude
graphs, runtime context, assignees, task decisions, review contexts and private
receipts. Matched commands and answers never enter provider history. Reads cannot
claim tasks, approve decisions, start, retry or compensate instances. See the
[Process guide](../../../../../nodics.docs/docs/pages/nodics.copilot/process-inspection.md)
and `test/copilotProcessInspection.test.js` plus the opt-in native runtime test.

`DefaultCopilotRulesInspectionService` owns five fixed Rules GET adapters.
Admission requires an exact tenant/enterprise/environment binding, configured
rule or band code and `copilot.data.query` plus the native operation grant.
Default admission is disabled. Every request uses the employee bearer through
the named `rulesApi` connection; no internal identity fallback is permitted.
Recheck current admission after await, reject routing/identity drift, minimize
scalar evidence and never send matched commands/results to provider history.
Simulation is a mutation and is not a read adapter. No configurable API executor
or second capability registry is introduced. See the canonical
[Rules inspection guide](../../../../../nodics.docs/docs/pages/nodics.copilot/rules-inspection.md)
and `test/copilotRulesInspection.test.js` plus the opt-in native runtime suite.

`DefaultCopilotOrderNotificationInspectionService` owns two fixed Digital Core
reads: an order-notification workspace GET and a PURCHASED/REFUNDED inspection
POST. Admission is default-disabled and binds one tenant, enterprise, environment
and order code. Both reads require `copilot.data.query` and
`commerce.digital.notification.read`; they use only the original employee bearer
through the exact non-default Commerce connection. Results are projected to
bounded delivery evidence and exclude recipients, template content and private
financial fields. Admission and identity are rechecked after every native await.
Matched commands and results never enter provider history. See the
[order-notification guide](../../../../../nodics.docs/docs/pages/nodics.copilot/order-notification-operations.md)
and `test/copilotOrderNotificationInspection.test.js`.

The operation catalogue is a bounded inert projection of
`DefaultCopilotExperienceCapabilityService.descriptors`, not a second registry.
Policy filters descriptors before projection using trusted employee, tenant and
enterprise context. Missing policy or context must fail closed. Response fields
are allowlisted; handlers, configuration and arbitrary adapter fields are excluded.

IMPLEMENTED describes source maturity, not live readiness or authorization to
execute. ADAPTER_REQUIRED and FUTURE must remain visibly distinct. All mutations
still require the governed preparation, approval and execution path. Current
domain API authorization remains authoritative even when an operation is visible.

The existing mutation inventory includes `commerce.product.create`,
`commerce.price.create`, `profile.enterprise.onboard`,
`profile.enterprise.invite`, `waste.collectionCentre.create` and
`commerce.coupon.redeem`. Product targets remain schema-owner resolved; the other
adapters delegate to Profile, Waste Collection and Digital Core respectively.
This list is not a claim to support every Axis operation. Invitations remain
pending registration, and coupon redemption retains its dedicated sensitive path.

Descriptors may declare up to sixteen explicit `requiredPermissions`. Malformed
declarations are hidden, not ignored. Canonical Policy evaluates these restrictions
alongside the primary permission and scope restrictions; its existing exact-grant
semantics remain unchanged (a wildcard does not satisfy a declared restriction).
These internal restriction fields are not projected as executable browser input.
Enterprise onboarding declares preparation and assignment grants; coupon redemption
declares preparation as well as its independent merchant permission.

See [the supported action and recovery inventory](../../../copilotWorkbench/llm/examples/governed-actions.md#supported-action-inventory)
for the per-adapter boundary. These typed adapters expose native original-receipt
reconciliation when separately configured and authorized. A stored Product, enterprise or collection-centre
code is not an original execution receipt and cannot unlock retry or continuation.

Later-layer descriptors must retain risk class, explicit permission and applicable
scope restrictions. Test `test/copilotOperationCatalogue.test.js` for projection,
permissions, bounds, and extension compatibility. The Workspace renders this
projection; operation detail editors and enterprise enablement are not yet supplied.
