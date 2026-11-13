# discoveryPublication Contracts

## Dedicated Index Retirement

`DefaultDiscoveryIndexRetirementService` consumes domain-owned current-authority
and replacement-evidence callbacks. Resolve only registered nSearch models with
explicit dedicated tenant/enterprise ownership. Bind review to physical UUID,
actor, plan and exact replacement generations. Use the private generated
`discoveryIndexRetirementReceipt` unique index claim across actors before one
native barrier. Never infer completion from block metadata or age. Preserve
uncertainty after any lost acknowledgement; inspection never dispatches a barrier.
Completed original evidence plus a currently present block proves retirement,
not erasure or current replacement readiness. Physical names must never be reused
by concurrent index administrators. Retirement keeps the old blocked index;
unblocking and generic receipt CRUD do not belong to this capability.

Separate `previewErasure`/`erase` require fresh replacements and provider-owned
decommissioning evidence. CAS an absent `erasure` to STARTED on the existing
retirement receipt before exactly one native deletion. Complete only after native
acknowledgement and absence verification; lost acknowledgement remains unknown.
Inspection selects the original actor/plan/tenant/enterprise receipt without
depending on the deleted UUID's continued existence. Contradictory/new UUIDs deny.
No reset, automatic retry, absence-only repair or deletion of receipt evidence.

Journal predicates must follow the generated durable-update contract: exact
scalar/null comparisons only. Claim with `erasure: null` (missing or explicitly
null, never a prior claim); bind completion to each exact scalar erasure field.
Do not use `$exists` or embedded-object equality in this path. Pass a copy of the
reviewed retirement record to insert: native providers may attach `_id`, which
must not contaminate the later reviewed completion predicate. Regression tests
must exercise the actual generated initializers, not only permissive map mocks.

Opt-in real-provider qualification is in `test/discoveryErasure.live.test.js`.
It creates an isolated secured Elastic process and a unique disposable MongoDB
database; exact deletion, revoked writers, concurrent claims, lost responses and
independent-process inspection are verified. This is not Profile/Axis login or
qualification of an operator's existing historical writer inventory.

Run `copilotKnowledge/test/copilotKnowledgeMigration.test.js` for the integrated
owner/provider contract and the canonical Knowledge Progress and Recovery guide
for deployment qualification, operator steps and residual erasure limitations.

`discoveryPublication` owns generic publication planning for Discovery indexes. Domain modules own source eligibility and source payload generation.

## Durable Generations

Generation descriptors may contain an optional 64-hex `contentDigest` of complete
derived source content. Older descriptors remain readable. `unchanged` reads a
matching policy/content/count, denies pending writers, verifies exact physical
count, rereads the same manifest revision and invokes the current-policy guard.
It never claims a writer, deletes debt or grants a readiness lease. Missing or
changed evidence returns null for a full refresh; concurrent drift fails closed.

`DefaultDiscoveryGenerationPublicationService` uses the private generated
`DefaultDiscoveryGenerationService`, never its own database adapter. Manifest
identity binds tenant, logical index, index configuration, source owner type and
source partition. Initialization is a unique insert plus exact reread; every
later transition uses the observed revision and an acknowledged single match.
No browser route exposes generic manifest CRUD.

Source owners claim a fresh UUID, write generation-qualified documents, verify
all write responses and nSearch visibility/count, then publish that exact claim.
Current and pending generations cannot be obsolete. No timeout steals a claim.
Explicit abandonment requires a reviewed revision and pending token. An optional
`assertCurrent` caller-policy guard runs after reread immediately before CAS.
For guarded writers, abandonment also prevents new per-write claims. It cannot
cancel a dispatched physical write. Guarded manifests require private
`DURABLE_JOURNAL` persistence and reject unguarded callers. `startWrite` performs
revision CAS before dispatch; `completeWrite` records only the original confirmed
write, including after retirement. `sealWriter` requires the exact completed
count and prohibits further dispatch before publication. A late completion
cannot transfer authority to another pending generation.

