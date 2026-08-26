# installer

`installer` is the platform runtime module for installed Nodics workspaces. It
creates the backend home for future Application Builder APIs and future Axis
operator screens.

The separate `nodics.installer` repository remains the public first-machine
bootstrap package. Beginners still use that repository through:

```bash
npx github:Nodics/nodics.installer
```

## Scope Contract

Phase 1 API scope is frozen in
[llm/contracts/installer-api-scope-contract.md](llm/contracts/installer-api-scope-contract.md).
Do not implement APIs outside that contract without updating the action ledger
first.

## Responsibilities

- Publish client-safe BackOffice capability metadata for future Axis discovery.
- Publish a bounded operation catalog for installed-runtime setup operations.
- Expose Phase 1 read-only APIs for discovery, workspace status, inventory,
  preflight, setup planning, and redacted evidence reads.
- Protect `nodics.ai` and `nodics.axis` as vendor-owned repositories in
  customer workspaces.

## Explicit Exclusions

- No replacement for the standalone `nodics.installer` repository.
- No frontend source or Axis browser implementation.
- No shell execution from runtime in this first slice.
- No npm or `npx` package identity changes.
- No new business descriptor such as `nodics.solution.json`.
- No Application Builder authority based on `nodics.project.json`.

## Future API Shape

Phase 1 operations are read-only:

- `GET /nodics/installer/v0/info`
- `GET /nodics/installer/v0/operations`
- `POST /nodics/installer/v0/workspace/status`
- `POST /nodics/installer/v0/workspace/inventory`
- `POST /nodics/installer/v0/workspace/preflight`
- `POST /nodics/installer/v0/setup/plan`
- `POST /nodics/installer/v0/evidence/read`

Mutating operations such as repair, backup, rollback, update-vendors, start, or
initialize should require explicit permissions, environment allowlists,
idempotency controls, bounded command execution, audit records, and sanitized
evidence.
