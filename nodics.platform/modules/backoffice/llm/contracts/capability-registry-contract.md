# BackOffice Capability Registry Contract

Backend workspace TEXT fields may declare `defaultFromParameter`, a bounded
alphanumeric query-parameter name. It supplies an editable default when following
an internal business continuation such as enterprise-to-user setup. Reject the
hint on password, hidden, permission and other non-TEXT controls. URL values are
untrusted input; the destination operation retains all validation and access
checks. This extends the existing workspace field contract, not a new registry.

BackOffice owns the effective capability registry and authenticated Axis
projection. It does not own registered modules, runtime activation, business
operations, schemas, routes, health, or permissions.

Concrete active modules optionally publish BackOffice metadata from
module-owned capability data through a service implementing `getCapability()`.
Module groups must not publish business capability services. Modules with no
Axis journey, or whose generic schema contract is sufficient, need no custom
provider.

## Runtime flow

1. A provider registers with `DefaultModuleRegistrationAgentService`.
2. The agent serializes its bounded projection into the authenticated lease.
3. BackOffice validates and stores the observed lease.
4. `DefaultBackofficeCapabilityRegistryService` selects consistent providers,
   applies durable functional-module registration and activation, rejects
   duplicate identities, filters permissions, removes orphans, and produces
   the effective catalogue.
5. Axis renders the catalogue and calls the concrete owner directly.

Multiple instances of one module produce one capability identity and multiple
availability providers. Inconsistent instance contributions fail closed.

The durable Functional Module Catalogue derives `runtimeState` and
`observedServers` from current leases. Registration renewal adds the current
server; graceful deregistration and lease expiry remove it. When the final
lease for a functional module disappears, runtime state becomes `OFFLINE`,
the observed-server list becomes empty, activation is rejected, and its Axis
capability projection is withdrawn without changing durable business data.

## Configuration boundary

### Lifecycle revision and runtime observation isolation

`catalogueRevision` protects administrator lifecycle decisions and changes to
functional identity, protection, registered version, and activation-package
policy. Runtime liveness, replica membership, display metadata and observation
timestamps do not advance that decision revision. Observation writes must not
restore a stale `enabled` or `registrationState`, or lower a newer revision.
Guard reconciliation writes by the revision read; retry only bounded observation
reconciliation, never automatically replay activation imports or human decisions.
Activation must still require an active runtime at its final conditional write.

Activation releases are identified by release code plus target server, module
and database. Two observed runtimes may advertise the same release code without
overwriting each other's target. Normalize that set deterministically. Existing
project `backofficeFunctionalModuleActivationData.modules` descriptors override
observed descriptors for the same release code, preserving project routing as
the later-layer authority. No new configuration registry is allowed.

Receipts are target-scoped. Historical receipts can be read only for their
recorded target and must never satisfy another runtime's import. New receipt
keys preserve project/module identity and include the execution target. A newer
target-scoped attempt takes precedence over an older historical receipt.

Axis clears prior lifecycle feedback when a new operation starts, refreshes
the authoritative catalogue after a rejected action, and does not automatically
retry a mutation with a substituted revision. Qualify with
`test/functionalModuleConcurrency.test.js` and the Axis Module Registry tests.

`config/properties.js` contains runtime-adjustable properties only. It must not
contain functions, navigation definitions, capability catalogues, localization
messages, workflow definitions, schemas, routes, or other business contracts.
The legacy `backofficeCapabilities` read is a disable switch only; it must not
synthesize a capability when no module-owned provider registered one.

Module-owned `data/manifest.json` DATA_RELEASE sections may be advertised by
runtime registration as activation data packages. BackOffice stores those
packages on the functional-module catalogue record and executes required
`init`/`core` releases through nImport when a human activates the functional
module. Optional `sample` releases remain user-triggered.

## Axis projection boundary

Axis consumes the authenticated BackOffice projection. It must not invent
module navigation, workspaces, lifecycle actions, content areas, grouping, or
route ownership from local frontend constants, preview shortcuts, route names,
module categories, or keywords.

