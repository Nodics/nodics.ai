# import

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

## Release Readiness Contract

Release planning and execution delegate header-target admission to capability
owners selected by `data.dataReleases.targetValidators.<moduleName>`. Each
loader-visible service exports read-only `validateImportTarget(metadata)` and
must return exactly `true`; unavailable owners, refusals and owner failures
reject before any installation claim or row dispatch. Metadata contains only
module/schema/index/operation and release destination/lifecycle, never rows.
This prevents a correctly labelled Staged release from hiding operational
targets. It does not replace row validation, grant permissions or make a failed
partial import atomic. Custom installers retain their existing preflight owner.
See [target admission and partial recovery](llm/contracts/README.md#release-target-admission-and-partial-recovery).

The data-release catalogue is the backend authority for import readiness. Every
catalogue item can carry a client-safe `readiness` projection with:

- `capabilityCode`, `displayName`, `capabilityType`, and `group`;
- `businessStatus`, `technicalStatus`, `releaseStatus`, and `nextAction`;
- bounded blockers with stable `blockerCode`, `code`, shared severity
  (`INFO`, `WARNING`, `BLOCKED`, or `REPAIR_REQUIRED`), `owner`,
  `ownerType`, `source`, `message`, `action`, client-safe disabled reason,
  sanitized technical status, and optional client-safe `repair` metadata;
- optional `extendsCapability` and `businessOutcome` for business grouping.

Axis renders this projection as preparation readiness. It must not calculate
readiness from browser state, source folders, or release names.

This projection uses the same blocker vocabulary as BackOffice application
capability readiness. Axis pages must not keep legacy `ACTION` or `BLOCKER`
normalization fallbacks as the primary contract; those strings are historical
compatibility only.

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

Blocker `repair` metadata is declarative guidance, not a browser authority. It
identifies whether a safe governed action is available now, the owning operation
family, an action code, idempotency, and whether confirmation is required.
Install/update/retry release actions stay inside nImport. Source defects such as
invalid generated release manifests are marked unavailable for automatic browser
repair and should guide the developer/operator to repair the owning source
release instead of asking business users to understand manifest internals.

The module registers `dataReleaseReadinessRepairProvider` when BackOffice
operational-readiness orchestration is present in the same runtime. BackOffice
owns repair locks, receipts, audit, cluster refresh events, and Axis response
contracts. The provider owns only nImport-specific execution and delegates to
`DefaultDataReleaseService.preflight` or `DefaultDataReleaseService.execute`.
Projects must not add parallel import repair handlers in Axis or custom project
code; extend nImport release policy, release data, or owner manifests instead.

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

Deep documentation lives in:

- `nodics.docs/docs/pages/nodics.foundation/data-import-export-migration.md`
- `nodics.docs/docs/pages/nodics.wcms/media-management.md`
- `nodics.docs/docs/pages/applications/tee-deap-solution-use-cases.md`

## Verification

`nodics project:run acceptance:staged-sample-data --target-role=<ROLE_STAGED> --release-modules=<module,...>`
checks the secured sample catalogue and validation APIs using employee authority.
Start the selected Platform and Staged runtimes through the project's topology
tooling first. The suite never starts or stops servers. `--help` is inert.
Application `dataPackages` in effective Platform profiles select the releases;
the module allowlist ignores inactive applications but fails when nothing matches.
Application data and fixture selections remain with their owners.

The default is validation-only. `--execute-install` explicitly permits installation;
the historical storefront-specific environment flag has no effect. Versions come
from the catalogue, never a guessed fallback. Duplicate/missing identities, wrong
destinations, changed versions and validation responses claiming execution fail.
Current releases are skipped; after installation the catalogue must report the
same selected versions as `CURRENT`. Import errors, including immutable-release
errors, are not success evidence. Partial installation is not automatically rolled
back; resolve the failure and retry through nImport. No reset, Online publication,
permission mutation or approval is performed by this suite.

Run import-focused contract tests when behavior changes, then run:

```bash
npm --prefix nodics.docs test
npm run quality:docs
```

Release composition uses target-qualified headers and current lower JS sources;
only executing-delta keys reach persistence. Evaluate Init deltas on every boot,
skip current receipts, and reject running or same-version edited Init releases.
See [layered composition](llm/contracts/README.md#layered-immutable-source-composition).

This capability declares an inert model-service inventory for [governed Local reset](../../../nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.

Release execution claims durable installation receipts through the existing
managed-counter database contract. Require matching attempt identity for
completion; never fail unstarted releases or take over a running attempt on a
timeout. See [concurrent release execution](llm/contracts/README.md#concurrent-release-execution).

Route-category defaults belong to this capability; deployments supply only intentional overrides.
Preserve nRouter enforcement and independent route authorization. See [exposure ownership](../../../nRouter/llm/contracts/README.md#capability-owned-exposure-defaults).

Own release safeguards and inert initialization profile templates. Deployment selection and exact-release permissions remain mandatory; see the local contract.

Content-pack defaults belong to `data.contentPacks.defaults` in this capability. Selected packs inherit source conventions, update policy and complete presentation fields; partner contributions override only intentional differences. Resolve omitted content paths from the selected manifest section, preserving explicit path overrides and all import authorization/checksum/staging guards. See `llm/contracts/README.md#content-pack-defaults-and-manifest-paths`.

Sample releases are available to authorized manual operators by default, with optional deployment restriction. Only Init can auto-run at startup. Environment scope reads the effective `environment.class` projected by nConfig from the selected environment module metadata; never author it in environment properties or derive it from the selected environment name or another capability policy. Permissions, roles, tenant isolation, release checksums and durable receipts remain mandatory.

Explicit enterprise placement belongs in a checksummed developer release header,
not imported rows or operator claims. nImport delegates fresh validation through
`data.dataReleases.targetValidators` and exposes only transient exact-request
metadata to the owning generated operation. Read the
[placement contract](llm/contracts/README.md#explicit-enterprise-placement).
