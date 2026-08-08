# Process Migration Audit

## Current source inventory

- Current modular framework contains `nodics.core/modules/nbpm`.
- Legacy archive contains a broader workflow family under:
  - `gFramework/nbpm`
  - `gCore/workflow/flowSchema`
  - `gCore/workflow/flowCore`
  - `gCore/workflow/flowApi`

## Interpretation

`nbpm` is already active as a Core framework workflow/process capability. It
handles generic workflow-to-schema lifecycle integration, source data builders,
activity interceptors, workflow events, and local/remote initialization.

The archived workflow family is a richer process/workflow runtime source that
should be migrated into `nodics.process` only through focused slices:

1. schema and status vocabulary;
2. definition validation service;
3. read-only API contracts;
4. draft definition CRUD;
5. publish/suspend/archive lifecycle;
6. instance runtime and task lifecycle;
7. Axis visual designer integration;
8. import/sample process packs;
9. compatibility and migration tests.

## No blind move rule

Do not physically move `nbpm` out of Core or copy legacy workflow modules into
`nodics.process` as a bulk operation. That would risk breaking the current
runtime graph, service override order, generated schema contracts, and fresh
bootstrap acceptance. Each migration slice must prove:

- module load order;
- schema/API compatibility;
- service override/customization path;
- data import behavior;
- BackOffice metadata validation;
- Axis route guarding;
- fresh database bootstrap;
- repeat bootstrap;
- rollback safety.
