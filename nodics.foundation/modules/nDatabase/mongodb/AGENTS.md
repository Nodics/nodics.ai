# mongodb Agent Contract

Explicit offline disposable database reset delegates to the provider-owned
[Local maintenance contract](llm/contracts/local-reset-maintenance.md). Preserve
exact native scope, operator attestations, positive bounded inspection, drop
acknowledgement, empty readback and owned cleanup; never invoke it on startup.
Registered derived destinations require genuine protected read observations and
complete fresh durable-pin comparisons within the same private one-use invocation.
Do not broaden public prefix guards or accept copied/serialized admission proof.

This file gives AI coding agents mandatory guidance for this Nodics module or package boundary.

## Inheritance

- Follow the repository AGENTS contract: `../../../AGENTS.md`.
- Follow global AI/development guidance: `../../nSetup/llm/ai-enablement-index.md`.
- If a deeper child module has its own `AGENTS.md`, follow that file for changes inside the child module.

## Module Work Rules

- Provider read variants reuse `guardProtectedRead` and `projectReadResult` for
  the actual prepared receiver and original request. Authorization before query
  and current result privacy after query are independent requirements. Never
  deliver raw aggregate rows when the ordinary read owner would deny or redact.

- Offline installed-version migration uses
  `DefaultMongodbInstalledVersionMigrationService`, not startup reconciliation.
  Read its [contract](llm/contracts/installed-version-migration-contract.md).
  Require explicit scope/schema/index proof, bounded BSON evidence, verified
  parent-owned outage and acknowledged durable intent before every side effect.
  Never open another connection, import business schema names, infer target
  indexes, reopen writers or create a parallel execution journal here.
- Strict internal journals must qualify `model.persistenceCapabilities()` and
  select `internalPersistence: 'DURABLE_JOURNAL'` on both CAS and readback. Never
  forward caller-supplied write concern into ordinary CRUD or equate an ordinary
  readback with crash durability. See the durable journal section of the
  [provider contract](llm/contracts/README.md#internal-durable-journal-persistence).

- Index discovery failures must reject before a reconciliation plan is dispatched.
  Respect explicit `cleanOrphan: false`; await all replacement drops before any
  create starts. A failed drop prohibits creates. Inspection never invokes this
  mutation path. Preserve the independent deferred/failure regression tests.
- Versioned index reconciliation must reject installed non-versioned unique
  indexes before any plan runs. Preserve the _id exemption; ordinary schemas
  retain their behavior. Configuration activation is not migration authority.

- Treat this directory as a layered Nodics module boundary when it contains `package.json`.
- Keep capabilities stable and make implementations replaceable through the module hierarchy.
- Do not hardcode project, environment, server, node, tenant, or customer behavior into reusable framework code.
- Put configurable behavior in layered configuration, schemas, routers, services, pipelines, data, and runtime governance.
- Update the concise `README.md`, canonical documentation content, `llm/contracts`, `llm/examples`, generated context, and tests whenever behavior or extension contracts change.
- Use `llm/contracts` for exact module-local AI/developer rules, `llm/examples` for approved patterns, and `llm/generated` for source-derived facts. Do not add a module-local llm README file; this `AGENTS.md` is the AI navigation and behavior entrypoint for the module.
- Generated files must be recreated from source definitions; do not hand-maintain generated artifacts as source of truth.
- MongoDB transaction mechanics belong in this adapter; business modules see
  only the provider-neutral opaque context.
- Qualify transactions only on a replica set or sharded cluster. A standalone
  MongoDB process is not transaction-capable even when the driver exposes
  `startSession`.
- Preserve snapshot reads, majority plus journaled writes, bounded commit time, session
  cleanup, and session propagation to every operation.

Use the keyed boolean `schemaProperties` contract; preserve zero/false constraints
and reject malformed selections. See [constraint selection](llm/contracts/README.md#keyed-schema-constraints).

MongoDB owns the framework connection-name defaults: `masterLocal` and `testLocal`
under `database.default.mongodb.master/test.databaseName`. Local deployments
inherit them; later layers declare only deliberate differences. Keep separate
server and tenant databases where required for isolation. A default change must
not rename, migrate, delete or reconnect existing databases automatically.
