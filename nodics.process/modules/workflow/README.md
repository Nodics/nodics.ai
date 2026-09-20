# Workflow

Workflow is the first capability inside the `nodics.process` functional module group. It owns schemas, engine services, and APIs for governed business process definitions, publication, execution, and inspection.

Runtime ownership is organized internally without nested runtime modules:

- `src/schemas` owns workflow persistence models.
- `src/utils` owns lifecycle status vocabulary.
- `src/service` owns graph validation, lifecycle rules, and execution-ready process services.
- `src/router`, `src/controller`, and `src/facade` own secured HTTP routes and API projection.

Axis can render workflow screens from BackOffice capability metadata, but the backend remains the authority for process definitions, validation, versioning, and runtime behavior.

This capability declares an inert model-service inventory for [governed Local reset](../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.

Starting a new process instance requires the existing registration agent's fresh
workflow activation state and validated local runtime identity. Preserve the
caller's authorization/audit context. Existing instances retain their completion,
cancellation and recovery contract after business deactivation; definition and
incident management do not silently start new instances.

Route-category defaults belong to this capability; deployments supply only intentional overrides.
Preserve nRouter enforcement and independent route authorization. See [exposure ownership](../../../nodics.foundation/modules/nRouter/llm/contracts/README.md#capability-owned-exposure-defaults).

Remote actions use the existing allowlist and nService with scoped runtime identity. Process persists an expiring single-claim execution in its instance; the target claims authoritative context before mutation. Completed task decisions and immutable versions are read-only through generic APIs. See `llm/contracts/README.md`; no domain HTTP implementation or new identity authority belongs in Process.
