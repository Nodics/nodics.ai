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

For selected provisioning, admitted secured subject requests await
`ensureAuthenticatedEnterprise` before dispatch. Reuse fresh private inventory
and the existing tenant preparation lock; never infer readiness from an active
marker, trust header placement, enable remote events or retry a business command.
See the live preparation section of `llm/contracts/README.md`.

Public business-enterprise placement may opt into `enterpriseResolution.runtimeLookup.enabled`.
Use the retained, independently verified runtime token through the fixed Profile
resolver, preserving its signed enterprise/header and sending only the selected
business code. Profile's default-off exact deployment allowlist and canonical
Enterprise/Tenant placement decide the binding. Never forward the public
caller's token, synthesize claims or fall back to a foreign bootstrap lookup.
Default runtime enterprise inventory remains strict and unchanged. See the
runtime enterprise placement section in `llm/contracts/README.md`.

Inventory diagnostics use fixed credential/private-context/inventory stage names
only; never expose upstream exceptions or payloads. Logger failures must preserve
the canonical held status and fail-closed readiness.
Default-only inventory carries the enterprise from the verified runtime token in
both the local request and remote `x-enterprise-code` header. Never substitute a
configured or caller-supplied enterprise for that verified binding.

Consumer-owned startup refusals must use nService-owned status definitions so
optional Profile absence cannot mask a held error as an unknown code. Preserve
content-free projection and fail-closed readiness/provenance; never load Profile
just to obtain its status catalogue. See `llm/contracts/README.md`.

Enterprise discovery, tenant database/model creation, search setup and initial
Cron job creation must complete before startup succeeds. Propagate required
failures; do not launch background enterprise retry loops or a second job
scheduler. Cron owns recurrence. Internal token refresh registers with the
existing runtime lifecycle service, prevents overlapping refreshes, stops its
timer and awaits active refresh work before transport/resource shutdown.

Runtime instances require configured retained proof and explicit identity. Keep renewal and registration in their existing bounded loops. Protected-work owners use the agent operational snapshot plus current credential validation; stale state cannot authorize new work.

Revocation lookup returns unrevoked only for the canonical `ERR_CACHE_00001`
cache miss. Provider outage, disabled channel and malformed cached data must
reject authorization even if a subsequent principal-stamp read could succeed.
Do not turn arbitrary authentication-state errors into absent revocation markers.

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

nService owns defaultContentType for module transport; nConfig only loads it.
Do not restore HTTP content defaults in the configuration loader.

Registry fallback resolution rejects unrelated logical runtime owners for the same
module/publication context. Replicas of one logical server remain eligible. When
more than one publication context matches, require an explicit target context;
lease freshness must not choose between authoring and delivery authorities. The
BackOffice registry remains responsible for admission and its delegated resolver.


Resolve runtime-local ownership only from canonical installed package metadata
`nodics.runtime.ownership`. Keep callable and schema/service evidence. Use the
shared scope/key helpers for admission; never trust payload ownershipScope or
exempt Foundation as a group. Remote local-mechanics resolution requires an exact
logical server. See the module-topology-and-transport contract.

Runtime Enterprise resolution selects the Profile module in OPERATIONAL
publication context through DefaultModuleService. Physical server labels do not
identify Profile ownership. Preserve the verified runtime principal, its exact
enterprise scope, `profile.enterprise.search`, fixed resolve API and original
caller separation; relocation never broadens identity grants.

Supplied DMS targetAuthority uses explicit publication plus optional environment,
server and node only. Reject role strings, code/nested runtimeRole and unknown
fields before any local/remote choice; use the same validator in registry resolution.

Non-callable modules with materialized schema/service authority must declare
trusted `nodics.runtime.ownership` explicitly. The shared registration helper
rejects missing metadata at outgoing construction and final admission. Generic
`owns: ['schema']`, wire ownership scope and empty schema files are not evidence.
Do not execute foreign schema configuration just to classify a candidate.

Registration admission must reuse one lazy canonical installed-source resolver
across the complete validated batch and its atomic retries, then discard it.
Keep the binding private, preserve exact ownership checks and read fresh source
metadata next operation; never introduce a process-wide authority cache.

Profile issues short-lived internal service tokens only after native apiAdmin API-key
proof in the requested tenant and enterprise. nConfig derives exact placement
and active/remote module scope from installed topology. Keep named permissions,
empty JWT groups, security stamps, namespace pins and domain caller checks.
The signed assignmentCode is a stable placement identifier for existing caller
pins. Startup and renewal do not consult per-runtime assignment rows. Profile
Init includes admin, apiAdmin and the existing authority-tenant guest Customer.
