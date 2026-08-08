# nodics.process

`nodics.process` is the standard Nodics functional module group for governed
business processes and workflows.

It extends `nodics.core` and will package reusable process-definition,
workflow-definition, task, approval, instance, retry, audit, and visual-design
contracts. Axis may render process workspaces only from this module's
BackOffice capability metadata; Axis must not become the workflow engine or
workflow persistence authority.

The current slice establishes the module boundary, capability metadata, and
migration/evaluation contracts. The existing `nbpm` capability in
`nodics.core` and the archived workflow modules remain migration references
until a focused runtime move is tested.

## Ownership

- `nodics.process` owns process/workflow definitions, runtime governance,
  workflow API contracts, task/approval lifecycle, designer validation, and
  process documentation.
- Domain modules own domain actions. For example, Commerce owns order
  cancellation/refund behavior; Process may orchestrate the flow but must not
  implement the commerce action itself.
- `nodics.axis` owns the React renderer/editor surface only.

## Verification

```bash
npm test
```
