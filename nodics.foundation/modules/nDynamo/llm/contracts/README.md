# nDynamo AI Contracts

This folder contains module-specific AI/developer contracts for `nodics.foundation/modules/nDynamo`.

Use these files for rules that are more specific than root `AGENTS.md` and the module `AGENTS.md`, especially extension boundaries, override expectations, testing rules, security constraints, and generated-artifact responsibilities.

Governance artifact reports consume loaded registries and their existing
`xNodics.overrideTrace`/`memberOrigins`. Never reconstruct runtime precedence by
scanning generated files underneath a later server module. `finalSourceModule`
is the latest artifact contributor; `memberOrigins` identifies an inherited or
replaced method's contributor. Source paths identify contributions, not a transfer
of capability ownership. Do not serialize functions or configuration secrets.
