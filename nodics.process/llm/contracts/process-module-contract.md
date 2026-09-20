# Process Module Contract

`nodics.process` is the reusable functional module group for governed business
process and workflow capability.

## Business outcome

Business users need to model, approve, publish, monitor, pause, retry, and
retire operational flows without every domain module inventing its own process
engine. Developers need one framework contract for definitions, instances,
tasks, transitions, retries, events, and audit. Operators need visibility into
running instances, stuck work, failed transitions, version drift, and safe
rollback.

## Boundary

- `nodics.process` is a functional module group, not the direct owner of
  runtime source files. It must follow the same repository shape as the other
  standard groups: group root for composition/contracts/defaults, child modules
  under `modules/` for real runtime behavior.
- Standard process capabilities are `workflow` and `cronjob`. `workflow`
  directly owns schema contracts, process status definitions, graph validation,
  lifecycle, versioning, execution services, routers, controllers, facades, and
  secured API projection. `cronjob` directly owns scheduled-job definitions,
  schedule execution, scheduler state, lifecycle commands, and Process trigger
  handoff.
- Direct `nodics.process/src` runtime code is forbidden.
- Process owns reusable process definition, workflow definition, scheduled-job,
  transition, task, approval, instance, audit, retry, compensation,
  visual-designer validation, and publication lifecycle.
- Domain modules own domain commands and side effects. A workflow may call a
  domain action through a governed adapter, but Process must not contain order,
  payment, catalog, media, profile, telco, logistics, or customer-specific
  business behavior.
- Core owns low-level framework primitives. `nbpm` currently remains in Core
  until migration is proven.
- Axis owns only rendering and interaction. The visual graph shown in Axis is
  an editor projection over process-owned definitions.

## Functional module lifecycle

1. Runtime observes `nodics.process` as an optional functional module.
2. BackOffice exposes process navigation only when the module is registered,
   active, live, and authorized.
3. Axis renders Process and Workflow pages from the BackOffice navigation
   contract.
4. Create/update/delete operations call process-owned APIs only after those APIs
   are implemented and authorized.
5. A process definition moves through draft, validated, published, suspended,
   deprecated, and archived states.
6. A process instance records every transition with tenant, actor/service,
   correlation, input/output summary, error, retry, and compensation evidence.
7. Runtime instance, task, and trigger mutations use dedicated permissions such
   as `process.instance.start`, `process.task.complete`, and
   `process.trigger.manage`; do not reuse definition-write permissions for
   runtime operations.
8. Process documentation is backend-owned by `nodics.process`. Axis may render
   it after WCMS imports the content pack, but Axis must not store framework
   Process documentation data.
9. The Process visual designer is a frontend editing surface over a
   backend-owned graph contract. Axis may project graph layout and collect draft
   changes, but Process owns validation, persistence, publication, and runtime
   execution.

## Minimum future API surface

The process API should use `/nodics/process/v0/...` and keep domain actions
behind adapters:

- `GET /definitions`
- `POST /definitions`
- `GET /definitions/{code}`
- `PATCH /definitions/{code}`
- `POST /definitions/{code}/validate`
- `POST /definitions/{code}/publish`
- `POST /definitions/{code}/suspend`
- `DELETE /definitions/{code}`
- `GET /instances`
- `GET /instances/{code}`
- `POST /instances`
- `POST /instances/{code}/cancel`
- `POST /instances/{code}/retry`
- `POST /instances/{code}/pause`
- `POST /instances/{code}/resume`
- `GET /tasks`
- `POST /tasks/{code}/claim`
- `POST /tasks/{code}/assign`
- `POST /tasks/{code}/complete`
- `POST /tasks/{code}/return`
- `GET /triggers`
- `POST /triggers`
- `PATCH /triggers/{code}`
- `POST /triggers/{code}/archive`

Delete is never a blind destructive operation. Draft definitions may be deleted.
Published definitions should be archived or deprecated so running instance
history remains explainable.

## Customization

Projects and partner modules customize Process by contributing:

- additional node types;
- validators;
- adapter services for domain actions;
- task assignment strategies;
- escalation policies;
- retry and compensation policies;
- tenant restrictions;
- import/sample definitions;
- Axis renderer extensions when a genuinely new presentation primitive is
  needed.

Configuration belongs in layered properties. Stable lifecycle states, error
codes, and process statuses belong in status definitions when runtime source is
added.

For workflow/cronjob topology, trigger ownership, visual-designer authority,
and where-to-write rules, also follow
`llm/contracts/process-ownership-and-designer-contract.md`.

### Operational admission for new instances

`startInstance` checks the existing registration agent's current `workflow`
activation and local runtime credential before reading a definition or creating
an instance. Direct API, scheduled trigger and publication-start paths share
that method. Preserve the requesting principal for domain authorization and
audit; the runtime proof does not replace caller permission checks. Business
deactivation blocks new instances while existing instances retain their normal
completion, cancellation and recovery contract. Missing/stale authority fails
closed without a second activation registry.

## Selected remote action protocols

The existing action registry accepts explicit records or names from `process.actionAdapters.definitions`. Definitions are inert; `allowedActions` remains the deployment allowlist. Unknown names fail, disabled adapters reject execution, and graph-supplied service/URL/method values cannot expand the allowlist. Use nConfig replacement for a complete selected list.

`DefaultProcessRemoteActionAdapterService` delegates standard Editorial callbacks through nService. Deployment `process.remoteActions.targets.editorial.connectionName` supplies the peer alias. Workflow owns only the bounded execution envelope and transport; Editorial owns decision transformation, source revision correlation and publication through nPublish. The transport forces remote dispatch and WCMS Staged authority, forwards caller access/tenant/enterprise/correlation context, uses a bounded timeout and one attempt, and propagates failures. No local Editorial activation, arbitrary URL fallback, direct fetch implementation or internal-token privilege escalation is permitted.

The selected `editorial.applyDecision` and `editorial.publishApproved` protocols invoke Editorial-owned callbacks. The CMS decision protocol continues using its existing callback service. Publication callback technical defaults belong to Workflow; each deployment selects its actual CMS connection. An unavailable peer or missing caller identity leaves the action failed for normal Process recovery.
