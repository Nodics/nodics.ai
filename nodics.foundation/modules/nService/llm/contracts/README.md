# nService AI Contracts

## Optional release projection

Registration honors the nImport DATA_RELEASE `selectionPolicy` contract.
`EXPLICIT` projects as optional USER-triggered data, including Init releases;
`DEFAULT` or omission preserves existing required activation behavior. Reject
unknown values rather than silently turning malformed opt-in metadata into an
automatic installation. Publication policy keeps its independent meaning.
The package projection grants no import or ownership migration authority and
does not replace destination validation. See
`../../../nData/nImport/import/llm/contracts/README.md#explicit-release-selection`.

This folder contains module-specific AI/developer contracts for `nodics.foundation/modules/nService`.

Use these files for rules that are more specific than root `AGENTS.md` and the module `AGENTS.md`, especially extension boundaries, override expectations, testing rules, security constraints, and generated-artifact responsibilities.

## Auth invalidation observability

Bearer acceptance always calls nAuth's `validateAuthorizationContext` after
revocation and stamp checks, requiring true before returning the payload. A
missing/failed/unqualified context owner cannot fall back to stamps. See
[live authorization context validation](../../../nAuth/llm/contracts/session-context-validation.md)
for exact proof and owner selection. `DefaultModuleSessionContextValidationService`
uses existing module topology: the configured local owner when operational, otherwise
the fixed authenticated Profile bridge. Remote admission independently verifies the
original signed subject token; a runtime service token authenticates transport only.
No unsigned claims, endpoint supplied by a caller or local-to-remote fallback is accepted.

Sensitive module calls explicitly request `secureTransport` with `required:true`.
The existing transport resolves the endpoint and then rejects redirects, credentials,
query/fragment components and disabled TLS verification. HTTP is permitted only for
an explicitly selected exact loopback host. Ordinary transport is unchanged. Private
calls must use Logger's exact `runSensitiveOperation` admission; a body property cannot
attest privacy. Installed proxy/APM/provider capture qualification remains separate.
`test/authorizationContextAdmissionContract.test.js` is authored, not executed.

- Auth token invalidation callbacks may publish logs, audit records, or
  cluster events only with sanitized context: reason code, tenant, enterprise,
  principal identifier, source module, and token type.
- Do not log, audit, or publish bearer tokens, refresh tokens, API keys, auth
  cache keys, or derived token keys.
- Project modules may override invalidation publishing, but must preserve the
  credential-free observability contract and fail-safe cache callback behavior.

## Module topology registry

