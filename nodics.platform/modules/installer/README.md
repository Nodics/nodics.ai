# installer

`installer` is the platform runtime module for installed Nodics workspaces. It
creates the backend home for future Application Builder APIs and future Axis
operator screens.

The separate `nodics.installer` repository remains the public first-machine
bootstrap package. Beginners still use that repository through:

```bash
npx github:Nodics/nodics.installer
```

## Responsibilities

- Publish client-safe BackOffice capability metadata for future Axis discovery.
- Publish a bounded operation catalog for installed-runtime setup operations.
- Keep API execution disabled until secured routes, permissions, evidence,
  audit, redaction, and vendor-boundary tests exist.
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

The first safe operations should be read-only:

- workspace status;
- workspace inventory;
- preflight readiness;
- support-bundle planning.

Mutating operations such as repair, backup, rollback, update-vendors, start, or
initialize should require explicit permissions, environment allowlists,
idempotency controls, bounded command execution, audit records, and sanitized
evidence.
