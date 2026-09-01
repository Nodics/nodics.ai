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

- Implement default and collection-targeted product-listing hero resolution first.
- Keep Page Designer rule attachment deferred until Experience Studio/resolver contracts are stable.
- Keep product grids, product variants, prices, inventory, filters, sorting, and pagination in Commerce/Search.
- Keep Axis as configuration/preview/control plane, not CMS source of truth.
