# nTest AI Contracts

This folder contains module-specific AI/developer contracts for `nodics.foundation/modules/nTest`.

Use these files for rules that are more specific than root `AGENTS.md` and the module `AGENTS.md`, especially extension boundaries, override expectations, testing rules, security constraints, and generated-artifact responsibilities.

Generated schema/API/scenario/CRUD tests belong beneath the selected server's
`test/gen/<type>/<owning-module>/`. Preserve logical schema ownership in generated
content. The runner accepts `--server` with optional `--environment`, or explicit
`--root`; it does not sweep another server's output as selected-server evidence.
Framework validation reads its retained repository-build server. Missing output
fails with a build diagnostic; destructive test selection remains explicit.
