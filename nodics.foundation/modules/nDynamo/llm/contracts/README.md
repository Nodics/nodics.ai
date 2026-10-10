# nDynamo AI Contracts

Activation decisions and claims use acknowledged exact-revision updates with
their lifecycle evidence in the same record. The policy requires the persisted
ACTIVATING actor and revision before owner execution. Never retry an uncertain
claim or completion automatically. See the
[activation lifecycle and migration guide](../examples/revision-safe-activation.md).
Opt-in [durable property activation](../examples/durable-property-activation.md)
adds atomic override/audit storage and startup/event refresh. Request-state CAS
is not an all-node transaction. Optional due dispatch uses CronJob, not a new
scheduler. Path removal and rollback require a new reviewed durable commit;
uncertain activation can reconcile only from exact stored evidence. Distributed
live acceptance remains separate; preserve the documented deployment opt-ins.

This folder contains module-specific AI/developer contracts for `nodics.foundation/modules/nDynamo`.

Use these files for rules that are more specific than root `AGENTS.md` and the module `AGENTS.md`, especially extension boundaries, override expectations, testing rules, security constraints, and generated-artifact responsibilities.

Governance artifact reports consume loaded registries and their existing
`xNodics.overrideTrace`/`memberOrigins`. Never reconstruct runtime precedence by
scanning generated files underneath a later server module. `finalSourceModule`
is the latest artifact contributor; `memberOrigins` identifies an inherited or
replaced method's contributor. Source paths identify contributions, not a transfer
of capability ownership. Do not serialize functions or configuration secrets.

## Offline Report Target Selection

`DefaultGovernanceReportGeneratorService` reuses nTooling's argument normalizer,
project server resolver and module-root resolver. Framework-root invocation uses
the existing persistent repository-build composition. Visit each resolved root
once: the composition already declares Foundation and must not rediscover it or
the non-runtime framework repository recursively. Do not add a second topology
scanner, command registry or configuration loader.

Explicit environment/server/node arguments override inherited selection. Bind
the resolved server/environment during nConfig preparation and restore process
selection in `finally`, including failure. Missing/unknown project targets and
duplicate target options must fail. Keep server-owned output and effective loader
traces. Reporting may call `prepareBuild`, `initUtilities` and `loadModules`, not
runtime start, entity/provider initialization, data import or database operations.
Module/pre-script hooks must preserve the existing generation-only build contract.
Focused target and failure tests remain in the already registered
`test/governanceReportMaturityMatrix.test.js` entry.
