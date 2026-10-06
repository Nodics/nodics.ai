# cronjob Agent Contract

This file gives AI coding agents mandatory guidance for this Nodics module or package boundary.

## Inheritance

- Follow the repository AGENTS contract: `../../AGENTS.md`.
- Follow global AI/development guidance: `../../../nodics.foundation/modules/nSetup/llm/ai-enablement-index.md`.
- If a deeper child module has its own `AGENTS.md`, follow that file for changes inside the child module.

## Module Work Rules

- Treat this directory as a layered Nodics module boundary when it contains `package.json`.
- Keep capabilities stable and make implementations replaceable through the module hierarchy.
- Do not hardcode project, environment, server, node, tenant, or customer behavior into reusable framework code.
- Put configurable behavior in layered configuration, schemas, routers, services, pipelines, data, and runtime governance.
- Update the concise `README.md`, canonical documentation content, `llm/contracts`, `llm/examples`, generated context, and tests whenever behavior or extension contracts change.
- Use `llm/contracts` for exact module-local AI/developer rules, `llm/examples` for approved patterns, and `llm/generated` for source-derived facts. Do not add a module-local llm README file; this `AGENTS.md` is the AI navigation and behavior entrypoint for the module.
- Generated files must be recreated from source definitions; do not hand-maintain generated artifacts as source of truth.

This capability declares an inert model-service inventory for [governed Local reset](../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.

New job target execution requires current operational admission. Forward the authenticated runtime principal to Process; preserve already-running job completion/recovery on business deactivation.

Runtime state writes belong to `DefaultCronJobRuntimeService.persistRuntimeState`.
Only owner-created wrapper identities may use canonical system identity for the
fixed bookkeeping fields. Never pass this identity to Process/domain actions,
accept a caller-created wrapper, or allow definition/activation edits through it.
Keep tenant/code/node predicates and require an exact update acknowledgement.

Process handoff preserves configured business context but Cron owns `source`,
`cronJobCode`, `cronJobTenant`, `scheduledExpression` and `firedAt`. Apply those
trusted values last; configured context must not forge scheduler provenance or
change the verified principal. These metadata values are never authorization.

Inactive schedule provisioning is owned by `DefaultCronJobScheduleDraftService`.
Read `llm/contracts/inactive-schedule-drafts.md` before changing its APIs or Axis
renderer. Deployment targets, scoped review, insert-only persistence, exact
acknowledgements and non-replaying inspection are mandatory. A saved draft is
not a qualified Process trigger, source assignment or activated schedule.
Optional source bindings are inert, exact policy-fingerprint associations. Validate
them against approved Process context; never treat them as a source grant or an
activation receipt. Source-aware Axis surfaces must exclude unbound/stale choices.
