# installer Agent Contract

## Inheritance

- Follow the root Nodics contract: `../../../AGENTS.md`.
- Follow the `nodics.platform` group contract: `../../AGENTS.md`.
- Follow global guidance from `../../../nodics.foundation/modules/nSetup/llm/ai-enablement-index.md`.

## Capability Boundary

- `installer` is the installed-runtime Application Builder capability under
  `nodics.platform`.
- Before adding or changing APIs, read
  `llm/contracts/installer-api-scope-contract.md` and the matching action
  ledger under `actionsRepo/installer-application-builder`.
- Keep the public first-machine bootstrap package in the separate
  `nodics.installer` repository. Do not move or delete that repository just
  because this runtime module exists.
- This module may expose secured backend APIs later for status, inventory,
  preflight, support-bundle, repair, and other governed local-workspace
  operations after Nodics already exists locally.
- Phase 1 APIs are active only for read-only discovery, workspace readiness,
  dry-run setup planning, and redacted evidence reads.
- This module does not own npm package identity, `npx` bootstrap behavior,
  repository download before first clone, framework runtime loading, Axis
  frontend source, or customer project customization.
- Mutating operation APIs must remain disabled until permission checks,
  workspace allowlists, evidence writing, secret redaction, audit events, and
  vendor-repository protections are implemented and tested.

## Axis Boundary

- Axis may render a future Application Builder UI from this module's BackOffice
  capability metadata.
- Keep navigation and lifecycle actions hidden until the backend API contract is
  implemented.
- Do not place frontend components, browser bundles, static rendering, or
  executable UI code in this module.

## Safety Rules

- Keep Phase 1 APIs read-only unless the scope contract and action ledger are
  explicitly updated first.
- Never execute shell commands from this module without an explicit governed
  API contract and test coverage.
- Never mutate `nodics.ai` or `nodics.axis` for a customer-specific setup.
- Never create `nodics.solution.json` or make `nodics.project.json` the
  Application Builder source of truth.
- Preserve the standalone `npx github:Nodics/nodics.installer` path for
  beginners who do not yet have Nodics locally.
