# Nodics WCMS Agent Contract

## Inheritance

- Follow the repository AGENTS contract: `../AGENTS.md`.
- Follow global AI/development guidance:
  `../nodics.core/modules/nSetup/llm/ai-enablement-index.md`.
- If a child module has its own `AGENTS.md`, follow that file for changes
  inside the child module.

## Module Work Rules

- `nodics.wcms` extends `nodics.core` directly; do not depend on `nodics.platform`
  for content schemas, publication, delivery, or authoring workflows.
- Keep Platform BackOffice as the control plane. WCMS owns content-management
  data, routes, pages, templates, slots, renderer mappings, delivery, and
  publication behavior.
- Axis product documentation and Axis-specific backend-importable data belong
  to the backend `axis` module under `nodics.platform`. WCMS remains the CMS
  schema, persistence, validation, delivery, publication, and authoring
  authority for those records after governed import.
- Generic WCMS baseline content belongs here only when it describes or
  bootstraps WCMS-owned capability rather than Axis product experience.
- Do not hardcode project, server, tenant, or customer behavior into reusable
  WCMS modules. Use layered configuration and project overrides.
