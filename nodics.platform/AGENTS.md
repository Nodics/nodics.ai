# Nodics Platform Agent Contract

## Inheritance

- Follow the repository AGENTS contract: `../AGENTS.md`.
- Follow global AI/development guidance:
  `../nodics.foundation/modules/nSetup/llm/ai-enablement-index.md`.
- If a child module has its own `AGENTS.md`, follow that file for changes
  inside the child module.

## Module Work Rules

- Follow the contracts exposed by `nodics.foundation`; do not duplicate its loader,
  lifecycle, configuration, security, or observability authorities.
- Keep this repository backend/API-only.
- Frontend clients own rendering and interaction. Documentation-content
  projects own authored content.
- The `installer` child module owns installed-runtime Application Builder
  backend capability contracts only. Keep the public first-machine bootstrap
  package in the separate `nodics.installer` repository so beginner `npx`
  setup still works before `nodics.ai` exists locally.
- Platform owns governed documentation import/projection and API delivery, not
  an external content project's source tree.
- BackOffice registration controls Axis representation and does not silently
  activate, deactivate, install, or remove runtime modules.
- Preserve tenant, environment, topology, permission, audit, cache-invalidation,
  compatibility, failure and recovery boundaries in every platform capability.
