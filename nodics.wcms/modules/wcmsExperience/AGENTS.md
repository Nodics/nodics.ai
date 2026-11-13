# wcmsExperience Agent Contract

This file gives AI coding agents mandatory guidance for this Nodics module boundary.

## Inheritance

- Follow the repository contract: `../../../AGENTS.md`.
- Follow the parent WCMS contract: `../../AGENTS.md`.
- Follow the Nodics coding contract under `nodics.foundation/modules/nSetup/llm/contracts/ai-coding-and-customization-contract.md`.
- Follow Discovery contracts when touching index/query/projection integration.

## Module Work Rules

- Treat this directory as a layered Nodics module boundary.
- Keep the module customer-agnostic. Do not add Agora, Nexus, tenant, project, or server-specific data here.
- Use existing CMS component/container/page/slot models instead of creating duplicate renderable-content models.
- Use `cmsExperiencePlacement` to decide when and where a published component or container appears.
- Use Discovery/Search as the delivery projection seam. Do not create a second search/index authority.
- Keep storefront delivery payloads renderer-safe: logical renderer keys, contract versions, properties, and media only.
- Do not expose draft/Staged content to public Online resolver requests.
- Keep route/controller/facade/service boundaries loader-visible and override-friendly.
- Put configurable limits and provider choices in `config/properties.js`.
- Put stable vocabulary in `src/utils/enums.js` and `src/utils/statusDefinitions.js`.
- Update `README.md`, `llm/contracts`, examples, and tests whenever resolver, placement, index, or Axis contracts change.

## Frozen Governance Contract

Before changing publication, indexing, resolver delivery, Axis authoring, or storefront contracts, read and preserve:

```text
llm/contracts/experience-governance-contract.md
```

Any deeper implementation must keep these rules true:

- draft/Staged CMS content is never exposed through public Online delivery;
- `cmsExperiencePlacement` remains the placement/rule entity and is not treated as a renderable component;
- resolver delivery uses indexed projections and bounded lookup, not broad CMS scans;
- Discovery/Elasticsearch remains delivery projection authority only;
- publication/indexing is idempotent and alias/rollback safe;
- Axis permissions remain split by view, edit, preview, publish-status, and override/rollback;
- storefront payloads stay renderer-safe and versioned.

## First Slice Guardrails

Explicit private Staged preparation is now authorized in the governance contract.
Reuse CMS Designer access and persisted Site/Catalog ownership, and Discovery's
guarded immutable generations; never install a separate preview pointer/store.
Only a complete acknowledged, physically visible, source-revalidated generation
may become readable. Pending writers require explicit inspection and exact revision
retirement. Keep Online untouched and stages user-driven; the same user may perform
all stages for which that user has permission. Defaults stay in this module.

- Implement default and collection-targeted product-listing hero resolution first.
- Keep Page Designer rule attachment deferred until Experience Studio/resolver contracts are stable.
- Keep product grids, product variants, prices, inventory, filters, sorting, and pagination in Commerce/Search.
- Keep Axis as configuration/preview/control plane, not CMS source of truth.
- Experience Studio navigation contributes to the existing `content` group at
  order `200`. Keep this identity aligned with CMS; identical display labels
  do not merge distinct groups. Preserve entry permissions and PREVIEW state.

Route-category defaults belong to this capability; deployments supply only intentional overrides.
Preserve nRouter enforcement and independent route authorization. See [exposure ownership](../../../nodics.foundation/modules/nRouter/llm/contracts/README.md#capability-owned-exposure-defaults).

Search participation defaults belong to this module in `config/properties.js`.
Do not move them to a role-keyed nSearch catalogue when relocating the module.
Later deployment layers may override `search.wcmsExperience.options.enabled`;
nSearch retains provider mechanics and effective readiness resolution.

Preserve explicit Discovery target context: committed Online events, including
withdrawal, target ONLINE; authorized preview selects STAGED, public delivery
ONLINE. Runtime role names cannot select these owners.

Operational resolver/status evidence must follow the scoped observation and failure safety section in the governance contract. Never restore fixture fallback, expose a caller-controlled clock or label bounded observations as alias health.

Default Experience help must target this owner’s canonical CMS documentation route. Keep the property and provider fallback aligned with the route record, while preserving explicit later-layer documentation overrides.


## Reviewed Online experience generations

Placements are frozen as hashed values in the existing publication dependency journal before review. CMS manifests retain these values, including chunked Site releases. The reviewer sees their exact targeting. Online Experience reads only active public pointers and frozen component graphs. Discovery guarded generations own current-alias publication, acknowledged visibility and exact-count proof. Pending generations never replace the previous complete public projection. Explicit Site-authorized inspection, exact-revision retirement and rebuild provide recovery; unknown writes are never replayed or deleted. Public generation reads enter the existing service-token transport when actorless. Defaults and bounds remain in Framework.

Online index controls use the existing CMS Online connection selector and one transport attempt. Recreate only known stable owner errors at the HTTP boundary; never expose transport internals or downgrade an inspection conflict to generic 500. Discovery generation permissions are declared by discoveryPublication and retained scope ceilings/assignments are changed only through Profile, preserving credentials.

A retried CMS outbox event may acknowledge an unchanged complete generation, but must not start another generation. After an uncertain write, exact retirement and a separately authorized explicit rebuild are required; a restart must not turn retirement into activation.
