# BackOffice AI Contracts

See [governed application setup](governed-application-setup.md) for full-catalogue
publication prerequisites before operational data initialization.

This index routes developers to BackOffice's discovery, registration, readiness and governed repair contracts.

## Application Readiness Evidence

Application readiness is an owner-targeted observation, not the most recent
global import outcome. Only the selected release owner's `FAILED` status maps
to `IMPORT_FAILED` / `REVIEW_IMPORT_HISTORY`. Missing or unrecognized release
evidence maps to `READINESS_UNKNOWN`; a failed prerequisite or transport check
maps to `READINESS_UNAVAILABLE`. Neither asserts that an import was attempted.
Unknown evidence blocks preparation; it never grants install admission.

The import owner's `ERR_IMP_00003` with HTTP 400 is a typed preflight
validation refusal; `ERR_IMP_00004` with HTTP 404 is a selected-release
availability refusal. Prefer nService's response-owned
`metadata.remoteHttpFailure` code/status over the normalized default status;
neither exception text nor response-body metadata establishes this evidence.
The selected batch remains `VALIDATION_BLOCKED`, producing
`READINESS_VALIDATION_BLOCKED` / `REVIEW_SETUP_PREREQUISITES` with no executable
repair. A batch refusal does not identify which individual release failed and
does not establish an import failure or a runtime outage. Do not expose raw
owner errors, infer Profile qualification, or install unaffected members of a
held batch. Review releases independently through the existing governed import
workbench when individual diagnostic evidence is needed.

Publication-runtime availability is separate from overall application readiness.
Resolve the configured connection through the existing deployment alias owner;
project its canonical server only after that binding succeeds. Recognized
preflight release evidence from that same server/role, fresh successful Media
metadata evidence, or a successful fixed publication-target response establishes
`AVAILABLE` for this request even if another runtime's prerequisites are blocked.
Missing, unrecognized, ambiguous or different-role evidence remains `UNKNOWN`.
Availability here is a point-in-request response observation, not continuous
health, publication readiness, Online qualification, or permission to execute.

The router's typed `ERR_RTR_00004` maps to `READINESS_RATE_LIMITED`, including
read-only publication-baseline status calls. Its only recovery operation is
`applicationInitialization.status` / `REFRESH_READINESS`, after waiting.
These codes do not create a failed publication, replay a write, enable a module,
relax eligibility, or authorize an import retry. Generic HTTP 500, authorization
denial, and opaque startup transport failures are not proof of a safely retryable
operation. Existing diagnostics and runtime-owner checks remain authoritative.

Import history remains local to the selected import runtime and tenant. A generic
History route without an exact authorized `importInstance` is not an aggregate
of every runtime and cannot prove that another runtime has no receipts. Axis
uses the authenticated connection catalogue for an exact-runtime read handoff;
never infer that endpoint from a receipt or invent a browser aggregation owner.

For an owner-confirmed failed data release, `repair.handoff` uses contract
version 1, owner `import`, action `REVIEW_IMPORT_HISTORY`, `readOnly: true`
and `automaticExecution: false`. An available handoff supplies `repair.route`,
`handoff.route`, `handoff.importInstance`, `targetServer` and
`targetRuntimeRole`. The route is the authorized effective `imports-exports`
navigation route plus `area=history&importInstance=<exact instance>`. No endpoint
or historical run ID is inferred or returned. A preparation operation failure
may carry the same descriptor as `operationFailure.historyHandoff` only when
fresh owner evidence confirms the failed selected release.

The registry's `readNavigationRecoveryContext(request)` reuses the existing
store, discovery/module permission checks, client-safe projection, functional
eligibility, fresh availability observations and effective navigation owners.
It does not expire leases, invoke bootstrap auditing, install data, or query
Media/publication readiness. The handoff requires one unexpired, healthy,
authorized import instance in the selected environment matching the exact
server and runtime role. Missing/ambiguous/denied evidence returns an unavailable
descriptor without a route. Navigation never grants history API permission.
Axis must preserve the descriptor and revalidate its instance against its
current authenticated catalogue; it must not substitute Process navigation,
guess a connection, aggregate unrelated runtimes, or turn navigation into retry.

