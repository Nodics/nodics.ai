# nodics.process

`nodics.process` is the standard Nodics functional module group for governed
business processes and workflows.

It extends `nodics.foundation` and packages reusable process-definition,
workflow-definition, task, approval, instance, audit, runtime-lifecycle, and
visual-design contracts. Axis may render process workspaces only from this
module's BackOffice capability metadata and secured APIs; Axis must not become
the workflow engine or workflow persistence authority.

`nodics.process` is a module group. Runtime implementation is intentionally
kept under child modules:

- `modules/workflow/src/schemas` owns process schemas.
- `modules/workflow/src/utils` owns status definitions and process utility vocabulary.
- `modules/workflow/src/service` owns graph validation, definition lifecycle,
  runtime instance lifecycle, task lifecycle, trigger metadata inspection, and
  future execution providers.
- `modules/workflow/src/router`, `src/controller`, and `src/facade` own secured
  process HTTP APIs.
- `modules/cronjob` owns scheduled-job definitions, lifecycle services,
  scheduler state, job routes, and Process trigger handoff.

The existing `nbpm` capability in `nodics.foundation` remains a compatibility
reference until a focused migration proves load order, bootstrap, API exposure,
and data compatibility.

## Ownership

- `nodics.process` owns process/workflow definitions, runtime governance,
  workflow API contracts, scheduled-job orchestration, task/approval lifecycle,
  designer validation, and process documentation.
- Domain modules own domain actions. For example, Commerce owns order
  cancellation/refund behavior; Process may orchestrate the flow but must not
  implement the commerce action itself.
- `nodics.axis` owns the React renderer/editor surface only.
- Runtime source must not be placed directly under `nodics.process/src`.
- Backend-owned beginner documentation source lives under
  `data/core-v001/source/documentation`. Generated/importable documentation records
  must also stay backend-owned when the Process documentation content-pack
  scaffold is introduced.

## Verification

```bash
npm test
```
