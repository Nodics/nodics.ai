# Workflow API Agent Guide

## Inheritance

- Follow the repository AGENTS contract: `../../../../../AGENTS.md`.
- Follow global AI/development guidance from `../../../../../nodics.core/modules/nSetup/llm/ai-enablement-index.md`.
- Follow the workflow capability contract: `../../AGENTS.md`.

## Module Work Rules

Use `flowApi` for routers, controllers, facades, API help metadata, route security, and BackOffice-facing API projection.

Do not implement business process lifecycle rules directly in controllers or facades. Delegate to `flowCore`.
