# nService Agent Contract

This file gives AI coding agents mandatory guidance for this Nodics module or package boundary.

## Inheritance

- Follow the repository AGENTS contract: `../../AGENTS.md`.
- Follow global AI/development guidance: `../nSetup/llm/ai-enablement-index.md`.
- If a deeper child module has its own `AGENTS.md`, follow that file for changes inside the child module.

## Module Work Rules

- Treat this directory as a layered Nodics module boundary when it contains `package.json`.
- Keep capabilities stable and make implementations replaceable through the module hierarchy.
- Do not hardcode project, environment, server, node, tenant, or customer behavior into reusable framework code.
- Put configurable behavior in layered configuration, schemas, routers, services, pipelines, data, and runtime governance.
- Update the concise `README.md`, canonical documentation content, `llm/contracts`, `llm/examples`, generated context, and tests whenever behavior or extension contracts change.
- Use `llm/contracts` for exact module-local AI/developer rules, `llm/examples` for approved patterns, and `llm/generated` for source-derived facts. Do not add a module-local llm README file; this `AGENTS.md` is the AI navigation and behavior entrypoint for the module.
- Generated files must be recreated from source definitions; do not hand-maintain generated artifacts as source of truth.
- Authentication and token/session helper services must keep logs, audit
  records, and events free of bearer tokens, refresh tokens, API keys, and auth
  cache keys while preserving tenant-scoped traceability.
- All module HTTP communication must use `DefaultModuleService`; do not add
  parallel timeout, retry, pooling, or circuit-breaker clients. Unsafe writes
  require explicit idempotency before retry.
- BackOffice self-registration must remain asynchronous control-plane work and
  use internal service identity rather than username/password authentication.

Capability builders may project the bounded native `backendWorkspace` variant through the existing provider contract. They must not synthesize accelerator navigation under a generic provider or invent schema targets for native screens.

## Tenant startup completion

Enterprise discovery, tenant database/model creation, search setup and initial
Cron job creation must complete before startup succeeds. Propagate required
failures; do not launch background enterprise retry loops or a second job
scheduler. Cron owns recurrence. Internal token refresh registers with the
existing runtime lifecycle service, prevents overlapping refreshes, stops its
timer and awaits active refresh work before transport/resource shutdown.

Runtime instances require configured retained proof and explicit identity. Keep renewal and registration in their existing bounded loops. Protected-work owners use the agent operational snapshot plus current credential validation; stale state cannot authorize new work.

Initial startup, tenant startup and renewal must use the same configured proof and Profile deployment-grant check. A local Profile host must never issue its own unscoped credential through a bootstrap shortcut. Profile owns tenant Init/identity preparation; no literal bootstrap employee or group belongs in the generic enterprise handler.

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

Keep common authority contexts bounded to explicitly selected modules; schema overrides and Profile-issued scopes remain authoritative. See the local contract.

A registry lease endpoint already names its canonical module API path and is preserved, including a prefix different from the logical module name. An origin-only endpoint uses the existing discovered package prefix or module name. Credentials, logical ownership and target-authority filtering remain unchanged.

Inherit authentication policy and bind deployment credentials through the existing
nAuth/nService contract. Keep provisioning proof separate from retained runtime
proof; preserve strict shared auth state and Profile grants. See the local contract.
