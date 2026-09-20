# Workflow Agent Guide

## Inheritance

- Follow the repository AGENTS contract: `../../../AGENTS.md`.
- Follow global AI/development guidance from `../../../nodics.foundation/modules/nSetup/llm/ai-enablement-index.md`.
- Follow the process group contract: `../../AGENTS.md`.

## Module Work Rules

Workflow is a capability module inside `nodics.process`. Keep the internal split clear without creating nested runtime modules:

- place schemas and status definitions in `src/schemas` and `src/utils`;
- place validation, lifecycle, and runtime engine services in `src/service`;
- place routers, controllers, facades, and API projections in `src/router`, `src/controller`, and `src/facade`.

Do not place runtime code directly under `nodics.process/src`. The process group root is for composition, contracts, and shared defaults only.

Do not move or duplicate `nbpm` from Core without a dedicated migration plan and compatibility test.

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
