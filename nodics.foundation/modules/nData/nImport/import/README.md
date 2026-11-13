# import

Run history defaults to newest persisted `created` timestamp first, with `code`
as a stable tie-breaker. The history API translates `limit` and `skip` into the
generated owner's paging contract; an empty internal search-options object does
not suppress these defaults. Explicit owner sort/paging customization remains
supported. History reads never replay imports or rewrite retained receipts.

Internal installed-schema migrations can journal immutable plans and fenced
checkpoints through the existing `importRun` authority. See the
[strict migration journal contract](llm/contracts/installed-migration-journal.md)
for developer integration, stopped-worker recovery and evidence limits. This
does not execute a migration, manage runtimes, expose a new route or change normal
best-effort import history.

Forward releases may retain historical source trees in the existing manifest's
validated `retainedRoots` map. Old bytes and installation identities remain intact;
retained roots are excluded from conventional discovery. See the
[retention contract](llm/contracts/README.md#retained-source-roots).

Import provides governed data ingestion for seed packs, migration inputs, media-backed uploads, headers, validation, dispatch, and execution evidence.

## Responsibility

This module owns generic import mechanics. Functional modules own their data meaning, schemas, default packs, lifecycle state, and business validation.

## Developer Notes

- Platform administrators can validate and install the tenant-local Sample Import
  Operator group through the secured Init sample-operator commands. Profile
  resolves the exact business enterprise and verifies the original administrator.
  nImport installs the existing group release. Assign the responsibility separately
  through Profile.

- DATA_RELEASE sections may pin same-type `prerequisites` by exact module,
  section, version and checksum. The existing release owner preflights and
  topologically executes that graph, including explicitly referenced inactive
  data owners without activating their code. Only Init can run at startup;
  existing owner installations require operator selection for graph upgrades.
  CURRENT dependencies never replay to repair deleted authority. Optional
  `partition: "DEFAULT"` references use exact existing default-partition receipts
  for other tenants, never cross-partition writes; unqualified groups stay
  tenant-local. See the
  [prerequisite contract](llm/contracts/import-release-contracts.md#exact-release-prerequisites).
  Versioned operation membership separates the canonical selected roots from
  prerequisite identities, allowing clients to correlate expanded validation
  plans and completed installation subsets without planning dependencies.
  Retained CURRENT receipts with same-version source drift instead return a
  no-write startup review result; catalogue readiness remains blocked and Profile
  retained identity validation still runs. Newly added prerequisites are not
  installed through a drifted graph, and manual checksum refusal is unchanged.
  No startup-skip configuration is required for this case.
  Versioned successor migrations can use the bounded
  [maintenance sequence](llm/contracts/import-release-contracts.md#existing-installation-maintenance-sequence):
  suppress `types.init.startupExecution`, keep Init enabled, migrate the default
  partition before tenants through governed operator imports, then restore startup.
  nImport keeps `types.init.startupProfileSelections` empty by default. A project
  module may explicitly select an Init-only guided profile for one exact
  environment and server when its reviewed authority pack must be installed
  before first internal authentication on an empty schema; normal release
  admission, create-preserve behavior and receipts still apply.
  An exact selected release may come from a declared inactive contribution when
  its headers target an admitted active owner. This selects data without activating
  the contributing capability. Unselected inactive releases remain excluded.

- Custom owner installers read fixed JSON payloads through
  `DefaultDataReleaseService.readContributionPayload(contribution, installerCode, payloadName)`.
  It requalifies the exact current release and destination, rejects symlinks and
  ambiguous basenames, and checks all declared bytes before returning detached JSON.
  Layered limits default to 1 MiB per selected file and 8 MiB per contribution;
  unrelated source-root assets are excluded. See the
  [payload contract](llm/contracts/import-release-contracts.md#custom-contribution-payloads).

- Single-record `update` headers preserve the generated owner's `model` contract;
  ambiguous batches reject before mutation. See the
  [dispatch contract](llm/contracts/README.md#generated-update-dispatch).

- Terminal model authorization denials retain their original error beneath a fixed
  `ERR_IMP_MODEL_<STAGE>` diagnostic. Stages are recorded privately by the exact
  model pipeline request, consumed after dispatch and contain no record values.
  They identify a boundary without asserting a write outcome or permitting replay.

- Import phases retry only explicit owner-declared dependency/safe-transient
  failures with `NOT_APPLIED` write outcomes. Unknown outcomes, authorization,
  credential, validation and concurrency refusals are terminal. The outer loop
  honours file-header/config fail-fast policy and preserves successful-row
  processed keys. See [phased retry admission](llm/contracts/README.md#phased-retry-admission).

- Managed-counter `saveAll` data files omit technical revisions. The importer
  captures each record's original token through generated reads and generated
  CRUD initializes/increments it. Same-request retries retain that snapshot;
  concurrent edits fail for review. Business versions and release checksum
  rules remain unchanged. Other operations on managed schemas fail explicitly.

- Add import headers, processors, validators, and adapters in the owning module or project layer.
- Keep import runs idempotent and auditable.
- Do not send local filesystem paths from Axis; use governed upload/media references.
- Keep tenant precedence, publication state, checksum, and rollback evidence explicit.

Generic media validation requires missing business properties only when the
effective schema provides no non-empty default. The normal save lifecycle still
supplies declared defaults and audit timestamps; validation does not evaluate
default providers or add their results to the source file. Unknown properties and
missing query identities remain errors. A valid dry run is separate from an
acknowledged import and its persisted readback.

## Release Readiness Contract

Conventional discovery ignores only undeclared folders containing no files after
safe containment and symlink inspection. Empty directory scaffolding left by a
source refactor is not a release. Explicit manifest sections, descriptor-only
folders, malformed manifests and unsafe or nonempty sources retain normal
validation and visible failure evidence. This discovery rule never changes an
installed receipt, imports records or permits zero-work installation. See the
[discovery contract](llm/contracts/import-release-contracts.md#empty-conventional-source-folders)
and `test/emptyConventionalReleaseDiscovery.test.js`.

Release planning and execution require capability-owner
[target admission](llm/contracts/README.md#release-target-admission-and-partial-recovery)
before installation claims or row dispatch. This never grants permissions,
replaces row validation or makes partial imports atomic.

The backend data-release catalogue owns readiness; Axis renders it without
inferring state from source folders or browser state. The
[module release contract](llm/contracts/import-release-contracts.md#module-release-manifests)
defines bounded blocker fields, shared severity vocabulary, capability grouping
and permitted repair operations.

Readiness is derived from the available release, installed receipt, active run
state, optional manifest capability metadata, and optional release descriptor
metadata. Common state mapping is:

| Release status | Business status | Typical next action |
| --- | --- | --- |
| `CURRENT` | `PREPARED_STAGED` | No import action required |
| `RUNNING` | `PREPARING` | Refresh readiness |
| `NOT_INSTALLED` | `NOT_PREPARED` | Prepare capability |
| `UPDATE_AVAILABLE` | `NEEDS_ATTENTION` | Update release |
| `FAILED` | `NEEDS_ATTENTION` | Retry failed import |
| `DOWNGRADE_AVAILABLE` | `NEEDS_ATTENTION` | Review installed version |
| `INVALID_RELEASE` | `NEEDS_ATTENTION` | Repair release manifest |

Repair metadata is guidance, not authority. nImport owns install/update/retry;
BackOffice owns orchestration, locks, receipts and audit. Invalid source releases
require owner repair, not automatic browser repair or a project-owned importer.

## Optional Release Descriptor

A release source root may include `release.descriptor.json` when the business
capability cannot be safely derived from the generated manifest. The descriptor
is not import payload and is excluded from release file expansion and checksum
calculation.

For aggregate manifests, declare section metadata under
`sections.<sectionCode>.capability`:

```json
{
  "sections": {
    "commerce": {
      "capability": {
        "code": "agora.apparel",
        "displayName": "Agora Apparel",
        "type": "ACCELERATOR",
        "group": "PROJECT_ACCELERATOR",
        "businessOutcome": "Prepare storefront commerce data."
      }
    }
  }
}
```

Allowed capability fields are `code`, `displayName`, `type`, `group`,
`extendsCapability`, and `businessOutcome`. Values must be bounded,
client-safe, and free of secrets or environment-specific runtime values. The
descriptor describes data intent only; framework logic, runtime configuration,
operator state, approval tasks, endpoints, and credentials belong to their
owning modules and configuration layers.

## Documentation

The [manifest](data/manifest.json) selects the current immutable documentation:

- [Import, export and migration guide](data/docs-v001/records/documentation/importDocumentationRelease003ComponentData.js)
- [Release contracts](llm/contracts/import-release-contracts.md) cover prerequisites,
  staging, media boundaries, layered composition, receipts and recovery.
  Cross-framework TEE/DEAP guidance is discovered through the `nodics.docs`
  catalogue, not a parallel Markdown authoring tree.

## Verification

See the [validation and operational safeguards](llm/contracts/README.md#validation-and-operational-safeguards) for exact admission, failure and recovery boundaries.

Run the affected owner tests, `npm --prefix nodics.docs test` and `npm run quality:docs`.

## Recorded release preparation

Authorized native operators can select checkpointed continuation on an exact Init, Core or Sample install. nImport persists the immutable actor/destination/source plan and claims at most one release per call. Typed execution history and receipt reads recover progress after navigation or restart. An uncertain command is reconciled only from its exact installation receipt; there is no timeout takeover or automatic replay. Process continues to own cross-domain workflow and approval. See [recorded release preparation](llm/contracts/release-execution-continuation.md).

Readiness repair uses the same checkpointed release execution. Its provider rechecks native import permission before preview, mutation and replay; only verified owner completion closes the BackOffice receipt. Reconciliation reads the original plan and installation evidence without dispatching another import.
