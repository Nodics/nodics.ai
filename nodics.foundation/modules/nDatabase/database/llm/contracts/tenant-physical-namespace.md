# Tenant Physical Namespace

## Readiness Observation Cost And Admission

The database connection contributor delegates to the selected database
configuration owner's `areRequiredConnectionsReady` when provided. The owner
checks the current whole-runtime durable binding once per tenant per synchronous
observation, then preserves current per-module scope and isolation checks and
inspects acquired master handles. It never creates connections, persists an
approval, or caches a pin across observations. Ordinary `getTenantDatabase`
and mutation admission remain unchanged. Layered configuration owners may
override this boolean capability while preserving these checks. The default
capability preserves the legacy per-handle path when either `getTenantDatabase`
or `getDatabaseConfiguration` is customized. It uses existing loader member
provenance and baseline function identity (which the startup Lodash merge
preserves); absent/changed identity conservatively retains the getter path.
A later layer must explicitly supply its own readiness capability to adopt
optimized behavior with customized legacy admission. Owners without the
capability also retain the existing per-handle contributor path.

Do not rebuild the complete module binding for every module during one health
observation: that multiplies namespace validation by the module count and can
make an otherwise-ready runtime exceed the existing public-probe deadline.
Missing pins, base/provider drift, aliasing and absent/failed acquired handles
still produce not-ready. Lease renewal and startup READY are not substitutes
for fresh health evidence, and probe deadlines must not be raised to mask this
work amplification. `tenantPhysicalNamespaceContract.test.js` covers this
source composition without opening providers or changing runtime data.

## Qualification Boundary

The current version-1 DERIVED path requires a stored exact deployment/server
binding BEFORE provider dispatch; unpinned intent fails closed. Database-owned
candidate construction and restart/config-drift rejection are source-tested.
Profile persistence/transport, installed qualification and migration acceptance
are separate integration gates, not proved by these helpers. Do not adopt
intent/bindings on established tenants as an automatic repair. A retained
partial tenant with failed-import evidence remains HELD pending explicit owner
recovery, never automatic first-binding or relocation.

## Authority and Provisioning

nDatabase owns physical namespace resolution. Tenant provisioning remains with
the existing domain owner. No second tenant registry, identity authority or
driver-based business provisioning is introduced.

The current source API for NEW tenant intent is the selected layered
`DefaultDatabaseConfigurationService.createTenantNamespaceIntent(tenantCode)`.
Its properties fragment is intended for the existing Tenant owner in
`Tenant.properties`, not an activation authorization:

```js
{ database: { tenantNamespace: {
  version: 1, mode: 'DERIVED', tenantCode: 'example-tenant'
} } }
```

The fragment contains no credentials, URI, physical database name or Platform
database override. It requests deterministic derivation from EACH runtime's
default-tenant, module-effective database configuration. Ordinary same-tenant
modules intentionally sharing a base continue sharing a physical namespace.
Different runtime/module base names derive different destinations.

This descriptor is not an access grant. Public data must never replace the
provisioning owner's authorization or credential ownership checks. The owning
caller must merge the fragment through the existing properties layer, not copy
browser-supplied namespace intent. The database owner validates exact version,
mode, tenant binding and keys on resolution.

## Admission and Existing Installations

`getDatabaseConfiguration(moduleName, tenant)` resolves without provider writes
and checks configured active tenant peers across database modules and both
master/test channels. `createDatabaseConnection` preflights the entire requested
module batch BEFORE the first provider dispatch. Non-default model-handle reads
also recheck admission through `getTenantDatabase`.

Default-tenant resolution is unchanged. No descriptor means NO derivation:
established explicit, distinct physical names remain unchanged; inherited or
case-only aliases fail with `ERR_DATABASE_TENANT_NAMESPACE`. An existing alias
must undergo separately approved migration, never receive a descriptor silently.
No data is copied, deleted, initialized or relocated by this helper.

With DERIVED intent, a channel still naming its module-effective base derives;
a different explicitly configured channel name is honored only after isolation
admission. A differing provider with qualified positive name validation may
serve an explicit isolated override, with or without DERIVED intent. Automatic
derivation requires a matching base provider type and a selected derivation
method; an unsupported automatic path rejects. Both configured channels are
checked even if test execution is disabled. Validation must return exactly true;
undefined, false and merely truthy values are not admission.

