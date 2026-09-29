# eWaste Reference Compatibility

The selected `eWaste:core-reference` successor is `core-v002`, version `0.0.1`,
with `selectionPolicy: EXPLICIT`. The complete `core-v001` tree and original
section metadata remain under the canonical manifest's `retainedRoots` contract.
No new migration service, alias registry or installation authority is introduced.

## Neutral Successor

The successor introduces `EWASTE_ENVIRONMENTAL_ESTIMATE`, an active
revision-1 `EXTERNAL_PROVIDER` profile with `publicClaimAllowed: false` and
`assessmentUse: ADVISORY_SUBMISSION_GATE`. This is a new identifier, not a rename
of an installed profile. It does not certify impacts, issue credits or change
the configured impact provider.

Eight category and twelve item-type references select the new neutral profile.
The two battery categories and two battery item types retain
`EWASTE_BATTERY_COUNT`. All other fields and the three existing neutral profiles
are unchanged in the successor. An independent consumer needs no customer data.

Retain the old source bytes, hashes, release identity and installed historical
profile records. A successor must not delete or relabel old impact results,
assessment snapshots, submissions, assets, ownership events or reward evidence.
Source neutrality does not establish that an existing installation is eligible
for a default-profile switch. Customer-defined overrides still belong to that
customer, including deliberate historical identifier pins.

## Existing Authorities

Waste owns schemas, validation, persistence and impact calculation. Its
`DefaultWasteDataContributionPolicyService.resolveByCode` can qualify effective
records in memory; it replaces whole records by code in layer order. nImport's
existing JS source-key composition is the separate supported field-inheritance
mechanism. A customer delta uses the same source-root version, logical filenames,
export keys and explicit header targets as its eWaste baseline. Arrays replace;
only keys authored by the delta are written. Missing or non-current baseline
receipts block execution; a selected predecessor can satisfy preflight. Later
customer/environment contributions must pass the existing contribution contract
after composition. Do not implement sparse overlays using resolveByCode alone.

nImport owns release discovery, selection, receipts, checksums, validation and
execution. BackOffice owns governed application preparation. No eWaste migration
service, direct database repair or runtime alias fallback is needed by this
source qualification. A runtime missing the selected profile must retain its
existing owner failure rather than silently falling back to another identity.

Source prerequisites are Waste schemas and material references, then eWaste
profiles/presets/taxonomy, then customer references and final customer policy.
Categories and item types refer to each other: closure must be checked across
the completed release, not claimed as a strict per-record topological ordering.
Package indexes alone do not prove execution order across core/sample releases
or across different source-root versions.

## Explicit Selection

Use the existing nImport core validation/install operations with explicit
`releaseCodes` and `expectedReleases: { "eWaste:core-reference": "0.0.1" }`.
Include the customer successor and its exact version when adopting together.
The v002 source sequence and module indexes enforce the baseline-before-delta
order. Tests exercise reversed caller selection, not just an array declaration.
The baseline receipt must match the current source version/checksum; source-only
inheritance must not replay other baseline records or customer transactions.

Source-root/filename/key alignment is part of the release compatibility contract.
Advance dependent source releases together; tests must reject missing or changed
qualified dependencies before operation. The current nImport mechanism does not
provide a general dependency DAG or a manifest-level fresh-only eligibility flag.

## Installed Adoption Gate

The release owner must qualify retained historical roots, exact version/hash
receipts, destination scope, dependency execution order, fresh installation,
existing installation and later-layer policy preservation. Existing installations
need a reference-only forward action; replaying a sample transaction pack is not
a migration. Unknown or conflicting provenance blocks adoption. Failures leave
the historical release and installed evidence intact; retries use nImport's
existing receipt/idempotency handling. No source test substitutes for those gates.

`eWasteReferenceCompatibility.test.js` covers neutral defaults, unchanged battery
behavior, reference closure, missing-profile rejection in qualification, retained
payload hashes and independent customer overrides. The module's existing
`test/*.test.js` command discovers it. `eWasteReferenceRelease.test.js` additionally
executes actual nImport discovery, planning and JS processing against in-memory
ports without a customer checkout. The bounded `referenceReleaseHarness.js`
fixture composes canonical nImport components; it owns no runtime import engine.
These are offline source-adoption tests, not installed or live-import acceptance.
