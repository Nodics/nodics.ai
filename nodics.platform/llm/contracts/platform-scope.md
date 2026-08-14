# Platform Scope

## Initial target

`nodics.platform extends nodics.foundation` and adds authenticated API composition,
Profile integration, BackOffice registration/discovery, and governed
documentation delivery.

## Required boundaries

- Profile remains authoritative for human/customer/employee identity.
- Service-to-service identity remains distinct from username/password login.
- BackOffice owns registration projection and effective catalog, not runtime
  module activation.
- Axis evaluates the effective catalog for presentation but backend APIs enforce
  authorization independently.
- A documentation-content project publishes versioned content; platform
  validates, imports, indexes, versions, secures and serves a read projection.

## First proof

After core startup is proven, a customer project `platformServer` can extend
`nodics.platform`. Success requires deterministic composition, configuration
precedence, authenticated health/bootstrap APIs, failure and shutdown behavior,
and no dependency on any pre-existing runtime at execution time.
