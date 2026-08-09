# Nodics Process Agent Contract

## Inheritance

- Follow the repository AGENTS contract: `../AGENTS.md`.
- Follow global AI/development guidance:
  `../nodics.core/modules/nSetup/llm/ai-enablement-index.md`.
- Follow the coding and customization contract before moving workflow source,
  adding process APIs, or enabling the visual designer.
- Read `llm/contracts/process-module-contract.md` and
  `llm/contracts/process-ownership-and-designer-contract.md` before changing
  Process ownership, Process/Cron topology, runtime APIs, trigger behavior,
  Axis process pages, or visual designer behavior.

## Module Work Rules

- Treat `nodics.process` as the functional module group for business process
  and workflow capability. It is a module group like `nodics.platform` and
  `nodics.core`, not a direct runtime implementation module.
- Runtime source must live under child modules. The first standard capability
  is `modules/workflow`, which composes:
  - `modules/workflow/modules/flowSchema` for schemas and status definitions;
  - `modules/workflow/modules/flowCore` for validation, lifecycle, and engine
    services;
  - `modules/workflow/modules/flowApi` for routers, controllers, and facades.
- Do not place runtime source directly under `nodics.process/src`.
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
- Runtime topology may compose `nodics.process` with `nodics.cron` in a shared
  process/automation server. This does not transfer scheduled-job ownership
  into Process; Cron remains the owner of job definitions, triggers, scheduler
  state, and execution lifecycle.
- Visual workflow design must persist a backend-validated definition model.
  The browser graph is only an editor projection.

## Verification

Run:

```bash
npm test
```
