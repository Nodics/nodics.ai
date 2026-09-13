# nRouter Agent Contract

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
- Route permissions that projects may customize should use `permissionConfig`
  paths into layered properties instead of hardcoded permission literals.
- Preserve `apiExposure` alongside permission and token metadata in generated
  OpenAPI `x-nodics` operations. Different exposure declarations cannot be
  collapsed as equivalent duplicate routes. A documented route is not proof of
  runtime exposure, principal authorization, or schema mutation authority.
- Module route keys must be resource/capability paths relative to the generated
  `/<contextRoot>/<modulePrefix>/<apiVersion>` base URL. Do not encode human
  audience, client shell, or access channel prefixes such as `/customer`,
  `/employee`, `/operator`, or `/backoffice` in `route.key`; enforce those
  concerns through `secured`, `authTokenTypes`, `accessGroups`, `permission`,
  `permissionConfig`, `apiExposure`, and ownership checks.

- Reuse `selectDefaultRouterGroups` for runtime and OpenAPI projection. Preserve
  keyed disablement, invalid-group rejection and the `schemaGoverned` contract;
  schema selection must not enable an internal module's HTTP listener.

Register listener cleanup before opening ports. Await all bind results; a
sibling failure closes listeners that succeeded. Missing HTTP configuration
rejects startup through the normal lifecycle. Open HTTPS only when its port is
explicitly configured. Preserve the original bind error after cleanup.

Runtime-bound JWTs authorize only declared modules and their explicit route
permissions. Keep runtime base-route eligibility separate from group permission
expansion; preserve restricted-group and accepted-token-type boundaries.

OpenAPI generation resolves the selected project environment and server through the
existing runtime metadata owner. It loads schema/router metadata without invoking
application service initialization hooks: static generation must not start runtime
resources or require operational API-key proof. Runtime startup retains all of its
credential checks. Persisted-schema reads remain an explicit generation option.
