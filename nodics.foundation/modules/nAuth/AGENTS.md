# nAuth Agent Contract

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

## Authentication And Authorization Rules

- The shared catalogue includes Location create/update as independently
  assignable route permissions. Do not add them to default migration groups
  merely to make a client or Copilot scenario pass. Location retains execution
  validation and runtime exposure; Profile retains assignment governance.

- Copilot migration read, execute and erase are separate catalogue entries, not
  default role grants. Preserve the full inherited catalogue when composing
  properties; ordinary array overrides merge positionally. The Copilot Knowledge
  permission-catalogue regression uses nConfig and Profile's real group validator.

- Independent person security bindings validate fail-closed even under legacy
  policy exceptions. Keep shape/stamps generic; Profile owns identity and context.
  See the bounded claims contract and `test/independentSecurityBindings.test.js`.

- A bounded person session context uses independent typed bindings rather than
  the colliding legacy tenant/login stamp. Validate context shape and person
  access-token type before taking that path; Profile still owns live admission.
- Qualified `authSecurity.authorizationPolicy` versions invalidate old access
  and refresh proofs without legacy fail-open exceptions. Keep rollout default
  off, coordinate the version across runtimes, and increase it on governed policy
  replacement. This is explicit invalidation, not automatic config-change detection.

- Authentication, authorization, token, service-token, API-key, and security-stamp behavior is security-critical.
- Do not introduce local fallback for strict distributed auth state.
- Strict auth cache state must respect layered cache activation: global cache,
  the `auth.auth` channel, and the selected distributed engine must all be
  enabled before strict token/session state can start.
- Internal-token route permissions must be defined through
  `authSecurity.internalToken.routePermission` and resolved by router metadata,
  not hardcoded into profile routers.
- Preserve tenant isolation, replay protection, revocation, audit traceability, hashed secrets, scoped permissions, and distributed-cache correctness.

Allow externalIdentityLinkCode only as a bounded opaque customer access-token claim supplied by Profile after verified channel authentication. Profile owns live identity-link validation and refresh preservation. No raw provider proof or identity belongs in this JWT claim.

Runtime JWTs require approved Profile deployment scope and a live security stamp. Strict auth state requires atomic version writes; no clock-only version allocator or stale issuer rollback is allowed.

Use the guarded runtime Redis integration to qualify actual token/stamp/
revocation/admission owners across independent processes. Keep token material on
IPC, require explicit isolated provider configuration and clean only the test's
unique cache namespace. Report synthetic local budgets separately from deployment
acceptance. See [integration contract](test/integration/README.md).

`DefaultServiceTokenService.requireRuntimePrincipal(request, moduleName)` checks
an already verified principal for service identity, exact tenant, enterprise,
bound runtime instance/scope and the required capability. It does not validate
raw JWTs: routes must still use the existing authentication/permission pipeline,
and callers checking a stored token must first use the authorization provider.
Remote business execution also requires the owning capability's current action
proof; runtime identity alone cannot authorize a caller-supplied decision.

Inherit authentication policy and bind deployment credentials through the existing
nAuth/nService contract. Keep provisioning proof separate from retained runtime
proof; preserve strict shared auth state and Profile grants. See the local contract.

Scoped runtime route admission recognizes `userGroup` and
`serviceAccountUserGroup` as base route classes. These labels do not become JWT
groups or expand permissions. nRouter still enforces the approved module, explicit
action permission, accepted token type and deployment exposure. Administrator and
human-only groups remain ineligible; later deployment policy may narrow the list.