BackOffice exposes a capability projection only when the owning functional
module is registered, activated, live in an observed runtime, and permitted for
the employee. If the module is absent, inactive, disabled, offline, or
unauthorized, BackOffice must withdraw the projection and Axis must hide the
left-navigation item and related functional content.

Eligibility must traverse the complete tenant/project catalogue with Nodics
`pageSize`/`pageNumber`, never a `limit` that the model pipeline overwrites.
Read size is layered through
`backofficeFunctionalModuleCatalogue.eligibilityPageSize`. Failed pages must
not return a partial eligibility set. Preserve each lease's validated
`functionalModuleIdentity` in the client-safe projection: a missing durable
record cannot turn a declared functional owner into an ungoverned capability.
Every declared functional owner requires positive eligibility. Use validated
lease ownership rather than requiring a technical member to also appear in a
durable list that may have been refreshed by another, narrower runtime batch.

Runtime configuration can disable a module-owned provider. It cannot create a
provider replacement or synthesize capability metadata that the owning module
did not publish.

Capability registration never activates or deploys a module. Lease expiry or
deregistration withdraws the effective projection without changing runtime
configuration or deleting business data.

## Feature-Scoped Availability

Use the existing `workbenchTarget.moduleName` and lifecycle-action `ownerModule`
metadata with the authorized runtime availability projection. The navigation
publisher being healthy is insufficient when its declared workbench target is
absent. Disable only that item and explain the missing owner through `help`.
An unavailable action owner disables only that action through `featureState`
and `summary`; unrelated actions remain usable. Preserve declared HIDDEN and
DISABLED states. UP and DEGRADED observations are usable under the existing
readiness contract; unknown or unavailable targets are not.

Apply these checks after governed presentation overrides as well as to module
defaults. A saved menu cannot turn a stale runtime observation into authority.
Recompute each projection without mutating the provider contribution so recovery
restores functionality. Target APIs still enforce authorization, validation and
required integration calls; BackOffice does not proxy or authorize mutations.

Optional cross-module integrations must not become whole-group activation
dependencies. Keep `backofficeFunctionalModuleActivationData.modules` for real
whole-module prerequisites and activation packages, not another list duplicating
per-feature targets. No new configuration layer or optional-module catalogue is
required.

All catalogue listings, eligibility, receipt reads and lease reconciliation must
traverse complete bounded pages through the existing page-size setting. Fetch a
project's pages before reconciling it so a failed later page cannot partially
mark its records offline. Aggregate technical membership across current leases;
one renewing instance must not replace its peers' contributions. Retain
last-known membership offline for diagnostics, never as live eligibility.

## Module-owned subtrees and native workspaces

Apply the [global contribution contract](../../../../../nodics.foundation/modules/nSetup/llm/contracts/module-owned-ui-contribution-contract.md). Parent placement never transfers the contributor's ownership. Cross-module orphan removal includes local grandchildren, and cycles are rejected after effective aggregation. The existing `backendWorkspace` field accepts the version-1 `axis.workspace.native` variant with bounded `workspaceCode`, `viewCode`, title and optional description. No executable or additional properties are accepted. Published overrides preserve these source-owned targets.

## Trusted instance binding and operational response

Registry writes require a deployment-bound service JWT. Single and batch paths
compare instance, project, environment, server and every announced module before
writing leases. Stored coordinates come from approved scope even when optional
body fields are absent. Caller declarations cannot broaden that scope. There is
no configuration switch to disable this identity binding.

The batch response projects business activation from the existing functional
catalogue for each registered technical module; it does not create another
activation authority. A registered, enabled functional record grants operational
state for a bounded `backofficeRegistry.operationalStateTtlMs` (default 30000,
1000–60000 milliseconds). Refresh uses the existing registration heartbeat.
Deactivation propagation is bounded by this freshness window, not instantaneous;
expired or absent state prevents new protected work. Lease removal leaves business
registration/data intact. Cronjob owns enforcement at job execution and retains
its existing handling of already-running jobs.