Additional focused command:

```sh
node --test nodics.platform/modules/backoffice/test/applicationImportHistoryHandoffContract.test.js
```

Focused source verification from the framework root:

```sh
node --test nodics.platform/modules/backoffice/test/applicationReadinessEvidenceContract.test.js nodics.platform/modules/backoffice/test/applicationPreparationReceipts.test.js nodics.platform/modules/backoffice/test/applicationTargetDiagnostic.test.js nodics.platform/modules/backoffice/test/backofficeApplicationInitializationContract.test.js
```

This suite uses inert collaborators and performs no runtime imports, database
writes, or live qualification. Customize through the layered BackOffice owner
service while retaining typed evidence and the separate execution admissions.

Keep CMS content delivery and target business APIs with their owners. Preserve signed scope, freshness, client-safe projections and explicit authorization; setup previews never install or activate dependencies.

Detailed material is preserved in the adjacent [contract guide](backoffice-governance-contracts.md). This README is the discovery index, not a replacement authority or evidence that runtime qualification passed.

Read [owner guidance](../../AGENTS.md) before changing behavior. Customize through the established later-loaded configuration, services, providers, schemas and runtime layers described in the guide; do not copy framework owners or bypass their invariants. Verification commands and their limits are retained in the guide. This documentation-only reorganization runs no behavioral tests or operations.

## Documentation source routing

See [Documentation source routing](backoffice-governance-contracts.md#documentation-source-routing).

## Canonical registry acceptance

See [Canonical registry acceptance](backoffice-governance-contracts.md#canonical-registry-acceptance).

## Startup and configuration validation

Generic tab workspaces may carry Profile's version-1 inert
`setupContinuation` descriptor. Its declared transport contains only type,
availability, bounded configured task/reason labels and optional inspect/resume
actions. Explicitly unavailable descriptors may omit actions entirely; available
descriptors require both. Inspect is GET, resume is POST with only
`expectedRevision`, and a qualified resume requires availability. Relative paths
support prepared custom prefixes but contain exactly one `{enterpriseCode}`
selector and no traversal, query, credentials or other selectors. Registry
metadata does not grant execution rights or expose retained setup intent/proof.
The API schema and executable contract reject undeclared fields throughout.
Unrelated native workspaces do not acquire this field. Regression coverage uses
the real Profile workspace/continuation owners and registration builder, including
unavailable metadata; omitting the continuation owner from a fixture is not
equivalent to installed module composition.

See [Startup and configuration validation](backoffice-governance-contracts.md#startup-and-configuration-validation).

## Required data completion before activation

See [Required data completion before activation](backoffice-governance-contracts.md#required-data-completion-before-activation).

## Inherited application targets and observed package facts

See [Inherited application targets and observed package facts](backoffice-governance-contracts.md#inherited-application-targets-and-observed-package-facts).

## Application capability readiness and repairs

See [Application capability readiness and repairs](backoffice-governance-contracts.md#application-capability-readiness-and-repairs).

### Business offering setup review

See [Business offering setup review](backoffice-governance-contracts.md#business-offering-setup-review).

## Operational readiness aggregate

Assistant knowledge readiness may be asynchronous. Await the owner with the
original authenticated request; preserve its evidence/coverage window, inspection
and cleanup counters, and unknown job-failure count. Do not convert a Promise,
missing response or rejected owner into ready state. Generation-mode Knowledge
owns current policy and physical count checks; BackOffice adds no index probe or
repair authority. See Knowledge's `llm/examples/durable-readiness.md`.

See [Operational readiness aggregate](backoffice-governance-contracts.md#operational-readiness-aggregate).

## Guided readiness repair provider contract

See [Guided readiness repair provider contract](backoffice-governance-contracts.md#guided-readiness-repair-provider-contract).

## Application Preparation Media Retry

See [Application Preparation Media Retry](backoffice-governance-contracts.md#application-preparation-media-retry).
