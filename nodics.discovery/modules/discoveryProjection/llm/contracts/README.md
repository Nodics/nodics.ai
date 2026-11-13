# discoveryProjection Contracts

`discoveryProjection` owns the generic Discovery document projection shape and validation helpers.

Implicit model lookup uses the schema's logical `typeName`, with its legacy
`indexName` fallback. A deployment may customize the physical provider index
through nSearch's layered index definitions; do not pass that physical name to the
logical model registry or add a second registry. Explicit logical request
selectors and tenant/module validation remain authoritative.

## Qualified stateful operations

`DefaultDiscoveryDocumentProjectionService` is the source-loadable facade for
save, search, visibility refresh and exact-generation removal. It invokes
`DefaultModuleService` with the canonical module identity and explicit publication.
The owner default is `discovery.projection.targetAuthority` in this module's
properties; its publication binds to the selected runtime context. Customer layers
may override only actual deployment differences. A trusted domain caller can
select a different publication explicitly (for example, committed CMS Online
indexing from an authoring process); remote operation bodies cannot select a
service, method, model handle or target authority.

The owner executes existing nSearch pipelines. No new provider, endpoint resolver,
role inventory or fallback is introduced. Four fixed module-internal routes require
service tokens, exact module admission and separate read/write/cleanup permission.
Generated schema CRUD remains disabled despite enabling these explicit routers.
The owner requires local module authority before resolving a model. Documents
must match the authenticated tenant; executable values cannot cross transport.
Optional undefined document fields are omitted and valid Dates become ISO values.

Removal accepts only the five exact generation terms already constructed by the
publication owner: tenant, owner type, index configuration, publication owner and
generation token. There is no broad remote delete endpoint. Manifest eligibility,
fresh domain checks and acknowledgement interpretation remain with their existing
owners. Failures propagate without local retry/fallback or manufactured success.

Physical retirement and erasure execute through the fixed DMS command ports described
below. Live model handles remain private to the Projection owner; the public
facade exposes `doDescribeIndex` with an opaque binding identity and canonical
replica pins. A replacement check rereads that same replica and rejects a changed
binding rather than passing provider objects across transport.

Verification: `discoveryProjectionRouting.test.js` exercises real DMS locality and
publication decisions, exact route authorization, payload scope and denial;
`customPhysicalIndexBinding.test.js` checks the local provider binding. These are
offline tests, not deployed credential or provider qualification.

## Portable physical retirement and erasure

The public Discovery Publication facade exposes `preview`, `execute`, `inspect`,
`previewErasure`, `erase` and `inspectErasure`. Each dispatches to Projection's
fixed physical command boundary. `DefaultDiscoveryPhysicalRetirementService`
runs the retained one-shot algorithm where the actual nSearch model is owned.
It uses existing native provider methods; no engine adapter or alias provider is
introduced or enabled. Raw model lookup is no longer a public transport facade.

The existing qualified index definition's `retirement.authority` selects its
source authority by module/service, not server name or role. Projection owns the
complete `discovery.projection.retirement.authorityDefaults` contract: fixed
`validateRetirementAuthority` operation, fixed internal API path and explicit
publication-context default. Later module configuration selects the source module
and service and only necessary context differences. Unknown authority fields and
nonstandard operation/API paths reject. No callback endpoint comes from a request.
Copilot supplies its standard selection in
`copilot.knowledge.legacyMigration.authorityBinding`; a qualified index definition
may use the existing binding `{ $config: 'ref', path:
'copilot.knowledge.legacyMigration.authorityBinding' }` when that source is loaded.
Missing qualification fails closed; migration enablement still defaults off.

Physical commands carry only bounded scope, the original transient signed employee
credential, source fingerprint and optional review digest. The credential is never
stored in receipts, returned as evidence or sent to the search provider. Owner-local
closures call the configured source service through DMS at every existing fresh
check, including inside native pre-mutation guards. The source re-verifies the
credential through the existing authorization provider, current stamps/context,
exact tenant and employee admission, then current plan and replacement policy.
No function, trusted authData assertion, endpoint or provider handle is serialized.

Projection's receipt client uses only Publication's fixed read/claim/complete/
claimErasure/completeErasure ports. Original unique inserts, scalar revision/claim
predicates, uncertainty and no-replay rules are unchanged. Physical and receipt
mutations explicitly select one transport attempt. Source checks, provider barriers
and receipt updates remain separate authorities; an uncertain response never grants
permission to retry. Generated receipt CRUD remains private.

The module-owned receipt target defaults to explicit current publication in
`discovery.projection.retirement.receiptTargetAuthority`; only genuine deployment
changes belong in later layers. Separate service-token permissions protect physical
commands, receipt commands and source revalidation. Source permission checks do not
install grants. Customer projects with no migration selections need no new values.

Offline verification uses real DMS selection with serialized dispatch, native
provider transport doubles and generated durable CAS fixtures. Cases include
concurrency, revocation after claim, tenant/employee denial, binding/UUID drift,
writer revocation, missing acknowledgements and read-only original inspection.
Native-provider acceptance is opt-in and was not executed for this source change.


Internal routes declare their `moduleInternal` exposure default here with neutral
`inheritUnknown: true` policy. Registration preserves nRouter's existing unknown
category denial or common default; it never enables a service, grants permissions
or qualifies a provider. Later explicit category overrides remain supported.
See nRouter's capability-owned exposure contract and
`apiExposureOwnershipContract.test.js` for default, denied and override evidence.

Actorless trusted domain calls use the existing DMS authenticated HTTP transport,
even for a cohosted Projection owner. The module facade selects `local:false` before
its single dispatch; payload callers cannot choose it. DMS obtains the existing
runtime service token, and nRouter still enforces module/permission/tenant grants.
Never synthesize authData, widen grants or fall back to local execution after a
denial. Authenticated local domain calls retain their existing identity. The routing
test covers cohosted actorless reads and denied service transport; live service-token
admission remains a separate deployment check.

Projection and retirement permission vocabulary is contributed by this module’s explicit `init-v001` release through Profile `ensureReferenceAll`. Import preserves existing records and never grants service scopes, changes credentials or activates a runtime. Service callers require separately approved exact permissions. Every fixed internal route must have an owner-matching vocabulary entry.

Legacy source refresh must await the existing Discovery/nSearch visibility acknowledgement before reporting PROJECTED. A rejected, missing or failed-shard refresh remains unconfirmed; never retry writes automatically. Governed Discovery projections default to uncached reads so a cached empty or prior result cannot override refreshed source or generation evidence. Source policy and published Online digest checks still run before and after retrieval.