Name comparison is deliberately case-insensitive and endpoint-independent. A
different URI is NOT accepted as evidence of isolation: aliases, credentials,
DNS and replica-set permutations cannot safely establish separate clusters from
source strings. Equal names on independent clusters consequently reject; a
later-layer provider strategy must preserve equivalent proven isolation.

Active configured peers are the available source evidence, not an installed
all-cluster inventory. Unknown/offline tenants and external deployments cannot
be inferred. Unresolvable configured peer admission fails closed. Existing
registered native handles reject a different resolved database name.

Across process restarts DERIVED admission compares the complete current candidate
against the owner-persisted binding, without relying on an in-memory handle. A
base, provider, destination, endpoint fingerprint, module inventory or stable
scope change rejects. Neither admission nor candidate construction updates a pin
to make configuration pass. Explicit installed migration review remains required;
this source change does not qualify migration or prove physical cluster isolation.

## Retained Handle Cleanup

Write/read admission MUST NOT gate closure of acquired resources. Internal
`getRetainedDatabaseScopesForCleanup()` enumerates exact owned registry pairs,
including inactive modules and rolled-back tenants. Internal
`getRetainedTenantDatabaseForCleanup(moduleName, tenant)` returns only an exact
owned wrapper without configuration resolution, active-scope validation, module
fallback, connection creation or a write grant. Do not expose these methods via
public routes or use them for CRUD/model/Init access.

`closeAllConnections()` uses the retained inventory, not the active topology.
Closure uses the provider captured by the retained wrapper. Shared native clients
are closed once per shutdown call; missing clients do not collapse unrelated
wrappers. All acquired closes are attempted and awaited before the first failure
is returned. Missing closure providers reject rather than reporting success.
Registry entries remain retained on failure; a new cleanup call can retry with a
fresh deduplication set. No registry removal is inferred from failed closure.

## Durable Binding Helpers and Transport DTO

`buildTenantNamespaceBinding(tenantCode)` builds and structurally validates a
pure candidate BEFORE requiring an existing pin. Effective tenant properties
and DERIVED intent must already be prepared; no provider, DNS or Tenant write
occurs. It computes the CURRENT runtime's complete database-module batch, never
an authored-only lookup or fabricated all-runtime configuration snapshot.

The exact DTO is:

```js
{
  scopeKey: 'deployment_' + sha256(JSON.stringify([projectCode, environmentCode, serverCode])),
  binding: {
    version: 1,
    tenantCode,
    scope: { projectCode, environmentCode, serverCode },
    modules: {
      [moduleName]: {
        databaseType,
        connectionHandler,
        channels: {
          master: {
            base: { databaseType, connectionHandler, databaseName, endpointFingerprint },
            destination: { databaseName, endpointFingerprint }
          }
          // Optional test: identical entry shape.
        }
      }
    }
  }
}
```

The project comes from `NODICS.getEnvironmentName()`, selected environment from
`getSelectedEnvironmentName()`, and server from `getServerName()`. All three
are required bounded stable codes; no silent fallback is allowed. No node,
process or instance identity enters the key.
Replica identity can authorize the caller at Profile, not assign a namespace.

Profile persists ONLY `binding` at existing
`Tenant.properties.database.tenantNamespaceBindings[scopeKey]`, through its
trusted owner with fresh runtime authorization, CAS and exact fresh readback.
No second registry or database-owned Tenant writer exists. First binding requires
trusted new-provisioning evidence, not a caller marker or failed Init history.
This contract specifies the consuming transport boundary; it does not claim
Profile/nService integration is delivered by this database-only change.

`validateTenantNamespaceBindingCandidate(candidate, expected)` returns exactly
true or `ERR_DATABASE_TENANT_BINDING`. `expected` is fresh owner-derived
`{tenantCode, projectCode, environmentCode, serverCode}`, NOT copied from the body. Validation
requires exact DTO keys, the computed scope key, default module/master channel,
at most 256 modules, 128-character module/provider codes, 256-byte database names,
64-lowercase-hex fingerprints and a maximum 262144-byte serialized DTO. It checks
structure/scope only, not first-binding authority or another runtime's config.

