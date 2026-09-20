# profile Agent Contract

This file gives AI coding agents mandatory guidance for this Nodics module or package boundary.

## Inheritance

- Follow the repository AGENTS contract: `../../AGENTS.md`.
- Follow global AI/development guidance from `../../../nodics.foundation/modules/nSetup/llm/ai-enablement-index.md`.
- If a deeper child module has its own `AGENTS.md`, follow that file for changes inside the child module.

## Module Work Rules

- Treat this directory as a layered Nodics module boundary when it contains `package.json`.
- Keep capabilities stable and make implementations replaceable through the module hierarchy.
- Do not hardcode project, environment, server, node, tenant, or customer behavior into reusable framework code.
- Put configurable behavior in layered configuration, schemas, routers, services, pipelines, data, and runtime governance.
- Update the concise `README.md`, canonical documentation content, `llm/contracts`, `llm/examples`, generated context, and tests whenever behavior or extension contracts change.
- Use `llm/contracts` for exact module-local AI/developer rules, `llm/examples` for approved patterns, and `llm/generated` for source-derived facts. Do not add a module-local llm README file; this `AGENTS.md` is the AI navigation and behavior entrypoint for the module.
- Generated files must be recreated from source definitions; do not hand-maintain generated artifacts as source of truth.
- Extend reusable Profile access/ownership defaults through layered
  `schemaPolicies.profile`; do not copy full schemas or add local access-policy
  factory functions.
- Internal authentication token routes are service capabilities, not generic
  user routes. Preserve explicit route permissions and tenant/cross-tenant
  governance when changing profile authentication routers or controllers.
- Employee and customer username/password authentication routes are
  pre-authentication routes: they must resolve enterprise/tenant context before
  credential validation without requiring an existing bearer token or API key.
  Do not weaken module-to-module internal token routes when changing them.
- Browser session restoration is Profile-owned. Keep refresh credentials in a
  scoped HttpOnly cookie, return access tokens only to client memory, require
  exact credentialed-CORS origins plus double-submit CSRF for restore/logout,
  rotate refresh state on every restore, and clear/revoke it on logout. Never
  introduce browser storage, a BackOffice-owned token authority, wildcard
  credentialed CORS, or non-Secure cookies outside loopback local development.
- Enterprise management APIs must remain Profile-owned, human-access-token
  protected, action-permissioned, bounded, and explicitly projected. Reuse the
  generated enterprise service; do not expose generic schema CRUD to an AI
  tool, add a parallel search/index path, or return recursive identity data.
- Enterprise setup resolves effective writable metadata through
  `DefaultSchemaUtilityService`, independently of a Workbench service. Keep
  provisioning, principal-bound retries and response projection in Profile;
  missing or excluded metadata must fail before persistence. The existing
  `createFromModel` adapter is not a generic insertion alternative.
- Enterprise/user-management Axis workspaces must be backend component driven.
  Publish labels, tabs, form fields, listings, role choices, and endpoints from
  Profile configuration/BackOffice capability metadata; Axis may add generic
  renderers and transport plumbing, but must not hardcode the business journey.

Application/domain modules own channel-entry policy and journey continuation.
Profile owns generic proof, links and session issuance. Preserve the one-use
browser handoff and cookie boundary; never let a domain route issue or relay
refresh credentials. Generic account-form normalization and identity construction
belong in the existing Profile registration service/pipeline.

External launch proof freshness is checked at session issuance. Continuing a channel journey uses the Profile-issued opaque externalIdentityLinkCode claim plus live link/account validation; never extend proof age globally or trust body-supplied bindings.

This capability declares an inert model-service inventory for [governed Local reset](../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.

Runtime admission reuses direct RUNTIME_DEPLOYMENT principal scope assignments. Never infer approval from headers, topology, broad groups or cross-tenant permission. Scope mutations await existing principal invalidation; the pre-update hook owns atomic version allocation.

Tenant preparation uses the existing governed Init release owner before mandatory identity reconciliation. It does not synthesize deployment grants or credentials from runtime topology; first authority provisioning remains trusted operator initializer data.

Generated Profile reads return the canonical `{code, result}` envelope, with a
success code and result array; they do not set a Boolean `success: true`. Runtime
authorization/removal must validate that envelope and reject explicit failures.
A runtime-scope mutation completes only after the existing Employee update
acknowledges exactly one matched principal and its stamp hooks finish. Zero or
multiple matches cannot count as successful credential invalidation.

The existing `GET /enterprise/get` also serves scoped runtime bootstrap. Its
service path requires `profile` module scope, `profile.enterprise.search`, and
an exact match between authenticated enterprise/tenant and requested context.
It returns one active enterprise with only code, active state and its tenant
code/state/properties. The trusted Profile lookup stays inside Profile after
authorization; runtime tokens gain no group-based generic CRUD access. Local
startup may prepare its authority-owned tenant inventory; a remote runtime may
only discover the enterprise authorized by its retained proof and deployment
grant. Tenant properties are protected runtime configuration, not public data.

Route-category defaults belong to this capability; deployments supply only intentional overrides.
Preserve nRouter enforcement and independent route authorization. See [exposure ownership](../../../nodics.foundation/modules/nRouter/llm/contracts/README.md#capability-owned-exposure-defaults).

`profileInitialization.requiredEmployeeLogins` owns initializer identity checks,
with admin/apiAdmin defaults matching Profile Init data. Runtime API-key login
metadata does not select the initializer employee. Custom identities require
matching governed Init data; partial checks never reset existing credentials.

Profile refresh sessions use the Profile-owned `auth` cache channel. Its module
configuration references nAuth's strict channel defaults through nConfig; do not
copy those defaults into a customer environment or redirect identity ownership.
The deployment must still enable the distributed provider. Later Profile channel
overrides use normal layering, preserving atomic consume and no local fallback.

Browser sessions resolve credentialed origins through nRouter's existing
`resolveCorsOrigins` service. Endpoint-derived origins and explicit origin lists
share one policy; explicit denials and endpoint disables take precedence.
Profile continues to enforce cookie security, CSRF and refresh rotation.

During a governed Local reset, the provider's private authority may reach scope
cleanup after Employee deletion. Profile must prove principal absence through an
authoritative read and await nAuth shared-stamp revocation. It must reject failed
reads or revocation, and a request field cannot forge reset authority. Existing
principals and ordinary scope mutations still require exactly one acknowledged
Employee update. This rule is independent of reset inventory ordering.

For a deployment serving both an approved HTTPS origin and local HTTP development,
keep browser-session `secure: true` and opt into `allowInsecureLoopback: true` in
the appropriate customer or employee session configuration. Only exact HTTP
localhost, IPv4 loopback and IPv6 loopback requests receive non-Secure cookies;
HTTPS retains Secure. This is resolved per request without changing shared
configuration. Exact credentialed CORS, CSRF, proof freshness and refresh rotation
remain required. Non-loopback HTTP and SameSite=None with non-Secure cookies fail.
