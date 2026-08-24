# Workflow

Workflow is the first capability inside the `nodics.process` functional module group. It owns schemas, engine services, and APIs for governed business process definitions, publication, execution, and inspection.

Runtime ownership is organized internally without nested runtime modules:

- `src/schemas` owns workflow persistence models.
- `src/utils` owns lifecycle status vocabulary.
- `src/service` owns graph validation, lifecycle rules, and execution-ready process services.
- `src/router`, `src/controller`, and `src/facade` own secured HTTP routes and API projection.

Axis can render workflow screens from BackOffice capability metadata, but the backend remains the authority for process definitions, validation, versioning, and runtime behavior.
