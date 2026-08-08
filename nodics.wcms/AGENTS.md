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
- Axis content baseline belongs here because it is CMS/WCMS data. Platform may
  authenticate and bootstrap Axis, but Platform must not own CMS page/component
  records.
- Do not hardcode project, server, tenant, or customer behavior into reusable
  WCMS modules. Use layered configuration and project overrides.
