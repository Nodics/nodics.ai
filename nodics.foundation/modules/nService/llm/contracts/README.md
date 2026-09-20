# nService AI Contracts

This folder contains module-specific AI/developer contracts for `nodics.foundation/modules/nService`.

Use these files for rules that are more specific than root `AGENTS.md` and the module `AGENTS.md`, especially extension boundaries, override expectations, testing rules, security constraints, and generated-artifact responsibilities.

## Auth invalidation observability

- Auth token invalidation callbacks may publish logs, audit records, or
  cluster events only with sanitized context: reason code, tenant, enterprise,
  principal identifier, source module, and token type.
- Do not log, audit, or publish bearer tokens, refresh tokens, API keys, auth
  cache keys, or derived token keys.
- Project modules may override invalidation publishing, but must preserve the
  credential-free observability contract and fail-safe cache callback behavior.

## Module topology registry

- `DefaultModulesConfigurationService` is the singleton authority for effective
  module, server, and node topology in one runtime process.
- `ModuleConfiguration` remains an independently constructed descriptor type;
  it is not the registry authority.
- Registry refresh must validate into an isolated candidate and replace active
  state atomically. Failed refresh must preserve the last valid registry.
- Later modules customize normalization or descriptor creation through exported
  service members, without restoring a `src/lib` container or parallel state.
- Runtime self-registration must use the router's effective module options to
  exclude `remoteOnly` consumers from local leases, authority claims and data
  package claims. Active-module membership alone does not prove local hosting.

Native business workspaces reuse the concrete module capability builder. `nativeWorkspace` projects the same common navigation fields while replacing the schema target with bounded, non-executable workspace/view keys. Ownership remains the publishing module; registration and BackOffice validation remain mandatory.

## Tenant startup completion

Enterprise discovery, tenant database/model creation, search setup and initial
Cron job creation must complete before startup succeeds. Propagate required
failures; do not launch background enterprise retry loops or a second job
scheduler. Cron owns recurrence. Internal token refresh registers with the
existing runtime lifecycle service, prevents overlapping refreshes, stops its
timer and awaits active refresh work before transport/resource shutdown.

## Runtime proof, renewal and operational admission

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

Inherit security policy and credential input defaults from
[nAuth](../../../nAuth/llm/contracts/README.md#deployment-credentials-and-inherited-auth-policy).
nService consumes current retained `defaultAuthDetail.apiKey` proof for both
initial issuance and renewal. It never falls back to provisioning proof or a human
administrator. Profile still validates tenant, enterprise and deployment grants.
A selected deployment may bind distinct runtime credentials through later layers.
The logical auth cache namespace is `auth`; this does not change Profile ownership.
