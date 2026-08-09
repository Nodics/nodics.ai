# Process Migration Audit

## Current source inventory

- Current modular framework contains `nodics.core/modules/nbpm`.
- Legacy archive contains a broader workflow family under:
  - `gFramework/nbpm`
  - `gCore/workflow/flowSchema`
  - `gCore/workflow/flowCore`
  - `gCore/workflow/flowApi`

## Interpretation

`nbpm` is already active as a Core framework workflow/process capability. It
handles generic workflow-to-schema lifecycle integration, source data builders,
activity interceptors, workflow events, and local/remote initialization.

This is not the same responsibility as `nodics.process`. The Process group owns
business process definition governance, draft validation, visual designer
projection, publication/versioning, process instances, tasks, audit, and future
runtime execution. `nbpm` currently provides a Core bootstrap bridge that lets
schemas participate in workflow lifecycle behavior.

The current evidence shows `nbpm` must remain in Core until compatibility is
proved:

- `nodics.core/nodics.js` calls
  `SERVICE.DefaultWorkflow2SchemaService.buildWorkflow2SchemaAssociations()`
  during initialization when init data is required.
- `nbpm/src/schemas/schemas.js` contributes the `system.workflow2Schema`
  schema. Generated Core artifacts exist for that schema under `nService`,
  `nFacade`, and `nController`.
- `nbpm/src/interceptors`, `nbpm/src/pipelines`, and `nbpm/src/event` define
  lifecycle hooks that attach workflow behavior to schema operations.
- `nodics.wcms/modules/wcms/src/service/publication/defaultWcmsPublicationWorkflowService.js`
  consumes approved `workflowCarrier` shape for publication handoff.
- `CONFIG.workflowModuleName` defaults to `workflow`, and `DefaultWorkflowService`
  can initialize workflows locally or through governed internal module calls.

The archived workflow family is a richer process/workflow runtime source that
should be migrated into `nodics.process` only through focused slices:

1. schema and status vocabulary;
2. definition validation service;
3. read-only API contracts;
4. draft definition CRUD;
5. publish/suspend/archive lifecycle;
6. instance runtime and task lifecycle;
7. Axis visual designer integration;
8. import/sample process packs;
9. compatibility and migration tests.

## No blind move rule

Do not physically move `nbpm` out of Core or copy legacy workflow modules into
`nodics.process` as a bulk operation. That would risk breaking the current
runtime graph, service override order, generated schema contracts, and fresh
bootstrap acceptance. Each migration slice must prove:

- module load order;
- schema/API compatibility;
- service override/customization path;
- data import behavior;
- BackOffice metadata validation;
- Axis route guarding;
- fresh database bootstrap;
- repeat bootstrap;
- rollback safety.

## Migration classification

| Area | Current owner | Current role | Future decision |
| --- | --- | --- | --- |
| `system.workflow2Schema` schema | `nodics.core/modules/nbpm` | Core bootstrap mapping from schema lifecycle to workflow behavior | Keep in Core until a compatibility adapter proves generated services and init flow can survive a move. |
| `DefaultWorkflow2SchemaService.buildWorkflow2SchemaAssociations` | `nodics.core/modules/nbpm` plus generated Core service merge | Builds runtime associations after init data import | Must stay callable during Core startup. Add a guard before any migration. |
| Workflow activity interceptors | `nodics.core/modules/nbpm` | Attach workflow events to schema save/update/remove behavior | Candidate for a Core bridge or a Process adapter only after schema lifecycle ownership is explicit. |
| Workflow lifecycle pipelines | `nodics.core/modules/nbpm` | Mutate workflow carrier/item state for assigned, released, blocked, paused, resumed, updated, filled, processed, action-performed, channel-evaluated, and error events | Candidate future `flowCore`, but only after dependent modules and generated artifacts are mapped. |
| Source carrier/item builders | `nodics.core/modules/nbpm` | Build carrier/item payloads from source schema records | Candidate future `flowCore` service, with a compatibility wrapper left in Core if schema integration remains Core-owned. |
| Workflow events/listeners | `nodics.core/modules/nbpm` | Dispatch lifecycle transitions through nEvent/nPipeline | Candidate future `flowCore`, but must preserve event names, tenant/auth context, and pipeline contracts. |
| Workflow-to-schema HTTP routes | `nodics.core/modules/nbpm` under `system` route family | Administrative mapping surface for workflow/schema association | Candidate future `flowApi` only if route compatibility or deprecation path is provided. |
| `workflowCarrier` consumer contracts | WCMS and generated workflow artifacts | Downstream modules consume approved carrier shape | Must be catalogued before any schema/model rename. |
| `nbpm` package identity `bpm` | Core runtime module | Low-index core capability loaded before standard functional module groups | Keep stable until replacement load order is proven in fresh and repeat bootstrap. |

## Required guard tests before migration

Before moving or deleting any `nbpm` artifact, tests must prove:

1. Core still exposes `DefaultWorkflow2SchemaService.buildWorkflow2SchemaAssociations`.
2. `system.workflow2Schema` remains discoverable as an effective schema.
3. Generated `DefaultWorkflow2SchemaService`, facade, and controller contracts
   are still present or have an explicit compatibility replacement.
4. WCMS publication workflow bridge can still consume `workflowCarrier`.
5. Process server can load `flowSchema`, `flowCore`, `flowApi`, `workflow`, and
   `nodics.process` without requiring `nbpm` to move.

## Current recommendation

Keep `nbpm` in Core. Treat it as the compatibility bridge between Core schema
lifecycle and workflow behavior. Build `nodics.process` as the modern business
process module group beside it, then introduce explicit adapters only after the
runtime dependency graph is stable and tested.