`assertTenantNamespaceBinding(tenantCode)` requires exact stored candidate
equality for DERIVED tenants. `getDatabaseConfiguration` invokes it before any
provider dispatch; the existing complete-batch preflight propagates its typed
error. Default and explicit legacy tenants without intent retain their behavior.

## Endpoint Proof Boundary

The Mongo provider's pure `getTenantEndpointFingerprint(channel)` uses the
driver dependency `mongodb-connection-string-url`, not regex URI stripping.
It is a direct root runtime dependency, pinned to the already locked 2.6.0
version and governance-restricted to the MongoDB module. Module manifests remain
metadata-only; root package/lock are the installation authority.
It hashes protocol, canonical sorted seed endpoints, explicit database name,
and allowlisted replica-set/direct/load-balanced/SRV, TLS/trust-file and proxy
endpoint options. The default Mongo port and hostname case are canonicalized;
supported effective options override matching URI options. Ambiguous duplicate
aliases reject. Unix-domain socket endpoints are unsupported and reject before
host case normalization/default-port handling; case-sensitive socket paths must
never be treated as TCP hosts. URI userinfo, auth-source/mechanism secrets and TLS private-key
passwords are excluded; credential rotation alone does not change namespace.
Only fingerprints/names/provider codes are persisted, never endpoint URIs.

A fingerprint is CONFIGURATION drift evidence, not proof of DNS/SRV resolution,
certificate file contents, actual physical cluster identity or distinct storage.
Endpoint aliases, changed DNS and unchanged paths with changed certificate
contents remain installed qualification boundaries. Do not accept a browser
assertion or equate URI/hash equality with cluster proof. Missing fingerprint
capability or changed configured identity rejects before provider connection;
independent installed proof must be supplied by the existing deployment owner.

## Provider Contract and Customization

The selected connection provider implements pure methods:

- `validateTenantDatabaseName(name) -> true`, or a content-free typed error.
- `deriveTenantDatabaseName(baseName, tenantCode) -> string`, required only for
  automatic derivation, not qualified explicit isolated overrides.
- `getTenantEndpointFingerprint(channel) -> 64-lowercase-hex string`, required
  for base/destination providers involved in DERIVED binding construction.

MongoDB uses a sanitized readable base prefix of at most 16 characters, `_t_`,
and the full SHA-256 base64url digest of JSON `[1, exactBaseName, exactTenantCode]`.
The resulting name is at most 62 ASCII bytes. The digest uses exact strings:
case changes, Unicode or normalization collisions never collapse to the readable
prefix. Configured name collisions still reject rather than trusting a hash.
Portable name validation rejects empty/over-63-byte names, whitespace, forbidden
Windows/MongoDB characters and reserved `admin`, `config`, `local` databases.

Later-layer services may override these methods through normal framework exports;
do not replace the registry or bypass pre-provider admission. Providers without
the pure namespace contract cannot serve a non-default tenant. Provider methods
must not contact storage or disclose URIs/credentials in diagnostic errors.

## Source Evidence

Run from the framework root:

```sh
node nodics.foundation/modules/nDatabase/database/test/tenantPhysicalNamespaceContract.test.js
node nodics.foundation/modules/nDatabase/database/test/tenantDatabaseConfigurationValidation.test.js
node nodics.foundation/modules/nDatabase/database/test/databaseConnectionHandlerRuntimeConfigContract.test.js
node nodics.foundation/modules/nDatabase/database/test/databaseShutdownCompletionContract.test.js
```

These are source-only fixtures; they open no MongoDB connection. They prove
multi-tenant/runtime/module derivation, isolated explicit overrides, bounded
names, alias rejection, in-process existing-handle fences, qualified explicit
differing-provider overrides and actual connection batch admission before
provider dispatch. Shutdown cases prove retained cleanup despite failed
admission/rollback, awaited unique closes, failure propagation and retry.
Fresh-module fixtures prove stored-pin admission without retained handles and
base/provider/endpoint drift rejection before provider dispatch. Fixture secrets
remain excluded and password rotation leaves endpoint fingerprints unchanged.
These fixtures do NOT prove installed owner persistence or cluster identity.
Installed provisioning, seed behavior,
cross-runtime readiness and browser acceptance remain integration gates.
