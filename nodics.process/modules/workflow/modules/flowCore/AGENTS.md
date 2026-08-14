# Workflow Core Agent Guide

## Inheritance

- Follow the repository AGENTS contract: `../../../../../AGENTS.md`.
- Follow global AI/development guidance from `../../../../../nodics.foundation/modules/nSetup/llm/ai-enablement-index.md`.
- Follow the workflow capability contract: `../../AGENTS.md`.

## Module Work Rules

Use `flowCore` for backend-owned workflow behavior: validation, lifecycle, versioning, execution, retry, task, audit, and compensation services.

Do not place schema definitions here unless they are generated/derived test fixtures. Do not place routers/controllers/facades here.
