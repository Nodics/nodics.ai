# nService AI Contracts

This folder contains module-specific AI/developer contracts for `nodics.foundation/modules/nService`.

Use these files for rules that are more specific than root `AGENTS.md` and the module `AGENTS.md`, especially extension boundaries, override expectations, testing rules, security constraints, and generated-artifact responsibilities.

## Auth invalidation observability

- Auth token invalidation callbacks may publish logs, audit records, or
  cluster events only with sanitized context: reason code, tenant, enterprise,
  principal identifier, source module, and token type.
- Do not log, audit, or publish bearer tokens, refresh tokens, API keys, auth
  cache keys, or derived token keys.
- Project modules may override invalidation publishing, but must preserve the
  credential-free observability contract and fail-safe cache callback behavior.

## Module topology registry

- `DefaultModulesConfigurationService` is the singleton authority for effective
  module, server, and node topology in one runtime process.
- `ModuleConfiguration` remains an independently constructed descriptor type;
  it is not the registry authority.
- Registry refresh must validate into an isolated candidate and replace active
  state atomically. Failed refresh must preserve the last valid registry.
- Later modules customize normalization or descriptor creation through exported
  service members, without restoring a `src/lib` container or parallel state.
