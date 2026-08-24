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
