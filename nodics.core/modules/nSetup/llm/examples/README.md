# nSetup AI Examples

This folder contains examples that help AI agents and developers work correctly inside Nodics module, project, provider, environment, server, node, tenant, and runtime-governance boundaries.

Prefer small examples that show proper layered customization, configuration overrides, service extension, schema/router changes, tests, and documentation updates without modifying unrelated Nodics code.

## Examples

- [Adding A New Nodics Feature](adding-new-feature.md)
- [Creating A New API](creating-new-api.md)
- [Creating Or Changing A Schema](creating-or-changing-schema.md)
- [Adding A Provider Implementation](adding-provider-implementation.md)
- [Creating A Scheduled Job](creating-scheduled-job.md)
- [Changing Runtime Configuration](changing-runtime-configuration.md)
- [Modularization Refactor Correction Case Study](modularization-refactor-correction-case-study.md)

Each example follows the same contract:

1. Pass the Nodics what / where / how gate.
2. Decide the owner before writing code.
3. Use the smallest layer that can own the behavior.
4. Put configuration in `config/properties.js`.
5. Put stable statuses, reason codes, lifecycle states, and error definitions
   in `src/utils/statusDefinitions.js`.
6. Put source behavior in loader-visible `src/service`, `src/facade`,
   `src/controller`, `src/router`, `src/schemas`, `src/pipelines`,
   `src/interceptors`, `src/event`, or `src/utils` paths.
7. Change source definitions, then regenerate generated artifacts.
8. Prove default behavior and project override behavior where customization is
   part of the contract.
9. Update module README, public docs, and generated LLM context when behavior
   or extension guidance changes.
