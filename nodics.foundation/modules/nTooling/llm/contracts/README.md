# nTooling AI Contracts

Documentation catalogues resolve explicit `CONTENT_PACK.includes` with nImport's
existing checksum/containment authority. Preserve each article's physical owner,
stable ID, route and anchor; do not assemble a second canonical source tree.
Explicit `referenceCatalogues` resolves validation-only targets through the same
local repository resolver and checksum/containment checks. Bound the selection,
reject duplicate/mismatched packs and conflicting canonical identities, and check
the complete selected reference graph's owners and anchors. It does not expand
staging, import records/assets or delivery scope. Never import a missing target
implicitly. Caller-supplied owner roots cannot expand the selected composition.
Authoring validation may retain draft records; reviewed STAGED routes are normal
publication inputs, not Online authority. Immutable CMS/Media activation and
normal Process approval govern public delivery. Inactive draft routes remain
excluded from site selection.
The existing record validator permits absent reviewer, approver and publisher
fields only for DRAFT/STAGED records in AUTHORING scope. Author provenance,
checksums, workflow and decision policy remain mandatory; null audit fields still
refuse. Later lifecycle states and PUBLIC_DELIVERY retain their existing actor
checks. Validation must never populate an approval actor or advance lifecycle.

- [Registered enterprise lifecycle suite and deferred safety classification](enterprise-lifecycle-suite.md)

This index routes developers to nTooling's command, generation, qualification and reference-change contracts.

Reuse established module discovery, manifests and topology owners. Customer selections do not replace canonical pass criteria; source preflight never grants business approval or runtime write authority.

Detailed material is preserved in the adjacent [contract guide](tooling-governance-contracts.md). This README is the discovery index, not a replacement authority or evidence that runtime qualification passed.

Read [owner guidance](../../AGENTS.md) before changing behavior. Customize through the established later-loaded configuration, services, providers, schemas and runtime layers described in the guide; do not copy framework owners or bypass their invariants. Verification commands and their limits are retained in the guide. This documentation-only reorganization runs no behavioral tests or operations.

## Reference Change Preparation

See [Reference Change Preparation](tooling-governance-contracts.md#reference-change-preparation).

## Maintenance Outage Evidence

See [Maintenance Outage Evidence](tooling-governance-contracts.md#maintenance-outage-evidence).

## Forward data releases

See [Forward data releases](tooling-governance-contracts.md#forward-data-releases).

## Functional Journey Composition

See [Functional Journey Composition](tooling-governance-contracts.md#functional-journey-composition).

## Project and repository build targeting

See [Project and repository build targeting](tooling-governance-contracts.md#project-and-repository-build-targeting).

## Complete export governance

See [Complete export governance](tooling-governance-contracts.md#complete-export-governance).

## Installed project command

See [Installed project command](tooling-governance-contracts.md#installed-project-command).

## Disposable runtime acceptance

See [Disposable runtime acceptance](tooling-governance-contracts.md#disposable-runtime-acceptance).

## Mandatory final review discovery

See [Mandatory final review discovery](tooling-governance-contracts.md#mandatory-final-review-discovery).

## Minimal generated topology

See [Minimal generated topology](tooling-governance-contracts.md#minimal-generated-topology).

## Configuration ownership checks

See [Configuration ownership checks](tooling-governance-contracts.md#configuration-ownership-checks).

## Reusable acceptance mechanics

See [Reusable acceptance mechanics](tooling-governance-contracts.md#reusable-acceptance-mechanics).

## Canonical acceptance commands

See [Canonical acceptance commands](tooling-governance-contracts.md#canonical-acceptance-commands).

## Effective acceptance policy

See [Effective acceptance policy](tooling-governance-contracts.md#effective-acceptance-policy).
## Selective Local JWT Rotation

Native Local startup also supplies a stable runtime-configuration encryption key
through the existing generated credential owner. Missing keys are provisioned
once, existing keys are preserved, and deployment overrides retain precedence.
This key does not grant access or provision provider tokens. Runtime secret writes
still use the nSystem schema-owned encrypted store. Never substitute generated
local values into non-Local environments or rotate encryption during startup.

`DefaultProjectLocalRuntimeCredentialService.rotateJwtSecret(projectRoot,
environmentCode)` is an explicit operator operation, not startup normalization.
Only an existing canonical Local environment credential file is eligible. Require
an exclusive verified runtime outage and inspect launcher/runtime environment
overrides before calling: those inputs take precedence over generated values.
Never call `ensureCredentials` as part of a selective rotation.

The method rejects unsafe environment paths, symlinked/multiply-linked files,
non-0600 permissions, missing/invalid/oversized records and intervening changes.
It generates 64 random bytes through the existing owner, changes only
`NODICS_JWT_SECRET`, proves every other credential value byte-equal and persists
through a 0600 exclusive temporary file, fsync and atomic rename. Secret values
never appear in its receipt or errors. Temporary state is removed on failure.
The outage is operator-controlled, not a distributed file lock; no concurrent
credential writer is admitted. A post-commit durability/readback failure reports
`JWT_ROTATION_COMMITTED_REQUIRES_RECONCILIATION`, never a synthetic rollback.

Rotation does not change passwords, pepper, service proof, grants or databases;
it does not flush cache namespaces or restart processes. Restart all participants
with the approved new signing reference, verify previous signed JWT rejection,
and separately verify missing refresh sessions in an approved isolated namespace.
The existing `projectLocalRuntimeCredentialService.test.js` covers selective
preservation, unsafe/missing inputs and actual JWT signature rejection using only
temporary fixture files. Source proof is not browser session acceptance.
