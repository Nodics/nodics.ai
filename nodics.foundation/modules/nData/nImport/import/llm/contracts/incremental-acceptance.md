# Governed Incremental Acceptance

`test/helpers/defaultIncrementalReleaseAcceptanceService.mjs` provides inert test-owned
source fixtures and an explicit acceptance coordinator for A02-A04. It does not
start a runtime, install itself, change configuration, grant access or connect to
a database. The existing importer and generated importDefinition owner retain
execution, validation and persistence authority. This is not a new installer.

## Fixture And Adoption

The exact selector is `importAcceptanceFixture:incrementalAcceptance`, Sample, PLATFORM, LOCAL only,
EXPLICIT. The predecessor is 1.0.0 in sample-v901; the successor is 1.0.1 in
sample-v902, exclusively under `test/fixtures/incrementalAcceptance/data`.
`incrementalAcceptanceSource(stage)` reads and checksum-verifies these bytes,
returning the section and retained-root metadata for a disposable isolated test
module. The test materializes that module and uses canonical Import discovery;
there is no special loader path, runtime flag or validation bypass. Neither fixture
is selected by the shipping Import manifest. Never copy these packs into an
application baseline or mutate a live source tree merely to run the tests.
Any separately authorized integrated test needs an isolated deployment and normal
module discovery, authentication and release admission. Do not deploy the
successor until the predecessor's real owner receipt is CURRENT. The successor
retains the complete original source tree and stable installation identity.
Source adoption/build/restart is an explicit coordinated deployment step, never
an acceptance-client side effect. No uninstalled fixture is live proof.

The two exact test records are `nodicsImportAcceptanceFirst` and
`nodicsImportAcceptanceEdited`, disabled import definitions targeting their own
schema. They contain no roles, credentials, funds or customer data. The default
tenant is the existing importDefinition catalogue restriction, not a new tenant
override. Fixture definitions and semantics must not be copied into customer
properties. Source-only tests establish no live installation qualification.

## Isolated Deployment Harness

`test/helpers/isolatedIncrementalAcceptanceHarness.mjs` composes a private test
application using the existing nTooling writers and nConfig package discovery.
The distinct `importAcceptanceFixture` module does not replace the Import owner.
It inherits security defaults and asserts their effective values; composition
contains only deployment, private-provider, isolation and secret overrides.
No registry replacement, database driver, raw collection operation, custom grant
or authentication bypass is provided.

From the Import module, explicitly authorized execution is:

```sh
node test/helpers/isolatedIncrementalAcceptanceHarness.mjs --execute-isolated --output=/absolute/existing/evidence-directory
```

This command starts its own MongoDB, Redis and normal runtime on private loopback
ports. It never accepts a customer project/database target or restarts existing
runtimes. Do not execute it when starting any runtime is prohibited. Native
provider binaries, normal build dependencies and an approved runtime deployment
grant for the exact selected deployment are prerequisites. The harness does not
create that grant. A refusal before readiness is BLOCKED, not an attempted
fixture import or a passed recovery scenario. Stop on that refusal; never repair
it by adding authority from this test harness.

All owned children are stopped on exit. The private source and provider state
are retained with sanitized JSON/log evidence after execution, including failure.
`removeTestSource` is only for offline compositions: it refuses deletion when
either provider directory exists, even after children stop. No automatic cleanup
deletes installed receipts. Offline tests do not start any provider or runtime.

## Explicit Sequence

Use authenticated existing Nodics APIs or loader-visible generated owner services
for every client port. No database drivers, direct collection reads or model
substitution in live execution. Preserve tenant, original human authorization,
API exposure and exact destination. Inspect advertised operations before dispatch.

1. `inspect` reads catalogue and exact fixture records, with no writes.
2. `install-predecessor` requires NOT_INSTALLED and absent fixture rows, validates
   and installs only the exact version, then records owner rows and run evidence.
3. `edit` changes only the second fixture description through its owner update.
4. Coordinate successor source adoption. Review UPDATE_AVAILABLE, 1.0.0 -> 1.0.1,
   exact checksum and two conditional updates in Axis before execution.
5. `attempt-successor` requires the business edit. The first conditional update
   succeeds; the edited second row must fail without overwriting that edit. A
   rejected preflight with no partial effect does not pass A04.
6. `resolve-conflict` explicitly restores only that test description after the
   retained failed-attempt evidence is reviewed. This is a deliberate operator
   resolution, not an automatic overwrite or relaxation of the immutable source.
7. `retry-successor` uses unchanged successor bytes, requires FAILED and prior
   resolution evidence, then verifies CURRENT and the original two record IDs.
8. `verify-current` requests the same CURRENT release; owner duplicate protection
   must reject installation with `ERR_IMP_00003` without executing another import,
   as required by the [repeat-current contract](import-release-contracts.md#offline-execution-test-ownership).
   Preflight must report `skipped: true`. Retain the rejection code and verify
   unchanged version/checksum, CURRENT state, complete business rows and run
   history. The code alone does not prove replay safety; all evidence checks must
   pass. Propagate other errors and reject unexpected successful install responses.

Every non-inspection call requires `execute: true`. The caller retains returned
evidence between phases. Validation must explicitly report `ready: true` and
`importExecuted: false` before installation. Resolution and retry reject stale
record evidence or changed source checksums. CURRENT replay must leave both
the complete fixture records and owner run history unchanged.
`catalogue`, `validate`, `install`, `history`,
`readRecords` and `updateDescription` are explicit owner adapters, not arbitrary
raw-persistence ports. `updateDescription` must use the original record identity
and expected description in the generated update query, request modified records,
and reject unmatched or ambiguous results. History must retain exact selected
release/version/checksum entries and failure/success counts. Do not log tokens.

This exercises explicit FAILED-release retry, not takeover of RUNNING work or
record-level resume. Safe replay of the completed first row is qualified by its
conditional update accepting predecessor or already-applied successor text.
Other edits still conflict. Never force a CURRENT receipt, delete evidence,
rehash historical bytes or introduce an acceptance fault-injection runtime flag.

## Verification And Limits

From the Import module, `node --test test/incrementalReleaseAcceptance.test.mjs` verifies fixture
discovery/retention with the real release owner and isolated coordinator ports.
Run adjacent single-update, retention and retry-classification tests. These are
not live proof. A02-A04 require real API receipts, owner record identities,
partial-effect evidence and parent Axis screenshots. Failed authentication,
unsupported generated operations or denied permissions block execution; do not
broaden access or use direct persistence as a fallback.
