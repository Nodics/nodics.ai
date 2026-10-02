# Enterprise Tenant Provisioning

Profile owns new Tenant provenance and durable namespace persistence. nDatabase
owns pure candidate construction, bounded validation, namespace isolation and
exact pin enforcement. nService owns proof-bound startup/event orchestration.
Reuse existing Tenant, Enterprise and runtime deployment assignments; no second
tenant registry, migration authority or credential store is introduced.

## Original Creation

`ensureTenant` captures `enterpriseProvisioning` under existing Tenant.properties:
original Enterprise code, private setup digests and the immutable approved stable
deployment scopes. Scopes come from fresh default-tenant RUNTIME_DEPLOYMENT
assignments for the trusted selected project/environment and bootstrap enterprise,
not browser fields. They must have the specific namespace-binding permission and
Profile module entitlement. The existing runtime grant owner validates shape;
actual admission later revalidates the current caller's exact grant.

Tenant code is unique. Private initial save uses an absent-properties predicate
so a concurrent creation cannot overwrite committed provenance or pins. Qualify
the unique index before live provisioning; source declaration is not installed
index evidence. New creation failure preserves its committed evidence.

An ordinary initial Tenant save checks only existence through the uncached,
nonrecursive generated Tenant read, with normal public redaction. It requires
no private capture admission: default Init precedes that qualification. Failed
or malformed reads and existing rows still refuse. Protected metadata creation
remains exclusive to the private provisioning owner; ordinary read results never
return provenance or namespace pins.

## Internal Transport

- GET `/internal/tenants/bootstrap`: bounded default/approved Enterprise-Tenant
  startup inventory, without creation hashes or continuation metadata.
- POST `/internal/tenants/:tenantCode/namespace-bindings`: exact nDatabase
  `{scopeKey,binding}` candidate, persisting only the binding at
  `properties.database.tenantNamespaceBindings[scopeKey]`.

Both routes are service-only, private, uncached and capability-owned through
`apiExposure.categories.profileTenantProvisioning`, default false. Controller
calls facade, which calls the provisioning service. Local module invocation uses
the same retained bearer verification, revocation/stamp checks and fresh
deployment-grant admission as HTTP. Caller authData or system flags alone cannot
admit a command. HTTP responses use no-store and fixed safe errors.

`profileTenantProvisioning.enabled` defaults false and explicitly selects the
new bootstrap inventory. When unselected, default-only deployments retain the
existing proof-bound `/enterprise/get` lookup and transport policy, without a
namespace-binding permission. Selected inventory failure never falls back.
Inventory uses the existing `profile.enterprise.search` permission independently
of binding authority; the permission selector is `inventoryPermission`.

Selected inventory and namespace-binding invocations explicitly set
`followRedirects: false` with required secure transport. Missing redirect policy
is a pre-HTTP transport refusal, not evidence that Profile rejected the runtime.
The remote contract regression composes actual ModuleService request construction
and secure transport, private HTTP controller/facade, proof admission, bounded
Team reads and nRouter JSON success/error envelopes using an isolated fetch stub.
It proves `result` envelope compatibility and rejects a revoked deployment grant;
it does not qualify a live remote endpoint or provider write.

Tenant inventory reads at most 257 rows (256 plus an overflow sentinel).
Enterprise inventory composes the actual private Team reader with at most 101
rows per request and pageNumber 1, ascending code sort and an exclusive code
cursor. Canonical query counts must match the remaining original count and each
page must be complete. Missing counts, count drift, duplicate/nonadvancing codes,
wrong tenant/state, incomplete pages or more than 256 inspected enterprises
across all tenants are HELD, never silently truncated. This is a bounded fresh
read, not an atomic snapshot guarantee. Preserve the reader's exact private
request admission; configuration selection or system auth alone cannot replace it.

The authentication tenant is defaultTenant; the target tenant is a subject, not
the authentication authority. Signed runtimeScope selects project/environment/
server and authenticates the replica instance. Namespace keys are stable across
replicas; instance IDs never determine storage. Functional candidate modules
require original and current exact grants. The database `default` entry is an
owner-defined channel role, not a fabricated functional-module permission.
No candidate-named service or configuration reader is invoked.

The candidate is secret-free and bounded by the database owner. Each module
contains selected provider and master/test channel base/destination database names
and endpoint fingerprints. These are configuration identities, not proof of an
installed physical cluster. A trusted authorized runtime attests its effective
configuration; Profile does not reconstruct another server's configuration.

## Pin Commit And Replay

First pin requires genuine original provenance and the snapshotted deployment
scope. The first deployment also proves absence of any initialization, membership
or credential-origin evidence. Another original deployment may pin after that
first deployment's Init; renamed/newly enrolled servers remain HELD. Current
grants are checked on every admission. Existing complete pins never change.

