# installer

`installer` is the platform runtime module for installed Nodics workspaces. It
owns Application Builder planning and the optional reversible Local build
used by Axis.

The separate `nodics.installer` repository remains the public first-machine
bootstrap package. Beginners still use that repository through:

```bash
npx github:Nodics/nodics.installer
```

## Scope Contract

The current API scope is frozen in
[llm/contracts/installer-api-scope-contract.md](llm/contracts/installer-api-scope-contract.md).
Do not implement APIs outside that contract without updating the action ledger
first.

Detailed module documentation is maintained in
[../../../nodics.platform/modules/installer/data/docs-v003/records/documentation/installerDocumentationComponentData.js](data/docs-v003/records/documentation/installerDocumentationComponentData.js).

## Responsibilities

- Publish client-safe BackOffice capability metadata for Axis discovery.
- Publish a bounded operation catalog for installed-runtime setup operations.
- Expose read-only APIs for discovery, workspace status, inventory,
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

## Current API Shape

The default operations are read-only:

- `GET /nodics/installer/v0/info`
- `GET /nodics/installer/v0/operations`
- `POST /nodics/installer/v0/workspace/status`
- `POST /nodics/installer/v0/workspace/inventory`
- `POST /nodics/installer/v0/workspace/preflight`
- `POST /nodics/installer/v0/setup/plan`
- `POST /nodics/installer/v0/evidence/read`

The separately selected Local workflow exposes
`POST /nodics/installer/v0/builds/{prepare|generate|read|rollback}`. It reviews
and generates a real nTooling project, then reverses only the unchanged output.
The runtime retains the receipt and audit transitions under its private
temporary directory. Kickoff Local supplies the trusted experience workspace
through `NODICS_LOCAL_BUILDER_EXPERIENCE_ROOT`. Generation does not install,
start, deploy, or qualify the resulting application.

Mutating operations such as repair, backup, rollback, update-vendors, start, or
initialize should require explicit permissions, environment allowlists,
idempotency controls, bounded command execution, audit records, and sanitized
evidence.

Route-category defaults belong to this capability; deployments supply only intentional overrides.
Preserve nRouter enforcement and independent route authorization. See [exposure ownership](../../../nodics.foundation/modules/nRouter/llm/contracts/README.md#capability-owned-exposure-defaults).

## Read-only qualification

Read-only qualification: nRouter owns the module/API prefix; installer route keys are relative, while the public operation catalogue retains canonical API routes. Runtime permissions use the existing secured-request authority and verified human Profile claims, including its restricted Platform full-access semantics. Never restore a parallel exact-permission or request-body grant authority. Installer failures have stable client-safe HTTP/error outcomes, never HTTP200 SUC with FAILED status or raw filesystem messages. Defaults and planning presentation belong to installer/config/properties.js. Workspace selections come only from layered configuration; do not read process environment in services or allow a request to authorize its own roots. Resolve symlinks before containment and bound evidence before reading; redact incomplete private-key prefixes. Preflight observes loopback TCP reachability without binding or shell commands; REFUSED is an observation, not a future availability certificate. Axis consumes the owner-qualified native planning descriptor and copy. Form, actor, scope and owner changes retire results. A dry-run plan is not execution, deployment qualification or a rollback receipt. The scoped Local build is governed separately; general repair and lifecycle writers remain reserved.

Regression: `npm test` covers route composition, authorization, containment,
bounded evidence, observed ports, and Local generation and reversal against
the exact retained output.
