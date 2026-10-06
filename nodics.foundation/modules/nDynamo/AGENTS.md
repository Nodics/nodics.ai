# nDynamo Agent Contract

Private committed-revision read fences follow
[the owner sequence](llm/examples/property-read-fences.md). Keep acquisition
default-disabled, property commits fence-aware, first commits insert-only and
recovery bound to the exact original operation. No automatic expiry/takeover or
claim of destructive-operation completion or failover qualification is permitted.
Fences require `persistence.requireDurableJournal: true`; preserve that internal
protocol on every property read, insert, conditional commit and fence update.
Ordinary persistence remains configurable but cannot admit a destructive consumer.

This file gives AI coding agents mandatory guidance for this Nodics module or package boundary.

## Inheritance

- Follow the repository AGENTS contract: `../../AGENTS.md`.
- Follow global AI/development guidance: `../nSetup/llm/ai-enablement-index.md`.
- If a deeper child module has its own `AGENTS.md`, follow that file for changes inside the child module.

## Module Work Rules

- Durable properties follow [the persistence guide](llm/examples/durable-property-activation.md):
  explicit deployment opt-in, generated exact-revision storage, atomic embedded
  audit, array replacement, fail-closed restoration and no uncertain replay.
  Do not enable direct in-memory rollback when durable mode is selected.

- Preserve [revision-safe activation](llm/examples/revision-safe-activation.md):
  generated exact-revision claims and lifecycle evidence, no uncertain-outcome
  replay, no generic activation-request CRUD, and no invented historical audit
  when upgrading legacy requests. notBefore remains an earliest-time guard;
  optional bounded due dispatch is invoked by the existing CronJob scheduler.
  Reviewed `$propertyPatch` deletions persist absence markers. Rollback prepares
  a new approval request from recorded evidence. Evidence-only reconciliation
  may close a committed claim, but must never rerun its property mutation.

- Treat this directory as a layered Nodics module boundary when it contains `package.json`.
- Keep capabilities stable and make implementations replaceable through the module hierarchy.
- Do not hardcode project, environment, server, node, tenant, or customer behavior into reusable framework code.
- Put configurable behavior in layered configuration, schemas, routers, services, pipelines, data, and runtime governance.
- Update the concise `README.md`, canonical documentation content, `llm/contracts`, `llm/examples`, generated context, and tests whenever behavior or extension contracts change.
- Use `llm/contracts` for exact module-local AI/developer rules, `llm/examples` for approved patterns, and `llm/generated` for source-derived facts. Do not add a module-local llm README file; this `AGENTS.md` is the AI navigation and behavior entrypoint for the module.
- Generated files must be recreated from source definitions; do not hand-maintain generated artifacts as source of truth.
- Runtime `schemaConfiguration` may expose transaction eligibility, but
  nDatabase remains the validation and execution authority. Delegate validation
  to `DefaultDatabaseSchemaHandlerService`; do not duplicate transaction rules
  or database-provider logic in nDynamo.

Governance reports use the loader's effective artifact trace and member origins.
Preserve generated-before-authored order and inherited methods; do not infer a
method winner from the last contributing filename.

This capability contributes an inert model-service inventory for [governed Local reset](../nSystem/llm/contracts/local-reset.md).
Deployment selection, environment and tenant checks, confirmation and required services remain mandatory.

Route-category defaults belong to this capability; deployments supply only intentional overrides.
Preserve nRouter enforcement and independent route authorization. See [exposure ownership](../nRouter/llm/contracts/README.md#capability-owned-exposure-defaults).
