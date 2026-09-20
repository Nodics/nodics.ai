# database Agent Contract

This file gives AI coding agents mandatory guidance for this Nodics module or package boundary.

## Inheritance

- Follow the repository AGENTS contract: `../../../AGENTS.md`.
- Follow global AI/development guidance: `../../nSetup/llm/ai-enablement-index.md`.
- If a deeper child module has its own `AGENTS.md`, follow that file for changes inside the child module.

## Module Work Rules

- Share generic HTTP/Workbench mutation-field normalization through the existing
  schema utility owner. Filter unknown/protected/read-only top-level fields,
  retain original managed counters, apply fixed values and trusted scope, and
  leave nested validation, access, ownership and persistence with their owners.
  Explicit schema operation restrictions apply to generated HTTP mutations.
  Idempotency-key forwarding is not a durable replay guarantee.

- `DefaultSchemaUtilityService` owns shared effective schema metadata. Keep
  generated capabilities/safe-search/delete-impact independent of Workbench.
  Workbench delegates remaining record-operation metadata to the effective utility
  service; collection/detail routes and entry points have been retired. Extend metadata helpers there so all consumers receive the same
  access-filtered fields, forms, relationships and authoring capabilities.
  Preserve the existing schema composition and configuration inputs; never
  introduce a screen-specific metadata registry or duplicate builder.

- Derive business form sections, copy and managed-create fields from the
  effective schema's existing `backoffice.form`. Append project-added fields,
  omit deleted fields and prohibit hiding required input without a declared
  owning CREATE aggregate. Preserve generic-create enforcement and the contract
  in `llm/contracts/schema-workbench-business-forms.md`.

- Resolve generic publication authoring from effective `backoffice` lifecycle
  metadata and the existing runtime role through `DefaultSchemaAuthoringPolicyService`.
  Publishable sources require Staged; owner-managed projections are read-only to
  generic APIs. Preserve owning publication/import service paths and the contract
  in `llm/contracts/schema-authoring-authority.md`. Never infer from counters.

- Generated CRUD owns technical counters only when effective
  `backoffice.concurrency.managed` is true. Preserve original tokens, scoped
  atomic provider writes, no-op behavior, and stable 409/428 errors. Never infer
  managed ownership from a field name or take over `versionId`/domain counters.

- Treat this directory as a layered Nodics module boundary when it contains `package.json`.
- Keep capabilities stable and make implementations replaceable through the module hierarchy.
- Do not hardcode project, environment, server, node, tenant, or customer behavior into reusable framework code.
- Put configurable behavior in layered configuration, schemas, routers, services, pipelines, data, and runtime governance.
- Update the concise `README.md`, canonical documentation content, `llm/contracts`, `llm/examples`, generated context, and tests whenever behavior or extension contracts change.
- Use `llm/contracts` for exact module-local AI/developer rules, `llm/examples` for approved patterns, and `llm/generated` for source-derived facts. Do not add a module-local llm README file; this `AGENTS.md` is the AI navigation and behavior entrypoint for the module.
- Generated files must be recreated from source definitions; do not hand-maintain generated artifacts as source of truth.
- Use `DefaultDatabaseTransactionService` for multi-record atomic work. Business
  modules receive only an opaque transaction context and must pass it through
  generated service requests; they must not import a database driver.
- Transaction contexts are module-, tenant-, database-, and callback-scoped.
  Reject missing capabilities, cross-database reuse, expired contexts, and
  adapters that cannot truthfully guarantee atomic commit and abort.
- Only schemas that explicitly declare `transaction.enabled: true` and
  `transaction.sideEffects: 'none'` may receive a transaction context. Their
  cache and event side effects must be disabled so no generated pipeline effect
  can escape before commit.
- Do not describe ordered writes, compensation, or record-level CAS as a
  multi-record transaction.
- Declare target-delete protection on the authoritative source `refSchema`
  relationship with `onTargetDelete: 'RESTRICT'`; never create a separate
  reference registry for Workbench or another client.
- Preserve fail-closed reference validation, tenant boundaries, bounded
  inspection, stable conflict semantics, and the shared generated remove
  pipeline when overriding reference-integrity behavior.
- Do not infer or implement cascading deletion from relationship metadata.
  Cascade behavior requires a module-owned business operation and explicit
  transaction or compensation rules.
- Keep every eligible model discoverable with generated Search, Read, Create,
  Update, and Delete operations by default, filtered through effective schema
  access. Treat `backoffice.enabled: false` as an explicit exclusion and use
  an explicit operations list to narrow sensitive models.
- Put reusable schema access and ownership defaults in layered
  `schemaPolicies` and reference stable capability names from schemas. Preserve
  final `accessGroups` and `ownership` as the sole runtime enforcement
  contract; named policies are composition inputs only.
- Use keyed booleans for extensible ownership group/type collections. Later
  layers add entries with `true` and remove inherited entries with `false`.
- Schema Workbench bulk actions must be schema-explicit, bounded, separately
  permissioned, idempotency-keyed, and delegated to generated CRUD or an
  owning domain service. Do not create a second mutation path.
- Derive relationship, delete-impact, concurrency, and aggregate metadata from
  effective schemas. Aggregate metadata resolves the declared owning controller operation to its
  prepared API; no generic aggregate dispatcher exists; same-database atomic work uses `DefaultDatabaseTransactionService`
  and cross-module consistency uses an owning Workflow or saga.

- Derive inert `apiOperations` from prepared matching generated-controller routes;
  do not create a second registration/configuration authority. Preserve module
  aliases, static relative paths, API versions and disabled declarations. Reject
  ambiguous operations. A projected route is neither a grant nor live validation.

- Canonical `/schemas` discovery uses the existing Schema Utility owner through
  controller/facade adapters. Keep `listSchemas` and `getSchema` authoritative for
  generated capabilities and canonical transports; never copy traversal or
  descriptor logic into the adapters. Pass the original secured request unchanged.
- Canonical collection/detail routes use `schemaApi.discoveryPermission`
  and the existing exposure gate. Retired discovery routes must not be restored. Keep
  permission/namespace migration explicit. Axis must not retry old discovery on
  missing routes, access rejection or invalid metadata. New backends precede clients.

- All Workbench runtime adapters/routes are removed. Use the canonical schema
  template group and existing domain APIs; no old-route fallback or second
  configuration namespace is permitted. The shared namespace/exposure is
  `schemaApi`, with `system.schema.view/manage` defaults.
- Selective update/delete must validate one primary identity and its original
  revision, preserving trusted request scope. Managed-counter bulk is unsupported
  and must fail before dispatch; keep ordinary schema-opted-in bulk bounded.

Require the selected server generated baseline after model preparation. Preserve
composed custom methods; never synthesize missing services at startup. See
[server build contract](llm/contracts/README.md#required-server-build).

Route-category defaults belong to this capability; deployments supply only intentional overrides.
Preserve nRouter enforcement and independent route authorization. See [exposure ownership](../../nRouter/llm/contracts/README.md#capability-owned-exposure-defaults).
