# vService AI Contracts

This folder contains module-specific AI/developer contracts for `nodics.foundation/modules/nService/vService`.

Use these files for rules that are more specific than root `AGENTS.md` and the module `AGENTS.md`, especially extension boundaries, override expectations, testing rules, security constraints, and generated-artifact responsibilities.

## Managed Mutation Delegation

The effective save/update pipeline retains its original permission, ownership,
validation and response contracts. For nonversioned schemas declaring
`backoffice.concurrency.managed: true`, the vService persistence nodes delegate
to the existing `DefaultModelConcurrencyService`. That owner validates original
tokens, selects provider-atomic CAS, initializes creates and advances changed
records. Unchanged saves retain their revision and skip base post-save effects.
This applies to internal generated-service calls as well as controller calls.

Versioned schemas keep `saveVersionedItems`/`updateVersionedItems`; unmanaged
schemas keep ordinary provider methods. Later layers may replace the effective
concurrency service without changing this delegation boundary. Never introduce
domain-side revision arithmetic, bypass ACL middleware or weaken receipt/CAS
checks to compensate for an override that skipped the concurrency owner.

`test/managedMutationLayerContract.test.js` composes base and variant handlers
and resolves the configured persistence nodes. It covers managed create/update,
stale rejection, unchanged saves, ordinary/versioned selection, provider CAS
and extension error envelopes with in-memory collection IO. A bounded discovery
fixture also runs the actual startup `loadServices` composition and checks
member provenance plus save/update CAS after the variant loads. The opt-in
`NODICS_MONGODB_TEST_URI` case uses the same startup composition and real MongoDB
provider against a new UUID-named temporary database, dropped in cleanup. It
proves revision advancement, no-op/stale behavior and a competing-write CAS miss.
It never selects an application database. This is not application recovery
qualification; existing failed writes require the owning domain's evidence-based
recovery before retry.

## Versioned Read Selection

The effective source schema owns `versionedReadMode`. Omitted mode or `HISTORY`
preserves ordinary provider reads. `CURRENT` requires versioned persistence and
`getCurrentVersionItems`; missing capability or any other mode rejects before
cache lookup. A request cannot override this selection. The base get service
owns the complete response pipeline; this variant overrides only
`resolveReadMethod`. Existing permission, ownership, tenant, population and cache
steps remain in their original owner.

In CURRENT mode, a top-level scalar `query.versionId` selects exact history and
must be a nonnegative safe integer. Other versionId shapes reject. All other
queries filter the current-record view, not historical matches; a nested version
predicate does not request a historical view. Exact lookups retain all other
query constraints. Latest authoring is not approved or Online publication.

Schema activation requires installed-data/index qualification and invalidation of
old query caches. Product currently disables these caches, but other adopters
must qualify their effective cache lifecycle. No existing schema is opted in by
this extension. Later layers may override read selection while preserving the
owner's explicit policy, authorization and exact-version contract.

Run `test/versionedReadResponseContract.test.js` for default/override behavior,
pre-cache denial, immutable lookup and provider failure propagation. Provider
tests separately qualify current-record query semantics; these tests alone do
not establish migration or publication activation.

## Layered Persistence Safety

The database owner implements `persistModel`, `persistUpdates`, `insertModel`,
`updateDurableJournal` and `assertReadSafety`. vService keeps its existing
success/error envelopes and single-row save projection, but delegates persistence
to those effective members. Its `resolveSaveMethod` and `resolveUpdateMethod`
choose versioned versus ordinary provider methods only after private admission.
Its read selector calls `assertReadSafety` before reading schema version policy.
Missing versioned provider methods reject; there is no ordinary-write fallback.

Private durable requests require qualified unversioned, nonmanaged, unrouted,
uncached, event-disabled journals and the owning provider protocol. Unknown
protocols, transactions, public schemas, recursive operations and unqualified
providers reject before dispatch. Save requires explicit boolean insert-only
intent; update retains exact original scalar predicates and no upsert. The
private credential-retirement path remains owned by the concurrency service.
Ordinary managed counters and existing versioned business records retain their
distinct lifecycles. This does not make generic business saves create-only.

The insert-only and durable-journal database suites test the merged variant,
including duplicate claims, failed acknowledgements, invalid protocols,
unsupported model types and private retirement delegation. Startup tests verify
member provenance from the actual service loader. The two opt-in MongoDB tests
qualify managed CAS and private journal insert/conditional completion/readback in
separate temporary databases; neither is full application or failover acceptance.
