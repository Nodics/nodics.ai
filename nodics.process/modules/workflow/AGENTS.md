# Workflow Agent Guide

Approval is access-rights based. The requesting human may also claim and approve
when the current tenant, enterprise and required permissions allow it. Do not
restore a same-user exclusion or special-case the login name `admin`. Keep native
requester provenance, decision actor, immutable workflow identity and audit checks.
See `llm/contracts/workflow-runtime-governance.md#public-task-decision-projection`.

Keyed trigger commands reuse `DefaultProcessTriggerCommandReceiptService` and
the same private Process command journal as tasks. Trigger creation is insert-only;
update/archive require exact observed-state CAS, acknowledged single match and
fresh readback before success. Preserve explicit native manage/execute grants,
original inputs and no uncertain replay. Trigger metadata does not own scheduling.

Keyed human task mutations use `DefaultProcessTaskCommandReceiptService` and the
existing nDatabase original-command journal. Never silently drop a malformed key,
infer an original acknowledgement from current task state or replay a decision.
Unkeyed native behavior remains unchanged. Assignment, like claim/completion and
cancellation, needs exact current task CAS and acknowledged uncached readback.
Receipt inspection rechecks the native command permission and original actor scope;
new-recording shutdown must not enable replay or remove authorized inspection.

ATTEMPTS history may include an exact validated `instanceCode`. Bind it in the
generated query and reject any returned row outside that identity. This narrows
inspection only; it never authorizes start, claim or retry. Legacy history rejects
this filter rather than silently ignoring it.

Remote target history is bounded and service-token-only. Legacy mode reads the
latest action per instance; ATTEMPTS mode reads private Process-owned execution
evidence across pinned versions, without backfill. Bind module and deployment scope before
querying, reject missing persistence acknowledgements and never claim or replay
an action during a read. Generated services require `pageSize`/`pageNumber`, not
raw database `limit`/`skip`. Recorded actions require exact begin/claim/terminal
acknowledgements. Never overwrite expired active handles or resend a recorded
terminal action on the same instance. The instance CAS remains execution authority;
history is a conservative projection, not a recovery credential. Run both remote
adapter and inspection tests. Read the recorded lifecycle in `llm/contracts/README.md`.

Source-owned review retirement is separately default-disabled. Preserve signed
source/context ownership, exact task/instance CAS, private marker admission and
same-closure recovery. Never steal remote actions or cancel a completed competing
decision. Generic persistence fences retired records; activation and cross-owner
acceptance remain separate. See the source-owned retirement contract.
Historical source attempts retain their original context/instance; Process never
selects application history. A completed task is a read-only competing outcome
even after instance advancement. Preserve immutable execution identity and reject
generic upserts/update pipelines that evade retirement fences.

Service-owned starts remain default-disabled, explicitly allowlisted and scoped
to the published domain owner/version. Preserve existing start/replay and
immutable task actor policy; never substitute human credentials for a service
principal. See `llm/contracts/README.md#service-owned-starts-and-human-review`.

Explicit allowed action strings can resolve remote declarations from discovered
inactive owners through the existing action registry. Keep the allowlist and
remote targets deployment-owned; do not copy owner definitions into Process or
activate a domain just to read them. See `llm/contracts/README.md`.
The deployment must include each selected inactive owner's group in its existing
`runtimeModuleRoots` discovery metadata. A remote identity grant or allowed action
string does not discover source declarations. Verify the real prepared graph,
not only a mocked owner lookup, and keep the remote owner inactive.

Preserve create-only start persistence and exact original-input replay evidence.
The trusted preSave hook must retain exact insert-only identity constraints;
do not append update-only retirement predicates to atomic creation. Update/remove
hooks always retain their retirement fence even if input includes insertOnly.
Never re-enter nodes on start retry or infer start identity from mutable context.
Incomplete or historical unverified starts require inspection, not overwrite.
Claim responses bind the stored definition/version as well as the execution.

Definition contribution owner changes require the exact provenance adoption
contract in `llm/contracts/README.md`. Never relabel installed history, accept
request-supplied transition authority or overwrite immutable versions. Domain
authoring and customer reviewer policy remain separate from Process installation.

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