Cleanup uses nSearch through Discovery Projection and conjunctively binds tenant,
owner type, index configuration, publication owner and exact obsolete generation.
Timeouts, conflicts, malformed counts or failures leave cleanup debt visible.
Never delete by a broad source-only predicate or treat a similar indexed count
as domain authorization. Publication/count inspection is not content integrity
attestation. Process remains the scheduler/execution-history owner.

`publishedObsoleteGenerations` is a validated subset of obsolete IDs, populated
only when a completed current generation is replaced. `retiredWriters` preserves
bounded private writer evidence after abandonment. `cleanupTokens` additionally
admits retired IDLE/SEALED writers unless `publishedOnly` is true. WRITING and
legacy tokens remain blocked, even after timeouts or process restarts.
Reviewed source-owner cleanup supplies an observed revision, `publishedOnly`
and a fresh-authority callback before each deletion. A pending writer or stale
review denies that mode. Never infer completion from age or an empty index.

## Empty Generation Slots

The private generation manifest represents unpublished or released slots with
explicit `null` values. `currentGeneration` and `pendingGeneration` therefore
accept only an object or null in the generated database validator. Optionality
alone permits absence, not null. Identity and revision remain required and typed.
Run `test/discoveryGenerationSchema.test.js` and the authenticated Copilot runtime
acceptance test to cover schema compilation and actual provider writes.

## Publication owner transport

Generation orchestration uses `DefaultDiscoveryGenerationTransportService` for
three fixed operations: exact read, canonical empty initialization and validated
revision advance. `DefaultModuleService` selects the unique `discoveryPublication`
owner using the module-owned `discovery.publication.targetAuthority` default,
whose publication binds to explicit runtime context. It never selects by role.
Required-module declarations identify source dependencies; Publication's index
follows Runtime because exact count interpretation uses its response parser.

The source domain retains its fresh eligibility callbacks immediately before
its effects. Callbacks are not serialized. The persistence owner reconstructs
scope and code, fixes read limits and insert-only behavior, rereads the current
manifest, validates both sides of a bounded transition, prohibits guarded-writer
downgrade and commits through generated exact-revision CAS. No new database
adapter, generic manifest CRUD, source eligibility authority or replay protocol
is introduced. An uncertain acknowledgement remains uncertain to the caller.

Only fixed service-token routes are exposed, requiring module admission and
`discovery.generation.read` or `discovery.generation.write`. Their bodies cannot
supply generated-service names, arbitrary predicates, persistence flags or actor
identity. These source contracts do not install grants or run initialization.
Existing deployments need their governed caller assignments qualified separately.

Physical retirement/erasure now uses the fixed Projection command owner while
this module retains the original private receipt schema. Public facade methods
are preview/execute/inspect/previewErasure/erase/inspectErasure; inspection returns
minimized status directly, not private evidence or a model handle. Projection
performs fresh source-owner decisions and native model checks. Publication's fixed
read/claim/complete/claimErasure/completeErasure commands reconstruct bounded
scope, prohibit arbitrary predicates, retain unique insertion and original scalar
CAS, and never manufacture provider acknowledgement. See
`discoveryProjection/llm/contracts/README.md` for authority qualification and
credential handling. No schemas, stored receipts or physical data are migrated.

Run generation routing plus generation publication regressions for owner selection,
concurrent CAS, protocol downgrade, lost acknowledgement and bounded admission.
The tests are offline and do not qualify native index retirement or live grants.


Internal routes declare their `moduleInternal` exposure default here with neutral
`inheritUnknown: true` policy. Registration preserves nRouter's existing unknown
category denial or common default; it never enables a service, grants permissions
or qualifies a provider. Later explicit category overrides remain supported.
See nRouter's capability-owned exposure contract and
`apiExposureOwnershipContract.test.js` for default, denied and override evidence.
