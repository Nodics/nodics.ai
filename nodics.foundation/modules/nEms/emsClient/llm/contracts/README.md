# emsClient AI Contracts

This folder contains module-specific AI/developer contracts for `nodics.foundation/modules/nEms/emsClient`.

Use these files for rules that are more specific than root `AGENTS.md` and the module `AGENTS.md`, especially extension boundaries, override expectations, testing rules, security constraints, and generated-artifact responsibilities.

## Live Smoke Admission

The active publisher smoke requires direct script execution with `--require-live`
outside Node's test-runner context. Importing it or discovering it with
`node --test` must not load nConfig, start a runtime, access providers or run
cleanup. Deployment environment variables do not authorize execution. Keep this
test excluded from safe suite discovery; its owner-local guard regression uses
isolated doubles and a dependency-denying child, never the enabled live path.
