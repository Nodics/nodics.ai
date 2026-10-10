# Offline Disposable Local Database Reset

## Registered Tenant Destinations

`discoverRegisteredTenantCodes` is a separate read-only operation on this same
owner. It queries only `TenantModel.code` in the exact configured local Profile
registry, excludes the explicitly resolved default tenant, and includes inactive
codes rather than silently losing their destinations. A primary cursor is bounded
to 33 rows and five seconds; more than 32 candidates, malformed/duplicate codes,
unsupported topology or incomplete cleanup refuse. It initializes no schemas or
indexes and closes its cursor and owned client on every path. Only sorted codes
leave the owner; credentials and protected properties do not. The effective
provider may override this member while preserving these limits.

Discovery is not a protected binding observation, scope approval, completeness
proof for orphan databases, or reset credential. Exact selected active Tenant and
Enterprise provenance and all fresh durable-pin checks below remain mandatory.
Inactive candidates must be reconciled explicitly; they cannot be dropped using
discovery results as substitute authority.

The same provider exposes `readRegisteredTenantBindings`,
`isRegisteredTenantObservation` and `withRegisteredTenantTargets`. The first
reads only exact selected active Tenant and Enterprise provenance with bounded,
primary native cursors and owned cleanup; it performs no initialization, index
or data writes. The observation is private and frozen, never a public reset
credential. Later-layer native maintenance owners may replace this read boundary
while retaining canonical protected provenance and the same refusal guarantees.

The awaited callback consumes that observation once, requires the exact approved
project/environment/tenant set, and validates complete durable pins against fresh
database-owner candidates. Both base and destination use the existing Mongo
endpoint fingerprint owner, not ad hoc URI parsing or name derivation. Only exact
native isolated module/channel destinations can escape the original prefix/name
rule. Missing channels, foreign scopes, changed endpoints/bases/destinations,
unregistered or extra targets and copied proof refuse before the callback.

Private request identity and AsyncLocalStorage scope hold the exception throughout
the awaited operation. No caller flag, body field or serialized receipt supplies
authority. Copied requests and use after completion refuse; held drop rechecks
admission, while client closure remains available. An invocation-local deny-only
destination set prevents stripping the marker from downgrading a derived request
to base admission, even when its name fits the base grammar. It never grants
authority and does not replace durable bindings. Default name/prefix guards,
operator attestations and positive inspection are unchanged.
This source capability does not supply independent deployment exclusivity.

`DefaultMongodbDatabaseConnectionHandlerService.openLocalResetMaintenance`
delegates to the effective `DefaultMongodbLocalResetMaintenanceService`. This
is an offline provider operation, not generated CRUD, nSystem record reset,
installed-version migration or runtime startup behavior.

Only an explicit exact configured database in an operator-attested disposable
native Local deployment is accepted. Both `exclusiveDeployment` and
`writersExcluded` attestations must be true. The environment/database names must
be valid scalars; the database carries the environment prefix. System/shared
databases, remote/sharded/proxy/load-balanced targets and missing
attestations refuse. Prefix and loopback are not independent ownership proof.

The owner opens a single direct connection with bounded discovery/operation
timeouts, no retry writes, no schema/index initialization and no URI diagnostics.
It checks writable native topology and exact database binding. Standalone or
single-seed loopback replica-set endpoints are supported. Structured connection
parsing admits only a bounded optional `replicaSet` query value, not arbitrary
URI options. Fresh hello must show bounded loopback-only hosts, passives and
arbiters, with this configured endpoint equal to the writable primary and `me`.
An explicit set name must match; implicit local set discovery is held to the same
proof. Before drop, fresh topology must match the original held identity. These
checks do not establish client exclusion; tooling's operational ownership proof
is separately restricted to one-member sets. Private held
targets expose contract version 1 and count-only inspect/drop/empty-verification
operations. Inspection closes its cursor and refuses more than 1000 collections.
Drop requires prior positive inspection and acknowledgement; empty verification
requires zero collections. No collection names or driver errors reach receipts.

nTooling owns exact deployment selection, all-target preflight, fresh outage
checks before effects, operator attestations and partial-failure receipts. The
provider owns SDK calls and client/cursor cleanup. Drop/readback are not atomic
across databases or with auth cleanup. Uncertain effects never justify automatic
retry, version lowering or reopening writers. Shared search/Media remain outside
this operation. Later overrides preserve these boundaries or refuse.

The owner fixture uses injected client/database objects only. Source support and
fixture passes do not establish installed isolation, authorize a reset or prove
that external clients are excluded.
