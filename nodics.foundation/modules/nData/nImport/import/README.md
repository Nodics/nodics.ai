# import

Import provides governed data ingestion for seed packs, migration inputs, media-backed uploads, headers, validation, dispatch, and execution evidence.

## Responsibility

This module owns generic import mechanics. Functional modules own their data meaning, schemas, default packs, lifecycle state, and business validation.

## Developer Notes

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

The data-release catalogue is the backend authority for import readiness. Every
catalogue item can carry a client-safe `readiness` projection with:

- `capabilityCode`, `displayName`, `capabilityType`, and `group`;
- `businessStatus`, `technicalStatus`, `releaseStatus`, and `nextAction`;
- bounded blockers with `code`, `severity`, `owner`, `message`, and `action`;
- optional `extendsCapability` and `businessOutcome` for business grouping.

Axis renders this projection as preparation readiness. It must not calculate
readiness from browser state, source folders, or release names.

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