Conditional updates compare exact prior properties and merge other runtime pins.
Fresh readback acknowledges an identical committed binding after uncertain
responses. Uncertain writes are never replayed. Only a positively acknowledged
zero-match CAS may retry, at most three attempts, after fresh evidence proves
unchanged configuration/provenance and independently valid additive original
scope bindings. Changed/missing existing pins reject.

nService obtains default-tenant runtime proof before candidate transport and
before target providers open. After fresh pinned Tenant readback it merges the
owner properties and calls exact database binding enforcement. Remote cold start
uses the same private inventory as local startup; auth.entCode-only lookup is
not an inventory. Identity-only Enterprise events resolve through that inventory
and join canonical in-flight preparation, even during provisional activation.
Save/update hooks await required activation/publication rather than returning an
early successful callback. Events never carry setupContinuation, digests or
namespace configuration. Provisional addressability is not readiness.

### Selected Subject Completion And Credential Realm

With `profileTenantProvisioning.enabled: true`, namespace admission authenticates
the default tenant and treats the nondefault tenant as its protected subject.
Operational completion is different: after target providers, required Init data
and identity reconciliation, the existing provider must authenticate the actual
target principal and issue a same-tenant, same-enterprise grant-bound token.
Only that token enters the target slot. Missing final proof removes provisional
activation; default proof is never substituted for an ordinary target call.

For native generated Local bootstrap only, the successful private `bind` response
projects `defaultAuthDetail.entCode` from the fresh original Enterprise/Tenant
setup binding. This is an existing per-tenant configuration merge, not a persisted
credential store or a copied API key. An explicitly present tenant
`defaultAuthDetail` (including null/incomplete configuration) is not overwritten.
Nonlocal credentials remain explicit operator-owned configuration.

`authorizeLocalRuntimeBootstrapScope(tenantCode, scope)` re-reads the original
setup key/hash, active Enterprise/Tenant, approved stable deployment snapshot,
current runtime namespace pin and actual authenticated default-principal grant.
The latter must still allow namespace binding and every requested permission;
modules must remain inside the original snapshot except for the explicit remote-only
Local upgrade described below. Native Local target assignments
reuse PrincipalScopeAssignment ownership. Their deterministic code suffix binds
the original enterprise without rewriting any legacy wrong-enterprise assignment.
Revoked, denied, ambiguous or drifted retained assignments remain held, not
reactivated. Sibling scopes are only those originally admitted and currently
grant-approved; package discovery alone adds no authority.

An existing native Local deployment may explicitly adopt
`profileTenantProvisioning.localRuntimeRemoteModuleExtensions` (default `[]`) in
its own server layer. Only additional modules present in that server's canonical
`runtimeIdentity.remoteModules`, absent from its active module graph, and included
in its current authenticated default-principal grant may pass. The selected
project/environment, original stable deployment, exact replica identity, original
setup evidence and current namespace pin remain required. The owner resolves the
server through the existing isolated deployment loader; caller headers or the
authority server's policy cannot supply another server's adoption. This does not
change immutable creation snapshots, admit storage/active-module growth, enroll
new servers, revive revoked grants or relax nonlocal rules. Removing adoption
holds subsequent reconciliation. Target grants still use the existing invalidating
PrincipalScopeAssignment owner; admission itself writes nothing.

Target Init releases, mandatory groups, service principals and configured local
administrator reconciliation are **not skipped**. Local credential reconciliation
resolves the existing tenant-effective configuration. No keys are generated by
this correction and no principal proof is relabelled. Ordinary registration
verification/delivery and tenant-backed service requests use the existing target
token selector and their existing permission/module/privacy qualifications.
Missing Communication permissions or qualifications remain refusals, not
automatic grants. Refresh authenticates every retained target slot through the
same provider and current target grant. Default/unselected behavior is unchanged.

`DefaultEnterpriseHandlerService.isEnterpriseRuntimeReady(enterprise)` is the
content-free completion observation for recovery consumers. It requires active
tenant addressability, the exact existing enterprise-to-tenant mapping, no
in-flight preparation, the actual target retained token slot and, for subjects,
successful current database namespace-binding enforcement. It is not a token
verification or execution authorization API. Inspection/resume must independently
retain current human admission, private guards, fresh namespace inspection,
serialization/CAS and qualification gates; a token slot alone proves none of
those requirements.

Readiness log, 2026-10-02: the 09:08 Local enterprise attempt persisted before
the legacy target issuance refused its default-tenant proof. Source correction
and actual nService-provider/Profile API-key/grant composition are authored in
`nService/test/tenantNamespaceHandshakeContract.test.js`, including mismatched
tenant refusal, revoked grants, missing final proof, namespace holds and legacy
compatibility. Offline tests are not evidence of repaired installed state. No
runtime retries, identity/grant writes, credential changes or flag activation
are performed by this source work. The retained attempt requires the separately
qualified setup inspection/continuation owner; creation must not be repeated.

