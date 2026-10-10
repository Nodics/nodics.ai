# nodics.process

Process is a mandatory functional group because governed publication approval
requires workflow during first-run setup. Runtime observation still remains
separate from bounded BackOffice operational state; workflow-dependent
operations fail closed when that authority is unavailable.

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
- Capability documentation records live in the implementing child's
  `data/docs-v001/records/documentation`: `modules/workflow` and
  `modules/cronjob`. This composition-only group does not own an importable data
  folder. Documentation remains optional and separate from business releases.

## Verification

```bash
npm test
```
