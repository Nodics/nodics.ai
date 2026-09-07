# BackOffice Capability Registry Contract

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

Runtime configuration can disable a module-owned provider. It cannot create a
provider replacement or synthesize capability metadata that the owning module
did not publish.

Capability registration never activates or deploys a module. Lease expiry or
deregistration withdraws the effective projection without changing runtime
configuration or deleting business data.
