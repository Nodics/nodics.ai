# Contributing to Nodics

Before changing code, read `AGENTS.md` from root-to-leaf and then the nearest
module `README.md`, `AGENTS.md`, and contract files under `modules/nSetup/llm`.

## Partner and maintainer authority

The [customer project contract](../nodics.foundation/modules/nSetup/llm/contracts/customer-project-mode-contract.md)
applies to every partner implementation. Partners write only to customer-owned
repositories and submit reusable framework or accelerator proposals through the
separate Nodics contribution/request channel agreed for their engagement.
Nodics owns review, generalization, implementation and release. This contributing
guide does not grant a partner write access to `nodics.ai` or permission to patch
installed framework source. Framework changes require an authorized Nodics
maintainer scope.

## Pre-implementation readiness

Every change must answer:

1. Which module owns this behavior?
2. Is this configuration-only, customization, extension, or new framework code?
3. Which public API, service, data, documentation, and test contracts are
   affected?
4. What is the smallest safe validation that proves the change?

## Coding expectations

- Keep exports customizable where practical.
- Prefer framework defaults in framework modules and light overrides at project,
  environment, server, or node level.
- Do not put status definitions, error codes, APIs, schemas, docs, or runtime
  properties in the wrong folder merely because it is convenient.
- Keep the root `package.json` focused on repository-level commands.

## Required checks

Run the relevant focused tests first. Before release or handoff, refresh AI
context with `npm run llm:generate` when contracts or module metadata changed,
then run the configured validation gates such as syntax, copyright,
documentation governance, ownership governance, AI validation, and runtime
acceptance checks.
