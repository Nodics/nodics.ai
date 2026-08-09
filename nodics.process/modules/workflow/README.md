# Workflow

Workflow is the first capability inside the `nodics.process` functional module group. It composes schema, engine, and API technical modules for governed business process definitions, publication, execution, and inspection.

Runtime ownership is split intentionally:

- `flowSchema` owns workflow persistence models and lifecycle status vocabulary.
- `flowCore` owns graph validation, lifecycle rules, and execution-ready process services.
- `flowApi` owns secured HTTP routes, controllers, and facades.

Axis can render workflow screens from BackOffice capability metadata, but the backend remains the authority for process definitions, validation, versioning, and runtime behavior.
