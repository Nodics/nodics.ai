# Nodics Process Agent Contract

## Inheritance

- Follow the repository AGENTS contract: `../AGENTS.md`.
- Follow global AI/development guidance:
  `../nodics.core/modules/nSetup/llm/ai-enablement-index.md`.
- Follow the coding and customization contract before moving workflow source,
  adding process APIs, or enabling the visual designer.

## Module Work Rules

- Treat `nodics.process` as the functional module group for business process
  and workflow capability.
- Do not move domain business actions into this module. Domain modules own
  their commands, validation, side effects, and compensation; Process owns
  reusable orchestration, definition, state, task, audit, retry, and designer
  governance.
- Do not move `nbpm` out of Core until the migration contract proves runtime
  compatibility, service load order, data import, API exposure, and fresh
  bootstrap behavior.
- Axis process pages must consume BackOffice capability metadata and
  process-owned APIs. Axis must not maintain a second workflow registry,
  calculate process state, or persist workflow definitions directly.
- Visual workflow design must persist a backend-validated definition model.
  The browser graph is only an editor projection.

## Verification

Run:

```bash
npm test
```
