# Nodics Process Agent Contract

## Inheritance

- Follow the repository AGENTS contract: `../AGENTS.md`.
- Follow global AI/development guidance:
  `../nodics.foundation/modules/nSetup/llm/ai-enablement-index.md`.
- Follow the coding and customization contract before moving workflow source,
  adding process APIs, or enabling the visual designer.
- Read `llm/contracts/process-module-contract.md` and
  `llm/contracts/process-ownership-and-designer-contract.md` before changing
  Process ownership, workflow/cronjob topology, runtime APIs, trigger behavior,
  Axis process pages, or visual designer behavior.

## Module Work Rules

- Treat `nodics.process` as the functional module group for business process
  and workflow capability. It is a module group like `nodics.platform` and
  `nodics.foundation`, not a direct runtime implementation module.
- Runtime source must live under child modules. Standard capabilities are
  `modules/workflow` for process/workflow behavior and `modules/cronjob` for
  scheduled-job behavior.
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
- Runtime topology may host both `workflow` and `cronjob` in the same
  process/automation server by loading `nodics.process`. This does not merge
  module authority: `workflow` owns process definitions and instances, while
  `cronjob` owns job definitions, schedules, scheduler state, and execution
  lifecycle.
- Visual workflow design must persist a backend-validated definition model.
  The browser graph is only an editor projection.

## Verification

Run:

```bash
npm test
```
