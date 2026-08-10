# BackOffice Capability Registry Contract

BackOffice owns the effective capability registry and authenticated Axis
projection. It does not own registered modules, runtime activation, business
operations, schemas, routes, health, or permissions.

Concrete active modules optionally publish BackOffice metadata from a
module-owned service implementing `getCapability()`. Module groups must not
publish business capability services. Modules with no Axis journey, or whose
generic schema contract is sufficient, need no custom provider.

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
The legacy `backofficeCapabilities` read is bounded migration compatibility.

Capability registration never activates or deploys a module. Lease expiry or
deregistration withdraws the effective projection without changing runtime
configuration or deleting business data.
