# wasteCore Contracts

Preserve shared Waste source-reference, enum, and lifecycle policy contracts.

## Installed Evidence Inspection

`DefaultWasteInstalledDataInspectionService` provides read-only prerequisite
evidence through the existing generated repositories. `wasteApi` exposes it at
`POST /nodics/wasteApi/v0/waste/installed-data/inspect`. Keep the generated schema
routers disabled: this capability is not a reason to expose CRUD operations.

The route requires an authenticated human in `adminGroup` and the canonical
existing `waste.audit.read` permission (including a legitimately granted
wildcard). The service independently enforces both admin membership and that permission and trusted token
tenant even when invoked internally. This is tenant-wide maintenance authority,
not a centre operator's permission. No new grant, service credential, impersonation
endpoint or tenant selector is supplied. Reference policy is sensitive operational
data; only a tenant-wide maintainer may inspect it. Ordinary business users and
customer journeys do not consume this operation.

The body accepts only `resource`, positive integer `page` (default 1), and optional
`expectedPageChecksum`. The effective `waste.installedDataInspection.resources`
allowlist and `pageSize` select permitted owner reads, capped at 500 per page.
Later layers may disable a resource with `false`, lower the page size, or narrow
reference output to fingerprints. The service uses its existing owner defaults
as a disclosure ceiling, independently of effective configuration: changing a
transaction to `REFERENCE` or introducing an unknown resource rejects before
reads. Extending the inventory requires owner review and redaction tests, not
only a customer configuration entry. Malformed request bodies and non-string
checksums also reject before reads. Arbitrary
queries, tenant, release, source-path and permission fields reject before reads.
Missing storage, unreliable counts, short pages and duplicate page identities
fail closed. Empty collections return zero records, not fabricated prerequisites.

Reference pages return complete installed records, including customer codes,
operator deltas and historical profile identifiers. Transaction pages return only
code and SHA-256 fingerprint of the complete detached record, not evidence,
customer identity or payload. Page hashes include authenticated tenant, resource,
page, limit, count and record hashes. Object keys are sorted; array order and every
record field remain significant. A supplied checksum mismatch raises a conflict.
These are uncached point-in-time reads, **not a database snapshot or write lock**.
Multiple pages must be enumerated, checked for duplicate identities, and re-read
with their checksums in a quiescent maintenance window. Concurrent writes require
fresh qualification; an inspection response is never an import permit.

`assertReferenceFields(installed, expected)` rejects missing identities or any
authored-field difference from a separately qualified historical reference. Extra
installed fields remain visible for operator review and are never removed. It
does not derive provenance from matching values or certify unknown extra fields.
Qualified expectations must include the effective historical customer overlays,
not only accelerator defaults. Divergent policy blocks adoption until its owner
explicitly preserves that delta in a newly qualified successor.

### Migration Prerequisites

1. Through existing nImport owner APIs, obtain exact installed release identities,
   versions, checksums and destination scope. Compare with retained immutable
   source roots and the selected successors. Unknown or conflicting provenance
   blocks the operation; a CURRENT label alone is insufficient.
2. Validate only explicitly selected core successors with exact versions through
   nImport. Confirm source hashes, destination and prerequisite ordering; exclude
   all sample/transaction releases. Inspection does not implement another importer.
3. Enumerate all affected installed references and relevant transaction fingerprint
   pages. Compare authored historical fields after customer composition, review
   additional installed fields, check all historical referenced identities remain,
   and preserve deliberate customer pins. Missing records and divergent operator
   policy block import rather than being automatically overwritten.
4. Recheck exact receipts/source hashes and every page checksum immediately before
   the separately authorized core-only import in the maintenance window. Missing
   atomicity must remain explicit; do not claim this HTTP preflight prevents a
   concurrent writer. Use the existing nImport install/idempotency lifecycle.
5. Verify exact successor receipts, expected composed references, retained historical
   profiles and unchanged transaction page hashes. A failure is an adoption failure,
   not permission to replay samples, force receipts, restore internally or delete data.

`wasteInstalledDataInspection.test.js` exercises real controller/facade, canonical
permission matching and generated-service envelopes with in-memory repositories.
It proves no live migration, snapshot isolation or installed receipt validation.
Runtime receipt comparison and migration remain explicit operator/coordinator gates.

`wasteCore` is the Waste business anchor. Common Waste reference data belongs in
`wasteCore/data`, even when the target schema authority is another module such
as Profile `enterprise`. Leaf Waste modules own only capability-specific data.


Operational access is owned by `DefaultWasteOperationalAccessService`. Require exact router permissions and Profile-resolved allow/deny scopes before exposing a submission or its evidence. Scopes remain request-local; missing scope resolution fails closed. Projects configure `waste.operations` and Profile assignments. See `wasteVerification/test/wasteOperationalRolesContract.test.js` in the sibling module for denied-centre, explicit-deny and read-only auditor evidence.

`DefaultWasteAssetReversalOperationService` owns a linked REVERSAL event and an
optimistic asset lock for an approved completed sale refund. Only the original
latest buyer-held sale can be reversed automatically. The domain coordinator
supplies settlement acknowledgements; Waste never writes wallet balances. The
former digital owner is restored only after the payment refund completes, and
the original ownership event remains unchanged.

## Composed business navigation

`waste-operations` is the stable Waste Management anchor owned by `wasteCore`. It contains the three generic operational views. Domain subgroups must attach with `parentModuleName: wasteCore`; the contributor retains ownership. Generic keyed view defaults are under `waste.reviewWorkspace.views`. Core must not declare Electronics, Clothing or future accelerator views. Native renderer dispatch comes from the validated `backendWorkspace` contract; configuration routes keep real schema-workbench targets.

The BackOffice capability source lives under `data/backoffice/`, declared as `SOURCE_CONTRIBUTION` in the module manifest. It is projected by the existing capability provider and is not part of an executable core import.

Waste Core owns inert Waste acceptance defaults under `tooling.acceptance`.
Resolve the WASTE and PLATFORM roles from the selected topology; do not copy
customer environment names, server names, ports or initialization profile codes.
Waste Core owns the complete protected `acceptance:waste-backoffice` suite.
It checks existing authorized registration and navigation without identity
migration, runtime grant expansion, automatic activation or runtime startup.
Customers supply topology and employee credentials, not replacement assertions.