Read the full owner contract in
[Module topology registry](module-topology-and-transport-contract.md#module-topology-registry).
Preserve its authorization, scope, failure and customization guarantees.

### Capability-Owned Domain Refusals

The [exact domain-refusal contract](module-topology-and-transport-contract.md#capability-owned-domain-refusals)
preserves response-owned evidence, circuit accounting and independent retry policy.

## Tenant startup completion

Follow the [inventory binding and diagnostic contract](module-topology-and-transport-contract.md#enterprise-inventory).

New-tenant addressability during model/search preparation is provisional, not
readiness. Concurrent callers join the same in-flight tenant preparation; Profile
must delegate activation rather than bypassing it on an active-tenant marker.
Required preparation failure removes only that provisional runtime marker and
propagates the original failure. Persisted enterprises, setup request keys,
tenant data and owner receipts remain intact for idempotent resumption. Publish
the active enterprise mapping only after preparation and internal token issuance
complete. Do not compensate by deleting the persisted enterprise or replaying an
unrelated creation request.

Enterprise discovery, tenant database/model creation, search setup and initial
Cron job creation must complete before startup succeeds. Propagate required
failures; do not launch background enterprise retry loops or a second job
scheduler. Cron owns recurrence. Internal token refresh registers with the
existing runtime lifecycle service, prevents overlapping refreshes, stops its
timer and awaits active refresh work before transport/resource shutdown.

## Runtime proof, renewal and operational admission

Registration validation rejection (`ERR_BOF_00000`, HTTP 400) latches the current
agent cycle as `BACKOFFICE_REGISTRATION_REPAIR_REQUIRED`. It clears operational
evidence and stops automatic attempts until an explicit stop/start after repair.
Native HTTP status or normalized transport status takes precedence over the
error-code default status, so connection/circuit/503 failures remain retryable.
Only fixed authentication codes select the single bounded credential refresh;
message text never selects refresh or terminal classification. Readiness and
terminal logs use fixed repair guidance, not the rejected descriptor or raw cause.
The existing nSystem contributor exposes the sanitized reason in readiness
details; its minimal UP/DOWN endpoint does not expose contributor reasons.

`runtimeIdentity.instanceCode` is an explicit deployment value with a distinct
Profile service principal and secret per replica. There is no process-ID identity
fallback. `defaultAuthDetail` supplies tenant-scoped API-key proof and enterprise;
local Profile and remote Profile issue through the same deployment authorization
owner. Missing proof, instance or assignment fails closed.

Internal-token renewal uses one non-overlapping asynchronous timer, bounded tenant
concurrency, expiry-based jitter, outage backoff and awaited shutdown. The default
maximum concurrency is four. Shutdown prevents late work from restarting timers.

The existing batched registry response carries approved business activation for
the registered technical modules. The registration agent holds that response for
`operationalStateTtlMs` (default 30000, valid 1000–60000 milliseconds), limited by
the authority expiry. Missing/inactive/expired state denies protected work;
registration failure does not extend state. No new per-module polling loop is
allowed. Owning modules call `assertModuleOperational` before accepting protected
work; it also validates current JWT expiry, revocation, stamp, tenant, deployment
and module scope through the existing authentication owner. This adds auth-cache
checks, not a Profile/registry HTTP request per job. An already-admitted operation
follows its owner's completion/cancellation/recovery contract.

Revocation lookup returns unrevoked only for the canonical `ERR_CACHE_00001`
cache miss. Provider outage, disabled channel and malformed cached data must
reject authorization even if a subsequent principal-stamp read could succeed.
Do not turn arbitrary authentication-state errors into absent revocation markers.

A separate runtime can request protected remote APIs through explicit
`runtimeIdentity.remoteModules` (for example `['profile', 'inventory']`).
The provider adds these bounded codes to its active-module request. This does
not activate source modules or establish local ownership. Every requested code
still requires the same Profile deployment grant and route permission. Configure
remote endpoints through the existing server topology, including its abstract
endpoint; an endpoint alone never grants capability access. Missing remote scope
fails during protected calls rather than silently broadening the credential.

`authSecurity.securityStamp.cacheModuleName` selects the shared authentication
state namespace for both principal stamps and token revocation. Authority and
consumer runtimes must use the same configured distributed channel. It can be
the active Foundation `auth` module when Profile runs remotely; this never
changes `profileModuleName` or identity ownership. The logical cache namespace defaults to `auth`; Profile remains the identity authority.

Module invocation honors the router topology's effective `remoteOnly` option,
including connection aliases, even when the module source is active locally.
The selected remote endpoint or registry owner remains mandatory; removing the
option restores ordinary local dispatch. Active source is not proof of local
service ownership. See `test/moduleInvocationContract.test.js`.

## Selected authority-context defaults

`runtimeAuthorityContexts.default` is an explicitly configured context, used only for modules whose entry is `true`, for example `{ default: 'warehouse.operational', modules: { stock: true, pricing: 'pricing.staged' } }`. Unselected/false modules retain their existing module/schema fallback. Explicit schema declarations and schema overrides retain precedence over module selections. A selected common default must be a nonempty string; malformed context values fail. Do not derive authority from a server name, module discovery, UI grouping or connection topology. Profile-issued deployment scope and runtime-role/tenant checks remain independent.

Activation-package facts come from existing module manifests and registration. A later BackOffice routing-only delta reuses observed owner facts; it cannot invent a release before its owner registers. Explicit custom package descriptors retain their documented registration/selection contract.

A registry lease endpoint already names its canonical module API path and is preserved, including a prefix different from the logical module name. An origin-only endpoint uses the existing discovered package prefix or module name. Credentials, logical ownership and target-authority filtering remain unchanged.

## Runtime credential configuration

DERIVED tenant startup uses Profile's private approved bootstrap inventory and
namespace-binding handshake before target providers open. Both local and remote
paths verify the existing default-tenant retained runtime proof and current
deployment grant. Original stable deployment snapshots permit multiple approved
runtimes; new runtime enrollment cannot rewrite storage. Identity-only Enterprise
events resolve fresh authorized inventory and join canonical in-flight startup.
Never accept provisional activeTenants as readiness or send private continuation
metadata through events. See [Profile provisioning](../../../../../nodics.platform/modules/profile/llm/contracts/enterprise-tenant-provisioning.md).

Consumer-side enterprise discovery and namespace binding failures use the
nService-owned `ERR_TNT_PROVISIONING_HELD` (409) status. Non-Profile runtimes load
this definition through their existing layered status owner; they must not activate
Profile or copy its status catalogue to construct a startup error. The generic
message remains content-free, required failures still prevent readiness, and no
fallback inventory, provenance reconstruction, provider opening or binding
relaxation follows a held result. Profile continues to own the actual admission
and retained provenance decisions. Cover this boundary using the real files/status
loader and NodicsError with Profile absent, not an unrestricted mock status map.

Inherit security policy and credential input defaults from
[nAuth](../../../nAuth/llm/contracts/README.md#deployment-credentials-and-inherited-auth-policy).
nService consumes current retained `defaultAuthDetail.apiKey` proof for both
initial issuance and renewal. It never falls back to provisioning proof or a human
administrator. Profile still validates tenant, enterprise and deployment grants.
A selected deployment may bind distinct runtime credentials through later layers.
The logical auth cache namespace is `auth`; this does not change Profile ownership.