## Protected Tenant Configuration

Private generated Tenant reads/writes use temporary unchanged-request admission
in DefaultTenantProvisioningGuardService. Native dispatch is inside an exact
detached logger private operation. Canonical save defaults/query are prepared
before private request capture. HTTP flags, system auth and serialized metadata
cannot forge admission.

Protect `properties.enterpriseProvisioning`, database.tenantNamespace and
database.tenantNamespaceBindings against generic replacement, ancestor update,
unset/rename, upsert, pipelines and protected query/projection operators. Generic
Tenant removal cannot discard lifecycle authority. Unrelated dotted tenant-layer
configuration updates remain available. Public recursive responses redact copied
protected fields, never shared cached objects. Tenant.properties is not indexed;
runtime-only bounded projections retain required intent/pins but omit provenance.

During the existing private awaited startup Init execution, the configured
authority Tenant seed may reapply only unprotected fields to its exact existing
record. The ordinary redacted owner lookup must return one matching ID/code;
the generated save is narrowed to that identity with upsert disabled. Protected
properties remain untouched, and concurrent removal must fail rather than
recreate the Tenant. This does not admit generic existing-Tenant saves,
non-authority seeds, caller startup flags or protected configuration replacement.

## Deployment And Evidence Gates

Permission is `profileTenantProvisioning.permission`, default
`profile.tenant.namespace.bind`; this implementation does not grant it. Existing
Local grant input is `identityGovernance.migration`:
`localRuntimeDeploymentGrantPermissions` and `servicePrincipalScopes`, consumed
by DefaultMandatoryIdentityBootstrapService.runtimeGrantPermissions. Adopt only
explicit approved runtime modules/permission through existing governance and
qualify retained assignments/credential scope; no wildcard or group expansion.
An old grant missing the permission is not qualified by bootstrapping alone.

Local sibling grant discovery resolves each server's effective
`identityGovernance.migration` through the canonical deployment configuration
owner. Both `servicePrincipalScopes.apiAdmin` and
`localRuntimeDeploymentGrantPermissions` belong to that resolved server, not
the Platform process doing discovery. A Platform-only Communication permission
must not appear in sibling grants unless their own effective policy includes it.
The exported `runtimeGrantPermissions` customization receives each resolved
policy independently. A declared runtime identity with absent/empty effective
permissions fails discovery before any assignment reconciliation; caller policy
is never a fallback. `currentRuntimeScope` retains its existing current-process
contract. The focused `mandatoryIdentityBootstrapService.test.js` composes the
deployment configuration reader with actual grant reconciliation and covers
isolated overrides, missing policy, caller independence and idempotence.
This correction does not authorize retained tenant module-ceiling expansion,
change physical pins, or qualify installed grants.

HTTPS is required; explicit `profileTenantProvisioning.allowInsecureLoopback`
defaults false. Source privacy guards do not certify external APM/capture.
Qualification requires focused mocks/pipeline checks, installed index/grant and
privacy evidence, followed by controlled multi-runtime acceptance. No tests in
this contract authorize live provider writes or activation.

The retained failed-import tenant stays HELD. Unmarked partial creation is not
silently omitted as a startup quarantine, relocated or admitted by skipping
seeds. Startup quarantine, new runtime enrollment and lost-request-key setup
recovery are separate governed work; reset is not recovery validation.

Even an unused historical tenant without its original deployment snapshot is
HELD before any configuration write. Current approved grants cannot reconstruct
that snapshot; `prepare` never persists an incomplete intent as recovery.
Only genuine new creation captures original deployment scopes. Existing exact
namespace/provenance is read without replacement. Inventory's prepared GET route
selects `profileTenantProvisioning.inventoryPermission`; binding POST separately
selects `profileTenantProvisioning.permission`.

Default-tenant Init installation precedes mandatory identity reconciliation and
runtime proof issuance in the canonical startup coordinator. The default
Enterprise post-save hook therefore defers activation events only inside
nImport's actual awaited `installStartupReleases` execution for that same
default tenant. nImport owns a private async execution context, revoked in
`finally`; no request option, source string or body marker selects this policy.
Startup subsequently performs identity reconciliation and enterprise discovery.
Other tenants, ordinary saves and operator imports retain awaited preparation
and event publication, including failure propagation. Publication acknowledgement
is not proof that all remote runtimes have completed tenant preparation.

Later Profile layers may tighten permission, privacy and snapshot admission;
database providers may implement their pure identity helpers. Preserve exact
pins, protected paths, independent grant authority and before-provider ordering.
