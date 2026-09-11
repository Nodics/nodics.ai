# database AI Contracts

This folder contains module-specific AI/developer contracts for `nodics.foundation/modules/nDatabase/database`.

Use these files for rules that are more specific than root `AGENTS.md` and the module `AGENTS.md`, especially extension boundaries, override expectations, testing rules, security constraints, and generated-artifact responsibilities.

## Managed-counter contract

- Opt in through effective `backoffice.concurrency: { managed: true, field: 'revision' }`.
  The declared field must be `int` or `long`; `versionId` and versioned schemas
  are rejected. No automatic ownership inference from property names.
- Create initializes at 1. Update/save-existing/delete require the original
  nonnegative integer token, from the query or original model. Query takes
  precedence. Defaults cannot manufacture a missing edit token.
- Generated writes require a scalar primary-key selector, preserve ownership
  filters and tenant-resolved model selection, and delegate to provider
  `compareAndSetItem`. Reject update operators and dotted paths. Do not bypass
  access, validation, reference integrity, or transaction-context enforcement.
- Compare-and-set returns the persisted record. A missing match is 409;
  missing edit token is 428; malformed/unsupported requests are 400.
- Legacy records without a counter use original token 0 and an atomic
  missing-field predicate. Never reset a populated counter.
- Unchanged business fields do not increment the counter or emit post-write
  mutation effects. Audit timestamps alone are not business changes.
- This is single-record optimistic concurrency, not a multi-record transaction.
  Audit all generated and domain writes before migrating a schema. Domain-owned
  counters, operational observations and nPublish keep their own authorities.
- Tests: `test/modelConcurrencyContract.test.js` and the MongoDB adapter's
  `test/mongodbManagedConcurrencyContract.test.js`.

## Transaction contract

- Use `DefaultDatabaseTransactionService`, never a driver session in business code.
- Pass the opaque context unchanged through generated service requests.
- Keep all records in the same resolved module/tenant database.
- Fail closed when `multiRecordAtomic` is absent.
- Prove commit, abort, expired context, wrong database, concurrency conflict,
  and live-provider topology before activation.

## Reference-integrity contract

- The source schema's effective `refSchema` is the relationship authority.
- Use `onTargetDelete: 'RESTRICT'` to prevent deletion of a referenced target.
- Enforce the rule in the shared generated remove lifecycle, never in Axis or
  a Workbench-only persistence path.
- Fail closed when an explicitly declared source cannot be validated.
- Preserve tenant context and configured relationship/record bounds.
- Keep conflict responses client-safe; never expose database queries, records,
  tokens, credentials, contexts, or stacks.
- A distributed replacement may use remote checks or a governed reference
  index, but must not become a separately managed relationship authority.
- Do not implement cascade implicitly. Use a module-owned business operation
  with explicit transaction or compensation semantics.

## Schema Workbench discovery contract

- Discover every eligible effective model with generated Search, Read, Create,
  Update, and Delete by default.
- Continue filtering descriptors through schema access groups and employee
  authorization.
- Exclude non-model schemas and models declaring `backoffice.enabled: false`.
- Use explicit per-schema operations to narrow models that must be read-only.
- Project only safe fields; never expose secrets, access policy internals,
  service configuration, database configuration, interceptors, or validators.
- Keep bulk operations disabled unless `backoffice.bulkOperations` explicitly
  enables a supported operation.
- Require the manage permission, configured item bound, and valid idempotency
  key for every generic bulk mutation; execute through generated CRUD.
- Derive delete impact from effective inbound `RESTRICT` relationships and
  fail closed when a declared source cannot be inspected.
- Advertise concurrency only from an effective revision field. Never infer it
  from timestamps or browser state.
- Keep aggregate service/method names private. The generic endpoint delegates
  to an owning module service and never becomes a second unit-of-work engine.
- Use `DefaultDatabaseTransactionService` for supported same-database atomic
  work and an owning Workflow or saga for cross-module consistency.

## Named schema-policy composition

- Reusable access/ownership defaults live in layered `schemaPolicies`.
- Namespace policies under the schema-owning module.
- Schemas reference stable policy names through `schemaPolicies`.
- Materialize policies before inheritance; final `accessGroups` and
  `ownership` remain the only runtime enforcement contract.
- Use keyed booleans for ownership collections: `true` includes and `false`
  removes an inherited entry.
- Reject unknown policy names and never call policy configuration directly
  from CRUD, authorization, ownership, Workbench, or frontend code.
