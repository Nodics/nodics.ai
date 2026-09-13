# copilotCore contracts

Generated documentation entry for copilotCore.

## Confirmed source record execution

`DefaultCopilotOrchestrationService.createOwnedSchemaRecord` invokes the configured
owning module remotely with PUT on the lowercased schema resource (`/product`,
`/pricerow`) and the raw model body. It preserves connection name, tenant,
`targetAuthority` and the Idempotency-Key header. There is no Workbench mutation
fallback. Backend selective schema routes must exist first; rejection propagates
without an alternate write. The existing approved plan, fresh policy check,
confirmation, tenant binding and action audit remain unchanged.

The former `createOwnedWorkbenchRecord` extension point is replaced by
`createOwnedSchemaRecord`. Move overrides to that existing orchestration helper;
custom route paths can be handled there while retaining canonical API semantics.
Do not introduce a new frontend/backend operation registry. Existing target-module
and connection configuration remains the deployment boundary. Schema writes are
Staged-only; publication is a separate domain operation. Idempotency forwarding
is not durable replay protection and ordered plan writes are not a transaction.
