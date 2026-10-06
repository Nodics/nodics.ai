# copilotProvider contracts

Recurring enterprise/user `defaultLimit` is optional, bounded by its `limit`
ceiling and used when the current-period journal has no target override. Zero
must remain zero; missing eligibility never grants capacity. Calendar resets
do not copy operational allocations or refund unresolved usage. Configuration
governance remains with nConfig/nDynamo. See the
[allocation administration guide](../examples/allocation-administration.md).

Historical usage reads two precisely derived accounting periods and filters both
by the same trusted identity and selectors. Do not infer a tenant's history from
another enterprise's records or turn absent matching history into measured zero.
Unresolved queues are oldest-first, 25 calls per page; receipt enrichment is
bounded to that page and never mutates accounting. Calendar selection is bounded
by `accounting.historyPeriods` (1-24), not an arbitrary client-supplied date range.

Manual provider checks require an independent `copilot.provider.check` grant and
the configured default selection. Only qualified adapter health methods perform
transport. Never accept a browser URL/credential override, generate a prompt on
check, return raw provider errors or probe automatically on workspace load. See
the [user and operator guide](../examples/historical-usage-and-provider-checks.md).

## Usage Evidence and Inspection

`DefaultCopilotReconciliationService` owns immutable, private generated
measurement receipts and evidence-backed reconciliation. Capture only normalized
measured counters from the trusted provider wrapper before ledger settlement;
no conversation content or credentials. The receipt binds original tenant,
enterprise, principal, period and call. Read identity and digest are rechecked.
No employee API may create evidence or submit measured counts.

Reconciliation requires assistant-read, enterprise usage-read and the independent
`copilot.usage.reconcile` grant. Preview is read-only; execution rechecks evidence
and call state, then commits the measured amount and audit through the existing
period journal CAS. Unknown acknowledgements are not retried. Original-period
repair never charges a new period. Missing evidence leaves capacity held.
Receipt schema and unique-index qualification are prerequisites for opting in;
the default remains disabled. See the [operator contract](../examples/usage-insights-and-reconciliation.md).

Usage analytics aggregate only the authorized filtered ledger. Daily buckets use
the accounting timezone; ranked breakdowns have explicit bounded windows.
Neither omitted rows nor unavailable counts may be turned into zero.

`DefaultCopilotProviderService` is the canonical model-provider entrypoint.
Layered properties select adapters by handler metadata. Adapter names must not
appear in provider-neutral branching logic. Disabled providers are not probed;
credential requirements come from adapter metadata and fail closed.

Selected profiles must be own properties of the effective `profiles` map and
must be objects. Unknown profiles fail before handler invocation. Standard and
streaming paths share the same request validation. Tool declaration validation
is capability checking, never authorization or proof of complete adapter mapping.

Usage normalization preserves unknown input/output/total counts as `null`.
Only non-negative safe integer counts are measured. Derive a missing total only
from two measured components with a safe integer sum; partial input cannot
manufacture a zero. Measurement state is not a reservation/reconciliation state.
Do not log prompts, secrets, or raw provider errors when implementing recovery.

When accounting is enabled, both invocation paths reserve before dispatch and
settle through `DefaultCopilotUsageService`. Atomic tenant/enterprise/user caps
and current period membership are checked together. Missing usage is pending;
lost persistence acknowledgement is not proof of rollback. Generic accounting
CRUD routes remain disabled. See [bounded accounting contract and limitations](../examples/usage-and-budgets.md).

`DefaultCopilotBudgetService` owns current-period operational allocation changes.
Read plus target-specific grants are checked in trusted request scope; caller
identity is never accepted from the body. Preview is read-only. Confirmed changes
bind to period, effective policy digest, allocation revision and stable command
identity. Allocation and audit share the usage journal CAS. Known conflicts may
retry CAS; ambiguous acknowledgements may not trigger a second write. Configured
ceilings and identity/provider eligibility remain in nConfig. Read the
[administration contract](../examples/allocation-administration.md) for bounds,
reset behavior and operator recovery.

`describeConfiguration(options)` is the read-only configuration projection for
dashboard consumers. It reuses canonical effective configuration and handler
validation, without resolving credentials or calling a provider. It returns only
`state`, `health: NOT_CHECKED`, and a nullable model name. Configuration failures
produce `NOT_CONFIGURED`; callers must not interpret this projection as a live
health check or expose underlying errors, endpoints, profiles, or secret references.
