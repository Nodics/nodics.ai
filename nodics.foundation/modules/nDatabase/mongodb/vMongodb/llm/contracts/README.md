# vMongodb AI Contracts

This folder contains module-specific AI/developer contracts for `nodics.foundation/modules/nDatabase/mongodb/vMongodb`.

Use these files for rules that are more specific than root `AGENTS.md` and the module `AGENTS.md`, especially extension boundaries, override expectations, testing rules, security constraints, and generated-artifact responsibilities.

## Versioned Persistence Safety

`validateModel` accepts only nonnegative safe-integer version IDs, without type
coercion. Missing models and invalid IDs reject with the existing model statuses
before reading or writing. Zero remains a valid first-version identity. Valid
next-version normalization and identical replay retain their existing behavior.

`getMatchedItems` accepts direct item arrays and the standard `{ result: items }`
response. An explicit empty array establishes empty history; missing, malformed
or failed envelopes do not. Both save and update must propagate this failure
without an insert, including a failure while fetching the previous version.
Transport/provider errors retain their original rejection path.

History rows must be plain record objects. `getStoredVersionId` validates the
selected persisted identity with the same nonnegative safe-integer rule. Missing
installed IDs no longer act as implicit version -1: an explicit owner migration
must qualify them before versioned saves or updates. This intentionally rejects
the former lazy transition for unmigrated records. Empty history still permits
version-zero creation. Resolve this member through the effective model so later
layers can extend validation without copying persistence.

Updates derive the successor from the stored ID, ignoring a patch's versionId.
An exhausted stored ID rejects without insertion; an identical replay at that ID
remains valid. Build new records without mutating objects returned by history
reads. A failure while preparing any member of an update batch prevents its
insertMany call; this is not a guarantee of atomicity once that call begins.

Successor updates reuse the existing `mergeNextVersion` helper with
`replaceArraysOnVersionMerge: true` on cloned previous and patch records.
Omitted fields inherit; explicitly supplied arrays replace the complete value
at every nested object depth, including `[]`. Array elements are not merged by
index: replacing `[{ name: 'old', stale: true }]` with `[{ name: 'new' }]` must
remove `stale`. This applies to data records, not configuration-layer array
semantics. Caller update options cannot disable this behavior. Preserve BSON
types/values and avoid aliasing either input's arrays into the successor.
This correction does not change the save/import helper's existing option
contract, stale-selection checks, unique version conflict handling or retry rules.
`validateSuccessorArrayReplacement` in the existing model contract test covers
shorter/nested-empty/object arrays, omitted fields, BSON bytes, patch/history
isolation and dispatch through the existing later-layer-overridable helper.

`selectVersionedUpdateItems` retains the highest matched version per scalar
logical identity without consuming the provider's result array. Invalid or
projected-away identities/version IDs reject. `fetchPreviousItems` then requires
exactly one latest record with the same logical identity and version as the
selection; missing or changed records reject the complete preparation. A query
matching only an old active/owned version cannot silently update a newer archived
or differently owned version. History paging still defines the selection; this
does not claim current-logical-record paging for mutation APIs.

Updates may repeat the same logical key but cannot rename it or supply `_id`.
Successors discard the previous storage ID. Latest-identity lookups use simple
collation. Both those lookups and insertion preserve the original trusted
transaction context through existing provider methods. Later layers may override
the selection method, but must preserve stale-selection and identity checks.

The reread is not an atomic lock. Qualified unique logical-key/version indexes
must reject concurrent insertion of the same successor; that provider error
propagates with no automatic rebase/retry. A bulk insert may partially succeed
without a transaction; operators must inspect stored outcomes before retrying.
These guards do not supply migration checkpoints, a write fence, an atomic
multi-resource publication snapshot, or complete versioned-save qualification.
The optional isolated MongoDB test also verifies deduplicated update and stale
exact-version rejection against actual installed fixture indexes.

Partner developers can override the existing provider read implementation, but
must preserve these response and failure contracts. Do not implement duplicate
history storage, alternate transport retries or business approval in this variant.
Operators correct invalid inputs or investigate the read failure before retrying;
they must not bypass history validation or re-import samples as a repair.

Maintainers and AI tools run `test/versionedModelContract.test.js` for successful
save/update, zero-version creation, identical/stale replay, malformed-history
denial, numerical boundaries and compatible provider overrides. These isolated
tests establish no installed-index migration, concurrent-write atomicity,
Commerce/Media publication readiness or business-user Online availability.

## Current Version Reads

`buildCurrentVersionPipeline` and `getCurrentVersionItems` belong to this provider.
Sort by logical primary key and descending versionId, select the first record
per identity, and only then apply the complete caller query. Applying status,
enterprise/ownership or other mutable predicates before grouping can expose an
older record after its current version becomes archived or inaccessible.

Count and page share one aggregation input. Sort ties include the logical primary
key. Require a positive integer limit, nonnegative integer offset, numeric sort
directions and simple inclusion/exclusion projections. Advanced find projections
are rejected, not silently reinterpreted as aggregation expressions. MongoDB
simple collation is explicit so collection defaults cannot collapse distinct
logical codes during grouping. Non-simple requested collations reject; adopters
must qualify this binary-identity/query contract before selecting CURRENT mode.
Locale-aware customer search remains with its search owner. MongoDB
query/operator failures propagate without fallback to history or empty results.
Preserve trusted transaction options and never forward a caller-supplied session.
The existing cursor adapter handles callback and Promise providers.

This is a current-authoring view, not an Online activation pointer. It neither
migrates data nor changes raw `getItems` history semantics. Installed identities
must already be qualified. A single aggregation is not a cross-request snapshot
or multi-resource transaction. Qualify query performance and configured timeouts
before large deployments; [MongoDB aggregation limits](https://www.mongodb.com/docs/manual/core/aggregation-pipeline-limits/)
and [facet limits](https://www.mongodb.com/docs/manual/reference/operator/aggregation/facet/)
still apply. No new unbounded in-process history scan is permitted.

Run `test/currentVersionReadContract.test.js`. Setting `NODICS_MONGODB_TEST_URI`
also runs the isolated provider test, which creates and removes only its uniquely
named temporary database. Without that explicit URI the live test is skipped;
do not report an isolated pipeline fixture as live MongoDB evidence.
## Current-Read Provider Privacy

`getCurrentVersionItems` retains the base model's `guardProtectedRead` before
aggregation and `projectReadResult` after validating its count/record envelope.
Both hooks resolve through the effective model and schema privacy owner. Pass
the original request and actual prepared receiver; do not create synthetic
admission. Private journal modes reject rather than ignoring their durability
requirements. Current-version selection, bounded paging and schema/property
privacy are distinct requirements; a valid pipeline is not authorization.
